import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { AccessDenied } from "../features/auth/ui/AccessDenied";
import { LoginPage } from "../features/auth/ui/LoginPage";
import { ClientsPage } from "../pages/clients-page/ui/ClientsPage";
import { getSupabase } from "../shared/api/supabase";

type AccessState = "checking" | "allowed" | "denied";

export function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [access, setAccess] = useState<AccessState>("checking");
  const [approvedUserId, setApprovedUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    void supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setAccess("checking");
      setApprovedUserId(null);
      return;
    }

    let active = true;
    setAccess("checking");
    setApprovedUserId(null);
    void getSupabase().rpc("is_admin").then(({ data, error }) => {
      if (!active) return;

      if (!error && data === true) {
        setApprovedUserId(session.user.id);
        setAccess("allowed");
      } else {
        setAccess("denied");
      }
    });

    return () => {
      active = false;
    };
  }, [session]);

  if (session === undefined) return <main className="auth-page">Loading…</main>;
  if (!session) return <LoginPage />;
  if (access === "checking") return <main className="auth-page">Checking access…</main>;
  if (access === "denied") return <AccessDenied />;

  return (
    <ClientsPage
      userEmail={session.user.email}
      userId={session.user.id}
      onSignOut={() => void getSupabase().auth.signOut()}
    />
  );
}
