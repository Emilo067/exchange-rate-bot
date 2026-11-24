SET local check_function_bodies = off;

CREATE TABLE "public"."admin_users" (
  "user_id" uuid NOT NULL,
  CONSTRAINT "admin_users_pkey" PRIMARY KEY (user_id)
);

ALTER TABLE "public"."admin_users"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."admin_users" FROM "anon", "authenticated";

CREATE OR REPLACE FUNCTION public.is_admin()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
    SELECT EXISTS (
      SELECT 1
      FROM public.admin_users
      WHERE user_id = auth.uid()
    );
  $function$;

REVOKE ALL ON FUNCTION "public"."is_admin"() FROM PUBLIC, "anon";

CREATE OR REPLACE FUNCTION public.set_updated_at()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
BEGIN
  NEW.updated_at = now();
RETURN NEW;
END;
$function$;

ALTER TABLE "public"."admin_users"
  ADD CONSTRAINT "admin_users_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE POLICY "approved administrators can read clients" ON "public"."clients"
  FOR SELECT
  TO "authenticated"
  USING (( SELECT public.is_admin() AS is_admin));

CREATE POLICY "approved administrators can read messages" ON "public"."messages"
  FOR SELECT
  TO "authenticated"
  USING (( SELECT public.is_admin() AS is_admin));

ALTER PUBLICATION "supabase_realtime" ADD TABLE "public"."messages";

ALTER PUBLICATION "supabase_realtime" SET (publish = 'insert');

GRANT EXECUTE ON FUNCTION "public"."is_admin"() TO "authenticated";

REVOKE ALL ON FUNCTION "public"."is_admin"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_admin"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."is_admin"() TO "service_role";

REVOKE ALL ON TABLE "public"."admin_users" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."admin_users" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."admin_users" TO "service_role";
