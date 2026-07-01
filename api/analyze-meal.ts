import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { image, mimeType, description, correctedItem } = req.body;

    let promptParts: any[] = [];
    let promptText = "";

    if (correctedItem) {
      // Recalculation request
      promptText = `Analyze this food item. The user has corrected the identification for a food item.
Corrected Food Name: "${correctedItem.name}"
Corrected Portion Size: "${correctedItem.portion}"

Estimate the calories, protein (g), carbs (g), and fats (g) specifically for this item based on the food type and portion size. Use the provided image (if present) for visual volume/scale cues.
Respond strictly in JSON format.
Respond ONLY in this exact JSON schema:
{
  "items": [
    { "name": "${correctedItem.name}", "portion": "${correctedItem.portion}", "calories": 250, "protein": 46, "carbs": 0, "fats": 6 }
  ],
  "total": { "calories": 250, "protein": 46, "carbs": 0, "fats": 6 },
  "confidence": "high"
}`;
    } else {
      // Initial scan request
      promptText = `Analyze this meal. Reason about portion sizes from visual cues (plate size, comparison to standard utensils/hand if visible, typical serving sizes for the identified dish) before estimating calories.
Identify the specific dish/ingredient name (e.g. 'vegetable spring roll, deep-fried' not just 'food'), then estimate a realistic single-serving calorie/macro breakdown based on that identification and visible portion size.
Provide a response strictly in JSON format.
Respond ONLY in this exact JSON schema:
{
  "items": [
    { "name": "grilled chicken breast", "portion": "150g", "calories": 250, "protein": 46, "carbs": 0, "fats": 6 }
  ],
  "total": { "calories": 250, "protein": 46, "carbs": 0, "fats": 6 },
  "confidence": "medium"
}`;
    }

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
    }

    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing in server environment variables!");
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
    console.error("API error during Gemini meal analysis:", error);
    if (error instanceof SyntaxError) {
      console.error("JSON Syntax error in Gemini response output.");
    }
    return res.status(500).json({ error: error.message || "Failed to analyze meal." });
  }
}
