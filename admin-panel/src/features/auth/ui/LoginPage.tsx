import { FormEvent, useState } from "react";
import { getSupabase } from "../../../shared/api/supabase";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: signInError } = await getSupabase().auth.signInWithPassword({
      email,
      password,
    });

    setIsSubmitting(false);
    if (signInError) setError(signInError.message);
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={signIn}>
        <p className="eyebrow">Admin panel</p>
        <h1>Sign in</h1>
        <p>Use your administrator email and password.</p>
        <label>
          Email
          <input
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>
        <label>
          Password
          <input
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
        {error ? <p className="auth-error" role="alert">{error}</p> : null}
        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
