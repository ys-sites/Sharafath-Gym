-- Migration: Add source to meal_items, create water_logs table, and add water_goal_ml to profiles

-- 1. Add source column and check constraint to meal_items
ALTER TABLE public.meal_items ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual_entry';
ALTER TABLE public.meal_items DROP CONSTRAINT IF EXISTS meal_items_source_check;
ALTER TABLE public.meal_items ADD CONSTRAINT meal_items_source_check 
  CHECK (source IN ('manual_entry', 'barcode'));

-- 2. Add water_goal_ml to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS water_goal_ml INTEGER DEFAULT 2500;

-- 3. Create water_logs table
CREATE TABLE IF NOT EXISTS public.water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  amount_ml INTEGER NOT NULL CHECK (amount_ml > 0 AND amount_ml <= 2000)
);

-- Enable RLS on water_logs
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for water_logs
DROP POLICY IF EXISTS "Users can manage their own water logs" ON public.water_logs;
CREATE POLICY "Users can manage their own water logs" ON public.water_logs
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
