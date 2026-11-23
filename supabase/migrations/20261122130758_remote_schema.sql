SET local check_function_bodies = off;

CREATE TABLE "public"."clients"
(
    "id"              bigint NOT NULL,
    "first_name"      text,
    "username"        text,
    "last_message_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "clients_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."clients"
    ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."messages"
(
    "id"         uuid NOT NULL            DEFAULT gen_random_uuid(),
    "client_id"  bigint,
    "sender"     text,
    "text"       text,
    "created_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "messages_pkey" PRIMARY KEY (id),
    CONSTRAINT "messages_sender_check" CHECK ((sender = ANY (ARRAY['client'::text, 'bot'::text])))
);

ALTER TABLE "public"."messages"
    ENABLE ROW LEVEL SECURITY;

CREATE
OR REPLACE FUNCTION public.update_last_message_at()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
BEGIN
UPDATE clients
SET last_message_at = NEW.created_at
WHERE id = NEW.client_id;
RETURN NEW;
END;
$function$;

ALTER TABLE "public"."messages"
    ADD CONSTRAINT "messages_client_id_fkey" FOREIGN KEY (client_id) REFERENCES public.clients (id);

CREATE TRIGGER update_client_last_message
    AFTER INSERT
    ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_last_message_at();

GRANT
EXECUTE
ON
FUNCTION
"public"
.
"update_last_message_at"
() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."update_last_message_at"() FROM "postgres";

GRANT
EXECUTE
ON
FUNCTION
"public"
.
"update_last_message_at"
() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."update_last_message_at"
() TO "service_role";

GRANT DELETE
, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."clients" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."clients" FROM "postgres";

GRANT
DELETE
, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."clients" TO "postgres";

GRANT DELETE
, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."clients" TO "service_role";

GRANT DELETE
, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."messages" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."messages" FROM "postgres";

GRANT
DELETE
, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."messages" TO "postgres";

GRANT DELETE
, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."messages" TO "service_role";
