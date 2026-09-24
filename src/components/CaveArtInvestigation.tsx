"use client";

import { useState } from "react";
import Panel from "./Panel";
import {
  StageStepper,
  EvidenceFigure,
  NextBackRow,
  ProseBlock,
  ErrorNote,
  SectionHeading,
  WordCounter,
  countWords,
} from "./shared";
import { caveArtContent as c } from "@/content/caveArt";
import { Investigation } from "@/types/investigation";
import { saveInvestigation } from "@/lib/investigationClient";

const STAGES = ["Learn", "Investigate Evidence", "Think / Respond"];
const MIN_WORDS = 75;

export default function CaveArtInvestigation({
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
  const [selectedObservations, setSelectedObservations] = useState<string[]>([]);
  const [interpretation, setInterpretation] = useState<string | null>(
    investigation.cave_art_interpretation
  );
  const [explanation, setExplanation] = useState(investigation.cave_art_response ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  function toggleObservation(key: string) {
    setSelectedObservations((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  const canSubmit = !!interpretation && countWords(explanation) >= MIN_WORDS;

  async function handleSave() {
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await saveInvestigation(
        investigationId,
        {
          cave_art_interpretation: interpretation,
          cave_art_response: explanation,
        },
        { completeSection: "caveArt" }
      );
      onSaved(updated);
      setJustSaved(true);
    } catch (e: any) {
      setError(e.message || "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Panel onClose={onClose} label="Cave Art">
      <h2 className="text-2xl font-bold tracking-wide text-parchment">{c.title}</h2>
      <p className="mb-4 text-ochre-400">{c.subtitle}</p>
      <StageStepper stages={STAGES} current={stage} />

      {stage === 0 && (
        <div>
          <ProseBlock text={c.hook} />
          <div className="my-5 h-px bg-char-700" />
          <SectionHeading>Painting the Stone Age</SectionHeading>
          <ProseBlock text={c.reading} />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded border border-char-600 p-3">
              <div className="text-xs font-semibold uppercase tracking-widest text-ochre-400">
                Fact / Observation
              </div>
              <div className="mt-1 text-sm text-parchment/85">{c.factObservation}</div>
            </div>
            <div className="rounded border border-char-600 p-3">
              <div className="text-xs font-semibold uppercase tracking-widest text-ember-400">
                Interpretation
              </div>
              <div className="mt-1 text-sm text-parchment/85">{c.interpretation}</div>
            </div>
          </div>
          <NextBackRow onNext={() => setStage(1)} nextLabel="NEXT" />
        </div>
      )}

      {stage === 1 && (
        <div>
          <EvidenceFigure
            src={c.evidenceImage}
            alt="Cave paintings of animals at Chauvet Cave"
            caption={c.evidenceCaption}
          />
          <SectionHeading>{c.observationPrompt}</SectionHeading>
          <div className="flex flex-wrap gap-2">
            {c.observations.map((obs) => {
              const selected = selectedObservations.includes(obs.key);
              return (
                <button
                  key={obs.key}
                  onClick={() => toggleObservation(obs.key)}
                  aria-pressed={selected}
                  className={
                    "rounded-full border px-3.5 py-1.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-ochre-500 " +
                    (selected
                      ? "border-ochre-500 bg-ochre-500/15 text-ochre-300"
                      : "border-char-600 text-parchment/80 hover:border-ochre-500/60")
                  }
                >
                  {obs.label}
                </button>
              );
            })}
          </div>
          <p className="mt-5 rounded border-l-2 border-ochre-500 bg-char-950/40 px-4 py-3 text-sm italic text-parchment/75">
            {c.observeInterpretNote}
          </p>
          <NextBackRow onBack={() => setStage(0)} onNext={() => setStage(2)} />
        </div>
      )}

      {stage === 2 && !justSaved && (
        <div>
          <SectionHeading>{c.interpretationQuestion}</SectionHeading>
          <p className="mb-3 text-xs uppercase tracking-wide text-parchment/50">
            Choose one interpretation below to continue.
          </p>
          <div className="grid gap-3">
            {c.interpretationOptions.map((opt) => {
              const selected = interpretation === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setInterpretation(opt.key)}
                  aria-pressed={selected}
                  className={
                    "rounded border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-ochre-500 " +
                    (selected
                      ? "border-ochre-500 bg-ochre-500/10"
                      : "border-char-600 hover:border-ochre-500/60")
                  }
                >
                  <div
                    className={
                      "text-sm font-semibold uppercase tracking-wide " +
                      (selected ? "text-ochre-300" : "text-parchment/90")
                    }
                  >
                    {opt.label}
                  </div>
                  <div className="mt-1 text-sm text-parchment/70">{opt.description}</div>
                </button>
              );
            })}
          </div>

          <div className="mt-6">
            <label htmlFor="caveart-explain" className="mb-2 block text-sm font-semibold text-parchment/90">
              {c.evidencePrompt}
            </label>
            <textarea
              id="caveart-explain"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={6}
              className="w-full rounded border border-char-600 bg-char-950/60 p-3 text-[15px] leading-relaxed text-parchment focus:border-ochre-500 focus:outline-none focus:ring-1 focus:ring-ochre-500"
              placeholder="What did you observe that supports this interpretation?"
            />
            <WordCounter text={explanation} min={MIN_WORDS} />
          </div>

          <ErrorNote message={error} />

          {!canSubmit && !saving && (
            <p className="mt-3 text-right text-xs text-ember-400/90">
              {!interpretation
                ? "Select an interpretation above before saving."
                : `Write at least ${MIN_WORDS} words to continue.`}
            </p>
          )}

          <div className="mt-2 flex items-center justify-between">
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

      {stage === 2 && justSaved && (
        <div>
          <div className="rounded border border-char-600 bg-char-950/50 p-5">
            <ProseBlock text={c.uncertaintyNote} />
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="rounded bg-ochre-500 px-5 py-2 text-sm font-semibold text-char-950 hover:bg-ochre-400 focus:outline-none focus:ring-2 focus:ring-ochre-300"
            >
              RETURN TO CAVE
            </button>
          </div>
        </div>
      )}
    </Panel>
  );
}
