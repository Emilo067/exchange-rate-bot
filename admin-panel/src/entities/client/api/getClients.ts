import { getSupabase } from "../../../shared/api/supabase";
import type { Client } from "../model/types";

export async function getClients(): Promise<Client[]> {
  const { data, error } = await getSupabase()
    .from("clients")
    .select("id, first_name, username, last_message_at")
    .order("last_message_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((client) => ({
    ...client,
    id: String(client.id),
  })) as Client[];
}
