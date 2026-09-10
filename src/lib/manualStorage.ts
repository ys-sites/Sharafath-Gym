export interface ManualExerciseSet {
  setNumber: number;
  weightKg: number | null; // null if bodyweight or plank
  reps: number | null; // null if duration/plank
  durationSeconds?: number | null;
  rpe?: number | null;
  completed: boolean;
  notes?: string;
}

export interface ManualLoggedExercise {
  name: string;
  targetSetsReps: string;
  isSkipped: boolean;
  sets: ManualExerciseSet[];
  notes?: string;
}

export interface ManualWorkoutSession {
  id: string;
  date: string; // ISO date YYYY-MM-DD
  dayLabel: string; // "Day 1 Push", "Day 2 Pull", "Day 3 Legs", "Day 5 Upper", "Day 6 Lower", etc.
  title: string;
  durationMinutes: number;
  cardioSummary?: string;
  exercises: ManualLoggedExercise[];
  overallNotes?: string;
  totalVolumeKg: number;
  totalSetsCompleted: number;
  createdAt: string;
}

export interface ManualWeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  bodyFatPct?: number | null;
  waistCm?: number | null;
  chestCm?: number | null;
  armsCm?: number | null;
  sleepHours: number;
  stressLevel: number; // 1-5
  energyLevel: number; // 1-10
  notes?: string;
}

export interface ManualNutritionEntry {
  id: string;
  date: string; // YYYY-MM-DD
  calories: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  waterLiters: number;
  halalCompliant: boolean;
  notes?: string;
}

export interface GymDataStore {
  version: string;
  lastUpdated: string;
  workouts: ManualWorkoutSession[];
  weights: ManualWeightEntry[];
  nutrition: ManualNutritionEntry[];
}

const STORAGE_KEY = "sharafath_ascension_gym_store_v2";

