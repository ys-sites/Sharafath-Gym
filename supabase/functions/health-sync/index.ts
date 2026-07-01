// DEPLOYED as version 2 of the health-sync edge function on project mnhwaljzcqfqtnfaivso.
//
// Accepts THREE payload formats:
//  1. Health Auto Export REST export  -> auth via x-user-id + x-sync-token headers
//  2. Native batch  { user_id, sync_token, metrics: [...] }
//  3. Native single { user_id, sync_token, type, value, unit, start_date, end_date }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const ALLOWED_TYPES = ['steps', 'workout', 'weight', 'active_energy', 'resting_hr', 'sleep_hours', 'distance_km'];

// Health Auto Export metric name -> our type + unit normalizer
const HAE_MAP: Record<string, { type: string; unit: string }> = {
  'step_count': { type: 'steps', unit: 'count' },
  'active_energy': { type: 'active_energy', unit: 'kcal' },
  'weight_body_mass': { type: 'weight', unit: 'kg' },
  'resting_heart_rate': { type: 'resting_hr', unit: 'bpm' },
  'walking_running_distance': { type: 'distance_km', unit: 'km' },
  'sleep_analysis': { type: 'sleep_hours', unit: 'h' },
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret, x-user-id, x-sync-token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...CORS } });

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const envSecret = Deno.env.get('HEALTH_WEBHOOK_SECRET');
  if (envSecret && req.headers.get('x-webhook-secret') !== envSecret) {
    return json({ error: 'Unauthorized: invalid webhook secret header' }, 401);
  }

  try {
    const payload = await req.json();

    // Auth: accept credentials from headers (Health Auto Export) or body (Shortcuts / test ping)
    const user_id = req.headers.get('x-user-id') || payload.user_id;
    const sync_token = req.headers.get('x-sync-token') || payload.sync_token;

    if (!user_id || !sync_token) {
      return json({ error: 'Unauthorized: Missing user_id or sync_token (body fields or x-user-id / x-sync-token headers)' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    if (!supabaseUrl || !supabaseServiceKey) return json({ error: 'Configuration missing on Edge Function' }, 500);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: profile, error: selectError } = await supabase
      .from('profiles')
      .select('user_id, sync_token')
      .eq('user_id', user_id)
      .eq('sync_token', sync_token)
      .maybeSingle();

    if (selectError || !profile) return json({ error: 'Unauthorized: Invalid user_id or sync_token' }, 401);

    // Normalize payload into rawMetrics [{type, value, unit, start_date, end_date}]
    let rawMetrics: any[] = [];

    if (payload?.data?.metrics && Array.isArray(payload.data.metrics)) {
      // ---- Health Auto Export format ----
      for (const m of payload.data.metrics) {
        const mapped = HAE_MAP[m?.name];
        if (!mapped || !Array.isArray(m?.data)) continue;
        for (const point of m.data) {
          const dateStr = point?.date;
          if (!dateStr) continue;
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) continue;

          // Normalize to a daily bucket so upserts stay idempotent per day
          const dayStart = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
          const dayEnd = new Date(dayStart.getTime() + 86399999);

          let value: number | null = null;
          let unit = mapped.unit;

          if (mapped.type === 'sleep_hours') {
            // HAE sleep points expose totals like totalSleep / asleep (hours)
            const v = point.totalSleep ?? point.asleep ?? point.qty;
            value = Number(v);
          } else if (mapped.type === 'distance_km') {
            let v = Number(point.qty);
            const u = (m.units || '').toLowerCase();
            if (u === 'mi') v = v * 1.60934;
            if (u === 'm') v = v / 1000;
            value = v;
          } else if (mapped.type === 'active_energy') {
            let v = Number(point.qty);
            const u = (m.units || '').toLowerCase();
            if (u === 'kj') v = v / 4.184;
            value = v;
          } else if (mapped.type === 'weight') {
            let v = Number(point.qty);
            const u = (m.units || '').toLowerCase();
            if (u === 'lb' || u === 'lbs') v = v * 0.453592;
            value = v;
          } else {
            value = Number(point.qty);
          }

          if (value === null || !Number.isFinite(value)) continue;
          rawMetrics.push({
            type: mapped.type,
            value,
            unit,
            start_date: dayStart.toISOString(),
            end_date: dayEnd.toISOString(),
          });
        }
      }
      if (rawMetrics.length === 0) {
        return json({ error: 'Health Auto Export payload contained no supported metrics. Supported: ' + Object.keys(HAE_MAP).join(', ') }, 400);
      }
    } else if (Array.isArray(payload.metrics)) {
      // ---- Native batch format ----
      rawMetrics = payload.metrics;
    } else if (payload.type && payload.value !== undefined && payload.start_date && payload.end_date) {
      // ---- Native single-metric format ----
      rawMetrics = [{ type: payload.type, value: payload.value, unit: payload.unit, start_date: payload.start_date, end_date: payload.end_date }];
    } else {
      return json({ error: 'Unrecognized payload. Send native {metrics:[...]} or a Health Auto Export REST export.' }, 400);
    }

    // Validate and sanitize
    const validatedMetrics: any[] = [];
    const errors: any[] = [];

    for (const metric of rawMetrics) {
      const { type: mType, value: mVal, unit: mUnit, start_date: mStart, end_date: mEnd } = metric;

      if (!ALLOWED_TYPES.includes(mType)) { errors.push({ metric, error: `Invalid type. Allowed: ${ALLOWED_TYPES.join(', ')}` }); continue; }
      const valNum = Number(mVal);
      if (!Number.isFinite(valNum) || valNum < 0 || valNum > 1000000) { errors.push({ metric, error: 'Value must be a finite number between 0 and 1,000,000' }); continue; }
      if (!mStart || !mEnd) { errors.push({ metric, error: 'Missing start_date or end_date' }); continue; }
      const startD = new Date(mStart);
      const endD = new Date(mEnd);
      if (isNaN(startD.getTime()) || isNaN(endD.getTime())) { errors.push({ metric, error: 'Dates must be valid ISO-8601 strings' }); continue; }
      if (endD < startD) { errors.push({ metric, error: 'end_date must be greater than or equal to start_date' }); continue; }

      validatedMetrics.push({
        user_id,
        type: mType,
        value: valNum,
        unit: mUnit || '',
        start_date: startD.toISOString(),
        end_date: endD.toISOString(),
        synced_at: new Date().toISOString(),
      });
    }

    // Dedupe within this batch on the idempotency key (keep the max value per day)
    const dedup = new Map<string, any>();
    for (const vm of validatedMetrics) {
      const key = `${vm.type}|${vm.start_date}`;
      const existing = dedup.get(key);
      if (!existing || vm.value > existing.value) dedup.set(key, vm);
    }
    const finalMetrics = [...dedup.values()];

    if (finalMetrics.length > 0) {
      const { error: upsertError } = await supabase
        .from('health_metrics')
        .upsert(finalMetrics, { onConflict: 'user_id,type,start_date' });
      if (upsertError) return json({ error: upsertError.message, errors }, 500);
    }

    // Mirror today's totals into profiles for the legacy cards
    const todayStr = new Date().toISOString().substring(0, 10);
    let todaySteps = 0, todayCalories = 0, hasTodaySteps = false, hasTodayCalories = false;

    for (const vm of finalMetrics) {
      if (vm.start_date.substring(0, 10) === todayStr) {
        if (vm.type === 'steps') { todaySteps = Math.max(todaySteps, vm.value); hasTodaySteps = true; }
        if (vm.type === 'active_energy') { todayCalories = Math.max(todayCalories, vm.value); hasTodayCalories = true; }
      }
    }

    const profileUpdates: any = { apple_health_connected: true, last_health_sync: new Date().toISOString() };
    if (hasTodaySteps) profileUpdates.steps_synced_today = Math.round(todaySteps);
    if (hasTodayCalories) profileUpdates.calories_synced_today = Math.round(todayCalories);

    await supabase.from('profiles').update(profileUpdates).eq('user_id', user_id);

    return json({ success: true, processed: finalMetrics.length, skipped: errors.length, errors: errors.length > 0 ? errors : undefined });
  } catch (err: any) {
    return json({ error: err.message }, 400);
  }
});
