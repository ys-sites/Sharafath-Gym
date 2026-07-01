# Sharafath Gym

Premium fitness and workout tracking web application styled to support user program routines, AI-assisted meal logging, database-persistent logs, and Apple Health synchronization.

## Tech Stack
- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, Framer Motion, Recharts
- **Backend & Database**: Supabase (PostgreSQL, Auth, Storage)
- **Local Dev Server**: Express (Node.js)

## Environment Variables
Create a local `.env` file in the root directory and configure the following parameters:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://mnhwaljzcqfqtnfaivso.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Owner credentials — server-side only, never VITE_ prefixed.
# Used by /api/session to mint the app's session; never exposed to the client.
OWNER_EMAIL=your_owner_account_email
OWNER_PASSWORD=your_owner_account_password

# Optional: Server-side integrations for AI analysis / sync
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
APP_URL=http://localhost:3000
```

| Variable | Where | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | Client + Server | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Client + Server | Supabase anon/public key |
| `OWNER_EMAIL` | Server only | Owner account email, used by `/api/session` to sign in server-side |
| `OWNER_PASSWORD` | Server only | Owner account password, used by `/api/session` to sign in server-side |
| `GEMINI_API_KEY` | Server only | Optional, for AI meal analysis |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Optional, for privileged sync operations |
| `APP_URL` | Server only | Optional, used for CORS/self-referential links |

## Running Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```
   The app will boot locally at [http://localhost:3000](http://localhost:3000).

## Database Backups

Ensure you set the database direct connection password in your terminal/environment:
```bash
$env:SUPABASE_DB_PASSWORD="your_database_password"
```
Then run the backup script:
```bash
npm run backup
```
The export will be saved as a timestamped SQL file inside the local `/backups` directory (which is ignored by Git).
