"use client";

import { useId, useState } from "react";

export default function GlossaryTerm({
  term,
  definition,
}: {
  term: string;
  definition: string;
}) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        aria-describedby={tooltipId}
        className="cursor-help rounded font-inherit text-inherit underline decoration-dotted decoration-ochre-400 underline-offset-2 focus:outline-none focus:ring-1 focus:ring-ochre-500"
      >
        {term}
      </button>
      {open && (
        <span
          id={tooltipId}
          role="tooltip"
          className="absolute left-1/2 top-full z-30 mt-1.5 w-56 -translate-x-1/2 rounded border border-char-600 bg-char-950 px-3 py-2 text-left text-xs font-normal normal-case leading-snug text-parchment/90 shadow-xl"
        >
          {definition}
        </span>
      )}
    </span>
  );
}
