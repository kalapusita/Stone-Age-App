"use client";

import { useRef, useState } from "react";

// "Make a Stone Tool" — a simplified educational simulation of striking a
// stone core with a hammerstone to remove flakes. Students click anywhere
// on the core (not predetermined dots); clicks near the edge succeed,
// clicks too close to the center are rejected with a hint. Built with
// SVG + CSS transitions only, no external assets.

type Point = [number, number];

const VIEW_W = 240;
const VIEW_H = 230;
const CENTER: Point = [110, 92];

// Hand-placed points around an irregular rock outline (clockwise).
const BASE_POINTS: Point[] = [
  [78, 46],
  [104, 34],
  [132, 38],
  [156, 50],
  [172, 72],
  [176, 98],
  [164, 122],
  [142, 142],
  [114, 150],
  [86, 144],
  [62, 128],
  [48, 104],
  [46, 78],
  [58, 58],
];
const N = BASE_POINTS.length;

const HAMMER_REST: Point = [206, 40];
const HAMMER_RELATIVE_POLY: Point[] = [
  [-12, -6],
  [-4, -10],
  [6, -9],
  [13, -3],
  [12, 6],
  [3, 10],
  [-7, 9],
  [-13, 1],
];

const SLOTS: Point[] = [
  [82, 206],
  [120, 210],
  [158, 206],
];

const REQUIRED_STRIKES = 3;

const INSIGHT_OPTIONS = [
  { key: "plan", label: "They could plan what they wanted to make." },
  { key: "fracture", label: "They understood how stone could break." },
  { key: "skill", label: "They developed skill through practice." },
  { key: "shape", label: "They could deliberately change natural materials for a purpose." },
];

function dist(a: Point, b: Point) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}
function normalize(v: Point): Point {
  const len = Math.hypot(v[0], v[1]) || 1;
  return [v[0] / len, v[1] / len];
}
function perp(v: Point): Point {
  return [-v[1], v[0]];
}
function angleDiff(a: number, b: number) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return Math.abs(d);
}
function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    !!window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

const BASE_RADII: number[] = BASE_POINTS.map((p) => dist(p, CENTER));
const BASE_ANGLES: number[] = BASE_POINTS.map((p) =>
  Math.atan2(p[1] - CENTER[1], p[0] - CENTER[0])
);

interface Flake {
  id: number;
  points: string;
  start: Point;
  end: Point;
  landed: boolean;
  rotation: number;
}