export const INITIAL_SEED_DATA: GymDataStore = {
  version: "2.0.0",
  lastUpdated: new Date().toISOString(),
  workouts: [
    // 1. Prior Day 6 Lower (2 weeks ago - for progression comparison)
    {
      id: "seed-day6-prev-1",
      date: "2026-08-26",
      dayLabel: "Day 6 Lower",
      title: "Phase 2 Day 6 Lower",
      durationMinutes: 62,
      cardioSummary: "Steps logged throughout day",
      totalVolumeKg: 1980,
      totalSetsCompleted: 15,
      createdAt: "2026-08-26T18:00:00.000Z",
      overallNotes: "First time testing smith squat and walking lunge combination.",
      exercises: [
        {
          name: "Smith machine squat",
          targetSetsReps: "3 × 6–10",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: 20, reps: 6, completed: true },
            { setNumber: 2, weightKg: 20, reps: 6, completed: true },
            { setNumber: 3, weightKg: 20, reps: 6, completed: true }
          ]
        },
        {
          name: "Walking lunge",
          targetSetsReps: "2 × 10–12 each leg",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: 20, reps: 10, completed: true },
            { setNumber: 2, weightKg: 20, reps: 10, completed: true }
          ]
        },
        {
          name: "Leg extension",
          targetSetsReps: "2 × 12–15",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: 30, reps: 12, completed: true },
            { setNumber: 2, weightKg: 30, reps: 12, completed: true }
          ]
        },
        {
          name: "Romanian deadlift",
          targetSetsReps: "3 × 8–10",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: 25, reps: 8, completed: true },
            { setNumber: 2, weightKg: 25, reps: 8, completed: true },
            { setNumber: 3, weightKg: 25, reps: 8, completed: true }
          ]
        },
        {
          name: "Lying leg curl",
          targetSetsReps: "3 × 10–15",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: 20, reps: 10, completed: true },
            { setNumber: 2, weightKg: 20, reps: 10, completed: true },
            { setNumber: 3, weightKg: 20, reps: 10, completed: true }
          ]
        }
      ]
    },
    // 2. Day 1 Push (Sept 1)
    {
      id: "seed-day1-push",
      date: "2026-09-01",
      dayLabel: "Day 1 Push",
      title: "Phase 2 Day 1 Push",
      durationMinutes: 65,
      cardioSummary: "15 min incline treadmill walk at 10% incline, 4.0 km/h",
      totalVolumeKg: 2420,
      totalSetsCompleted: 20,
      createdAt: "2026-09-01T17:30:00.000Z",
      overallNotes: "Felt strong on chest press. Kept dips skipped for shoulder comfort per coach Mousa's advice.",
      exercises: [
        {
          name: "Machine chest press",
          targetSetsReps: "3 × 6–10",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: 35, reps: 8, completed: true },
            { setNumber: 2, weightKg: 35, reps: 8, completed: true },
            { setNumber: 3, weightKg: 35, reps: 7, completed: true }
          ]
        },
        {
          name: "Incline dumbbell press",
          targetSetsReps: "3 × 8–12",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: 16, reps: 10, completed: true },
            { setNumber: 2, weightKg: 16, reps: 9, completed: true },
            { setNumber: 3, weightKg: 16, reps: 8, completed: true }
          ]
        },
        {
          name: "Machine pec deck fly",
          targetSetsReps: "2 × 10–15",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: 27, reps: 12, completed: true },
            { setNumber: 2, weightKg: 27, reps: 11, completed: true }
          ]
        },
        {
          name: "Supported dips",
          targetSetsReps: "3 × 10",
          isSkipped: true,
          sets: [],
          notes: "Skipped per coach 2-week adaptation rule."
        },
        {
          name: "Dumbbell lateral raise",
          targetSetsReps: "3 × 12–15",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: 8, reps: 14, completed: true },
            { setNumber: 2, weightKg: 8, reps: 13, completed: true },
            { setNumber: 3, weightKg: 8, reps: 12, completed: true }
          ]
        },
        {
          name: "Reverse pec deck",
          targetSetsReps: "3 × 12–15",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: 22, reps: 13, completed: true },
            { setNumber: 2, weightKg: 22, reps: 12, completed: true },
            { setNumber: 3, weightKg: 22, reps: 12, completed: true }
          ]
        },
        {
          name: "Triceps pushdown",
          targetSetsReps: "3 × 10–15",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: 18, reps: 12, completed: true },
            { setNumber: 2, weightKg: 18, reps: 12, completed: true },
            { setNumber: 3, weightKg: 18, reps: 11, completed: true }
          ]
        },
        {
          name: "Overhead rope extension",
          targetSetsReps: "3 × 10–15",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: 14, reps: 12, completed: true },
            { setNumber: 2, weightKg: 14, reps: 11, completed: true },
            { setNumber: 3, weightKg: 14, reps: 10, completed: true }
          ]
        }
      ]
    },
    // 3. Day 2 Pull (Sept 3)
    {
      id: "seed-day2-pull",
      date: "2026-09-03",
      dayLabel: "Day 2 Pull",
      title: "Phase 2 Day 2 Pull",
      durationMinutes: 68,
      cardioSummary: "15 mins on StairMaster easy pace, level 5",
      totalVolumeKg: 2850,
      totalSetsCompleted: 24,
      createdAt: "2026-09-03T18:15:00.000Z",
      overallNotes: "Lats felt very engaged. Focused on pulling toward lower ribs on seated cable row.",
      exercises: [
        {
          name: "Wide-grip lat pulldown",
          targetSetsReps: "3 × 8–12",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: 40, reps: 10, completed: true },
            { setNumber: 2, weightKg: 40, reps: 10, completed: true },
            { setNumber: 3, weightKg: 40, reps: 9, completed: true }
          ]
        },
        {
          name: "Close-grip lat pulldown",
          targetSetsReps: "3 × 8–12",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: 45, reps: 10, completed: true },
            { setNumber: 2, weightKg: 45, reps: 9, completed: true },
            { setNumber: 3, weightKg: 45, reps: 8, completed: true }
          ]
        },
        {
          name: "Seated cable row",
          targetSetsReps: "3 × 8–12",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: 38, reps: 10, completed: true },
            { setNumber: 2, weightKg: 38, reps: 10, completed: true },
            { setNumber: 3, weightKg: 38, reps: 10, completed: true }
          ]
        },
        {
          name: "Wide-grip row",
          targetSetsReps: "3 × 8",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: 32, reps: 8, completed: true },
            { setNumber: 2, weightKg: 32, reps: 8, completed: true },
            { setNumber: 3, weightKg: 32, reps: 8, completed: true }
          ]
        },
        {
          name: "Lat pullover machine",
          targetSetsReps: "3 × 10–15",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: 25, reps: 12, completed: true },
            { setNumber: 2, weightKg: 25, reps: 12, completed: true },
            { setNumber: 3, weightKg: 25, reps: 11, completed: true }
          ]
        },
        {
          name: "Preacher curl",
          targetSetsReps: "3 × 8–12",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: 15, reps: 10, completed: true },
            { setNumber: 2, weightKg: 15, reps: 9, completed: true },
            { setNumber: 3, weightKg: 15, reps: 8, completed: true }
          ]
        },
        {
          name: "Incline dumbbell curl",
          targetSetsReps: "3 × 10–12",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: 10, reps: 11, completed: true },
            { setNumber: 2, weightKg: 10, reps: 10, completed: true },
            { setNumber: 3, weightKg: 10, reps: 10, completed: true }
          ]
        },
        {
          name: "Hammer curl",
          targetSetsReps: "3 × 10–12",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: 12, reps: 11, completed: true },
            { setNumber: 2, weightKg: 12, reps: 10, completed: true },
            { setNumber: 3, weightKg: 12, reps: 10, completed: true }
          ]
        }
      ]
    },
    // 4. Day 5 Upper (Sept 7)
    {
      id: "seed-day5-upper",
      date: "2026-09-07",
      dayLabel: "Day 5 Upper",
      title: "Phase 2 Day 5 Upper",
      durationMinutes: 70,
      cardioSummary: "Step routine maintained",
      totalVolumeKg: 3120,
      totalSetsCompleted: 26,
      createdAt: "2026-09-07T18:00:00.000Z",
      overallNotes: "High pump throughout chest and back. Incline machine press reached top rep range.",
      exercises: [
        {
          name: "Incline machine press",
          targetSetsReps: "3 × 8–12",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: 40, reps: 12, completed: true },
            { setNumber: 2, weightKg: 40, reps: 11, completed: true },
            { setNumber: 3, weightKg: 40, reps: 10, completed: true }
          ]
        },
        {
          name: "Machine chest press",
          targetSetsReps: "2 × 8–12",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: 38, reps: 10, completed: true },
            { setNumber: 2, weightKg: 38, reps: 9, completed: true }
          ]
        },
        {
          name: "Pull-up or assisted pull-up",
          targetSetsReps: "3 × 6–10",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: 25, reps: 8, completed: true, notes: "-25kg assist" },
            { setNumber: 2, weightKg: 25, reps: 7, completed: true, notes: "-25kg assist" },
            { setNumber: 3, weightKg: 25, reps: 6, completed: true, notes: "-25kg assist" }
          ]
        },
        {
          name: "Chest-supported row",
          targetSetsReps: "3 × 8–12",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: 30, reps: 10, completed: true },
            { setNumber: 2, weightKg: 30, reps: 10, completed: true },
            { setNumber: 3, weightKg: 30, reps: 9, completed: true }
          ]
        },
        {
          name: "Lat pullover machine",
          targetSetsReps: "2 × 10–15",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: 27, reps: 12, completed: true },
            { setNumber: 2, weightKg: 27, reps: 12, completed: true }
          ]
        },
        {
          name: "Dumbbell lateral raise",
          targetSetsReps: "3 × 12–15",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: 9, reps: 13, completed: true },
            { setNumber: 2, weightKg: 9, reps: 12, completed: true },
            { setNumber: 3, weightKg: 9, reps: 12, completed: true }
          ]
        },
        {
          name: "Reverse pec deck",
          targetSetsReps: "3 × 12–15",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: 25, reps: 13, completed: true },
            { setNumber: 2, weightKg: 25, reps: 12, completed: true },
            { setNumber: 3, weightKg: 25, reps: 12, completed: true }
          ]
        },
        {
          name: "Preacher curl",
          targetSetsReps: "3 × 10–12",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: 15, reps: 11, completed: true },
            { setNumber: 2, weightKg: 15, reps: 10, completed: true },
            { setNumber: 3, weightKg: 15, reps: 10, completed: true }
          ]
        },
        {
          name: "Cable curl",
          targetSetsReps: "2 × 10–12",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: 18, reps: 11, completed: true },
            { setNumber: 2, weightKg: 18, reps: 10, completed: true }
          ]
        },
        {
          name: "Rope pushdown",
          targetSetsReps: "3 × 10–12",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: 20, reps: 11, completed: true },
            { setNumber: 2, weightKg: 20, reps: 10, completed: true },
            { setNumber: 3, weightKg: 20, reps: 10, completed: true }
          ]
        },
        {
          name: "Overhead cable extension",
          targetSetsReps: "2 × 10–12",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: 16, reps: 11, completed: true },
            { setNumber: 2, weightKg: 16, reps: 10, completed: true }
          ]
        }
      ]
    },
    // 5. Sharafath's ACTUAL LOGGED DAY 6 LOWER SESSION (From user screenshot)
    {
      id: "sharafath-actual-day6-lower",
      date: "2026-09-09",
      dayLabel: "Day 6 Lower",
      title: "Phase 2 Day 6 Lower",
      durationMinutes: 58,
      cardioSummary: "Short walk after lifting",
      totalVolumeKg: 2476,
      totalSetsCompleted: 19,
      createdAt: "2026-09-09T20:30:00.000Z",
      overallNotes: "Solid session overall — hip thrust and cable crunch skipped, everything else hit.",
      exercises: [
        {
          name: "Smith machine squat",
          targetSetsReps: "3 × 6–10",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: 25, reps: 6, completed: true },
            { setNumber: 2, weightKg: 25, reps: 6, completed: true },
            { setNumber: 3, weightKg: 25, reps: 6, completed: true }
          ]
        },
        {
          name: "Walking lunge",
          targetSetsReps: "2 × 10–12 each leg",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: 25, reps: 10, completed: true },
            { setNumber: 2, weightKg: 25, reps: 10, completed: true }
          ]
        },
        {
          name: "Leg extension",
          targetSetsReps: "2 × 12–15",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: 34, reps: 12, completed: true },
            { setNumber: 2, weightKg: 34, reps: 12, completed: true }
          ]
        },
        {
          name: "Romanian deadlift",
          targetSetsReps: "3 × 8–10",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: 30, reps: 10, completed: true },
            { setNumber: 2, weightKg: 30, reps: 10, completed: true },
            { setNumber: 3, weightKg: 30, reps: 10, completed: true }
          ]
        },
        {
          name: "Lying leg curl",
          targetSetsReps: "3 × 10–15",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: 23, reps: 10, completed: true },
            { setNumber: 2, weightKg: 23, reps: 10, completed: true },
            { setNumber: 3, weightKg: 23, reps: 10, completed: true }
          ]
        },
        {
          name: "Hip thrust",
          targetSetsReps: "3 × 8–12",
          isSkipped: true,
          sets: [],
          notes: "Skipped"
        },
        {
          name: "Standing calf raise",
          targetSetsReps: "3 × 12–20",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: null, reps: 15, completed: true },
            { setNumber: 2, weightKg: null, reps: 15, completed: true },
            { setNumber: 3, weightKg: null, reps: 15, completed: true }
          ]
        },
        {
          name: "Seated calf raise",
          targetSetsReps: "2 × 12–20",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: 10, reps: 12, completed: true },
            { setNumber: 2, weightKg: 10, reps: 12, completed: true },
            { setNumber: 3, weightKg: 10, reps: 12, completed: true }
          ]
        },
        {
          name: "Cable crunch",
          targetSetsReps: "3 × 12–20",
          isSkipped: true,
          sets: [],
          notes: "Skipped"
        },
        {
          name: "Plank",
          targetSetsReps: "3 × 20–40 sec",
          isSkipped: false,
          sets: [
            { setNumber: 1, weightKg: null, reps: null, durationSeconds: 40, completed: true },
            { setNumber: 2, weightKg: null, reps: null, durationSeconds: 40, completed: true },
            { setNumber: 3, weightKg: null, reps: null, durationSeconds: 40, completed: true }
          ]
        }
      ]
    }
  ],
  weights: [
    {
      id: "w-1",
      date: "2026-08-20",
      weightKg: 82.0,
      sleepHours: 7,
      stressLevel: 3,
      energyLevel: 6,
      waistCm: 92,
      notes: "Starting official Ascension protocol with coach Mousa Ghanem."
    },
    {
      id: "w-2",
      date: "2026-08-24",
      weightKg: 81.7,
      sleepHours: 7.5,
      stressLevel: 2,
      energyLevel: 7,
      notes: "Meals feeling more consistent. High water intake."
    },
    {
      id: "w-3",
      date: "2026-08-28",
      weightKg: 81.3,
      sleepHours: 7,
      stressLevel: 3,
      energyLevel: 7,
      waistCm: 91.5
    },
    {
      id: "w-4",
      date: "2026-09-02",
      weightKg: 80.9,
      sleepHours: 8,
      stressLevel: 2,
      energyLevel: 8,
      notes: "Good recovery over the weekend."
    },
    {
      id: "w-5",
      date: "2026-09-06",
      weightKg: 80.4,
      sleepHours: 7,
      stressLevel: 3,
      energyLevel: 7,
      waistCm: 90.8
    },
    {
      id: "w-6",
      date: "2026-09-09",
      weightKg: 80.1,
      sleepHours: 7.5,
      stressLevel: 2,
      energyLevel: 8,
      waistCm: 90.2,
      notes: "Weight trending down smoothly toward 75 kg target (-1.9 kg total progress)."
    }
  ],
  nutrition: [
    {
      id: "n-1",
      date: "2026-09-07",
      calories: 2180,
      proteinG: 172,
      fatG: 58,
      carbsG: 242,
      waterLiters: 3.2,
      halalCompliant: true,
      notes: "Halal chicken and jasmine rice lunch. Greek yogurt snack."
    },
    {
      id: "n-2",
      date: "2026-09-08",
      calories: 2210,
      proteinG: 168,
      fatG: 62,
      carbsG: 245,
      waterLiters: 3.5,
      halalCompliant: true,
      notes: "Salmon dinner with rice and mushrooms."
    },
    {
      id: "n-3",
      date: "2026-09-09",
      calories: 2195,
      proteinG: 174,
      fatG: 59,
      carbsG: 240,
      waterLiters: 3.8,
      halalCompliant: true,
      notes: "Pre-workout carbs on point. Post-workout lean beef and white rice."
    }
  ]
};

