CREATE OR REPLACE FUNCTION public.update_last_message_at()
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

GRANT EXECUTE ON FUNCTION "public"."update_last_message_at"() TO PUBLIC, "anon", "authenticated";

GRANT EXECUTE ON FUNCTION "public"."update_last_message_at"() TO "service_role";

REVOKE ALL ON FUNCTION "public"."update_last_message_at"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."update_last_message_at"() TO "postgres";
