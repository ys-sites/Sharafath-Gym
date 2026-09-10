export interface ExercisePlanItem {
  name: string;
  setsReps: string;
  rest: string;
  howToPerform: string;
  isOptional?: boolean;
  notes?: string;
}

export interface DayWorkoutRoutine {
  dayNumber: number;
  title: string;
  subtitle: string;
  focusMuscles: string;
  warmup: string;
  exercises: ExercisePlanItem[];
  finisher?: string;
  recoveryNotes?: string;
}

export interface MoussaBlueprintRoutine {
  id: string;
  title: string;
  motto: string;
  warmup: string;
  sections: {
    category: string;
    exercises: {
      name: string;
      setsReps: string;
      executionNote?: string;
    }[];
  }[];
  finisher?: {
    exercise: string;
    setsReps: string;
    note: string;
  };
  postNutrition?: string;
}

export interface MicronutrientItem {
  nutrient: string;
  primaryPurpose: string;
  physiologicalRole: string;
  bestFoodSources: string;
  dailyValue: string;
  deficiency: string;
  excessAndNotes: string;
}

export const SHARAFATH_PROFILE = {
  name: "Mohamed Sharafath",
  coach: "Certified Elite Coach Mousa Ghanem",
  programName: "ASCENSION — A More Beautiful You",
  motto: "Discipline Creates Freedom • Better Habits, A Brighter Tomorrow • Mind • Body • Appearance • Purpose",
  age: 24,
  heightCm: 173,
  heightFt: "5 ft 8 in",
  startingWeightKg: 82.0,
  startingWeightLbs: 181,
  goalWeightKg: 75.0,
  experienceLevel: "Beginner",
  primaryGoal: "Move from 82 kg toward 75 kg while preserving muscle and building basic strength.",
  startingSituation: {
    training: {
      current: "5 days available; gym and home access",
      coachingFocus: "Build technique and consistency; pay attention to lower-back comfort."
    },
    meals: {
      current: "3 per day; mostly home-cooked by mother",
      coachingFocus: "Work with familiar meals and repeatable portions."
    },
    appetite: {
      current: "Low appetite and reported under-eating; cravings also noted",
      coachingFocus: "Use food records to confirm intake before changing calories."
    },
    recovery: {
      current: "About 7 hours sleep; medium stress; somewhat active",
      coachingFocus: "Keep recovery manageable and avoid early burnout."
    },
    budget: {
      current: "$300; time period not provided",
      coachingFocus: "Confirm what the budget covers and for how long."
    }
  },
  threeActions: [
    {
      step: 1,
      title: "Schedule your training",
      desc: "Choose three available days. First two weeks (or when you come back): show up, learn the movements and log your sets."
    },
    {
      step: 2,
      title: "Make meals predictable",
      desc: "Eat three planned meals with protein. Use 2,200 kcal as the provisional starting target; record what you actually eat."
    },
    {
      step: 3,
      title: "Keep a simple record",
      desc: "Track workouts, food and steps. Review weekly weight averages and energy with your coach."
    }
  ],
  generalExecutionRules: [
    {
      title: "Warm Up",
      rule: "Start with 5–8 minutes of easy movement. Perform 2–3 gradually heavier warm-up sets for the first big lift, and 1–2 light sets when needed for a new movement. These do not count toward the listed working sets."
    },
    {
      title: "Work in Order",
      rule: "Complete every set of an exercise before moving on. For example, 3 × 8–12 means three working sets of eight to twelve reps, resting between sets. No supersets are required."
    },
    {
      title: "Control Each Rep",
      rule: "Lower smoothly, lift without bouncing, and use a comfortable range of motion. Stop a set when you can no longer keep the same technique."
    },
    {
      title: "Progress and Record",
      rule: "Log load and reps for every set. When all working sets reach the top of the range with consistent form, add the smallest practical weight increase next session. Otherwise keep the load and build reps. For fixed-rep sets, complete all prescribed reps before increasing."
    },
    {
      title: "Steps & Active Recovery",
      rule: "Keep your usual daily step target. Spread walking across the day with two or three easy 10-minute walks. Reduce walking if soreness changes your gait."
    },
    {
      title: "Recovery Basics",
      rule: "Keep regular meals and your protein target, drink regularly, and aim for 7–9 hours of sleep. Easy movement should leave you feeling fresher."
    }
  ]
};

