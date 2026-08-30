import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service role key.
 *
 * NEVER import this file from a Client Component ("use client") — the
 * service role key bypasses every database rule and must stay on the
 * server. Only call this from Server Components, Server Actions, or
 * Route Handlers.
 *
 * Returns null (instead of throwing) when the env vars aren't set yet,
 * so pages can render a friendly "not connected" state instead of
 * crashing during setup.
 */
export function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
