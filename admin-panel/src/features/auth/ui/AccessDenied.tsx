import { getSupabase } from "../../../shared/api/supabase";

export function AccessDenied() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">Admin panel</p>
        <h1>Access denied</h1>
        <p>Your account is authenticated but is not an approved administrator.</p>
        <button onClick={() => void getSupabase().auth.signOut()} type="button">
          Sign out
        </button>
      </section>
    </main>
  );
}
