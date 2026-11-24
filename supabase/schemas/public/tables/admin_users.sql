CREATE TABLE "public"."admin_users" (
  "user_id" uuid NOT NULL,
  CONSTRAINT "admin_users_pkey" PRIMARY KEY ("user_id"),
  CONSTRAINT "admin_users_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES auth.users("id") ON DELETE CASCADE
);

ALTER TABLE "public"."admin_users"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."admin_users" FROM "anon", "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."admin_users" TO "service_role";

REVOKE ALL ON TABLE "public"."admin_users" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."admin_users" TO "postgres";
