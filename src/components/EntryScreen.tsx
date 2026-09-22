"use client";

import { useState } from "react";

export default function EntryScreen({
  onBegin,
  loading,
  error,
}: {
  onBegin: (name: string, className: string) => void;
  loading: boolean;
  error: string | null;
}) {
  const [name, setName] = useState("");
  const [className, setClassName] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onBegin(name.trim(), className.trim());
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-char-950 px-4">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: "url(/images/main-cave-scene.png)" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-b from-char-950 via-char-950/80 to-char-950" />

      <div className="relative z-10 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold tracking-wide text-parchment sm:text-4xl">
          LIFE IN THE STONE AGE
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-balance text-ochre-300">
          &ldquo;What can archaeological evidence tell us about the lives of
          prehistoric humans?&rdquo;
        </p>
        <p className="mt-6 text-sm text-parchment/70">
          Enter your name to begin your investigation.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
          <div>
            <label htmlFor="name" className="mb-1 block text-xs uppercase tracking-wide text-parchment/60">
              Name
            </label>
            <input
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border border-char-600 bg-char-900/80 px-3 py-2.5 text-parchment focus:border-ochre-500 focus:outline-none focus:ring-1 focus:ring-ochre-500"
              placeholder="Your name"
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="class" className="mb-1 block text-xs uppercase tracking-wide text-parchment/60">
              Class <span className="normal-case text-parchment/40">(optional)</span>
            </label>
            <input
              id="class"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full rounded border border-char-600 bg-char-900/80 px-3 py-2.5 text-parchment focus:border-ochre-500 focus:outline-none focus:ring-1 focus:ring-ochre-500"
              placeholder="e.g. 10B"
            />
          </div>

          {error && (
            <div role="alert" className="rounded border border-ember-600 bg-ember-600/10 px-3 py-2 text-sm text-ember-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full rounded bg-ochre-500 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-char-950 shadow-glow transition hover:bg-ochre-400 disabled:cursor-not-allowed disabled:bg-char-700 disabled:text-parchment/40 disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-ochre-300"
          >
            {loading ? "Entering the cave…" : "Begin Exploration"}
          </button>
        </form>
      </div>
    </div>
  );
}
