"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function TeacherLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/teacher/dashboard");
      } else {
        setChecking(false);
      }
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.replace("/teacher/dashboard");
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center text-parchment/60">
        Checking session…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded border border-char-700 bg-char-900 p-6">
        <h1 className="text-xl font-bold text-parchment">Teacher Sign In</h1>
        <p className="mt-1 text-sm text-parchment/60">
          Life in the Stone Age — investigation dashboard
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-xs uppercase tracking-wide text-parchment/60">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-char-600 bg-char-950/60 px-3 py-2.5 text-parchment focus:border-ochre-500 focus:outline-none focus:ring-1 focus:ring-ochre-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-xs uppercase tracking-wide text-parchment/60">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-char-600 bg-char-950/60 px-3 py-2.5 text-parchment focus:border-ochre-500 focus:outline-none focus:ring-1 focus:ring-ochre-500"
            />
          </div>

          {error && (
            <div role="alert" className="rounded border border-ember-600 bg-ember-600/10 px-3 py-2 text-sm text-ember-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-ochre-500 px-4 py-2.5 text-sm font-semibold text-char-950 hover:bg-ochre-400 disabled:cursor-not-allowed disabled:bg-char-700 focus:outline-none focus:ring-2 focus:ring-ochre-300"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-5 text-xs text-parchment/40">
          Teacher accounts are created by the site administrator in the Supabase
          dashboard — see the project README for instructions.
        </p>
      </div>
    </div>
  );
}