export default function KnappingDemo() {
  const [radiusScale, setRadiusScale] = useState<number[]>(() => Array(N).fill(1));
  const [flakes, setFlakes] = useState<Flake[]>([]);
  const [strikeCount, setStrikeCount] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [hammerPos, setHammerPos] = useState<Point>(HAMMER_REST);
  const [showClack, setShowClack] = useState(false);
  const [impactPoint, setImpactPoint] = useState<Point | null>(null);
  const [edgeHint, setEdgeHint] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "success" | "miss"; lines: string[] } | null>(
    null
  );
  const [selectedInsights, setSelectedInsights] = useState<string[]>([]);

  const svgRef = useRef<SVGSVGElement>(null);
  const animatingRef = useRef(false);
  const edgeHintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const completed = strikeCount >= REQUIRED_STRIKES;

  function scaledPoint(i: number, scaleArr: number[]): Point {
    const [bx, by] = BASE_POINTS[i];
    return [CENTER[0] + (bx - CENTER[0]) * scaleArr[i], CENTER[1] + (by - CENTER[1]) * scaleArr[i]];
  }

  const currentPoints: Point[] = BASE_POINTS.map((_, i) => scaledPoint(i, radiusScale));
  const pathD = "M " + currentPoints.map((p) => p.join(",")).join(" L ") + " Z";
  const beforePathD = "M " + BASE_POINTS.map((p) => p.join(",")).join(" L ") + " Z";

  function makeFlakePolygon(idx: number, scaleArr: number[]): string {
    const p = scaledPoint(idx, scaleArr);
    const outward = normalize([p[0] - CENTER[0], p[1] - CENTER[1]]);
    const tangent = perp(outward);
    const p1: Point = [p[0] + outward[0] * 5, p[1] + outward[1] * 5];
    const p2: Point = [
      p[0] - outward[0] * 6 + tangent[0] * 7,
      p[1] - outward[1] * 6 + tangent[1] * 7,
    ];
    const p3: Point = [
      p[0] - outward[0] * 6 - tangent[0] * 7,
      p[1] - outward[1] * 6 - tangent[1] * 7,
    ];
    return [p1, p2, p3].map((pt) => pt.join(",")).join(" ");
  }

  function findNearestVertex(angle: number): number {
    let bestIdx = 0;
    let bestDiff = Infinity;
    for (let i = 0; i < N; i++) {
      const diff = angleDiff(angle, BASE_ANGLES[i]);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestIdx = i;
      }
    }
    return bestIdx;
  }

  function triggerMiss() {
    setFeedback({
      tone: "miss",
      lines: ["Try closer to the edge. Toolmakers had to choose carefully where to strike."],
    });
    setEdgeHint(true);
    if (edgeHintTimer.current) clearTimeout(edgeHintTimer.current);
    edgeHintTimer.current = setTimeout(() => setEdgeHint(false), 1800);
  }

  function handleStoneClick(e: React.MouseEvent<SVGPathElement>) {
    if (completed || animating) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = VIEW_W / rect.width;
    const scaleY = VIEW_H / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const dx = x - CENTER[0];
    const dy = y - CENTER[1];
    const angleClick = Math.atan2(dy, dx);
    const distClick = Math.hypot(dx, dy);
    const idx = findNearestVertex(angleClick);
    const boundaryRadius = BASE_RADII[idx] * radiusScale[idx];

    if (distClick < boundaryRadius * 0.62) {
      triggerMiss();
      return;
    }
    performStrike(idx);
  }

  async function performStrike(idx: number) {
    if (animatingRef.current || completed) return;
    animatingRef.current = true;
    setAnimating(true);
    setFeedback(null);

    const reduced = prefersReducedMotion();
    const preNotchPoint = scaledPoint(idx, radiusScale);
    const flakePoly = makeFlakePolygon(idx, radiusScale);
    const slot = SLOTS[strikeCount] ?? SLOTS[SLOTS.length - 1];
    const flakeId = Date.now() + idx;

    function applyNotch() {
      setRadiusScale((prev) => {
        const next = [...prev];
        next[idx] = prev[idx] * 0.55;
        const before = (idx - 1 + N) % N;
        const after = (idx + 1) % N;
        next[before] = Math.min(prev[before], prev[before] * 0.88);
        next[after] = Math.min(prev[after], prev[after] * 0.88);
        return next;
      });
    }

    if (reduced) {
      applyNotch();
      setFlakes((prev) => [
        ...prev,
        { id: flakeId, points: flakePoly, start: preNotchPoint, end: slot, landed: true, rotation: (strikeCount - 1) * 14 },
      ]);
      finalizeStrike();
      animatingRef.current = false;
      setAnimating(false);
      return;
    }

    setHammerPos(preNotchPoint);
    await sleep(320);

    setImpactPoint(preNotchPoint);
    setShowClack(true);
    applyNotch();
    setFlakes((prev) => [
      ...prev,
      { id: flakeId, points: flakePoly, start: preNotchPoint, end: slot, landed: false, rotation: (strikeCount - 1) * 14 },
    ]);

    await sleep(60);
    setFlakes((prev) => prev.map((f) => (f.id === flakeId ? { ...f, landed: true } : f)));

    await sleep(220);
    setShowClack(false);

    await sleep(380);
    setHammerPos(HAMMER_REST);

    await sleep(260);
    finalizeStrike();
    animatingRef.current = false;
    setAnimating(false);
  }

  function finalizeStrike() {
    setStrikeCount((prev) => {
      const next = prev + 1;
      if (next === 1) {
        setFeedback({
          tone: "success",
          lines: [
            "Good strike! A sharp flake has broken away.",
            "Both the flake and the newly exposed edge could be useful for cutting.",
          ],
        });
      } else if (next === 2) {
        setFeedback({
          tone: "success",
          lines: [
            "Another flake breaks away.",
            "The stone is beginning to take on a more deliberate shape.",
          ],
        });
      } else {
        setFeedback(null);
      }
      return next;
    });
  }

  function reset() {
    if (edgeHintTimer.current) clearTimeout(edgeHintTimer.current);
    setRadiusScale(Array(N).fill(1));
    setFlakes([]);
    setStrikeCount(0);
    setAnimating(false);
    animatingRef.current = false;
    setHammerPos(HAMMER_REST);
    setShowClack(false);
    setImpactPoint(null);
    setEdgeHint(false);
    setFeedback(null);
    setSelectedInsights([]);
  }

  function toggleInsight(key: string) {
    setSelectedInsights((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  const hammerTranslate: Point = [hammerPos[0] - HAMMER_REST[0], hammerPos[1] - HAMMER_REST[1]];
  const hammerPolyPoints = HAMMER_RELATIVE_POLY.map(
    ([dx, dy]) => `${HAMMER_REST[0] + dx},${HAMMER_REST[1] + dy}`
  ).join(" ");

  const promptText = completed
    ? null
    : strikeCount === 0
    ? "Choose a place along the EDGE of the stone to strike."
    : "Strike again to continue shaping the stone.";

  return (
    <div
      role="group"
      aria-label="Make a stone tool interactive demonstration"
      className="rounded border border-char-700 bg-char-950/50 p-4"
    >
      <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-wide text-parchment/60">
        <span>{completed ? "Stone shaped" : `Flakes removed: ${strikeCount} / ${REQUIRED_STRIKES}`}</span>
        <button
          onClick={reset}
          className="rounded border border-char-600 px-2 py-1 hover:border-ochre-500 hover:text-ochre-300 focus:outline-none focus:ring-2 focus:ring-ochre-500"
        >
          Reset stone
        </button>
      </div>

      {promptText && (
        <p className="mb-2 text-center text-sm text-parchment/80">{promptText}</p>
      )}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="mx-auto h-64 w-full max-w-xs select-none"
      >
        {/* flake tray slots */}
        {SLOTS.map((s, i) => (
          <circle
            key={i}
            cx={s[0]}
            cy={s[1]}
            r="11"
            fill="none"
            stroke="#5a5044"
            strokeDasharray="3 3"
            strokeWidth="1.2"
            opacity="0.6"
          />
        ))}
        <text
          x={VIEW_W / 2}
          y={225}
          textAnchor="middle"
          className="fill-parchment/40"
          style={{ fontSize: 8, letterSpacing: 1 }}
        >
          REMOVED FLAKES
        </text>

        {/* edge hint ring, shown briefly after a miss */}
        <path
          d={pathD}
          fill="none"
          stroke="#e8c48a"
          strokeWidth="5"
          opacity={edgeHint ? 0.55 : 0}
          style={{ transition: "opacity 400ms ease-out" }}
        />

        {/* the stone core itself */}
        <path
          d={pathD}
          fill="#5c4a37"
          stroke="#2f2820"
          strokeWidth="3"
          className={completed || animating ? "" : "cursor-pointer"}
          onClick={handleStoneClick}
          style={{ transition: "d 150ms ease-out" }}
        />

        {/* detached flakes */}
        {flakes.map((f) => (
          <g
            key={f.id}
            style={{
              transform: f.landed
                ? `translate(${f.end[0] - f.start[0]}px, ${f.end[1] - f.start[1]}px) rotate(${f.rotation}deg)`
                : "translate(0px, 0px)",
              transformOrigin: `${f.start[0]}px ${f.start[1]}px`,
              transition: prefersReducedMotion() ? "none" : "transform 480ms ease-out",
            }}
          >
            <polygon points={f.points} fill="#c1873f" stroke="#241d15" strokeWidth="1" />
          </g>
        ))}

        {/* hammerstone */}
        <g
          style={{
            transform: `translate(${hammerTranslate[0]}px, ${hammerTranslate[1]}px)`,
            transition: prefersReducedMotion() ? "none" : "transform 300ms ease-in-out",
          }}
        >
          <polygon points={hammerPolyPoints} fill="#8a7a63" stroke="#241d15" strokeWidth="2" />
        </g>

        {/* impact flash */}
        {impactPoint && (
          <text
            x={impactPoint[0]}
            y={impactPoint[1] - 14}
            textAnchor="middle"
            className="fill-ochre-300"
            style={{
              fontSize: 11,
              fontWeight: 700,
              opacity: showClack ? 1 : 0,
              transition: "opacity 220ms ease-out",
            }}
          >
            CLACK!
          </text>
        )}
      </svg>

      {/* unobtrusive keyboard-accessible alternative to clicking the stone */}
      {!completed && (
        <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1 text-center">
          <button
            onClick={() => performStrike(12)}
            disabled={animating}
            className="text-[11px] uppercase tracking-wide text-parchment/40 underline decoration-dotted underline-offset-2 hover:text-ochre-300 focus:outline-none focus:ring-2 focus:ring-ochre-500 rounded disabled:opacity-40"
          >
            Strike left edge
          </button>
          <button
            onClick={() => performStrike(1)}
            disabled={animating}
            className="text-[11px] uppercase tracking-wide text-parchment/40 underline decoration-dotted underline-offset-2 hover:text-ochre-300 focus:outline-none focus:ring-2 focus:ring-ochre-500 rounded disabled:opacity-40"
          >
            Strike upper edge
          </button>
          <button
            onClick={() => performStrike(4)}
            disabled={animating}
            className="text-[11px] uppercase tracking-wide text-parchment/40 underline decoration-dotted underline-offset-2 hover:text-ochre-300 focus:outline-none focus:ring-2 focus:ring-ochre-500 rounded disabled:opacity-40"
          >
            Strike right edge
          </button>
        </div>
      )}

      {feedback && (
        <div
          className={
            "mt-3 rounded border px-3 py-2 text-sm " +
            (feedback.tone === "success"
              ? "border-ochre-500/40 bg-ochre-500/10 text-parchment/90"
              : "border-ember-600/50 bg-ember-600/10 text-parchment/85")
          }
        >
          {feedback.lines.map((line, i) => (
            <p key={i} className={i > 0 ? "mt-1 text-parchment/75" : ""}>
              {line}
            </p>
          ))}
        </div>
      )}

      {completed && (
        <div className="mt-5 border-t border-char-700 pt-5">
          <h4 className="text-center text-sm font-bold uppercase tracking-widest text-ochre-400">
            You Shaped the Stone
          </h4>

          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="text-center">
              <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H - 40}`} className="h-20 w-20 mx-auto">
                <path d={beforePathD} fill="#4a3d30" stroke="#2f2820" strokeWidth="3" />
              </svg>
              <div className="mt-1 text-[10px] uppercase tracking-widest text-parchment/50">
                Before
              </div>
            </div>
            <span className="text-xl text-parchment/40">→</span>
            <div className="text-center">
              <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H - 40}`} className="h-20 w-20 mx-auto">
                <path d={pathD} fill="#6b5842" stroke="#e8c48a" strokeWidth="3" />
              </svg>
              <div className="mt-1 text-[10px] uppercase tracking-widest text-ochre-400">
                After
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-sm text-parchment/85">
            Each carefully placed strike removed a flake and changed the edge of the core.
          </p>

          <p className="mt-4 text-center text-sm text-parchment/90">
            This technique is called <span className="font-bold text-ochre-400">STONE KNAPPING</span>.
          </p>
          <p className="mt-2 text-center text-sm text-parchment/80">
            Making an effective stone tool required more than force. Toolmakers needed
            experience, control, and knowledge of how stone fractures.
          </p>

          <div className="mt-5">
            <p className="mb-2 text-center text-sm font-semibold text-parchment/90">
              What does making a tool like this suggest about the person who made it?
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {INSIGHT_OPTIONS.map((opt) => {
                const selected = selectedInsights.includes(opt.key);
                return (
                  <button
                    key={opt.key}
                    onClick={() => toggleInsight(opt.key)}
                    aria-pressed={selected}
                    className={
                      "rounded-full border px-3 py-1.5 text-xs transition focus:outline-none focus:ring-2 focus:ring-ochre-500 " +
                      (selected
                        ? "border-ochre-500 bg-ochre-500/15 text-ochre-300"
                        : "border-char-600 text-parchment/75 hover:border-ochre-500/60")
                    }
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="mt-5 text-center text-[11px] italic text-parchment/45">
            Simplified demonstration: real stone-tool making required considerable skill and
            varied by material, tool type, place, and period.
          </p>
        </div>
      )}
    </div>
  );
}
