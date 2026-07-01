import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API route for meal analysis
  app.post("/api/analyze-meal", async (req, res) => {
    try {
      const { image, mimeType, description } = req.body;
      let promptParts: any[] = [];
      const promptText = `Analyze this meal. Provide a response strictly in JSON format.
Identify food items and estimate: food name, estimated portion size, calories, protein (g), carbs (g), fats (g).
Respond ONLY in this exact JSON schema:
{
  "items": [
    { "name": "grilled chicken breast", "portion": "150g", "calories": 250, "protein": 46, "carbs": 0, "fats": 6 }
  ],
  "total": { "calories": 250, "protein": 46, "carbs": 0, "fats": 6 },
  "confidence": "medium"
}`;

      promptParts.push(promptText);

      if (image && mimeType) {
        promptParts.push({
          inlineData: {
            mimeType,
            data: image,
          }
        });
      } else if (description) {
        promptParts.push(`\nMeal description: ${description}`);
      } else {
        return res.status(400).json({ error: "Please provide an image or description." });
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promptParts,
        config: {
          responseMimeType: "application/json"
        }
      });

      const jsonText = response.text || "{}";
      const parsedData = JSON.parse(jsonText);

      res.json(parsedData);
    } catch (error: any) {
      console.error("Analysis error:", error);
      res.status(500).json({ error: "Failed to analyze meal." });
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
