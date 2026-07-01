-- Widen meal_items.source to allow AI-scanned entries, and index meals for fast date-range lookups.

ALTER TABLE public.meal_items DROP CONSTRAINT IF EXISTS meal_items_source_check;
ALTER TABLE public.meal_items ADD CONSTRAINT meal_items_source_check
  CHECK (source IN ('manual_entry', 'barcode', 'ai_detected', 'ai_recalculated'));

CREATE INDEX IF NOT EXISTS meals_user_logged_idx ON public.meals (user_id, logged_at);
