import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: { 
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret' 
      } 
    })
  }

  // Authenticate the webhook request
  const webhookSecret = req.headers.get('x-webhook-secret');
  if (webhookSecret !== Deno.env.get('HEALTH_WEBHOOK_SECRET')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const payload = await req.json();
    const { type, value, unit, start_date, end_date, user_id } = payload;

    // Validate payload
    if (!type || value === undefined || !unit || !start_date || !end_date) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    // Use service role key to bypass RLS for webhook ingestion
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert the record
    const { data, error } = await supabase
      .from('health_metrics')
      .insert({
        user_id: user_id || null, // Ensure your iOS shortcut sends the correct user_id
        type,
        value,
        unit,
        start_date,
        end_date
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
