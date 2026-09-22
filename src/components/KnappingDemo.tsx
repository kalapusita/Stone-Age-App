"use client";

import { useState } from "react";

// A simple, non-scientific visual demonstration: click points along the
// edge of a stone core to strike off flakes with a hammerstone. After
// several strikes the edge becomes visibly sharper. Built with SVG only.

const STRIKE_POINTS = [
  { x: 62, y: 40 },
  { x: 95, y: 34 },
  { x: 128, y: 38 },
  { x: 155, y: 55 },
  { x: 168, y: 85 },
];

export default function KnappingDemo() {
  const [struck, setStruck] = useState<Set<number>>(new Set());
  const [flakes, setFlakes] = useState<{ id: number; x: number; y: number }[]>([]);

  const total = STRIKE_POINTS.length;
  const done = struck.size >= total;

  function strike(i: number) {
    if (struck.has(i)) return;
    setStruck((prev) => new Set(prev).add(i));
    const p = STRIKE_POINTS[i];
    setFlakes((prev) => [...prev, { id: i, x: p.x, y: p.y }]);
  }

  function reset() {
    setStruck(new Set());
    setFlakes([]);
  }

  return (
    <div className="rounded border border-char-700 bg-char-950/50 p-4">
      <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-wide text-parchment/60">
        <span>Edge worked: {struck.size} / {total}</span>
        <button
          onClick={reset}
          className="rounded border border-char-600 px-2 py-1 hover:border-ochre-500 hover:text-ochre-300 focus:outline-none focus:ring-2 focus:ring-ochre-500"
        >
          Reset core
        </button>
      </div>

      <svg viewBox="0 0 220 180" className="mx-auto h-56 w-full max-w-xs">
        {/* stone core */}
        <path
          d={
            done
              ? "M40,90 L60,42 L96,32 L130,36 L158,52 L172,84 L160,130 L110,150 L60,140 L38,110 Z"
              : "M40,90 C40,60 55,45 80,40 C100,36 130,34 150,45 C170,56 178,75 172,95 C168,115 155,135 120,145 C90,153 60,145 45,120 C38,108 40,100 40,90 Z"
          }
          fill="#5c4a37"
          stroke="#2f2820"
          strokeWidth="3"
        />
        {/* hammerstone icon, decorative */}
        <circle cx="196" cy="150" r="14" fill="#8a7a63" stroke="#2f2820" strokeWidth="2" />

        {/* strike points */}
        {STRIKE_POINTS.map((p, i) => {
          const isStruck = struck.has(i);
          return (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r="9"
                fill={isStruck ? "transparent" : "#e8703a"}
                fillOpacity={isStruck ? 0 : 0.85}
                stroke={isStruck ? "none" : "#0c0a08"}
                strokeWidth="1.5"
                className={isStruck ? "" : "cursor-pointer"}
                onClick={() => strike(i)}
              />
              <circle
                cx={p.x}
                cy={p.y}
                r="14"
                fill="transparent"
                className="cursor-pointer"
                onClick={() => strike(i)}
                role="button"
                tabIndex={0}
                aria-label={`Strike point ${i + 1}${isStruck ? ", flake removed" : ""}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") strike(i);
                }}
              />
            </g>
          );
        })}

        {/* flying flake chips */}
        {flakes.map((f) => (
          <polygon
            key={f.id}
            points={`${f.x},${f.y} ${f.x + 14},${f.y - 6} ${f.x + 4},${f.y + 12}`}
            fill="#c1873f"
            stroke="#0c0a08"
            strokeWidth="1"
            opacity="0.9"
          />
        ))}

        {done && (
          <path
            d="M60,42 L96,32 L130,36 L158,52"
            fill="none"
            stroke="#e8c48a"
            strokeWidth="3"
            strokeLinecap="round"
          />
        )}
      </svg>

      <p className="mt-2 text-center text-xs text-parchment/60">
        {done
          ? "The worked edge is now sharper — several flakes have been removed."
          : "Click a strike point on the core's edge to remove a flake."}
      </p>
    </div>
  );
}
