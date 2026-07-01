import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.warn("DEPRECATION WARNING: /api/sync-health is deprecated. Call the Edge Function directly: https://mnhwaljzcqfqtnfaivso.supabase.co/functions/v1/health-sync");

  // Handle CORS
  const origin = req.headers.origin;
  let allowedOrigin = process.env.APP_URL || "";
  if (origin && (origin.endsWith(".vercel.app") || (process.env.APP_URL && origin === process.env.APP_URL))) {
    allowedOrigin = origin;
  }
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin || "null");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-webhook-secret");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Proxy the request directly to the Supabase Edge Function URL to preserve body payload
  try {
    const targetUrl = "https://mnhwaljzcqfqtnfaivso.supabase.co/functions/v1/health-sync";
    
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": req.headers["x-webhook-secret"] as string || ""
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error("Proxy error in retired sync-health endpoint:", error);
    return res.status(500).json({ error: "Failed to proxy request to edge function", details: error.message });
  }
}