// Persistence functions
export function getGymStore(): GymDataStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_DATA));
      return INITIAL_SEED_DATA;
    }
    const parsed = JSON.parse(raw) as GymDataStore;
    // ensure all arrays exist
    if (!parsed.workouts || !parsed.weights || !parsed.nutrition) {
      const merged: GymDataStore = {
        ...INITIAL_SEED_DATA,
        ...parsed,
        workouts: parsed.workouts || INITIAL_SEED_DATA.workouts,
        weights: parsed.weights || INITIAL_SEED_DATA.weights,
        nutrition: parsed.nutrition || INITIAL_SEED_DATA.nutrition
      };
      saveGymStore(merged);
      return merged;
    }
    return parsed;
  } catch (err) {
    console.error("Failed to read gym store from localStorage:", err);
    return INITIAL_SEED_DATA;
  }
}

export function saveGymStore(store: GymDataStore): void {
  try {
    store.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    // Dispatch custom event for cross-component reactive updates
    window.dispatchEvent(new Event("sharafath-gym-data-updated"));
  } catch (err) {
    console.error("Failed to save gym store:", err);
  }
}

// Workout operations
export function saveWorkoutSession(session: Omit<ManualWorkoutSession, "id" | "createdAt"> & { id?: string }): ManualWorkoutSession {
  const store = getGymStore();
  const id = session.id || `workout-${Date.now()}`;
  const completeSession: ManualWorkoutSession = {
    ...session,
    id,
    createdAt: new Date().toISOString()
  };

  const existingIdx = store.workouts.findIndex(w => w.id === id);
  if (existingIdx >= 0) {
    store.workouts[existingIdx] = completeSession;
  } else {
    store.workouts.unshift(completeSession);
  }
  saveGymStore(store);
  return completeSession;
}

