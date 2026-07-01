import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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

    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
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

    return res.status(200).json(parsedData);
  } catch (error: any) {
    console.error("Analysis error:", error);
    return res.status(500).json({ error: "Failed to analyze meal." });
  }
}
