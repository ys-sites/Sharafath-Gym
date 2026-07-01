import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const dbPassword = process.env.SUPABASE_DB_PASSWORD || "";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { user_id, steps, calories } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: "Missing user_id parameter in body" });
    }

    const stepsVal = Number(steps || 0);
    const caloriesVal = Number(calories || 0);
    const now = new Date().toISOString();

    if (supabaseUrl && serviceRoleKey) {
      const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false }
      });

      const { error } = await supabase
        .from("profiles")
        .update({
          apple_health_connected: true,
          steps_synced_today: stepsVal,
          calories_synced_today: caloriesVal,
          last_health_sync: now
        })
        .eq("user_id", user_id);

      if (!error) {
        return res.status(200).json({ success: true, method: "Supabase Service Client" });
      }
      console.warn("Supabase Service Client update failed:", error);
    }

    if (dbPassword) {
      const connectionString = `postgresql://postgres:${dbPassword}@db.mnhwaljzcqfqtnfaivso.supabase.co:5432/postgres`;
      const sql = postgres(connectionString);

      await sql`
        UPDATE profiles 
        SET 
          apple_health_connected = true,
          steps_synced_today = ${stepsVal},
          calories_synced_today = ${caloriesVal},
          last_health_sync = ${now}
        WHERE user_id = ${user_id};
      `;

      await sql.end();
      return res.status(200).json({ success: true, method: "Direct PG Database Update" });
    }

    return res.status(500).json({
      error: "No server credentials configured. Please set either SUPABASE_SERVICE_ROLE_KEY or SUPABASE_DB_PASSWORD in environment variables."
    });
  } catch (err: any) {
    console.error("Health sync error:", err);
    return res.status(500).json({ error: err.message || "Failed to sync Health data" });
  }
}
