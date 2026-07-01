-- Migration: health_metrics idempotent sync upgrades and daily summary view

-- 1. Modify the type check constraint to include all required iOS HealthKit fields
ALTER TABLE public.health_metrics DROP CONSTRAINT IF EXISTS health_metrics_type_check;
ALTER TABLE public.health_metrics ADD CONSTRAINT health_metrics_type_check 
  CHECK (type IN ('steps', 'workout', 'weight', 'active_energy', 'resting_hr', 'sleep_hours', 'distance_km'));

-- 2. Add a UNIQUE constraint for idempotency: (user_id, type, start_date)
ALTER TABLE public.health_metrics ADD CONSTRAINT health_metrics_user_type_start_date_key 
  UNIQUE (user_id, type, start_date);

-- 3. Create health_daily_summary view for tracking trends on the dashboard
CREATE OR REPLACE VIEW public.health_daily_summary 
WITH (security_invoker = true) AS
SELECT 
  user_id,
  date_trunc('day', start_date) AS day,
  type,
  max(value) AS value
FROM public.health_metrics
GROUP BY user_id, date_trunc('day', start_date), type;

-- Grant permissions to authenticated users to select from the summary view
GRANT SELECT ON public.health_daily_summary TO authenticated;
GRANT SELECT ON public.health_daily_summary TO service_role;

-- 4. Ensure profiles update policies exist for self-regeneration of tokens
DROP POLICY IF EXISTS "Users can update own profiles" ON public.profiles;
CREATE POLICY "Users can update own profiles" ON public.profiles 
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
