-- Migration: Add sync_token to profiles and fix meal_scan_logs RLS inserts

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sync_token uuid DEFAULT gen_random_uuid();

-- Correct RLS policy for meal_scan_logs inserts
DROP POLICY IF EXISTS "Authenticated can insert meal scan logs" ON public.meal_scan_logs;
CREATE POLICY "Users insert own scan logs" ON public.meal_scan_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
