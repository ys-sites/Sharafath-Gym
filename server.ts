import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";
import {
  analyzeMeal,
  extractUserIdFromAuthHeader,
  validateAndSanitizeInput,
  MealAnalysisConfigError,
  MealAnalysisValidationError,
  type AnalyzeMealInput,
} from "./src/server/mealAnalysis";

const SESSION_RATE_LIMIT_WINDOW_MS = 60_000;
const SESSION_RATE_LIMIT_MAX = 10;
const sessionRateLimitStore = new Map<string, { count: number; windowStart: number }>();

function isSessionRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = sessionRateLimitStore.get(ip);

  if (!entry || now - entry.windowStart > SESSION_RATE_LIMIT_WINDOW_MS) {
    sessionRateLimitStore.set(ip, { count: 1, windowStart: now });
    return false;
  }

  entry.count += 1;
  return entry.count > SESSION_RATE_LIMIT_MAX;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API route for minting a session server-side (mirrors api/session.ts)
  app.all("/api/session", async (req, res) => {
    if (req.method !== "GET" && req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const ip = req.ip || req.socket?.remoteAddress || "unknown";
    if (isSessionRateLimited(ip)) {
      return res.status(429).json({ error: "Too many requests" });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
    const ownerEmail = process.env.OWNER_EMAIL;
    const ownerPassword = process.env.OWNER_PASSWORD;

    if (!supabaseUrl || !supabaseAnonKey || !ownerEmail || !ownerPassword) {
      console.error("Session error: missing required environment variables");
      return res.status(500).json({ error: "Unable to establish session" });
    }

    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
      });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: ownerEmail,
        password: ownerPassword,
      });

      if (error || !data.session) {
        console.error("Session error:", error?.message);
        return res.status(500).json({ error: "Unable to establish session" });
      }

      return res.status(200).json({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
    } catch (err) {
      console.error("Session error:", err);
      return res.status(500).json({ error: "Unable to establish session" });
    }
  });

  // API route for meal analysis (mirrors api/analyze-meal.ts)
  app.post("/api/analyze-meal", async (req, res) => {
    let input: AnalyzeMealInput;
    try {
      input = validateAndSanitizeInput(req.body);
    } catch (err: any) {
      if (err instanceof MealAnalysisValidationError) {
        return res.status(err.status).json({ error: err.message });
      }
      return res.status(400).json({ error: "Invalid request." });
    }

    const userId = extractUserIdFromAuthHeader(req.headers.authorization);
    const inputType = input.correctedItem ? "correction" : input.image ? "image" : "description";
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const logClient = supabaseUrl && serviceRoleKey
      ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
      : null;

    const logScan = async (success: boolean, rawResponse: any, errorMessage: string | null, provider: string | null) => {
      if (!logClient) return;
      try {
        await logClient.from("meal_scan_logs").insert({
          user_id: userId,
          input_type: inputType,
          raw_ai_response: rawResponse,
          success,
          error_message: errorMessage,
          provider,
        });
      } catch (err) {
        console.error("Failed to write meal_scan_logs entry:", err);
      }
    };

    try {
      const { data, provider, fallbackUsed } = await analyzeMeal(input);
      await logScan(true, data, null, provider);
      return res.status(200).json({ ...data, provider, fallback_used: fallbackUsed });
    } catch (error: any) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Meal analysis failed:", message);

      if (error instanceof MealAnalysisConfigError) {
        await logScan(false, null, message, null);
        return res.status(500).json({ error: `AI configuration error: ${message}` });
      }

      await logScan(false, null, message, null);
      return res.status(500).json({ error: "Analysis failed, try again." });
    }
  });

  // API route for Apple Health sync
  app.post("/api/sync-health", async (req, res) => {
    try {
      const { user_id, sync_token, steps, calories } = req.body;
      if (!user_id || !sync_token) {
        return res.status(400).json({ error: "Missing required user_id or sync_token in request body" });
      }

      const stepsNum = Number(steps);
      const caloriesNum = Number(calories);

      if (!Number.isFinite(stepsNum) || stepsNum < 0 || stepsNum >= 500000) {
        return res.status(400).json({ error: "Invalid steps: must be a finite number between 0 and 500,000" });
      }

      if (!Number.isFinite(caloriesNum) || caloriesNum < 0 || caloriesNum >= 500000) {
        return res.status(400).json({ error: "Invalid calories: must be a finite number between 0 and 500,000" });
      }

      const now = new Date().toISOString();
      const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
      const anonKey = process.env.VITE_SUPABASE_ANON_KEY || "";

      // Initialize Supabase client (try service role, then fallback to anon key in dev)
      const key = serviceRoleKey || anonKey;
      if (!supabaseUrl || !key) {
        return res.status(500).json({ error: "Supabase environment variables not configured" });
      }

      const supabase = createClient(supabaseUrl, key, {
        auth: { persistSession: false }
      });

      // Verify sync token
      const { data: profile, error: selectError } = await supabase
        .from("profiles")
        .select("user_id, sync_token")
        .eq("user_id", user_id)
        .eq("sync_token", sync_token)
        .maybeSingle();

      if (selectError || !profile) {
        return res.status(401).json({ error: "Unauthorized: Invalid user_id or sync_token" });
      }

      // Update values
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          apple_health_connected: true,
          steps_synced_today: stepsNum,
          calories_synced_today: caloriesNum,
          last_health_sync: now
        })
        .eq("user_id", user_id);

      if (updateError) {
        throw updateError;
      }

      return res.json({ success: true, method: "Supabase Client" });
    } catch (error: any) {
      console.error("Health sync error:", error);
      res.status(500).json({ error: error.message || "Failed to sync Health data." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
