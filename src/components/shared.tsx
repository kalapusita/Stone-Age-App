"use client";

import { ReactNode } from "react";
import { glossary } from "@/content/glossary";
import GlossaryTerm from "./GlossaryTerm";

// Wraps the first occurrence of each glossary term in a paragraph of text
// with a GlossaryTerm tooltip. `usedTerms` is shared across paragraphs in
// the same ProseBlock call, so each term is only ever defined once per
// reading passage, even if the word appears again later.
function linkifyGlossary(text: string, usedTerms: Set<string>): ReactNode[] {
  const termNames = Object.keys(glossary);
  if (termNames.length === 0) return [text];
  const pattern = new RegExp(`\\b(${termNames.join("|")})s?\\b`, "gi");
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text))) {
    const matched = match[0];
    const canonical = termNames.find(
      (t) => t.toLowerCase() === matched.replace(/s$/i, "").toLowerCase()
    );
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (canonical && !usedTerms.has(canonical)) {
      usedTerms.add(canonical);
      nodes.push(
        <GlossaryTerm key={`gt-${key++}`} term={matched} definition={glossary[canonical]} />
      );
    } else {
      nodes.push(matched);
    }
    lastIndex = match.index + matched.length;
  }
  nodes.push(text.slice(lastIndex));
  return nodes;
}

// For a single string (not split into paragraphs) -- used for short notes
// like the Fire investigation's "context" callout.
export function GlossaryText({ text }: { text: string }) {
  const usedTerms = new Set<string>();
  return <>{linkifyGlossary(text, usedTerms)}</>;
}

export function StageStepper({
  stages,
  current,
}: {
  stages: string[];
  current: number;
}) {
  return (
    <div className="mb-6 flex items-center gap-2 text-xs uppercase tracking-wider text-parchment/60">
      {stages.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <span
            className={
              i === current
                ? "rounded-full bg-ochre-500 px-2.5 py-1 text-char-950 font-semibold"
                : i < current
                ? "rounded-full border border-ochre-500/60 px-2.5 py-1 text-ochre-400"
                : "rounded-full border border-char-600 px-2.5 py-1"
            }
          >
            {i + 1}. {s}
          </span>
          {i < stages.length - 1 && <span className="text-char-600">—</span>}
        </div>
      ))}
    </div>
  );
}

export function EvidenceFigure({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: string;
}) {
  return (
    <figure className="my-4">
      <div className="mb-2 inline-block rounded bg-ember-600/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-ember-400">
        Archaeological Evidence
      </div>
      <div className="overflow-hidden rounded border border-char-700 bg-char-950/60 p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="mx-auto max-h-[420px] w-auto object-contain"
        />
      </div>
      <figcaption className="mt-2 text-sm italic text-parchment/70">
        {caption}
      </figcaption>
    </figure>
  );
}

export function NextBackRow({
  onBack,
  onNext,
  nextLabel = "NEXT",
  nextDisabled = false,
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}) {
  return (
    <div className="mt-8 flex items-center justify-between">
      <div>
        {onBack && (
          <button
            onClick={onBack}
            className="rounded border border-char-600 px-4 py-2 text-sm hover:border-ochre-500 hover:text-ochre-300 focus:outline-none focus:ring-2 focus:ring-ochre-500"
          >
            BACK
          </button>
        )}
      </div>
      {onNext && (
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className="rounded bg-ochre-500 px-5 py-2 text-sm font-semibold text-char-950 hover:bg-ochre-400 disabled:cursor-not-allowed disabled:bg-char-700 disabled:text-parchment/40 focus:outline-none focus:ring-2 focus:ring-ochre-300"
        >
          {nextLabel}
        </button>
      )}
    </div>
  );
}

export function countWords(text: string): number {
  return text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
}

export function WordCounter({ text, min }: { text: string; min: number }) {
  const count = countWords(text);
  const met = count >= min;
  return (
    <p
      className={
        "mt-1.5 text-xs " + (met ? "text-ochre-400" : "text-parchment/50")
      }
    >
      {count} / {min} words{met ? " — ready to save" : ""}
    </p>
  );
}

export function ProseBlock({
  text,
  useGlossary = false,
}: {
  text: string;
  useGlossary?: boolean;
}) {
  const usedTerms = new Set<string>();
  return (
    <div className="space-y-3 text-[15px] leading-relaxed text-parchment/90">
      {text
        .split("\n\n")
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i}>{useGlossary ? linkifyGlossary(p, usedTerms) : p}</p>
        ))}
    </div>
  );
}

export function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="mt-3 rounded border border-ember-600 bg-ember-600/10 px-3 py-2 text-sm text-ember-400"
    >
      {message}
    </div>
  );
}

export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-2 text-sm font-semibold uppercase tracking-widest text-ochre-400">
      {children}
    </h3>
  );
}

// A small, consistent visual cue marking a block that needs the student to
// click, select, or write something — as opposed to plain reading content.
// Used the same way across every investigation so the pattern becomes
// familiar after the first section.
export function ActivityTag() {
  return (
    <span className="mb-2 inline-block rounded bg-ochre-500/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-ochre-400">
      Your Turn
    </span>
  );
}
