"use client";

import { SectionKey } from "@/types/investigation";

interface Hotspot {
  key: SectionKey;
  label: string;
  // percentages, positioned over the 1536x1024 main-cave-scene.png
  left: string;
  top: string;
}

const HOTSPOTS: Hotspot[] = [
  { key: "fire", label: "FIRE", left: "30%", top: "52%" },
  { key: "caveArt", label: "CAVE ART", left: "54%", top: "20%" },
  { key: "stoneTools", label: "STONE TOOLS", left: "82%", top: "63%" },
];

export default function CaveScene({
  completed,
  onOpen,
}: {
  completed: Record<SectionKey, boolean>;
  onOpen: (key: SectionKey) => void;
}) {
  return (
    <div className="relative mx-auto w-full max-w-6xl">
      <div className="relative aspect-[1536/1024] w-full overflow-hidden rounded-md border border-char-700 bg-char-950 shadow-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/main-cave-scene.png"
          alt="An artistic reconstruction of a Stone Age cave, showing people making fire, painting on the cave wall, and shaping stone tools."
          className="h-full w-full object-contain"
        />

        {HOTSPOTS.map((h) => (
          <button
            key={h.key}
            onClick={() => onOpen(h.key)}
            style={{ left: h.left, top: h.top }}
            className="group absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
            aria-label={
              h.label + (completed[h.key] ? " — explored" : " — not yet explored")
            }
          >
            <span
              className={
                "absolute inset-0 -m-4 rounded-full transition group-hover:bg-ember-400/20 group-focus-visible:bg-ember-400/25 group-hover:shadow-glow group-focus-visible:shadow-glow " +
                (completed[h.key] ? "ring-1 ring-ochre-400/40" : "")
              }
            />
            <span className="relative flex flex-col items-center gap-1">
              {completed[h.key] ? (
                <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-ochre-300 bg-ochre-400 text-char-950 shadow-glow transition group-hover:scale-110">
                  <svg
                    className="h-3.5 w-3.5"
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
                </span>
              ) : (
                <span className="h-3.5 w-3.5 rounded-full border-2 border-parchment/70 bg-ember-500/60 transition group-hover:bg-ember-400 group-hover:scale-125" />
              )}
              <span
                className={
                  "pointer-events-none whitespace-nowrap rounded px-2 py-1 text-[11px] font-semibold uppercase tracking-wider shadow transition " +
                  (completed[h.key]
                    ? "bg-ochre-400 text-char-950 opacity-100"
                    : "bg-char-950/90 text-parchment opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100")
                }
              >
                {h.label}
                {completed[h.key] && <span className="ml-1">✓</span>}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