export const PHASE_2_WORKOUTS: DayWorkoutRoutine[] = [
  {
    dayNumber: 1,
    title: "Day 1 Push",
    subtitle: "Chest, Shoulders and Triceps",
    focusMuscles: "Chest, Front/Side Delts, Triceps",
    warmup: "5–8 mins easy movement + 2–3 progressive warmup sets on first press.",
    exercises: [
      {
        name: "Machine chest press",
        setsReps: "3 × 6–10",
        rest: "2–3 min",
        howToPerform: "Keep your back supported; press without shrugging."
      },
      {
        name: "Incline dumbbell press",
        setsReps: "3 × 8–12",
        rest: "2–3 min",
        howToPerform: "Keep feet planted and wrists over elbows."
      },
      {
        name: "Machine pec deck fly",
        setsReps: "2 × 10–15",
        rest: "60–90 sec",
        howToPerform: "Keep elbows softly bent; close without bouncing."
      },
      {
        name: "Supported dips",
        setsReps: "3 × 10",
        rest: "2 min",
        howToPerform: "Use assistance; lower only as far as shoulders stay comfortable.",
        isOptional: true,
        notes: "Optional add-on only when recovery and shoulder comfort are good. Skip during first two weeks."
      },
      {
        name: "Dumbbell lateral raise",
        setsReps: "3 × 12–15",
        rest: "60–90 sec",
        howToPerform: "Lead with elbows; avoid swinging or shrugging."
      },
      {
        name: "Reverse pec deck",
        setsReps: "3 × 12–15",
        rest: "60–90 sec",
        howToPerform: "Keep chest on the pad; open arms without arching."
      },
      {
        name: "Triceps pushdown",
        setsReps: "3 × 10–15",
        rest: "60–90 sec",
        howToPerform: "Keep upper arms still; extend elbows smoothly."
      },
      {
        name: "Overhead rope extension",
        setsReps: "3 × 10–15",
        rest: "60–90 sec",
        howToPerform: "Keep ribs down; bend and straighten elbows."
      }
    ],
    finisher: "Complete 15 minutes of incline treadmill walking at a comfortable, conversational pace. Log your sets and reps.",
    recoveryNotes: "Treat dips as an add-on only when recovery and shoulder comfort are good. Skip them during the first two weeks."
  },
  {
    dayNumber: 2,
    title: "Day 2 Pull",
    subtitle: "Back and Biceps",
    focusMuscles: "Lats, Upper Back, Biceps, Forearms",
    warmup: "5–8 mins easy movement + light lat activation sets.",
    exercises: [
      {
        name: "Wide-grip lat pulldown",
        setsReps: "3 × 8–12",
        rest: "2 min",
        howToPerform: "Pull toward upper chest; keep your torso steady."
      },
      {
        name: "Close-grip lat pulldown",
        setsReps: "3 × 8–12",
        rest: "2 min",
        howToPerform: "Drive elbows down; avoid leaning back to finish."
      },
      {
        name: "Seated cable row",
        setsReps: "3 × 8–12",
        rest: "2 min",
        howToPerform: "Pull toward lower ribs without rocking."
      },
      {
        name: "Wide-grip row",
        setsReps: "3 × 8",
        rest: "2 min",
        howToPerform: "Draw elbows back; keep shoulders away from ears."
      },
      {
        name: "Lat pullover machine",
        setsReps: "3 × 10–15",
        rest: "60–90 sec",
        howToPerform: "Keep ribs down; drive upper arms toward your sides."
      },
      {
        name: "Preacher curl",
        setsReps: "3 × 8–12",
        rest: "60–90 sec",
        howToPerform: "Keep upper arms on the pad; lower with control."
      },
      {
        name: "Incline dumbbell curl",
        setsReps: "3 × 10–12",
        rest: "60–90 sec",
        howToPerform: "Let arms hang; curl without moving shoulders."
      },
      {
        name: "Hammer curl",
        setsReps: "3 × 10–12",
        rest: "60–90 sec",
        howToPerform: "Keep palms facing in and elbows by your sides."
      }
    ],
    finisher: "Complete 15 minutes on the StairMaster at an easy, conversational pace. Keep the effort low enough that your legs feel ready for tomorrow.",
    recoveryNotes: "Record today's loads and reps. Prepare for legs with your normal meals, fluids and sleep."
  },
  {
    dayNumber: 3,
    title: "Day 3 Legs",
    subtitle: "Quads, Hamstrings, Calves and Core",
    focusMuscles: "Quads, Hamstrings, Glutes, Calves, Core",
    warmup: "Bodyweight squats + hip mobility + 2-3 progressive warm-up sets on hack squat.",
    exercises: [
      {
        name: "Hack squat",
        setsReps: "3 × 8–12",
        rest: "2–3 min",
        howToPerform: "Keep hips on the pad; track knees with toes."
      },
      {
        name: "Leg press",
        setsReps: "3 × 10–15",
        rest: "2–3 min",
        howToPerform: "Lower only while your pelvis stays against the pad."
      },
      {
        name: "Leg extension",
        setsReps: "2 × 12–15",
        rest: "60–90 sec",
        howToPerform: "Align knees with the pivot; lift without kicking."
      },
      {
        name: "Dumbbell Romanian deadlift",
        setsReps: "3 × 8–12",
        rest: "2–3 min",
        howToPerform: "Soften knees; push hips back with weights close."
      },
      {
        name: "Seated leg curl",
        setsReps: "3 × 10–15",
        rest: "60–90 sec",
        howToPerform: "Keep hips down; curl and return slowly."
      },
      {
        name: "Standing calf raise",
        setsReps: "3 × 12–20",
        rest: "60–90 sec",
        howToPerform: "Use a controlled stretch and rise; avoid bouncing."
      },
      {
        name: "Seated leg raise",
        setsReps: "3 × 10–15",
        rest: "60–90 sec",
        howToPerform: "Brace your abdomen; lift without swinging."
      }
    ],
    finisher: "Keep your daily steps consistent. No additional cardio is prescribed.",
    recoveryNotes: "Ensure high protein intake and recovery fluids post-leg session."
  },
  {
    dayNumber: 4,
    title: "Day 4 Rest & Active Recovery",
    subtitle: "Active Recovery & Mobility",
    focusMuscles: "Systemic Recovery & Connective Tissue",
    warmup: "Short, relaxed outdoor or treadmill walks.",
    exercises: [
      {
        name: "Daily Walking",
        setsReps: "Spread across day",
        rest: "N/A",
        howToPerform: "Short relaxed walks to reach step target."
      },
      {
        name: "Gentle Mobility",
        setsReps: "5–10 mins",
        rest: "N/A",
        howToPerform: "Gentle hip, ankle and upper-back mobility work.",
        isOptional: true
      },
      {
        name: "Easy Cycling (Alternative)",
        setsReps: "10–20 mins",
        rest: "N/A",
        howToPerform: "Easy cycling at low intensity instead of an extra walk.",
        isOptional: true
      }
    ],
    finisher: "Keep it easy and avoid turning recovery into another hard workout.",
    recoveryNotes: "Hit 2,200 kcal nutrition targets. Keep hydration high."
  },
  {
    dayNumber: 5,
    title: "Day 5 Upper",
    subtitle: "Chest, Back, Shoulders and Arms",
    focusMuscles: "Chest, Back, Delts, Biceps, Triceps",
    warmup: "Progressive warm-up sets before the first heavy press / pull.",
    exercises: [
      {
        name: "Incline machine press",
        setsReps: "3 × 8–12",
        rest: "2–3 min",
        howToPerform: "Keep back supported and wrists stacked."
      },
      {
        name: "Machine chest press",
        setsReps: "2 × 8–12",
        rest: "2–3 min",
        howToPerform: "Press smoothly without rolling shoulders forward."
      },
      {
        name: "Pull-up or assisted pull-up",
        setsReps: "3 × 6–10",
        rest: "2–3 min",
        howToPerform: "Use enough assistance to avoid kicking or swinging. Progress by reducing assistance."
      },
      {
        name: "Chest-supported row",
        setsReps: "3 × 8–12",
        rest: "2 min",
        howToPerform: "Keep chest on the pad; pull elbows back."
      },
      {
        name: "Lat pullover machine",
        setsReps: "2 × 10–15",
        rest: "60–90 sec",
        howToPerform: "Keep ribs down; bring upper arms toward your sides."
      },
      {
        name: "Dumbbell lateral raise",
        setsReps: "3 × 12–15",
        rest: "60–90 sec",
        howToPerform: "Lift with control; keep shoulders relaxed."
      },
      {
        name: "Reverse pec deck",
        setsReps: "3 × 12–15",
        rest: "60–90 sec",
        howToPerform: "Open arms without lifting your chest off the pad."
      },
      {
        name: "Preacher curl",
        setsReps: "3 × 10–12",
        rest: "60–90 sec",
        howToPerform: "Keep upper arms supported; avoid bouncing."
      },
      {
        name: "Cable curl",
        setsReps: "2 × 10–12",
        rest: "60–90 sec",
        howToPerform: "Keep elbows still; avoid leaning back."
      },
      {
        name: "Rope pushdown",
        setsReps: "3 × 10–12",
        rest: "60–90 sec",
        howToPerform: "Keep upper arms tucked; extend smoothly."
      },
      {
        name: "Overhead cable extension",
        setsReps: "2 × 10–12",
        rest: "60–90 sec",
        howToPerform: "Keep abdomen braced; move through your elbows."
      }
    ],
    finisher: "Log every set. Keep your normal step routine; no additional cardio is prescribed.",
    recoveryNotes: "Reach the top of the rep range on all working sets with consistent form before increasing load."
  },
  {
    dayNumber: 6,
    title: "Day 6 Lower",
    subtitle: "Quads, Hamstrings, Glutes, Calves and Core",
    focusMuscles: "Quads, Hamstrings, Glutes, Calves, Core",
    warmup: "Warm-up sets before the first heavy lower-body movement.",
    exercises: [
      {
        name: "Smith machine squat",
        setsReps: "3 × 6–10",
        rest: "2–3 min",
        howToPerform: "Brace; keep heels down and knees tracking with toes."
      },
      {
        name: "Walking lunge",
        setsReps: "2 × 10–12 each leg",
        rest: "2 min",
        howToPerform: "Step under control; push through the front foot."
      },
      {
        name: "Leg extension",
        setsReps: "2 × 12–15",
        rest: "60–90 sec",
        howToPerform: "Keep hips still; avoid kicking the weight."
      },
      {
        name: "Romanian deadlift",
        setsReps: "3 × 8–10",
        rest: "2–3 min",
        howToPerform: "Push hips back; keep the weight close and spine steady."
      },
      {
        name: "Lying leg curl",
        setsReps: "3 × 10–15",
        rest: "60–90 sec",
        howToPerform: "Keep hips on the pad; lower slowly."
      },
      {
        name: "Hip thrust",
        setsReps: "3 × 8–12",
        rest: "2 min",
        howToPerform: "Keep chin tucked; finish with glutes, not a back arch."
      },
      {
        name: "Standing calf raise",
        setsReps: "3 × 12–20",
        rest: "60–90 sec",
        howToPerform: "Pause at the top; lower into a controlled stretch."
      },
      {
        name: "Seated calf raise",
        setsReps: "2 × 12–20",
        rest: "60–90 sec",
        howToPerform: "Raise heels through a comfortable full range."
      },
      {
        name: "Cable crunch",
        setsReps: "3 × 12–20",
        rest: "60–90 sec",
        howToPerform: "Bring ribs toward pelvis; avoid pulling with arms."
      },
      {
        name: "Plank",
        setsReps: "3 × 20–40 sec",
        rest: "60–90 sec",
        howToPerform: "Brace and breathe; stop before hips sag. Build time while maintaining form."
      }
    ],
    finisher: "Log loads, reps and plank times. Suggested plank starting range: 20–40 seconds per set.",
    recoveryNotes: "Take a full day off lifting tomorrow. Prioritize meals, fluids and sleep."
  },
  {
    dayNumber: 7,
    title: "Day 7 Rest",
    subtitle: "Complete Rest & Restoration",
    focusMuscles: "Full System Recovery",
    warmup: "Optional gentle stretching for 5–10 minutes.",
    exercises: [
      {
        name: "Rest & Walking",
        setsReps: "Full Day Off",
        rest: "N/A",
        howToPerform: "Keep steps comfortable with short walks."
      }
    ],
    finisher: "Prioritize meals, fluids and sleep. If unusually fatigued, skip extra activity and recover before repeating Day 1.",
    recoveryNotes: "Prepare for Day 1 Push next day. Mental focus and carb replenishment."
  }
];

