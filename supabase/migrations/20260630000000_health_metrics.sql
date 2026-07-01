CREATE TABLE IF NOT EXISTS public.health_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('steps', 'workout', 'weight', 'active_energy')),
  value numeric NOT NULL,
  unit text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  synced_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS health_metrics_user_type_date_idx ON public.health_metrics (user_id, type, start_date);

ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own health metrics"
  ON public.health_metrics
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health metrics"
  ON public.health_metrics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