export function deleteWorkoutSession(id: string): void {
  const store = getGymStore();
  store.workouts = store.workouts.filter(w => w.id !== id);
  saveGymStore(store);
}

// Weight operations
export function saveWeightEntry(entry: Omit<ManualWeightEntry, "id"> & { id?: string }): ManualWeightEntry {
  const store = getGymStore();
  const id = entry.id || `weight-${Date.now()}`;
  const completeEntry: ManualWeightEntry = {
    ...entry,
    id
  };

  const existingIdx = store.weights.findIndex(w => w.id === id);
  if (existingIdx >= 0) {
    store.weights[existingIdx] = completeEntry;
  } else {
    store.weights.unshift(completeEntry);
  }
  // sort by date ascending
  store.weights.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  saveGymStore(store);
  return completeEntry;
}

export function deleteWeightEntry(id: string): void {
  const store = getGymStore();
  store.weights = store.weights.filter(w => w.id !== id);
  saveGymStore(store);
}

// Nutrition operations
export function saveNutritionEntry(entry: Omit<ManualNutritionEntry, "id"> & { id?: string }): ManualNutritionEntry {
  const store = getGymStore();
  const id = entry.id || `nutrition-${Date.now()}`;
  const completeEntry: ManualNutritionEntry = {
    ...entry,
    id
  };

  const existingIdx = store.nutrition.findIndex(n => n.id === id);
  if (existingIdx >= 0) {
    store.nutrition[existingIdx] = completeEntry;
  } else {
    store.nutrition.unshift(completeEntry);
  }
  store.nutrition.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  saveGymStore(store);
  return completeEntry;
}