export const MOUSSA_5DAY_BLUEPRINT: MoussaBlueprintRoutine[] = [
  {
    id: "moussa-01",
    title: "01 — BACK + TRICEPS",
    motto: "Load carb the fuel. Spend it under tension.",
    warmup: "Pull-ups — AMRAP, stop 1–2 reps before failure",
    sections: [
      {
        category: "BACK",
        exercises: [
          { name: "Muscle-ups", setsReps: "1–2 × 6–8" },
          { name: "Wide-grip lat pulldown", setsReps: "2 × 6–8" },
          { name: "Close-grip lat pulldown", setsReps: "2 × 4–6" },
          { name: "Close-grip rows", setsReps: "2 × 6–8" }
        ]
      },
      {
        category: "TRICEPS",
        exercises: [
          { name: "Cable pushdowns", setsReps: "2 × 6–10" },
          { name: "Overhead triceps extensions", setsReps: "2 × 8–12" }
        ]
      }
    ],
    finisher: {
      exercise: "Incline bench raises",
      setsReps: "2 sets",
      note: "To failure"
    },
    postNutrition: "Post Hella carbs"
  },
  {
    id: "moussa-02",
    title: "02 — CHEST + SHOULDERS + BICEPS",
    motto: "Proper form. High intensity.",
    warmup: "Push-ups — 1–2 sets, controlled reps, stop before failure",
    sections: [
      {
        category: "CHEST",
        exercises: [
          { name: "Incline Dumbbell Press", setsReps: "2 × 6–8", executionNote: "To failure" },
          { name: "Flat Machine Press", setsReps: "2 × 6–8", executionNote: "Optional • to failure" },
          { name: "Chest Fly", setsReps: "2 × 6–8", executionNote: "To failure" },
          { name: "Dips", setsReps: "1–2 sets", executionNote: "To failure (The upper-body squat)" }
        ]
      },
      {
        category: "SHOULDERS",
        exercises: [
          { name: "Cable / Dumbbell Lateral Raises", setsReps: "2 × 8–12", executionNote: "To failure" },
          { name: "Rear-Delt Fly", setsReps: "2 × 8–12", executionNote: "To failure" }
        ]
      },
      {
        category: "BICEPS",
        exercises: [
          { name: "Incline Dumbbell Curl", setsReps: "2 × 8–12", executionNote: "To failure" },
          { name: "Preacher Machine Curl", setsReps: "2 × 6–8", executionNote: "To failure" },
          { name: "Hammer or Reverse Curl", setsReps: "2 × 6–8", executionNote: "To failure" }
        ]
      }
    ]
  },
  {
    id: "moussa-03",
    title: "03 — SHOULDERS + LEGS",
    motto: "Drive through the floor. Stable shoulders.",
    warmup: "Bodyweight squats • Band shoulder rotations • 1–2 progressive warm-up sets before first heavy leg movement",
    sections: [
      {
        category: "LEGS",
        exercises: [
          { name: "Main squat / hack squat movement", setsReps: "1 warm-up + 2–3 × 6–8" },
          { name: "Romanian Deadlift (RDL)", setsReps: "2 × 4–6" },
          { name: "Leg Curl", setsReps: "1 × 8–12", executionNote: "To failure" },
          { name: "Leg Press", setsReps: "1–2 sets", executionNote: "Optional • to failure" },
          { name: "Leg Extension", setsReps: "2 × 8–12", executionNote: "To failure" }
        ]
      },
      {
        category: "SHOULDERS",
        exercises: [
          { name: "Lateral Raises", setsReps: "2 × 8–12", executionNote: "To failure" },
          { name: "Rear-Delt Fly / Reverse Pec Deck", setsReps: "2 × 8–12", executionNote: "To failure" },
          { name: "Shoulder Press", setsReps: "1–2 × 6–8", executionNote: "Optional if front delts are recovered" }
        ]
      }
    ]
  },
  {
    id: "moussa-04",
    title: "04 — UPPER",
    motto: "Hypertrophy-focused split built around controlled execution and high-effort sets.",
    warmup: "Progressive warm-up sets before first heavy press / pull",
    sections: [
      {
        category: "CHEST",
        exercises: [
          { name: "Incline Dumbbell Press", setsReps: "2 × 6–8" },
          { name: "Bench Cable Fly", setsReps: "2 × 6–8" },
          { name: "Dips", setsReps: "1–2 sets", executionNote: "To failure" }
        ]
      },
      {
        category: "BACK",
        exercises: [
          { name: "T-Bar Row", setsReps: "2 sets", executionNote: "To failure" },
          { name: "Lat Pullover", setsReps: "2 × 6–8" }
        ]
      },
      {
        category: "SHOULDERS",
        exercises: [
          { name: "Lateral Raises", setsReps: "2 × 10–12" },
          { name: "Reverse Pec Deck", setsReps: "2 × 6–10" }
        ]
      },
      {
        category: "ARMS",
        exercises: [
          { name: "Preacher Curl", setsReps: "2–3 × 6–10" },
          { name: "Triceps Pushdown", setsReps: "2 sets", executionNote: "To failure" },
          { name: "Reverse Curl", setsReps: "2 × 6–10" },
          { name: "Overhead Triceps Extension", setsReps: "2 sets", executionNote: "To failure" }
        ]
      }
    ],
    finisher: {
      exercise: "Bench Raises",
      setsReps: "2 sets",
      note: "To failure"
    }
  },
  {
    id: "moussa-05",
    title: "05 — LOWER",
    motto: "Thighs parallel. Flex spine front for abs. Dumbbell to feet then hips in.",
    warmup: "Warm-up sets before first heavy lower-body movement",
    sections: [
      {
        category: "LOWER BODY",
        exercises: [
          { name: "Free-Weight Squat", setsReps: "2–3 × 6–10", executionNote: "Thighs parallel to ground" },
          { name: "Cable Crunch", setsReps: "2–3 sets til failure", executionNote: "Flex spine front for abs" },
          { name: "Romanian Deadlift (RDL)", setsReps: "2 sets 6–8 reps", executionNote: "Dumbbell to feet then hips in" },
          { name: "Lunges", setsReps: "2 sets 6–10 reps per leg" },
          { name: "Leg Curl", setsReps: "1 set til failure", executionNote: "To failure" },
          { name: "Leg Extension", setsReps: "2 sets 6–10 reps", executionNote: "To failure" }
        ]
      }
    ]
  }
];

