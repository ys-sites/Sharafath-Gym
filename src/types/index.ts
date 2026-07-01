export type Exercise = {
  id: string;
  user_id?: string | null;
  name: string;
  muscle_group: string;
  youtube_url?: string | null;
  created_at?: string;
};

export type WorkoutSession = {
  id: string;
  user_id: string;
  template_id?: string | null;
  name: string;
  category: string;
  start_time: string;
  end_time?: string | null;
  active_duration_seconds: number;
  total_volume: number;
  created_at?: string;
};

export type SessionExercise = {
  id: string;
  session_id: string;
  exercise_id: string;
  order_index: number;
  is_circuit: boolean;
  circuit_group_id?: string | null;
  exercise?: Exercise; // Joined
  sets?: SetRecord[];
};

export type SetRecord = {
  id: string;
  session_exercise_id: string;
  set_number: number;
  reps: number;
  weight: number;
  rpe?: number | null;
  completed_at?: string;
};
