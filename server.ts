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
      const { user_id, steps, calories } = req.body;
      if (!user_id) {
        return res.status(400).json({ error: "Missing user_id parameter in body" });
      }

      const stepsVal = Number(steps || 0);
      const caloriesVal = Number(calories || 0);
      const now = new Date().toISOString();

      const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
      const dbPassword = process.env.SUPABASE_DB_PASSWORD || "";

      if (supabaseUrl && serviceRoleKey) {
        const supabase = createClient(supabaseUrl, serviceRoleKey, {
          auth: { persistSession: false }
        });

        const { error } = await supabase
          .from("profiles")
          .update({
            apple_health_connected: true,
            steps_synced_today: stepsVal,
            calories_synced_today: caloriesVal,
            last_health_sync: now
          })
          .eq("user_id", user_id);

        if (!error) {
          return res.json({ success: true, method: "Supabase Service Client" });
        }
      }

      if (dbPassword) {
        const connectionString = `postgresql://postgres:${dbPassword}@db.mnhwaljzcqfqtnfaivso.supabase.co:5432/postgres`;
        const sql = postgres(connectionString);

        await sql`
          UPDATE profiles 
          SET 
            apple_health_connected = true,
            steps_synced_today = ${stepsVal},
            calories_synced_today = ${caloriesVal},
            last_health_sync = ${now}
          WHERE user_id = ${user_id};
        `;

        await sql.end();
        return res.json({ success: true, method: "Direct PG Database Update" });
      }

      const anonKey = process.env.VITE_SUPABASE_ANON_KEY || "";
      if (supabaseUrl && anonKey) {
        const supabase = createClient(supabaseUrl, anonKey, {
          auth: { persistSession: false }
        });

        const { error } = await supabase
          .from("profiles")
          .update({
            apple_health_connected: true,
            steps_synced_today: stepsVal,
            calories_synced_today: caloriesVal,
            last_health_sync: now
          })
          .eq("user_id", user_id);

        if (!error) {
          return res.json({ success: true, method: "Supabase Anon Client" });
        }
      }

      res.status(500).json({ error: "No database credentials configured on Express server." });
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