export const NUTRITION_BLUEPRINT = {
  dailyTargets: {
    energyKcal: 2200,
    proteinG: 170,
    fatG: 60,
    carbG: 245,
    macroCheck: "170 × 4 + 60 × 9 + 245 × 4 = 2,200 kcal",
    maintenanceKcal: 2500,
    deficitGoal: "Fat loss: Move from 82 kg to 75 kg while preserving muscle & strength"
  },
  mealStructure: [
    {
      when: "Breakfast",
      example: "Eggs and egg whites, white sourdough toast, banana",
      instruction: "Start with protein and carbs. Add food gradually if breakfast is currently skipped."
    },
    {
      when: "Lunch",
      example: "Halal chicken, white rice, olive oil, cooked cauliflower",
      instruction: "Prepare ahead. Adjust rice and oil portions to your daily target."
    },
    {
      when: "Dinner",
      example: "Salmon or halal lean beef, rice, mushrooms or fruit",
      instruction: "Rotate proteins and produce; use ordinary meals rather than relying on shakes."
    },
    {
      when: "Planned Snack",
      example: "Greek yogurt and fruit, or whey with milk and banana",
      instruction: "Use to close a calorie or protein gap. A shake is optional, not a daily requirement."
    }
  ],
  foodChoicesAndSwaps: [
    {
      category: "Protein",
      chooseMostOften: "Halal chicken, turkey and lean beef; eggs, salmon, cod",
      usefulNote: "Rotate sources rather than making every meal red meat."
    },
    {
      category: "Dairy & Shakes",
      chooseMostOften: "Plain milk, Greek yogurt, cottage cheese; verified halal whey",
      usefulNote: "Use lactose-free dairy if needed. Check enzymes, gelatin and flavorings in processed products."
    },
    {
      category: "Starches",
      chooseMostOften: "White rice, cream of rice, white bread or white sourdough",
      usefulNote: "Make rice a simple staple. Check ingredients; choose plain versions without nuts, bran or cocoa."
    },
    {
      category: "Fats",
      chooseMostOften: "Olive oil, whole eggs, salmon; modest portions of cheese or butter",
      usefulNote: "Use olive oil as main added fat. Extra butter or dietary cholesterol is not a testosterone strategy."
    },
    {
      category: "Fruit",
      chooseMostOften: "Bananas, apples, pears, pineapple, melon, peaches",
      usefulNote: "Fresh or frozen both work. Rotate portions across the day for variety and fiber."
    },
    {
      category: "Non-Green Vegetables",
      chooseMostOften: "Cauliflower, mushrooms, onions",
      usefulNote: "Use cooked portions if easier to tolerate. Greens and green powders are excluded by preference."
    }
  ],
  foodsToReplace: [
    {
      leaveOut: "Peanut butter, almonds, cashews and other nuts",
      useInstead: "Olive oil for added calories; eggs or dairy for a snack."
    },
    {
      leaveOut: "Spinach, leafy greens, salads and green powders",
      useInstead: "Fruit and non-green vegetables (cauliflower, mushrooms, onions)."
    },
    {
      leaveOut: "Sweet potatoes, wheat bran, cocoa and chocolate",
      useInstead: "Rice or white bread for starch; fruit or a little honey for sweetness."
    },
    {
      leaveOut: "Unspecified dried fruit or mixed berry blends",
      useInstead: "A known fruit choice such as banana, apple or pineapple."
    }
  ],
  troubleshootingCheckIns: [
    {
      scenario: "You struggle to eat enough",
      action: "Use smaller meals plus a planned snack. Add rice, bread, milk or a measured amount of oil; avoid filling up on low-calorie foods first."
    },
    {
      scenario: "Energy or weight trend is below your goal",
      action: "Check meal consistency, sleep and logging first. If gaining is the agreed goal and average weight is flat for 2 weeks, discuss adding 100–150 kcal/day."
    },
    {
      scenario: "Weight changes from one day to the next",
      action: "Use 3–4 morning weigh-ins per week under similar conditions and compare weekly averages. Do not cut calories based on one reading."
    }
  ],
  halalStandards: [
    {
      area: "Meat and poultry",
      standard: "Buy from a trusted halal-certified source that meets your religious requirements."
    },
    {
      area: "Ingredients & preparation",
      standard: "Avoid pork, lard, non-halal meat and intoxicating alcohol. Use alcohol-free cooking alternatives and prevent contact with non-halal foods."
    },
    {
      area: "Packaged food & supplements",
      standard: "Check whey, cheese enzymes, gelatin, capsules and flavorings. Prefer recognized halal certification; verify uncertain ingredients."
    },
    {
      area: "Methods & decisions",
      standard: "Pursue results through halal means. Keep supplements and treatments consistent with beliefs; seek a trusted scholar's guidance for uncertain questions."
    }
  ],
  testosteronePriorities: [
    {
      priority: "Enough Energy",
      action: "Meet meals consistently and avoid prolonged under-eating.",
      note: "Poor nutrition and excessive exercise can temporarily lower testosterone."
    },
    {
      priority: "Sleep and Recovery",
      action: "Aim for 7–9 hours of sleep and follow the two rest days.",
      note: "Manage fatigue instead of adding more hard training."
    },
    {
      priority: "Balanced Nutrition",
      action: "Include planned fat intake, varied proteins and sufficient carbs.",
      note: "No single food or high-fat diet guarantees higher testosterone."
    },
    {
      priority: "Nutrient Adequacy",
      action: "Use foods such as beef for zinc, fish and fortified milk for vitamin D.",
      note: "Correct an identified deficiency with professional advice; avoid megadoses."
    },
    {
      priority: "Persistent Symptoms",
      action: "Discuss ongoing low libido, fewer morning erections or unusual fatigue with a clinician.",
      note: "Diagnosis requires symptoms plus consistently low morning blood tests; avoid self-prescribed hormones or 'testosterone boosters'."
    }
  ]
};

