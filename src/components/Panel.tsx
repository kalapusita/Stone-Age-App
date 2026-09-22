"use client";

import { ReactNode, useEffect, useRef } from "react";

export default function Panel({
  onClose,
  children,
  label,
}: {
  onClose: () => void;
  children: ReactNode;
  label: string;
}) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeBtnRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      {/* Backdrop — clicking it does NOT close the panel, to protect unsaved writing */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto panel-scroll rounded-lg border border-char-600 bg-char-900 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-char-700 bg-char-900/95 px-5 py-3 backdrop-blur">
          <span className="text-xs uppercase tracking-[0.2em] text-ochre-400">
            {label}
          </span>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="rounded border border-char-600 px-3 py-1.5 text-sm text-parchment/90 hover:border-ochre-500 hover:text-ochre-300 focus:outline-none focus:ring-2 focus:ring-ochre-500"
          >
            ← Return to Cave
          </button>
        </div>
        <div className="px-5 py-6 sm:px-8 sm:py-8">{children}</div>
      </div>
    </div>
  );
}
