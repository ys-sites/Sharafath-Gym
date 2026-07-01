import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { image, mimeType, description, correctedItem } = req.body;

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

    let parsedData: any = null;

    // 1. OPENAI ROUTING
    if (process.env.OPENAI_API_KEY) {
      console.log("Routing meal analysis to OpenAI GPT-4o...");
      const messages: any[] = [];
      const userContent: any[] = [{ type: "text", text: promptText }];

      if (image && mimeType) {
        userContent.push({
          type: "image_url",
          image_url: { url: `data:${mimeType};base64,${image}` }
        });
      } else if (description) {
        userContent.push({
          type: "text",
          text: `Meal description: ${description}`
        });
      }

      messages.push({ role: "user", content: userContent });

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          response_format: { type: "json_object" },
          messages
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errText}`);
      }

      const result = await response.json();
      const jsonText = result.choices?.[0]?.message?.content || "{}";
      parsedData = JSON.parse(jsonText);

    // 2. ANTHROPIC CLAUDE ROUTING
    } else if (process.env.ANTHROPIC_API_KEY) {
      console.log("Routing meal analysis to Anthropic Claude 3.5 Sonnet...");
      const userContent: any[] = [];

      if (image && mimeType) {
        userContent.push({
          type: "image",
          source: {
            type: "base64",
            media_type: mimeType,
            data: image
          }
        });
      }
      
      userContent.push({ type: "text", text: promptText + (description ? `\nMeal description: ${description}` : "") });

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1000,
          messages: [{ role: "user", content: userContent }]
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Anthropic API error: ${response.status} - ${errText}`);
      }

      const result = await response.json();
      const jsonText = result.content?.[0]?.text || "{}";
      parsedData = JSON.parse(jsonText);

    // 3. GEMINI FALLBACK
    } else if (process.env.GEMINI_API_KEY) {
      console.log("Routing meal analysis to Google Gemini 2.5 Flash...");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const promptParts: any[] = [promptText];

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

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promptParts,
        config: {
          responseMimeType: "application/json"
        }
      });

      const jsonText = response.text || "{}";
      parsedData = JSON.parse(jsonText);
    } else {
      throw new Error("No AI API keys (OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY) are configured on the server.");
    }

    return res.status(200).json(parsedData);
  } catch (error: any) {
    console.error("API error during multi-provider meal analysis:", error);
    return res.status(500).json({ error: error.message || "Failed to analyze meal." });
  }
}