export const MICRONUTRIENT_TABLE_1: MicronutrientItem[] = [
  {
    nutrient: "Vitamin A",
    primaryPurpose: "Vision, immunity, skin and tissue integrity",
    physiologicalRole: "Retinoids regulate gene expression; retinal is required for visual cycle; supports epithelial differentiation and immune function.",
    bestFoodSources: "Liver, eggs, dairy; carrots, sweet potato",
    dailyValue: "900 mcg RAE",
    deficiency: "Night blindness, dry eyes/skin, impaired immunity",
    excessAndNotes: "Preformed vitamin A can be toxic in excess; carotenoids from foods are safer. High-dose retinol is a pregnancy concern."
  },
  {
    nutrient: "Vitamin D",
    primaryPurpose: "Calcium balance, bone, muscle and immune function",
    physiologicalRole: "Acts like a hormone through vitamin D receptor; increases intestinal calcium/phosphate absorption and supports neuromuscular function.",
    bestFoodSources: "Fatty fish, egg yolk, fortified milk/foods; sunlight enables skin synthesis",
    dailyValue: "20 mcg (800 IU)",
    deficiency: "Low bone mineralization, muscle weakness; severe deficiency causes rickets/osteomalacia",
    excessAndNotes: "Excess supplemental intake can cause hypercalcemia. Blood testing is more informative than guessing high doses."
  },
  {
    nutrient: "Vitamin E",
    primaryPurpose: "Antioxidant protection of cell membranes",
    physiologicalRole: "Alpha-tocopherol helps limit lipid peroxidation in cell membranes and protects polyunsaturated fatty acids from oxidative damage.",
    bestFoodSources: "Nuts, seeds, wheat germ, avocado, plant oils",
    dailyValue: "15 mg",
    deficiency: "Rare; neuropathy, muscle weakness and hemolysis can occur in severe deficiency",
    excessAndNotes: "Very high supplemental doses may increase bleeding risk, especially with anticoagulants."
  },
  {
    nutrient: "Vitamin K",
    primaryPurpose: "Blood clotting and bone protein activation",
    physiologicalRole: "Required for gamma-carboxylation of clotting factors and proteins such as osteocalcin and matrix Gla protein.",
    bestFoodSources: "Meat fats, butter",
    dailyValue: "120 mcg",
    deficiency: "Easy bruising or bleeding; deficiency is uncommon in healthy adults",
    excessAndNotes: "Food intake is generally safe, but major changes in vitamin K intake can interfere with warfarin therapy."
  }
];

