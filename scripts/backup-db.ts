import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const password = process.env.SUPABASE_DB_PASSWORD;

if (!password) {
  console.error('Error: SUPABASE_DB_PASSWORD environment variable is not defined!');
  console.error('Please set it in your environment or add it to your .env file.');
  process.exit(1);
}

const backupsDir = path.join(process.cwd(), 'backups');
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const fileName = `backup_${timestamp}.sql`;
const filePath = path.join(backupsDir, fileName);

const connectionString = `postgresql://postgres:${password}@db.mnhwaljzcqfqtnfaivso.supabase.co:5432/postgres`;

console.log('Initiating database backup via pg_dump...');

try {
  // Execute pg_dump command
  execSync(`pg_dump --dbname="${connectionString}" --file="${filePath}" --clean --if-exists`, {
    stdio: 'inherit'
  });
  console.log('\n========================================');
  console.log('✅ DATABASE BACKUP COMPLETED SUCCESSFULLY!');
  console.log(`Saved as: backups/${fileName}`);
  console.log('========================================');
} catch (error) {
  console.error('\n❌ Backup failed using pg_dump.');
  console.log('Checking if Supabase CLI is available...');
  try {
    // Fallback: try using Supabase CLI if pg_dump failed/not found
    console.log('Attempting backup using Supabase CLI...');
    execSync(`supabase db dump --db-url "${connectionString}" -f "${filePath}"`, {
      stdio: 'inherit'
    });
    console.log('\n========================================');
    console.log('✅ DATABASE BACKUP COMPLETED SUCCESSFULLY (via Supabase CLI)!');
    console.log(`Saved as: backups/${fileName}`);
    console.log('========================================');
  } catch (cliError: any) {
    console.error('\n❌ Backup failed via both pg_dump and Supabase CLI.');
    console.error('Please ensure either pg_dump (PostgreSQL client tools) or Supabase CLI is installed and in your PATH.');
    process.exit(1);
  }
}
