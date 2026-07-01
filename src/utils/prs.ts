import { supabase } from '../lib/supabase';

export function calculate1RM(weight: number, reps: number): number {
  if (reps === 0) return 0;
  if (reps === 1) return weight;
  // Epley 1RM formula: weight * (1 + reps / 30)
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

export interface PastSet {
  weight: number;
  reps: number;
  created_at: string;
}

export async function getPastSetsForExercise(userId: string, exerciseId: string): Promise<PastSet[]> {
  try {
    // 1. Fetch sessions for this user to get session IDs
    const { data: sessions, error: sErr } = await supabase
      .from('workout_sessions')
      .select('id')
      .eq('user_id', userId);
    
    if (sErr || !sessions || sessions.length === 0) return [];
    const sessionIds = sessions.map(s => s.id);

    // 2. Fetch session exercises for this exercise
    const { data: sessionExs, error: sxErr } = await supabase
      .from('session_exercises')
      .select('id')
      .eq('exercise_id', exerciseId)
      .in('session_id', sessionIds);

    if (sxErr || !sessionExs || sessionExs.length === 0) return [];
    const sxIds = sessionExs.map(sx => sx.id);

    // 3. Fetch sets
    const { data: sets, error: setsErr } = await supabase
      .from('sets')
      .select('weight, reps, created_at')
      .in('session_exercise_id', sxIds)
      .order('created_at', { ascending: true });

    if (setsErr || !sets) return [];
    return sets.map(s => ({
      weight: Number(s.weight) || 0,
      reps: Number(s.reps) || 0,
      created_at: s.created_at
    }));
  } catch (err) {
    console.error("Error in getPastSetsForExercise:", err);
    return [];
  }
}

export function getExercisePRs(pastSets: { weight: number; reps: number }[]) {
  let maxWeight = 0;
  let max1RM = 0;

  pastSets.forEach(s => {
    const w = Number(s.weight) || 0;
    const r = Number(s.reps) || 0;
    if (w > maxWeight) maxWeight = w;
    const oneRepMax = calculate1RM(w, r);
    if (oneRepMax > max1RM) max1RM = oneRepMax;
  });

  return { maxWeight, max1RM };
}