export const MICRONUTRIENT_TABLE_2: MicronutrientItem[] = [
  {
    nutrient: "Vitamin C",
    primaryPurpose: "Collagen formation, antioxidant defense, iron absorption",
    physiologicalRole: "Cofactor for collagen hydroxylation and carnitine synthesis; regenerates antioxidants and increases non-heme iron absorption.",
    bestFoodSources: "Citrus, kiwi, berries, peppers, pineapple, potatoes",
    dailyValue: "90 mg",
    deficiency: "Fatigue, poor wound healing, bleeding gums; severe deficiency causes scurvy",
    excessAndNotes: "Large doses may cause GI upset; can raise urinary oxalate in susceptible people."
  },
  {
    nutrient: "B1 — Thiamin",
    primaryPurpose: "Carbohydrate metabolism and nerve function",
    physiologicalRole: "Thiamin pyrophosphate is a coenzyme for pyruvate dehydrogenase, alpha-ketoglutarate dehydrogenase and transketolase.",
    bestFoodSources: "Whole/enriched grains, legumes, seeds",
    dailyValue: "1.2 mg",
    deficiency: "Fatigue, neuropathy; severe deficiency causes beriberi or Wernicke-Korsakoff syndrome",
    excessAndNotes: "No established toxicity from food; needs can rise with high carbohydrate throughput."
  },
  {
    nutrient: "B2 — Riboflavin",
    primaryPurpose: "Energy metabolism and redox reactions",
    physiologicalRole: "Precursor to FAD and FMN, electron carriers used in mitochondrial energy production and many oxidation-reduction reactions.",
    bestFoodSources: "Dairy, eggs, meat, almonds, mushrooms, fortified grains",
    dailyValue: "1.3 mg",
    deficiency: "Cracked mouth corners, sore tongue, dermatitis",
    excessAndNotes: "Low toxicity; bright-yellow urine after supplements is harmless."
  },
  {
    nutrient: "B3 — Niacin",
    primaryPurpose: "Energy metabolism and DNA repair",
    physiologicalRole: "Forms NAD and NADP, essential for cellular redox reactions, ATP production, signaling and DNA repair.",
    bestFoodSources: "Meat, poultry, fish, peanuts, enriched grains",
    dailyValue: "16 mg NE",
    deficiency: "Pellagra: dermatitis, diarrhea, cognitive changes",
    excessAndNotes: "High-dose nicotinic acid can cause flushing and liver injury; pharmacologic dosing is not equivalent to food intake."
  },
  {
    nutrient: "B5 — Pantothenic Acid",
    primaryPurpose: "Coenzyme A production and fatty-acid metabolism",
    physiologicalRole: "Component of coenzyme A and acyl-carrier protein, central to fatty-acid synthesis/oxidation and acetyl-group transfer.",
    bestFoodSources: "Chicken, beef, eggs, mushrooms, avocado, whole grains",
    dailyValue: "5 mg",
    deficiency: "Rare; fatigue, numbness and burning-foot symptoms can occur",
    excessAndNotes: "Very high intakes may cause diarrhea; deficiency is uncommon with varied diets."
  },
  {
    nutrient: "B6 — Pyridoxine",
    primaryPurpose: "Amino-acid metabolism, neurotransmitters, hemoglobin",
    physiologicalRole: "Pyridoxal phosphate is a coenzyme for transamination, glycogen breakdown, neurotransmitter synthesis and heme production.",
    bestFoodSources: "Poultry, fish, potatoes, bananas, chickpeas",
    dailyValue: "1.7 mg",
    deficiency: "Dermatitis, anemia, irritability, neuropathy",
    excessAndNotes: "Chronic high-dose supplements can itself cause sensory neuropathy."
  },
  {
    nutrient: "B7 — Biotin",
    primaryPurpose: "Carboxylation reactions and macronutrient metabolism",
    physiologicalRole: "Cofactor for carboxylase enzymes involved in fatty-acid synthesis, gluconeogenesis and amino-acid metabolism.",
    bestFoodSources: "Egg yolk, nuts, seeds, salmon, meat",
    dailyValue: "30 mcg",
    deficiency: "Rare; rash, hair loss and neurologic symptoms",
    excessAndNotes: "High-dose biotin can interfere with laboratory tests, including some thyroid and cardiac assays."
  },
  {
    nutrient: "B9 — Folate",
    primaryPurpose: "DNA synthesis, red blood cells and methylation",
    physiologicalRole: "Tetrahydrofolate carries one-carbon units used for nucleotide synthesis and homocysteine-to-methionine metabolism.",
    bestFoodSources: "Leafy greens, legumes, citrus, avocado; fortified grains",
    dailyValue: "400 mcg DFE",
    deficiency: "Megaloblastic anemia; inadequate intake during pregnancy increases neural-tube-defect risk",
    excessAndNotes: "High folic-acid intake can mask vitamin B12 deficiency; pregnancy needs are higher."
  },
  {
    nutrient: "B12 — Cobalamin",
    primaryPurpose: "Nervous system, red blood cells and methylation",
    physiologicalRole: "Cofactor for methionine synthase and methylmalonyl-CoA mutase; required for myelin maintenance and normal erythropoiesis.",
    bestFoodSources: "Meat, fish, shellfish, eggs, dairy; fortified foods",
    dailyValue: "2.4 mcg",
    deficiency: "Megaloblastic anemia, numbness, balance/cognitive changes; neurologic injury can become irreversible",
    excessAndNotes: "Low toxicity. Vegans and people with impaired absorption are at higher risk of deficiency."
  }
];

