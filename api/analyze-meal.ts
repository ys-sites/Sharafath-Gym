import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as Sentry from "@sentry/node";
import {
  analyzeMeal,
  extractUserIdFromAuthHeader,
  validateAndSanitizeInput,
  MealAnalysisConfigError,
  MealAnalysisValidationError,
  type AnalyzeMealInput,
} from "../src/server/mealAnalysis";

const sentryDsn = process.env.SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    tracesSampleRate: 1.0,
  });
}

function getServiceClient() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function logScan(params: {
  userId: string | null;
  inputType: string;
  rawResponse: any;
  success: boolean;
  errorMessage: string | null;
  provider: string | null;
}) {
  const client = getServiceClient();
  if (!client) return;
  try {
    await client.from("meal_scan_logs").insert({
      user_id: params.userId,
      input_type: params.inputType,
      raw_ai_response: params.rawResponse,
      success: params.success,
      error_message: params.errorMessage,
      provider: params.provider,
    });
  } catch (err) {
    console.error("Failed to write meal_scan_logs entry:", err);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let input: AnalyzeMealInput;
  try {
    input = validateAndSanitizeInput(req.body);
  } catch (err) {
    if (err instanceof MealAnalysisValidationError) {
      return res.status(err.status).json({ error: err.message });
    }
    return res.status(400).json({ error: "Invalid request." });
  }

  const userId = extractUserIdFromAuthHeader(req.headers.authorization);
  const inputType = input.correctedItem ? "correction" : input.image ? "image" : "description";

  try {
    const { data, provider, fallbackUsed } = await analyzeMeal(input);
    await logScan({
      userId,
      inputType,
      rawResponse: data,
      success: true,
      errorMessage: null,
      provider,
    });
    return res.status(200).json({ ...data, provider, fallback_used: fallbackUsed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Meal analysis failed:", message);
    if (sentryDsn) {
      Sentry.captureException(err);
    }

    if (err instanceof MealAnalysisConfigError) {
      await logScan({ userId, inputType, rawResponse: null, success: false, errorMessage: message, provider: null });
      return res.status(500).json({ error: `AI configuration error: ${message}` });
    }

    await logScan({ userId, inputType, rawResponse: null, success: false, errorMessage: message, provider: null });
    return res.status(500).json({ error: "Analysis failed, try again." });
  }
}
