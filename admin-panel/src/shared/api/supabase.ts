import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url?.trim() || !anonKey?.trim()) {
    throw new Error(
      "VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be configured",
    );
  }

  client = createClient(url, anonKey);
  return client;
}
