"use client";

import { useState } from "react";
import Panel from "./Panel";
import { ErrorNote, SectionHeading } from "./shared";
import { Investigation } from "@/types/investigation";
import { saveInvestigation } from "@/lib/investigationClient";

const STARTERS = [
  "Archaeological evidence suggests that...",
  "For example,...",
  "This tells us that...",
  "However, we cannot know for certain...",
];

export default function Synthesis({
  investigation,
  investigationId,
  onClose,
  onSubmitted,
}: {
  investigation: Investigation;
  investigationId: string;
  onClose: () => void;
  onSubmitted: (updated: Investigation) => void;
}) {
  const [response, setResponse] = useState(investigation.final_response ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = response.trim().length >= 40;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await saveInvestigation(
        investigationId,
        { final_response: response },
        { submit: true }
      );
      onSubmitted(updated);
    } catch (e: any) {
      setError(e.message || "Could not submit. Your writing is still here — please try again.");
    } finally {
      setSaving(false);
    }
  }

  function insertStarter(s: string) {
    setResponse((prev) => (prev.trim().length ? prev.trimEnd() + "\n\n" + s + " " : s + " "));
  }

  return (
    <Panel onClose={onClose} label="Complete Your Investigation">
      <h2 className="text-2xl font-bold tracking-wide text-parchment">
        THE ARCHAEOLOGIST&rsquo;S CONCLUSION
      </h2>

      <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-parchment/90">
        <p>What have you discovered?</p>
        <p>
          You have investigated three types of evidence about prehistoric humans. Now
          use the evidence to construct a conclusion.
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded border border-char-700 p-3">
          <div className="text-xs font-semibold uppercase tracking-widest text-ochre-400">Fire</div>
          <p className="mt-1 text-sm text-parchment/75">
            Burned materials and hearths provide evidence that humans controlled fire.
          </p>
        </div>
        <div className="rounded border border-char-700 p-3">
          <div className="text-xs font-semibold uppercase tracking-widest text-ochre-400">Cave Art</div>
          <p className="mt-1 text-sm text-parchment/75">
            Paintings provide evidence of artistic and symbolic behavior, but their exact
            meaning remains uncertain.
          </p>
        </div>
        <div className="rounded border border-char-700 p-3">
          <div className="text-xs font-semibold uppercase tracking-widest text-ochre-400">Stone Tools</div>
          <p className="mt-1 text-sm text-parchment/75">
            Stone artifacts provide evidence of technology, planning and changing skills.
          </p>
        </div>
      </div>

      <div className="my-6 h-px bg-char-700" />

      <SectionHeading>
        What can archaeological evidence tell us about the lives of prehistoric humans?
      </SectionHeading>
      <p className="mb-4 text-sm text-parchment/70">
        Write 3–5 sentences. Use evidence from at least TWO parts of your investigation.
      </p>

      <div className="mb-3 flex flex-wrap gap-2">
        {STARTERS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => insertStarter(s)}
            className="rounded-full border border-char-600 px-3 py-1 text-xs text-parchment/60 hover:border-ochre-500/60 hover:text-ochre-300 focus:outline-none focus:ring-2 focus:ring-ochre-500"
          >
            {s}
          </button>
        ))}
      </div>

      <textarea
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        rows={10}
        className="w-full rounded border border-char-600 bg-char-950/60 p-4 text-[15px] leading-relaxed text-parchment focus:border-ochre-500 focus:outline-none focus:ring-1 focus:ring-ochre-500"
        placeholder="Write your conclusion here..."
      />

      <ErrorNote message={error} />

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || saving}
          className="rounded bg-ochre-500 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-char-950 hover:bg-ochre-400 disabled:cursor-not-allowed disabled:bg-char-700 disabled:text-parchment/40 focus:outline-none focus:ring-2 focus:ring-ochre-300"
        >
          {saving ? "SUBMITTING…" : "SUBMIT INVESTIGATION"}
        </button>
      </div>
    </Panel>
  );
}