// Backup & Upload operations
export function exportGymDataJSON(): string {
  const store = getGymStore();
  return JSON.stringify(store, null, 2);
}

export function importGymDataJSON(jsonString: string): { success: boolean; message: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !Array.isArray(parsed.workouts) || !Array.isArray(parsed.weights)) {
      return { success: false, message: "Invalid backup format. Missing workouts or weight array." };
    }
    const cleanStore: GymDataStore = {
      version: parsed.version || "2.0.0",
      lastUpdated: new Date().toISOString(),
      workouts: parsed.workouts,
      weights: parsed.weights,
      nutrition: parsed.nutrition || []
    };
    saveGymStore(cleanStore);
    return { success: true, message: `Successfully imported ${cleanStore.workouts.length} workouts, ${cleanStore.weights.length} weigh-ins, and ${cleanStore.nutrition.length} nutrition logs.` };
  } catch (err: any) {
    return { success: false, message: `Failed to parse JSON file: ${err.message}` };
  }
}

export function resetToSeedData(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_DATA));
  window.dispatchEvent(new Event("sharafath-gym-data-updated"));
}

// Analysis & Progression Helpers
export interface ExerciseProgressPoint {
  date: string;
  workoutTitle: string;
  dayLabel: string;
  topWeightKg: number;
  totalVolume: number;
  totalReps: number;
  setSummary: string;
}

