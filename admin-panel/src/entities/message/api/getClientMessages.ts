import { getSupabase } from "../../../shared/api/supabase";
import type { Message } from "../model/types";

export async function getClientMessages(clientId: string): Promise<Message[]> {
  const { data, error } = await getSupabase()
    .from("messages")
    .select("id, client_id, sender, text, created_at")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) throw error;
  return (data ?? [])
    .map((message) => ({
      ...message,
      client_id: String(message.client_id),
    }))
    .reverse() as Message[];
}