export const MICRONUTRIENT_TABLE_3: MicronutrientItem[] = [
  {
    nutrient: "Calcium",
    primaryPurpose: "Bone structure, muscle contraction and cell signaling",
    physiologicalRole: "Structural mineral in hydroxyapatite; calcium ions trigger muscle contraction, neurotransmitter release and intracellular signaling.",
    bestFoodSources: "Dairy, fortified milks, canned fish with bones, eggs",
    dailyValue: "1,300 mg",
    deficiency: "Low bone mineral density; severe deficiency can cause muscle spasms",
    excessAndNotes: "Excess supplements can cause constipation and may increase kidney-stone risk in susceptible people."
  },
  {
    nutrient: "Phosphorus",
    primaryPurpose: "Bone, ATP, cell membranes and acid-base balance",
    physiologicalRole: "Part of hydroxyapatite, ATP, DNA/RNA and phospholipids; phosphate buffers body fluids.",
    bestFoodSources: "Meat, dairy, fish, legumes, nuts, whole grains",
    dailyValue: "1,250 mg",
    deficiency: "Rare; weakness, bone pain and impaired appetite",
    excessAndNotes: "High intake is more concerning in kidney disease; phosphate additives can substantially increase intake."
  },
  {
    nutrient: "Magnesium",
    primaryPurpose: "ATP reactions, muscle/nerve function and glucose regulation",
    physiologicalRole: "Cofactor in hundreds of enzymes; stabilizes ATP and nucleic acids and participates in ion transport and neuromuscular signaling.",
    bestFoodSources: "Pumpkin seeds, nuts, legumes, whole grains, dark chocolate",
    dailyValue: "420 mg",
    deficiency: "Cramps, weakness, arrhythmias; deficiency risk rises with GI losses and some medications",
    excessAndNotes: "Food magnesium is safe; high supplemental magnesium commonly causes diarrhea and can be dangerous in severe kidney impairment."
  },
  {
    nutrient: "Sodium",
    primaryPurpose: "Fluid balance, nerve impulses and muscle contraction",
    physiologicalRole: "Primary extracellular cation; establishes osmotic gradients and membrane potentials needed for nerves and muscle.",
    bestFoodSources: "Salt, breads, cheese, processed foods, sauces",
    dailyValue: "<2,300 mg",
    deficiency: "True dietary deficiency is uncommon; large sweat losses can contribute to hyponatremia when paired with excessive plain water",
    excessAndNotes: "DV is an upper reference limit. High intake can raise blood pressure in salt-sensitive individuals; athletes may need context-specific replacement."
  },
  {
    nutrient: "Potassium",
    primaryPurpose: "Cellular fluid balance, nerve function and muscle contraction",
    physiologicalRole: "Primary intracellular cation, critical for membrane potential, cardiac rhythm and sodium balance.",
    bestFoodSources: "Potatoes, bananas, beans, yogurt, avocado, fruit",
    dailyValue: "4,700 mg",
    deficiency: "Weakness, cramps, arrhythmias; often related to losses rather than diet alone",
    excessAndNotes: "High food intake is usually safe with healthy kidneys; kidney disease or some medications can cause dangerous hyperkalemia."
  },
  {
    nutrient: "Chloride",
    primaryPurpose: "Fluid balance, stomach acid and electrical neutrality",
    physiologicalRole: "Main extracellular anion; pairs with sodium and forms hydrochloric acid in the stomach.",
    bestFoodSources: "Table salt, sea salt, many processed foods",
    dailyValue: "2,300 mg",
    deficiency: "Rare; can occur with prolonged vomiting or major fluid losses",
    excessAndNotes: "Usually tracks sodium intake; excessive salt intake raises both sodium and chloride."
  }
];

