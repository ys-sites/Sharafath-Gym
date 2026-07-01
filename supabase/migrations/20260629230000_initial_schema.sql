-- Bootstrap migration: recreates the baseline schema (previously only applied ad hoc via
-- supabase/schema.sql / the SQL editor, never tracked as a migration). Every later migration
-- in this folder assumes these tables already exist (ALTER TABLE ... on profiles, meals,
-- meal_items, workout_sessions, etc.), so a fresh database/preview branch replaying migrations
-- from scratch fails without this file. Everything here is idempotent and safe to run against
-- a database that already has these objects (production).

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Exercises Library
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  muscle_group TEXT,
  youtube_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout Templates (Programs)
CREATE TABLE IF NOT EXISTS public.workout_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  split_day TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercises within a template
CREATE TABLE IF NOT EXISTS public.template_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES public.workout_templates(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES public.exercises(id),
  order_index INTEGER NOT NULL,
  target_sets INTEGER,
  target_reps TEXT,
  is_circuit BOOLEAN DEFAULT false,
  circuit_group_id UUID
);

-- Workout Sessions (History)
CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  template_id UUID REFERENCES public.workout_templates(id),
  name TEXT NOT NULL,
  category TEXT,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  active_duration_seconds INTEGER DEFAULT 0,
  total_volume NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Status column (tracks whether a live-logged session finished, was abandoned, or is ongoing)
ALTER TABLE public.workout_sessions ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'in_progress';
ALTER TABLE public.workout_sessions DROP CONSTRAINT IF EXISTS workout_sessions_status_check;
ALTER TABLE public.workout_sessions ADD CONSTRAINT workout_sessions_status_check
  CHECK (status IN ('completed', 'incomplete', 'in_progress'));

-- Exercises performed in a session
CREATE TABLE IF NOT EXISTS public.session_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES public.exercises(id),
  order_index INTEGER NOT NULL,
  is_circuit BOOLEAN DEFAULT false,
  circuit_group_id UUID
);

-- Sets performed for a session exercise
CREATE TABLE IF NOT EXISTS public.sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_exercise_id UUID REFERENCES public.session_exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight NUMERIC NOT NULL,
  rpe NUMERIC,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_calorie_target INTEGER DEFAULT 2200,
  protein_target_g INTEGER DEFAULT 160,
  carbs_target_g INTEGER DEFAULT 300,
  fats_target_g INTEGER DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meals
CREATE TABLE IF NOT EXISTS public.meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  meal_type TEXT,
  photo_url TEXT,
  ai_raw_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meal Items
CREATE TABLE IF NOT EXISTS public.meal_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_id UUID REFERENCES public.meals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  portion TEXT,
  calories INTEGER DEFAULT 0,
  protein_g INTEGER DEFAULT 0,
  carbs_g INTEGER DEFAULT 0,
  fats_g INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_items ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view global exercises and their own" ON public.exercises;
CREATE POLICY "Users can view global exercises and their own" ON public.exercises
  FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own exercises" ON public.exercises;
CREATE POLICY "Users can insert their own exercises" ON public.exercises
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage their own templates" ON public.workout_templates;
CREATE POLICY "Users can manage their own templates" ON public.workout_templates
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage their own template exercises" ON public.template_exercises;
CREATE POLICY "Users can manage their own template exercises" ON public.template_exercises
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.workout_templates WHERE id = template_exercises.template_id AND user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can manage their own sessions" ON public.workout_sessions;
CREATE POLICY "Users can manage their own sessions" ON public.workout_sessions
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage their own session exercises" ON public.session_exercises;
CREATE POLICY "Users can manage their own session exercises" ON public.session_exercises
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.workout_sessions WHERE id = session_exercises.session_id AND user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can manage their own sets" ON public.sets;
CREATE POLICY "Users can manage their own sets" ON public.sets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.session_exercises se
      JOIN public.workout_sessions ws ON ws.id = se.session_id
      WHERE se.id = sets.session_exercise_id AND ws.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage their own profiles" ON public.profiles;
CREATE POLICY "Users can manage their own profiles" ON public.profiles
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage their own meals" ON public.meals;
CREATE POLICY "Users can manage their own meals" ON public.meals
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage their own meal items" ON public.meal_items;
CREATE POLICY "Users can manage their own meal items" ON public.meal_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.meals WHERE id = meal_items.meal_id AND user_id = auth.uid())
  );

-- Seed a handful of default global exercises (only if not already present, e.g. from a later seed)
INSERT INTO public.exercises (name, muscle_group, youtube_url)
SELECT v.name, v.muscle_group, v.youtube_url
FROM (VALUES
  ('Barbell Bench Press', 'Chest', 'https://www.youtube.com/watch?v=rxD321l2svE'),
  ('Squat', 'Legs', 'https://www.youtube.com/watch?v=bEv6CCg2BC8'),
  ('Deadlift', 'Back', 'https://www.youtube.com/watch?v=op9kVnSso6Q'),
  ('Pull-up', 'Back', 'https://www.youtube.com/watch?v=eGo4IYtl4jO'),
  ('Overhead Press', 'Shoulders', 'https://www.youtube.com/watch?v=2yjwXTZEpac')
) AS v(name, muscle_group, youtube_url)
WHERE NOT EXISTS (SELECT 1 FROM public.exercises e WHERE e.name = v.name);