export function getExerciseProgression(exerciseName: string): ExerciseProgressPoint[] {
  const store = getGymStore();
  const points: ExerciseProgressPoint[] = [];

  // Sort workouts oldest to newest
  const sortedWorkouts = [...store.workouts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  for (const session of sortedWorkouts) {
    const foundExercise = session.exercises.find(
      e => e.name.toLowerCase().trim() === exerciseName.toLowerCase().trim() && !e.isSkipped
    );
    if (!foundExercise || foundExercise.sets.length === 0) continue;

    let maxWeight = 0;
    let volume = 0;
    let totalReps = 0;
    const repsList: string[] = [];

    for (const set of foundExercise.sets) {
      if (set.completed) {
        const w = set.weightKg ?? 0;
        const r = set.reps ?? 0;
        if (w > maxWeight) maxWeight = w;
        volume += w * r;
        totalReps += r;
        if (set.durationSeconds) {
          repsList.push(`${set.durationSeconds}s`);
        } else if (set.reps !== null) {
          repsList.push(String(set.reps));
        }
      }
    }

    points.push({
      date: session.date,
      workoutTitle: session.title,
      dayLabel: session.dayLabel,
      topWeightKg: maxWeight,
      totalVolume: volume,
      totalReps,
      setSummary: repsList.join(", ")
    });
  }

  return points;
}

export function getDistinctExercises(): string[] {
  const store = getGymStore();
  const set = new Set<string>();
  for (const w of store.workouts) {
    for (const e of w.exercises) {
      if (e.name) set.add(e.name);
    }
  }
  return Array.from(set).sort();
}
