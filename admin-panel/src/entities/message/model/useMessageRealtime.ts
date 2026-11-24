import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "../../../shared/api/supabase";

export function useMessageRealtime(userId: string | undefined, clientId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId || !clientId) return;

    const messagesQueryKey = ["messages", userId, clientId];

    const channel = getSupabase()
      .channel(`admin-messages:${clientId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `client_id=eq.${clientId}`,
        },
        () => {
          void queryClient
            .cancelQueries({ queryKey: messagesQueryKey })
            .then(() => queryClient.invalidateQueries({ queryKey: messagesQueryKey }));
          void queryClient.invalidateQueries({ queryKey: ["clients", userId] });
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED" || status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          void queryClient.invalidateQueries({ queryKey: messagesQueryKey });
        }
      });

    return () => {
      void getSupabase().removeChannel(channel);
    };
  }, [clientId, queryClient, userId]);
}
