-- Supabase Schema for TrainTrack

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Exercises Library
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id), -- If null, it's a global default exercise
  name TEXT NOT NULL,
  muscle_group TEXT,
  youtube_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout Templates (Programs)
CREATE TABLE workout_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  split_day TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercises within a template
CREATE TABLE template_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES workout_templates(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id),
  order_index INTEGER NOT NULL,
  target_sets INTEGER,
  target_reps TEXT,
  is_circuit BOOLEAN DEFAULT false,
  circuit_group_id UUID -- To group exercises into supersets/circuits
);

-- Workout Sessions (History)
CREATE TABLE workout_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  template_id UUID REFERENCES workout_templates(id), -- Optional, if started from template
  name TEXT NOT NULL,
  category TEXT,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  active_duration_seconds INTEGER DEFAULT 0,
  total_volume NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercises performed in a session
CREATE TABLE session_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id),
  order_index INTEGER NOT NULL,
  is_circuit BOOLEAN DEFAULT false,
  circuit_group_id UUID
);

-- Sets performed for a session exercise
CREATE TABLE sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_exercise_id UUID REFERENCES session_exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight NUMERIC NOT NULL,
  rpe NUMERIC, -- Rate of Perceived Exertion (1-5 scale mapped to 1-10 if needed)
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Setup RLS (Row Level Security)
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_calorie_target INTEGER DEFAULT 2200,
  protein_target_g INTEGER DEFAULT 160,
  carbs_target_g INTEGER DEFAULT 300,
  fats_target_g INTEGER DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meals
CREATE TABLE meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  meal_type TEXT,
  photo_url TEXT,
  ai_raw_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meal Items
CREATE TABLE meal_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_id UUID REFERENCES meals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  portion TEXT,
  calories INTEGER DEFAULT 0,
  protein_g INTEGER DEFAULT 0,
  carbs_g INTEGER DEFAULT 0,
  fats_g INTEGER DEFAULT 0
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own profiles" ON profiles FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage their own meals" ON meals FOR ALL USING (user_id = auth.uid());

-- Allow users to manage related tables if they own the parent session/template
-- (Simplified for prototype: we'll use a service role or let the user fetch directly if RLS is tricky to set up perfectly without full testing, but ideally these would join to check auth.uid())
CREATE POLICY "Users can manage their own meal items" ON meal_items FOR ALL USING (
  EXISTS (SELECT 1 FROM meals WHERE id = meal_items.meal_id AND user_id = auth.uid())
);


-- Policies
CREATE POLICY "Users can view global exercises and their own" ON exercises
  FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can insert their own exercises" ON exercises
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- For other tables, users can only manage their own data
-- (Assuming cascading policies or explicitly defining them for each)
CREATE POLICY "Users can manage their own templates" ON workout_templates
  FOR ALL USING (user_id = auth.uid());
  
CREATE POLICY "Users can manage their own sessions" ON workout_sessions
  FOR ALL USING (user_id = auth.uid());
  
-- Allow users to manage related tables if they own the parent session/template
-- (Simplified for prototype: we'll use a service role or let the user fetch directly if RLS is tricky to set up perfectly without full testing, but ideally these would join to check auth.uid())

-- We will insert some default exercises for the prototype
INSERT INTO exercises (name, muscle_group, youtube_url) VALUES 
('Barbell Bench Press', 'Chest', 'https://www.youtube.com/watch?v=rxD321l2svE'),
('Squat', 'Legs', 'https://www.youtube.com/watch?v=bEv6CCg2BC8'),
('Deadlift', 'Back', 'https://www.youtube.com/watch?v=op9kVnSso6Q'),
('Pull-up', 'Back', 'https://www.youtube.com/watch?v=eGo4IYtl4jO'),
('Overhead Press', 'Shoulders', 'https://www.youtube.com/watch?v=2yjwXTZEpac');
