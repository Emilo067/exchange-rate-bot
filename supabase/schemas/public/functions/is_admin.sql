CREATE OR REPLACE FUNCTION public.is_admin()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = ''
  AS $function$
    SELECT EXISTS (
      SELECT 1
      FROM public.admin_users
      WHERE user_id = auth.uid()
    );
  $function$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, "anon";

GRANT EXECUTE ON FUNCTION public.is_admin() TO "authenticated";
