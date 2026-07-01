-- Migration: Create meal_scan_logs table for AI meal-analysis observability

CREATE TABLE IF NOT EXISTS public.meal_scan_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  input_type TEXT NOT NULL,
  raw_ai_response JSONB,
  success BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Track which AI provider served (or attempted) the scan
ALTER TABLE public.meal_scan_logs ADD COLUMN IF NOT EXISTS provider TEXT;

ALTER TABLE public.meal_scan_logs ENABLE ROW LEVEL SECURITY;

-- Inserts are performed exclusively by the server via the service role key,
-- which bypasses RLS, so no INSERT policy is granted to other roles.
DROP POLICY IF EXISTS "Users can view their own meal scan logs" ON public.meal_scan_logs;
CREATE POLICY "Users can view their own meal scan logs" ON public.meal_scan_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
