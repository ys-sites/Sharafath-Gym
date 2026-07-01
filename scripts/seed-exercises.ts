import * as fs from 'fs';
import * as path from 'path';

async function seed() {
  console.log('Fetching exercise dataset...');
  const res = await fetch('https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json');
  if (!res.ok) throw new Error('Failed to fetch exercises');
  const dataset = await res.json();
  console.log(`Fetched ${dataset.length} exercises from free-exercise-db.`);

  const existingNames = new Set([
    'barbell bench press',
    'squat',
    'deadlift',
    'pull-up',
    'overhead press'
  ]);

  const statements: string[] = [];

  // 1. Schema update
  statements.push(`-- Migration: Add extra columns to exercises and seed free-exercise-db`);
  statements.push(`ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS equipment TEXT;`);
  statements.push(`ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS level TEXT;`);
  statements.push(`ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS instructions TEXT[];`);
  statements.push(`ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS image_urls TEXT[];`);
  statements.push(`ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'user';`);
  statements.push(``);

  // 2. Insert exercises
  for (const ex of dataset) {
    const nameLower = ex.name.toLowerCase();
    if (existingNames.has(nameLower)) {
      console.log(`Skipping duplicate seed exercise: ${ex.name}`);
      continue;
    }

    const muscleGroup = ex.primaryMuscles && ex.primaryMuscles[0]
      ? ex.primaryMuscles[0].charAt(0).toUpperCase() + ex.primaryMuscles[0].slice(1)
      : 'Other';

    const equipment = ex.equipment || 'Other';
    const level = ex.level || 'beginner';
    
    // Construct raw image urls
    const imageUrls = (ex.images || []).map((img: string) => 
      `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${img}`
    );

    // Escape and format SQL string arrays
    const sqlInstructions = (ex.instructions || []).map((inst: string) => `$$${inst.trim()}$$`).join(', ');
    const sqlImageUrls = imageUrls.map((url: string) => `$$${url}$$`).join(', ');

    statements.push(
      `INSERT INTO public.exercises (name, muscle_group, equipment, level, instructions, image_urls, source) VALUES (` +
      `$$${ex.name.trim()}$$, ` +
      `$$${muscleGroup}$$, ` +
      `$$${equipment}$$, ` +
      `$$${level}$$, ` +
      `ARRAY[${sqlInstructions}]::TEXT[], ` +
      `ARRAY[${sqlImageUrls}]::TEXT[], ` +
      `'free-exercise-db'` +
      `);`
    );
  }

  const migrationPath = 'supabase/migrations/20260701200000_seed_free_exercise_db.sql';
  fs.writeFileSync(migrationPath, statements.join('\n'), 'utf8');
  console.log(`Created migration at: ${migrationPath}`);
}

seed().catch(err => {
  console.error('Seeding script failed:', err);
  process.exit(1);
});
