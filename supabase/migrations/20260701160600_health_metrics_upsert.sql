-- Migration: Create health_metrics table and daily summary view

-- 1. Create health_metrics table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own health metrics" ON public.health_metrics;
CREATE POLICY "Users manage own health metrics" ON public.health_metrics 
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 2. Add or replace the type check constraint
ALTER TABLE public.health_metrics DROP CONSTRAINT IF EXISTS health_metrics_type_check;
ALTER TABLE public.health_metrics ADD CONSTRAINT health_metrics_type_check 
  CHECK (type IN ('steps', 'workout', 'weight', 'active_energy', 'resting_hr', 'sleep_hours', 'distance_km'));

-- 3. Add unique constraint for idempotent sync upserts (user_id, type, start_date)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'health_metrics_user_type_start_date_key'
  ) THEN
    ALTER TABLE public.health_metrics 
      ADD CONSTRAINT health_metrics_user_type_start_date_key 
      UNIQUE (user_id, type, start_date);
  END IF;
END $$;

-- 4. Create health_daily_summary view for dashboard trend charts
CREATE OR REPLACE VIEW public.health_daily_summary 
WITH (security_invoker = true) AS
SELECT 
  user_id,
  date_trunc('day', start_date) AS day,
  type,
  max(value) AS value
FROM public.health_metrics
GROUP BY user_id, date_trunc('day', start_date), type;

GRANT SELECT ON public.health_daily_summary TO authenticated;
GRANT SELECT ON public.health_daily_summary TO service_role;

-- 5. Ensure profiles self-update policy exists
DROP POLICY IF EXISTS "Users can update own profiles" ON public.profiles;
CREATE POLICY "Users can update own profiles" ON public.profiles 
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
