"use client";

import { useState } from "react";
import Panel from "./Panel";
import {
  StageStepper,
  NextBackRow,
  ProseBlock,
  ErrorNote,
  SectionHeading,
} from "./shared";
import KnappingDemo from "./KnappingDemo";
import { stoneToolsContent as c } from "@/content/stoneTools";
import { Investigation } from "@/types/investigation";
import { saveInvestigation } from "@/lib/investigationClient";

const STAGES = ["Learn", "Investigate Evidence", "Think / Respond"];

export default function StoneToolsInvestigation({
  investigation,
  investigationId,
  onClose,
  onSaved,
}: {
  investigation: Investigation;
  investigationId: string;
  onClose: () => void;
  onSaved: (updated: Investigation) => void;
}) {
  const [stage, setStage] = useState(0);
  const [selectedInferences, setSelectedInferences] = useState<string[]>([]);
  const [showLanguageNote, setShowLanguageNote] = useState(false);
  const [response, setResponse] = useState(investigation.stone_tools_response ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleInference(key: string) {
    if (key === c.unsupportedInference.key) {
      setShowLanguageNote(true);
      return;
    }
    setSelectedInferences((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  const canSubmit = response.trim().length >= 20;

  async function handleSave() {
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await saveInvestigation(
        investigationId,
        { stone_tools_response: response },
        { completeSection: "stoneTools" }
      );
      onSaved(updated);
      onClose();
    } catch (e: any) {
      setError(e.message || "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Panel onClose={onClose} label="Stone Tools">
      <h2 className="text-2xl font-bold tracking-wide text-parchment">{c.title}</h2>
      <p className="mb-4 text-ochre-400">{c.subtitle}</p>
      <StageStepper stages={STAGES} current={stage} />

      {stage === 0 && (
        <div>
          <ProseBlock text={c.hook} />
          <div className="my-5 h-px bg-char-700" />
          <ProseBlock text={c.reading} useGlossary />
          <NextBackRow onNext={() => setStage(1)} nextLabel="NEXT" />
        </div>
      )}

      {stage === 1 && (
        <div>
          <SectionHeading>A general technological pattern</SectionHeading>
          <p className="mb-3 text-xs italic text-parchment/60">{c.progressionNote}</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {c.progression.map((step, i) => (
              <div key={step.key} className="rounded border border-char-700 p-3">
                {step.image ? (
                  <div className="mb-2 overflow-hidden rounded bg-char-950/60">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={step.image}
                      alt={step.label}
                      className="mx-auto max-h-40 w-auto object-contain"
                    />
                  </div>
                ) : (
                  <div className="mb-2 flex h-40 items-center justify-center rounded border border-dashed border-char-600 text-xs text-parchment/40">
                    (later tools, varied forms)
                  </div>
                )}
                <div className="text-center text-xs font-semibold uppercase tracking-wide text-ochre-400">
                  {i > 0 && <span className="mr-1 text-parchment/40">↓</span>}
                  {step.label}
                </div>
                <p className="mt-1 text-xs text-parchment/70">{step.caption}</p>
              </div>
            ))}
          </div>
          <div className="mb-1 mt-2 inline-block rounded bg-ember-600/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-ember-400">
            Archaeological Evidence
          </div>

          <div className="mt-6">
            <SectionHeading>Try knapping a core</SectionHeading>
            <p className="mb-3 text-sm text-parchment/80">{c.knappingIntro}</p>
            <KnappingDemo />
            <p className="mt-3 text-sm italic text-parchment/70">{c.knappingOutro}</p>
          </div>

          <NextBackRow onBack={() => setStage(0)} onNext={() => setStage(2)} />
        </div>
      )}

      {stage === 2 && (
        <div>
          <SectionHeading>Think Like an Archaeologist</SectionHeading>
          <p className="mb-3 text-sm text-parchment/80">{c.archaeologistQuestion}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {c.supportedInferences.map((inf) => {
              const selected = selectedInferences.includes(inf.key);
              return (
                <button
                  key={inf.key}
                  onClick={() => toggleInference(inf.key)}
                  aria-pressed={selected}
                  className={
                    "rounded border px-3 py-2.5 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-ochre-500 " +
                    (selected
                      ? "border-ochre-500 bg-ochre-500/10 text-ochre-300"
                      : "border-char-600 text-parchment/80 hover:border-ochre-500/60")
                  }
                >
                  {inf.label}
                </button>
              );
            })}
            <button
              onClick={() => toggleInference(c.unsupportedInference.key)}
              className="rounded border border-char-600 px-3 py-2.5 text-left text-sm text-parchment/80 transition hover:border-ember-500/60 focus:outline-none focus:ring-2 focus:ring-ochre-500"
            >
              {c.unsupportedInference.label}
            </button>
          </div>
          {showLanguageNote && (
            <div className="mt-3 rounded border border-ember-600/60 bg-ember-600/10 px-4 py-3 text-sm text-parchment/85">
              {c.unsupportedInference.explanation}
            </div>
          )}

          <div className="mt-6">
            <label htmlFor="stonetools-response" className="mb-2 block text-sm font-semibold text-parchment/90">
              {c.responseQuestion}
            </label>
            <textarea
              id="stonetools-response"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={6}
              className="w-full rounded border border-char-600 bg-char-950/60 p-3 text-[15px] leading-relaxed text-parchment focus:border-ochre-500 focus:outline-none focus:ring-1 focus:ring-ochre-500"
              placeholder="Use the evidence and the knapping demonstration to support your answer..."
            />
          </div>

          <ErrorNote message={error} />

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setStage(1)}
              className="rounded border border-char-600 px-4 py-2 text-sm hover:border-ochre-500 hover:text-ochre-300 focus:outline-none focus:ring-2 focus:ring-ochre-500"
            >
              BACK
            </button>
            <button
              onClick={handleSave}
              disabled={!canSubmit || saving}
              className="rounded bg-ochre-500 px-5 py-2 text-sm font-semibold text-char-950 hover:bg-ochre-400 disabled:cursor-not-allowed disabled:bg-char-700 disabled:text-parchment/40 focus:outline-none focus:ring-2 focus:ring-ochre-300"
            >
              {saving ? "SAVING…" : "SAVE RESPONSE & COMPLETE SECTION"}
            </button>
          </div>
        </div>
      )}
    </Panel>
  );
}
