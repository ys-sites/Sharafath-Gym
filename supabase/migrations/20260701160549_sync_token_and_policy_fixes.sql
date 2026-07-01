-- Migration: Add sync_token to profiles and ensure meal_scan_logs exists with correct RLS

-- 1. Create meal_scan_logs if it doesn't exist
CREATE TABLE IF NOT EXISTS public.meal_scan_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url TEXT,
  ai_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.meal_scan_logs ENABLE ROW LEVEL SECURITY;

-- 2. Add sync_token column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sync_token uuid DEFAULT gen_random_uuid();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS apple_health_connected BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS steps_synced_today INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS calories_synced_today INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_health_sync TIMESTAMP WITH TIME ZONE;

-- 3. Fix RLS policy for meal_scan_logs inserts
DROP POLICY IF EXISTS "Authenticated can insert meal scan logs" ON public.meal_scan_logs;
DROP POLICY IF EXISTS "Users insert own scan logs" ON public.meal_scan_logs;
CREATE POLICY "Users insert own scan logs" ON public.meal_scan_logs 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users select own scan logs" ON public.meal_scan_logs 
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
