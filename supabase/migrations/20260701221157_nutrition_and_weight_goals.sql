-- Migration: Restructure meal type check, add grounded column, and add target_weight_kg to profiles
-- Also allow 'ai_detected' in meal_items.source check constraint

-- 1. Restructure meals.meal_type
UPDATE public.meals SET meal_type = LOWER(TRIM(meal_type)) WHERE meal_type IS NOT NULL;
UPDATE public.meals SET meal_type = 'snack' WHERE meal_type IS NULL OR LOWER(TRIM(meal_type)) NOT IN ('breakfast', 'lunch', 'dinner', 'snack');

ALTER TABLE public.meals DROP CONSTRAINT IF EXISTS meals_meal_type_check;
ALTER TABLE public.meals ADD CONSTRAINT meals_meal_type_check CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack'));

-- 2. Add grounded to meal_items
ALTER TABLE public.meal_items ADD COLUMN IF NOT EXISTS grounded BOOLEAN DEFAULT false;

-- 3. Update meal_items_source_check constraint to allow 'ai_detected'
ALTER TABLE public.meal_items DROP CONSTRAINT IF EXISTS meal_items_source_check;
ALTER TABLE public.meal_items ADD CONSTRAINT meal_items_source_check CHECK (source IN ('manual_entry', 'barcode', 'ai_detected'));

-- 4. Add target_weight_kg to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_weight_kg NUMERIC DEFAULT NULL;
