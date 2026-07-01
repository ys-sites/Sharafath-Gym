import postgres from 'postgres';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const password = process.env.SUPABASE_DB_PASSWORD;
if (!password) {
  console.error('Error: SUPABASE_DB_PASSWORD is not defined in .env');
  process.exit(1);
}

const connectionString = `postgresql://postgres:${password}@db.mnhwaljzcqfqtnfaivso.supabase.co:5432/postgres`;

async function runMigrations() {
  const sql = postgres(connectionString);
  console.log('Connected to database. Running migrations...');

  const migrationFiles = [
    'supabase/migrations/20260701190000_meal_items_source_and_water.sql',
    'supabase/migrations/20260701200000_seed_free_exercise_db.sql'
  ];

  for (const file of migrationFiles) {
    if (!fs.existsSync(file)) {
      console.warn(`Migration file not found: ${file}. Skipping.`);
      continue;
    }

    console.log(`Executing migration: ${file}...`);
    const content = fs.readFileSync(file, 'utf8');
    
    try {
      // Split statements by semicolon to run individually or execute as a single block
      // To handle things like DO $$ blocks and functions correctly, we can execute the script as a single batch query!
      await sql.unsafe(content);
      console.log(`Successfully completed migration: ${file}`);
    } catch (err: any) {
      console.error(`Migration failed for ${file}:`, err.message || err);
      // Don't exit immediately so other parts can run, but you can decide to throw
    }
  }

  await sql.end();
  console.log('All migrations processed.');
}

runMigrations().catch(err => {
  console.error('Migration runner failed:', err);
  process.exit(1);
});
