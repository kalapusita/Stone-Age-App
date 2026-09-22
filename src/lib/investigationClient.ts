"use client";

import { Investigation } from "@/types/investigation";

const STORAGE_KEY = "stoneage_investigation_id";

export function getStoredInvestigationId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storeInvestigationId(id: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // ignore — worst case the student re-enters their name
  }
}

export function clearStoredInvestigationId() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

async function parseOrThrow(res: Response) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || "Something went wrong. Please try again.");
  }
  return json;
}

export async function createInvestigation(
  studentName: string,
  className: string
): Promise<Investigation> {
  const res = await fetch("/api/investigation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ student_name: studentName, class_name: className }),
  });
  const json = await parseOrThrow(res);
  return json.investigation as Investigation;
}

export async function fetchInvestigation(id: string): Promise<Investigation> {
  const res = await fetch(`/api/investigation/${id}`, { cache: "no-store" });
  const json = await parseOrThrow(res);
  return json.investigation as Investigation;
}

export async function saveInvestigation(
  id: string,
  fields: Record<string, unknown>,
  options?: { completeSection?: "fire" | "caveArt" | "stoneTools"; submit?: boolean }
): Promise<Investigation> {
  const res = await fetch(`/api/investigation/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fields,
      complete_section: options?.completeSection,
      submit: options?.submit,
    }),
  });
  const json = await parseOrThrow(res);
  return json.investigation as Investigation;
}
