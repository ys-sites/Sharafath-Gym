import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const ALLOWED_TYPES = ['steps', 'workout', 'weight', 'active_energy', 'resting_hr', 'sleep_hours', 'distance_km'];

serve(async (req) => {
  // Handle CORS OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: { 
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      } 
    });
  }

  // 1. Optional header shared secret check if configured in environment
  const envSecret = Deno.env.get('HEALTH_WEBHOOK_SECRET');
  if (envSecret) {
    const webhookSecret = req.headers.get('x-webhook-secret');
    if (webhookSecret !== envSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized: invalid webhook secret header' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  }

  try {
    const payload = await req.json();
    const { user_id, sync_token, metrics, type, value, unit, start_date, end_date } = payload;

    // 2. Authenticate the payload using per-user token model
    if (!user_id || !sync_token) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Missing user_id or sync_token' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Configuration missing on Edge Function' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user credentials in profiles table
    const { data: profile, error: selectError } = await supabase
      .from('profiles')
      .select('user_id, sync_token')
      .eq('user_id', user_id)
      .eq('sync_token', sync_token)
      .maybeSingle();

    if (selectError || !profile) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid user_id or sync_token' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // 3. Normalize single metric or batch array payload
    let rawMetrics: any[] = [];
    if (Array.isArray(metrics)) {
      rawMetrics = metrics;
    } else if (type && value !== undefined && start_date && end_date) {
      rawMetrics = [{ type, value, unit, start_date, end_date }];
    } else {
      return new Response(JSON.stringify({ error: 'No metrics array or valid single metric fields found in body' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // 4. Validate and sanitize each incoming metric row
    const validatedMetrics: any[] = [];
    const errors: any[] = [];

    for (const metric of rawMetrics) {
      const { type: mType, value: mVal, unit: mUnit, start_date: mStart, end_date: mEnd } = metric;
      
      if (!ALLOWED_TYPES.includes(mType)) {
        errors.push({ metric, error: `Invalid type. Allowed: ${ALLOWED_TYPES.join(', ')}` });
        continue;
      }

      const valNum = Number(mVal);
      if (!Number.isFinite(valNum) || valNum < 0 || valNum > 1000000) {
        errors.push({ metric, error: 'Value must be a finite number between 0 and 1,000,000' });
        continue;
      }

      if (!mStart || !mEnd) {
        errors.push({ metric, error: 'Missing start_date or end_date' });
        continue;
      }

      const startD = new Date(mStart);
      const endD = new Date(mEnd);
      if (isNaN(startD.getTime()) || isNaN(endD.getTime())) {
        errors.push({ metric, error: 'Dates must be valid ISO-8601 strings' });
        continue;
      }

      if (endD < startD) {
        errors.push({ metric, error: 'end_date must be greater than or equal to start_date' });
        continue;
      }

      validatedMetrics.push({
        user_id,
        type: mType,
        value: valNum,
        unit: mUnit || "",
        start_date: startD.toISOString(),
        end_date: endD.toISOString(),
        synced_at: new Date().toISOString()
      });
    }

    // 5. Upsert validated metrics using unique idempotency key
    if (validatedMetrics.length > 0) {
      const { error: upsertError } = await supabase
        .from('health_metrics')
        .upsert(validatedMetrics, { onConflict: 'user_id,type,start_date' });

      if (upsertError) {
        return new Response(JSON.stringify({ error: upsertError.message, errors }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // 6. Sync today's totals back into profiles to keep legacy cards updated
    const todayStr = new Date().toISOString().substring(0, 10);
    let todaySteps = 0;
    let todayCalories = 0;
    let hasTodaySteps = false;
    let hasTodayCalories = false;

    for (const vm of validatedMetrics) {
      if (vm.start_date.substring(0, 10) === todayStr) {
        if (vm.type === 'steps') {
          todaySteps = Math.max(todaySteps, vm.value);
          hasTodaySteps = true;
        }
        if (vm.type === 'active_energy') {
          todayCalories = Math.max(todayCalories, vm.value);
          hasTodayCalories = true;
        }
      }
    }

    const profileUpdates: any = {
      apple_health_connected: true,
      last_health_sync: new Date().toISOString()
    };

    if (hasTodaySteps) {
      profileUpdates.steps_synced_today = Math.round(todaySteps);
    }
    if (hasTodayCalories) {
      profileUpdates.calories_synced_today = Math.round(todayCalories);
    }

    await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('user_id', user_id);

    return new Response(JSON.stringify({ 
      success: true, 
      processed: validatedMetrics.length, 
      skipped: errors.length,
      errors: errors.length > 0 ? errors : undefined
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
});
