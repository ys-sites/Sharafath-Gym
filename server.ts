import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import multer from "multer";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for meal analysis
  app.post("/api/analyze-meal", upload.single("image"), async (req, res) => {
    try {
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

      if (req.file) {
        // Image was uploaded
        const mimeType = req.file.mimetype;
        const data = req.file.buffer.toString("base64");
        promptParts.push({
          inlineData: {
            mimeType,
            data,
          }
        });
      } else if (req.body.description) {
        // Text description provided
        promptParts.push(`\nMeal description: ${req.body.description}`);
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
