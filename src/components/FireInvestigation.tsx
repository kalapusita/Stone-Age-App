"use client";

import { useState } from "react";
import Panel from "./Panel";
import {
  StageStepper,
  EvidenceFigure,
  NextBackRow,
  ProseBlock,
  GlossaryText,
  ErrorNote,
  SectionHeading,
} from "./shared";
import { fireContent as c } from "@/content/fire";
import { Investigation } from "@/types/investigation";
import { saveInvestigation } from "@/lib/investigationClient";

const STAGES = ["Learn", "Investigate Evidence", "Think / Respond"];

export default function FireInvestigation({
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
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [effects, setEffects] = useState<string[]>(
    [investigation.fire_effect_1, investigation.fire_effect_2].filter(
      Boolean
    ) as string[]
  );
  const [explanation, setExplanation] = useState(investigation.fire_response ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleEffect(key: string) {
    setEffects((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= 2) return prev; // exactly two
      return [...prev, key];
    });
  }

  const canSubmit = effects.length === 2 && explanation.trim().length >= 20;

  async function handleSave() {
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await saveInvestigation(
        investigationId,
        {
          fire_effect_1: effects[0],
          fire_effect_2: effects[1],
          fire_response: explanation,
        },
        { completeSection: "fire" }
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
    <Panel onClose={onClose} label="Making Fire">
      <h2 className="text-2xl font-bold tracking-wide text-parchment">{c.title}</h2>
      <p className="mb-4 text-ochre-400">{c.subtitle}</p>
      <StageStepper stages={STAGES} current={stage} />

      {stage === 0 && (
        <div>
          <ProseBlock text={c.hook} />
          <div className="my-5 h-px bg-char-700" />
          <SectionHeading>{c.readingHeading}</SectionHeading>
          <ProseBlock text={c.reading} useGlossary />
          <NextBackRow onNext={() => setStage(1)} nextLabel="NEXT" />
        </div>
      )}

      {stage === 1 && (
        <div>
          <EvidenceFigure
            src={c.evidenceImage}
            alt="Fire-altered stone tools from Gesher Benot Ya'aqov"
            caption={c.evidenceCaption}
          />
          <SectionHeading>{c.investigationPrompt}</SectionHeading>
          <div className="grid gap-3 sm:grid-cols-3">
            {c.evidenceCategories.map((cat) => (
              <button
                key={cat.key}
                onClick={() =>
                  setOpenCategory(openCategory === cat.key ? null : cat.key)
                }
                aria-expanded={openCategory === cat.key}
                className={
                  "rounded border px-3 py-3 text-left text-sm font-semibold uppercase tracking-wide transition focus:outline-none focus:ring-2 focus:ring-ochre-500 " +
                  (openCategory === cat.key
                    ? "border-ochre-500 bg-ochre-500/10 text-ochre-300"
                    : "border-char-600 text-parchment/80 hover:border-ochre-500/60")
                }
              >
                {cat.label}
              </button>
            ))}
          </div>
          {openCategory && (
            <div className="mt-3 rounded border border-char-700 bg-char-950/50 p-4 text-sm text-parchment/85">
              {c.evidenceCategories.find((cc) => cc.key === openCategory)?.explanation}
            </div>
          )}
          <p className="mt-5 rounded border-l-2 border-ochre-500 bg-char-950/40 px-4 py-3 text-sm italic text-parchment/75">
            <GlossaryText text={c.contextNote} />
          </p>
          <NextBackRow onBack={() => setStage(0)} onNext={() => setStage(2)} />
        </div>
      )}

      {stage === 2 && (
        <div>
          <SectionHeading>{c.responseQuestion}</SectionHeading>
          <p className="mb-3 text-xs text-parchment/60">
            Choose exactly two ({effects.length}/2 selected).
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {c.effectOptions.map((opt) => {
              const selected = effects.includes(opt.key);
              return (
                <button
                  key={opt.key}
                  onClick={() => toggleEffect(opt.key)}
                  aria-pressed={selected}
                  className={
                    "rounded border px-3 py-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-ochre-500 " +
                    (selected
                      ? "border-ochre-500 bg-ochre-500/15 text-ochre-300"
                      : "border-char-600 text-parchment/80 hover:border-ochre-500/60")
                  }
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="mt-6">
            <label htmlFor="fire-explain" className="mb-2 block text-sm font-semibold text-parchment/90">
              {c.explanationPrompt}
            </label>
            <textarea
              id="fire-explain"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={6}
              className="w-full rounded border border-char-600 bg-char-950/60 p-3 text-[15px] leading-relaxed text-parchment focus:border-ochre-500 focus:outline-none focus:ring-1 focus:ring-ochre-500"
              placeholder="Use evidence and reasoning from what you just read..."
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
