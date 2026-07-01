import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const password = process.env.SUPABASE_DB_PASSWORD;

if (!password) {
  console.error('Error: SUPABASE_DB_PASSWORD environment variable is not defined!');
  process.exit(1);
}

const connectionString = `postgresql://postgres:${password}@db.mnhwaljzcqfqtnfaivso.supabase.co:5432/postgres`;

async function main() {
  const sql = postgres(connectionString);
  console.log('Connecting to database and adding Apple Health columns to profiles...');

  try {
    // Add columns if they do not exist
    await sql`
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS apple_health_connected BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS steps_synced_today INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS calories_synced_today INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_health_sync TIMESTAMP WITH TIME ZONE;
    `;
    console.log('✅ Health columns added successfully to profiles table!');
  } catch (err) {
    console.error('❌ Failed to update profiles table schema:', err);
  } finally {
    await sql.end();
  }
}

main();