export const MICRONUTRIENT_TABLE_4: MicronutrientItem[] = [
  {
    nutrient: "Iron",
    primaryPurpose: "Oxygen transport and energy metabolism",
    physiologicalRole: "Central atom in hemoglobin/myoglobin and component of cytochromes used in mitochondrial electron transport.",
    bestFoodSources: "Red meat, liver, shellfish, poultry; legumes and fortified grains",
    dailyValue: "18 mg",
    deficiency: "Iron-deficiency anemia, fatigue, reduced exercise capacity, impaired cognition",
    excessAndNotes: "Excess iron is toxic and promotes oxidative damage; supplementation should be based on need/labs, especially in men and postmenopausal adults."
  },
  {
    nutrient: "Zinc",
    primaryPurpose: "Immune function, protein synthesis, growth and wound healing",
    physiologicalRole: "Structural/catalytic component of hundreds of enzymes and transcription factors; supports DNA synthesis and cell division.",
    bestFoodSources: "Oysters, beef, poultry, dairy, beans, nuts",
    dailyValue: "11 mg",
    deficiency: "Poor wound healing, reduced taste/smell, impaired immunity, hair loss",
    excessAndNotes: "Chronic high-dose zinc can induce copper deficiency and alter lipids."
  },
  {
    nutrient: "Copper",
    primaryPurpose: "Iron metabolism, connective tissue and antioxidant enzymes",
    physiologicalRole: "Cofactor for ceruloplasmin, lysyl oxidase, cytochrome c oxidase and superoxide dismutase.",
    bestFoodSources: "Liver, shellfish, nuts, seeds, cocoa",
    dailyValue: "0.9 mg",
    deficiency: "Anemia, neutropenia, neurologic problems",
    excessAndNotes: "Excess can damage liver; high zinc intake can reduce copper absorption."
  },
  {
    nutrient: "Manganese",
    primaryPurpose: "Enzyme function, bone formation and antioxidant defense",
    physiologicalRole: "Cofactor for enzymes including mitochondrial manganese superoxide dismutase and enzymes in carbohydrate/amino-acid metabolism.",
    bestFoodSources: "Whole grains, nuts, legumes, tea",
    dailyValue: "2.3 mg",
    deficiency: "Very rare; may affect growth, bone and metabolism",
    excessAndNotes: "Excessive exposure can be neurotoxic; food sources are generally safe."
  },
  {
    nutrient: "Iodine",
    primaryPurpose: "Thyroid hormone production",
    physiologicalRole: "Required to synthesize T4 and T3, which regulate metabolic rate, growth and development.",
    bestFoodSources: "Iodized salt, seaweed, dairy, eggs, seafood",
    dailyValue: "150 mcg",
    deficiency: "Goiter, hypothyroidism; severe deficiency during pregnancy impairs fetal brain development",
    excessAndNotes: "Both too little and too much iodine can disrupt thyroid function."
  },
  {
    nutrient: "Selenium",
    primaryPurpose: "Antioxidant enzymes and thyroid hormone metabolism",
    physiologicalRole: "Part of selenoproteins such as glutathione peroxidases and deiodinases that activate/inactivate thyroid hormones.",
    bestFoodSources: "Brazil nuts, seafood, meat, eggs, grains",
    dailyValue: "55 mcg",
    deficiency: "Rare; impaired immunity, thyroid function and cardiomyopathy in severe deficiency",
    excessAndNotes: "Narrower safety margin than many nutrients; chronic excess causes hair/nail brittleness, GI and neurologic symptoms."
  },
  {
    nutrient: "Chromium",
    primaryPurpose: "Supports normal macronutrient metabolism",
    physiologicalRole: "May influence insulin signaling and glucose metabolism, although essentiality and exact mechanisms remain less certain than for many other trace minerals.",
    bestFoodSources: "Whole grains, meats, broccoli, some spices",
    dailyValue: "35 mcg",
    deficiency: "Well-defined deficiency is rare outside specialized clinical settings",
    excessAndNotes: "Routine high-dose chromium supplementation has limited evidence for body-composition benefits."
  },
  {
    nutrient: "Molybdenum",
    primaryPurpose: "Cofactor for sulfur and purine metabolism",
    physiologicalRole: "Required for molybdoenzymes including sulfite oxidase, xanthine oxidase and aldehyde oxidase.",
    bestFoodSources: "Legumes, grains, nuts, dairy",
    dailyValue: "45 mcg",
    deficiency: "Extremely rare; neurologic/metabolic abnormalities in severe deficiency",
    excessAndNotes: "Excessive intake can disrupt copper metabolism, but toxicity from food is uncommon."
  },
  {
    nutrient: "Fluoride",
    primaryPurpose: "Tooth enamel resistance and bone mineral interaction",
    physiologicalRole: "Incorporates into mineralized tissues and increases enamel resistance to acid-mediated demineralization.",
    bestFoodSources: "Fluoridated water, tea, some seafood",
    dailyValue: "4 mg",
    deficiency: "Low exposure increases dental-caries risk",
    excessAndNotes: "Chronic excess during tooth development can cause dental fluorosis; very high long-term exposure can affect bone."
  }
];
