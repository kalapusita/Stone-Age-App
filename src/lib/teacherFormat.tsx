// Shared formatting/display helpers for the teacher dashboard and the
// student detail page, kept in one place so both stay consistent.

export function fmtDate(v: string | null | undefined): string {
  if (!v) return "—";
  return new Date(v).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function fmtDateShort(v: string | null | undefined): string {
  if (!v) return "—";
  return new Date(v).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function Check({ done }: { done: boolean }) {
  return done ? (
    <span className="text-ochre-400" aria-label="Completed">
      ✓
    </span>
  ) : (
    <span className="text-parchment/30" aria-label="Not completed">
      —
    </span>
  );
}

export function toCsvValue(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
