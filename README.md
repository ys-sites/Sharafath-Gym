<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/0f3cd4a5-e863-4b9b-b950-9c536a08f54d

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Database Backups

You can run automated timestamped SQL schema/data exports locally.

### Setup DB Password
Create or set `SUPABASE_DB_PASSWORD` in your local `.env` file or environment:
```bash
SUPABASE_DB_PASSWORD=your_supabase_db_password
```

### Run Backup
Run the backup script:
```bash
npm run backup
```
The output file will be generated in `/backups` under the project root (ignored by Git).

