"use client";

import { useEffect, useState } from "react";
import EntryScreen from "@/components/EntryScreen";
import CaveScene from "@/components/CaveScene";
import FireInvestigation from "@/components/FireInvestigation";
import CaveArtInvestigation from "@/components/CaveArtInvestigation";
import StoneToolsInvestigation from "@/components/StoneToolsInvestigation";
import Synthesis from "@/components/Synthesis";
import InfoModal from "@/components/InfoModal";
import { Investigation, SectionKey } from "@/types/investigation";
import {
  createInvestigation,
  fetchInvestigation,
  getStoredInvestigationId,
  storeInvestigationId,
  clearStoredInvestigationId,
} from "@/lib/investigationClient";
import { aboutReconstructionText, sources } from "@/content/sources";

type View = "loading" | "entry" | "cave" | "done";

export default function Home() {
  const [view, setView] = useState<View>("loading");
  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [openSection, setOpenSection] = useState<SectionKey | null>(null);
  const [showSynthesis, setShowSynthesis] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [entryError, setEntryError] = useState<string | null>(null);
  const [entryLoading, setEntryLoading] = useState(false);

  useEffect(() => {
    const existingId = getStoredInvestigationId();
    if (!existingId) {
      setView("entry");
      return;
    }
    fetchInvestigation(existingId)
      .then((inv) => {
        setInvestigation(inv);
        setView(inv.status === "submitted" ? "done" : "cave");
      })
      .catch(() => {
        setView("entry");
      });
  }, []);

  async function handleBegin(name: string, className: string) {
    setEntryLoading(true);
    setEntryError(null);
    try {
      const inv = await createInvestigation(name, className);
      storeInvestigationId(inv.id);
      setInvestigation(inv);
      setView("cave");
    } catch (e: any) {
      setEntryError(e.message || "Could not start your investigation. Please try again.");
    } finally {
      setEntryLoading(false);
    }
  }

  function handleSaved(updated: Investigation) {
    setInvestigation(updated);
  }

  function handleSubmitted(updated: Investigation) {
    setInvestigation(updated);
    setOpenSection(null);
    setShowSynthesis(false);
    setView("done");
  }

  function handleSwitchStudent() {
    if (!investigation) return;
    const ok = window.confirm(
      `Switch to a different student on this computer? ${investigation.student_name}'s answers are already saved and will not be lost — you'll just need to enter a new name to continue.`
    );
    if (!ok) return;
    clearStoredInvestigationId();
    setInvestigation(null);
    setOpenSection(null);
    setShowSynthesis(false);
    setView("entry");
  }

  if (view === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center text-parchment/60">
        Loading your investigation…
      </div>
    );
  }

  if (view === "entry" || !investigation) {
    return <EntryScreen onBegin={handleBegin} loading={entryLoading} error={entryError} />;
  }

  const completed: Record<SectionKey, boolean> = {
    fire: !!investigation.fire_completed_at,
    caveArt: !!investigation.cave_art_completed_at,
    stoneTools: !!investigation.stone_tools_completed_at,
  };
  const exploredCount = Object.values(completed).filter(Boolean).length;
  const allDone = exploredCount === 3;

  if (view === "done") {
    return (
      <div className="relative flex min-h-screen items-center justify-center px-4">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url(/images/main-cave-scene.png)" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-char-950 via-char-950/85 to-char-950" />
        <div className="relative z-10 max-w-xl text-center">
          <h1 className="text-3xl font-bold tracking-wide text-parchment">
            INVESTIGATION COMPLETE
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-parchment/85">
            You explored evidence of technology, creativity and adaptation in the
            Stone Age.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-parchment/85">
            Archaeologists reconstruct prehistoric life from the evidence people left
            behind — but that evidence does not always give us complete answers.
          </p>
          <p className="mt-6 text-sm text-ochre-400">
            Submitted by <span className="font-semibold">{investigation.student_name}</span>
            {investigation.class_name ? ` — ${investigation.class_name}` : ""}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setShowSynthesis(true)}
              className="rounded border border-char-600 px-5 py-2.5 text-sm hover:border-ochre-500 hover:text-ochre-300 focus:outline-none focus:ring-2 focus:ring-ochre-500"
            >
              Review My Investigation
            </button>
            <button
              onClick={() => setView("cave")}
              className="rounded bg-ochre-500 px-5 py-2.5 text-sm font-semibold text-char-950 hover:bg-ochre-400 focus:outline-none focus:ring-2 focus:ring-ochre-300"
            >
              Return to Cave
            </button>
          </div>
        </div>

        {showSynthesis && (
          <Synthesis
            investigation={investigation}
            investigationId={investigation.id}
            onClose={() => setShowSynthesis(false)}
            onSubmitted={handleSubmitted}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:py-10">
      <header className="mx-auto mb-6 flex max-w-6xl flex-col items-center gap-2 text-center sm:mb-8">
        <h1 className="text-2xl font-bold tracking-wide text-parchment sm:text-3xl">
          LIFE IN THE STONE AGE
        </h1>
        <p className="max-w-xl text-sm italic text-ochre-300/90">
          &ldquo;What can archaeological evidence tell us about the lives of prehistoric
          humans?&rdquo;
        </p>

        <p className="mt-1 text-sm text-parchment/70">
          Welcome, <span className="font-semibold text-parchment">{investigation.student_name}</span>
          {investigation.class_name ? ` · ${investigation.class_name}` : ""}
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          {(
            [
              { key: "fire" as SectionKey, label: "Fire" },
              { key: "caveArt" as SectionKey, label: "Cave Art" },
              { key: "stoneTools" as SectionKey, label: "Stone Tools" },
            ] as const
          ).map((s) => (
            <span
              key={s.key}
              className={
                "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition " +
                (completed[s.key]
                  ? "border-ochre-400/70 bg-ochre-500/15 text-ochre-300"
                  : "border-char-600 text-parchment/50")
              }
            >
              {completed[s.key] ? (
                <svg
                  className="h-3 w-3 text-ochre-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 5.29a1 1 0 010 1.415l-7.4 7.4a1 1 0 01-1.415 0l-3.6-3.6a1 1 0 111.415-1.414l2.892 2.892 6.693-6.693a1 1 0 011.415 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <span className="h-1.5 w-1.5 rounded-full border border-parchment/40" />
              )}
              {s.label}
            </span>
          ))}
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-parchment/60">
          <button
            onClick={() => setShowAbout(true)}
            className="underline decoration-dotted underline-offset-2 hover:text-ochre-300 focus:outline-none focus:ring-2 focus:ring-ochre-500 rounded"
          >
            ⓘ About this reconstruction
          </button>
          <button
            onClick={() => setShowSources(true)}
            className="underline decoration-dotted underline-offset-2 hover:text-ochre-300 focus:outline-none focus:ring-2 focus:ring-ochre-500 rounded"
          >
            Sources &amp; Credits
          </button>
          <button
            onClick={handleSwitchStudent}
            className="underline decoration-dotted underline-offset-2 hover:text-ember-400 focus:outline-none focus:ring-2 focus:ring-ochre-500 rounded"
          >
            Not {investigation.student_name}? Switch Student
          </button>
        </div>
      </header>

      <CaveScene completed={completed} onOpen={(k) => setOpenSection(k)} />

      <div className="mx-auto mt-8 flex max-w-6xl justify-center">
        {allDone ? (
          <button
            onClick={() => setShowSynthesis(true)}
            className="rounded bg-ochre-500 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-char-950 shadow-glow hover:bg-ochre-400 focus:outline-none focus:ring-2 focus:ring-ochre-300"
          >
            Complete Your Investigation →
          </button>
        ) : (
          <p className="text-sm text-parchment/50">
            Explore all three activities in the cave to unlock your final investigation.
          </p>
        )}
      </div>

      {openSection === "fire" && (
        <FireInvestigation
          investigation={investigation}
          investigationId={investigation.id}
          onClose={() => setOpenSection(null)}
          onSaved={handleSaved}
        />
      )}
      {openSection === "caveArt" && (
        <CaveArtInvestigation
          investigation={investigation}
          investigationId={investigation.id}
          onClose={() => setOpenSection(null)}
          onSaved={handleSaved}
        />
      )}
      {openSection === "stoneTools" && (
        <StoneToolsInvestigation
          investigation={investigation}
          investigationId={investigation.id}
          onClose={() => setOpenSection(null)}
          onSaved={handleSaved}
        />
      )}

      {showSynthesis && (
        <Synthesis
          investigation={investigation}
          investigationId={investigation.id}
          onClose={() => setShowSynthesis(false)}
          onSubmitted={handleSubmitted}
        />
      )}

      {showAbout && (
        <InfoModal label="About this reconstruction" onClose={() => setShowAbout(false)}>
          <h2 className="text-xl font-bold text-parchment">{aboutReconstructionText.heading}</h2>
          <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-parchment/85">
            {aboutReconstructionText.body.split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </InfoModal>
      )}

      {showSources && (
        <InfoModal label="Sources & Credits" onClose={() => setShowSources(false)}>
          <h2 className="text-xl font-bold text-parchment">Sources &amp; Credits</h2>
          <ul className="mt-4 space-y-4">
            {sources.map((s) => (
              <li key={s.url} className="border-b border-char-700 pb-3">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-ochre-400 underline underline-offset-2 hover:text-ochre-300"
                >
                  {s.label}
                </a>
                <p className="mt-1 text-sm text-parchment/70">{s.note}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-parchment/50">
            Image credits for the archaeological photographs used in this activity are
            configurable by your teacher/administrator — see the project README.
          </p>
        </InfoModal>
      )}
    </div>
  );
}
