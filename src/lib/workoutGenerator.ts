import { supabase } from './supabase';

export interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string;
  level: string;
  instructions: string[];
  image_urls: string[];
  youtube_url?: string;
  source: string;
}

export type WorkoutGoal = 'strength' | 'hypertrophy' | 'endurance';

export type WorkoutSplit = 'push_pull_legs' | 'upper_lower' | 'full_body' | 'single_focus';

export interface Scheme {
  reps: string;
  sets: number;
  rest: number; // in seconds
}

export const GOAL_SCHEMES: Record<WorkoutGoal, Scheme> = {
  strength: { reps: '3-8', sets: 4, rest: 120 },
  hypertrophy: { reps: '8-15', sets: 4, rest: 90 },
  endurance: { reps: '12-30', sets: 3, rest: 60 }
};

export const SPLIT_MUSCLES: Record<string, string[]> = {
  // Push / Pull / Legs
  push: ['Chest', 'Shoulders', 'Triceps'],
  pull: ['Lats', 'Middle back', 'Lower back', 'Biceps', 'Forearms', 'Traps'],
  legs: ['Quadriceps', 'Hamstrings', 'Calves', 'Glutes', 'Abductors', 'Abductors'],
  
  // Upper / Lower
  upper: ['Chest', 'Shoulders', 'Triceps', 'Lats', 'Middle back', 'Lower back', 'Biceps', 'Forearms', 'Traps'],
  lower: ['Quadriceps', 'Hamstrings', 'Calves', 'Glutes', 'Abductors', 'Abductors', 'Abdominals'],
  
  // Full Body
  full_body: ['Chest', 'Shoulders', 'Triceps', 'Lats', 'Middle back', 'Lower back', 'Biceps', 'Quadriceps', 'Hamstrings', 'Calves', 'Glutes', 'Abdominals']
};

export interface GeneratedExerciseSlot {
  exercise: Exercise;
  target_sets: number;
  target_reps: string;
  rest: number;
}

// Generate workout
export async function generateWorkout(
  split: WorkoutSplit,
  day: string, // 'push', 'pull', 'legs', 'upper', 'lower', 'full_body', or focus muscles
  goal: WorkoutGoal,
  focusMuscles?: string[]
): Promise<GeneratedExerciseSlot[]> {
  if (!supabase) return [];

  // Determine target muscle groups
  let targetMuscles: string[] = [];
  if (split === 'single_focus' && focusMuscles && focusMuscles.length > 0) {
    targetMuscles = focusMuscles;
  } else {
    targetMuscles = SPLIT_MUSCLES[day.toLowerCase()] || SPLIT_MUSCLES['full_body'];
  }

  // Fetch exercises matching target muscles
  const { data: rawExercises, error } = await supabase
    .from('exercises')
    .select('*')
    .in('muscle_group', targetMuscles);

  if (error || !rawExercises) {
    console.error('Failed to fetch exercises for generation:', error);
    return [];
  }

  const exercises = rawExercises as Exercise[];
  if (exercises.length === 0) return [];

  // Group by muscle to ensure variety
  const exercisesByMuscle: Record<string, Exercise[]> = {};
  for (const muscle of targetMuscles) {
    exercisesByMuscle[muscle] = exercises.filter(e => e.muscle_group === muscle);
  }

  // Helper to check if an equipment is compound
  const isCompound = (eq: string) => {
    const e = eq.toLowerCase();
    return e.includes('barbell') || e.includes('dumbbell');
  };

  // Sort each muscle group's exercises: compound first, then randomize
  for (const muscle of targetMuscles) {
    if (exercisesByMuscle[muscle]) {
      exercisesByMuscle[muscle].sort((a, b) => {
        const aComp = isCompound(a.equipment);
        const bComp = isCompound(b.equipment);
        if (aComp && !bComp) return -1;
        if (!aComp && bComp) return 1;
        return Math.random() - 0.5; // Randomize order within compound/isolation groups
      });
    }
  }

  const scheme = GOAL_SCHEMES[goal];
  const workoutLength = Math.max(5, Math.min(7, targetMuscles.length * 2));
  const selectedSlots: GeneratedExerciseSlot[] = [];
  
  let lastMuscle = '';
  const muscleIndices: Record<string, number> = {};
  for (const m of targetMuscles) {
    muscleIndices[m] = 0;
  }

  for (let i = 0; i < workoutLength; i++) {
    // Pick the muscle group for this slot
    // Rotate through target muscles, but skip lastMuscle if we have options
    let candidateMuscle = '';
    const availableMuscles = targetMuscles.filter(m => {
      const list = exercisesByMuscle[m] || [];
      const idx = muscleIndices[m] || 0;
      return idx < list.length;
    });

    if (availableMuscles.length === 0) break;

    // Try to pick a muscle different from lastMuscle
    const nonDupeMuscles = availableMuscles.filter(m => m !== lastMuscle);
    if (nonDupeMuscles.length > 0) {
      candidateMuscle = nonDupeMuscles[Math.floor(Math.random() * nonDupeMuscles.length)];
    } else {
      candidateMuscle = availableMuscles[0];
    }

    const list = exercisesByMuscle[candidateMuscle];
    const idx = muscleIndices[candidateMuscle];
    const exercise = list[idx];
    
    if (exercise) {
      muscleIndices[candidateMuscle]++;
      lastMuscle = candidateMuscle;

      selectedSlots.push({
        exercise,
        target_sets: scheme.sets,
        target_reps: scheme.reps,
        rest: scheme.rest
      });
    }
  }

  return selectedSlots;
}

// Swap single exercise slot
export async function swapExerciseSlot(
  currentSlot: GeneratedExerciseSlot,
  alreadySelectedIds: string[],
  goal: WorkoutGoal
): Promise<GeneratedExerciseSlot | null> {
  if (!supabase) return null;

  const muscle = currentSlot.exercise.muscle_group;

  // Fetch exercises matching the same muscle group
  const { data: rawExercises } = await supabase
    .from('exercises')
    .select('*')
    .eq('muscle_group', muscle);

  if (!rawExercises) return null;

  const exercises = rawExercises as Exercise[];
  const candidates = exercises.filter(e => !alreadySelectedIds.includes(e.id));

  if (candidates.length === 0) return null;

  // Prefer compound, then random
  candidates.sort((a, b) => {
    const aComp = a.equipment.toLowerCase().includes('barbell') || a.equipment.toLowerCase().includes('dumbbell');
    const bComp = b.equipment.toLowerCase().includes('barbell') || b.equipment.toLowerCase().includes('dumbbell');
    if (aComp && !bComp) return -1;
    if (!aComp && bComp) return 1;
    return Math.random() - 0.5;
  });

  const scheme = GOAL_SCHEMES[goal];

  return {
    exercise: candidates[0],
    target_sets: scheme.sets,
    target_reps: scheme.reps,
    rest: scheme.rest
  };
}
