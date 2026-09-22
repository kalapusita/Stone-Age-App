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
              <span
                className={
                  "h-3.5 w-3.5 rounded-full border-2 transition " +
                  (completed[h.key]
                    ? "border-ochre-300 bg-ochre-400"
                    : "border-parchment/70 bg-ember-500/60 group-hover:bg-ember-400 group-hover:scale-125")
                }
              />
              <span className="pointer-events-none whitespace-nowrap rounded bg-char-950/90 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-parchment opacity-0 shadow transition group-hover:opacity-100 group-focus-visible:opacity-100">
                {h.label}
                {completed[h.key] && <span className="ml-1 text-ochre-400">✓ Explored</span>}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
