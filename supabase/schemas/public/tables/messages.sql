CREATE TABLE "public"."messages" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "client_id"  bigint,
  "sender"     text,
  "text"       text,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "messages_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients(id),
  CONSTRAINT "messages_pkey" PRIMARY KEY (id),
  CONSTRAINT "messages_sender_check" CHECK ((sender = ANY (ARRAY['client'::text, 'bot'::text])))
);

ALTER TABLE "public"."messages"
  ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_client_last_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_last_message_at();

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."messages" TO "anon", "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."messages" TO "service_role";

REVOKE ALL ON TABLE "public"."messages" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."messages" TO "postgres";
