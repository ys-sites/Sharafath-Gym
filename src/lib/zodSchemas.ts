import { z } from 'zod';

// 1. /api/session Response Schema
export const SessionResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
});

// 2. AI Meal Analysis Schema
export const MealItemSchema = z.object({
  name: z.string().default('Unknown Item'),
  portion: z.string().default('1 serving'),
  calories: z.coerce.number().default(0),
  protein: z.coerce.number().default(0),
  carbs: z.coerce.number().default(0),
  fats: z.coerce.number().default(0),
});

export const MealTotalSchema = z.object({
  calories: z.coerce.number().default(0),
  protein: z.coerce.number().default(0),
  carbs: z.coerce.number().default(0),
  fats: z.coerce.number().default(0),
});

export const AIResponseSchema = z.object({
  items: z.array(MealItemSchema).default([]),
  total: MealTotalSchema.optional().default({ calories: 0, protein: 0, carbs: 0, fats: 0 }),
});

// 3. Open Food Facts Product Schema
export const OFFProductSchema = z.object({
  status: z.number(),
  product: z.object({
    product_name: z.string().optional().default('Unknown Item'),
    brands: z.string().optional().default(''),
    serving_size: z.string().optional().default('100g'),
    serving_quantity: z.coerce.number().optional().default(100),
    nutriments: z.object({
      'energy-kcal_100g': z.coerce.number().optional().default(0),
      'energy-kcal': z.coerce.number().optional().default(0),
      'proteins_100g': z.coerce.number().optional().default(0),
      'proteins': z.coerce.number().optional().default(0),
      'carbohydrates_100g': z.coerce.number().optional().default(0),
      'carbohydrates': z.coerce.number().optional().default(0),
      'fat_100g': z.coerce.number().optional().default(0),
      'fat': z.coerce.number().optional().default(0),
    }).optional().default({}),
  }).optional(),
});
