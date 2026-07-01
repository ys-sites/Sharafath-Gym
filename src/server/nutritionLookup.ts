import fetch from 'node-fetch';

export interface GroundedNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fdcId: number;
  foodName: string;
}

function calculateOverlapSimilarity(str1: string, str2: string): number {
  const getTokens = (s: string) => {
    return new Set(
      s.toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean)
    );
  };
  const tokens1 = getTokens(str1);
  const tokens2 = getTokens(str2);
  if (tokens1.size === 0 || tokens2.size === 0) return 0;

  let intersection = 0;
  for (const t of tokens1) {
    if (tokens2.has(t)) intersection++;
  }

  return intersection / Math.min(tokens1.size, tokens2.size);
}

export function parseGrams(portionStr: string): number {
  const matchG = portionStr.match(/(\d+(?:\.\d+)?)\s*g/i);
  if (matchG) return parseFloat(matchG[1]);

  const matchNum = portionStr.match(/^(\d+(?:\.\d+)?)$/);
  if (matchNum) return parseFloat(matchNum[1]);

  return 100; // fallback to 100g
}

export async function lookupNutritionInUSDA(itemName: string): Promise<GroundedNutrition | null> {
  const apiKey = process.env.FDC_API_KEY;
  if (!apiKey) {
    console.log("FDC_API_KEY is not set. Skipping USDA lookup.");
    return null;
  }

  try {
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(apiKey)}&query=${encodeURIComponent(itemName)}&dataType=Foundation,SR%20Legacy&pageSize=1`;
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`USDA FoodData Central API call failed with status ${res.status}`);
      return null;
    }

    const data: any = await res.json();
    if (!data || !Array.isArray(data.foods) || data.foods.length === 0) {
      return null;
    }

    const matchedFood = data.foods[0];
    const similarity = calculateOverlapSimilarity(itemName, matchedFood.description);

    // Similarity threshold of 0.5 (token overlap)
    if (similarity < 0.5) {
      console.log(`USDA match "${matchedFood.description}" rejected for "${itemName}" (similarity: ${similarity.toFixed(2)})`);
      return null;
    }

    console.log(`USDA match "${matchedFood.description}" accepted for "${itemName}" (similarity: ${similarity.toFixed(2)})`);

    // Extract macros per 100g
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fats = 0;

    const nutrients = matchedFood.foodNutrients || [];
    for (const nut of nutrients) {
      const name = (nut.nutrientName || '').toLowerCase();
      const id = Number(nut.nutrientId);

      if (id === 1008 || name.includes('energy') || nut.unitName === 'KCAL') {
        calories = Number(nut.value) || calories;
      } else if (id === 1003 || name.includes('protein')) {
        protein = Number(nut.value) || protein;
      } else if (id === 1005 || name.includes('carbohydrate')) {
        carbs = Number(nut.value) || carbs;
      } else if (id === 1004 || name.includes('lipid') || name === 'fat') {
        fats = Number(nut.value) || fats;
      }
    }

    return {
      calories,
      protein,
      carbs,
      fats,
      fdcId: matchedFood.fdcId,
      foodName: matchedFood.description
    };
  } catch (err) {
    console.error("USDA lookup error:", err);
    return null;
  }
}
