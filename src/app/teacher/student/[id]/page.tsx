"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Investigation } from "@/types/investigation";
import { fireContent } from "@/content/fire";
import { caveArtContent } from "@/content/caveArt";
import { fmtDate } from "@/lib/teacherFormat";

function statusLabel(r: Investigation) {
  return r.status === "submitted" ? "Submitted" : "In Progress";
}

export default function StudentDetail() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id;

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [navIds, setNavIds] = useState<string[] | null>(null);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const idsParam = searchParams.get("ids");

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (!data.session) {
        router.replace("/teacher");
        return;
      }
      setCheckingAuth(false);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (checkingAuth) return;
    let active = true;
    setLoading(true);
    setError(null);
    supabase
      .from("investigations")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setError(error.message);
        } else if (!data) {
          setError("This investigation could not be found. It may have been deleted.");
        } else {
          setInvestigation(data as Investigation);
        }
        setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, checkingAuth]);

  // Prev/Next navigation context: prefer the filtered/sorted id list passed
  // in from the dashboard; fall back to fetching a full, default-ordered
  // list of ids so Prev/Next still works if this page was opened directly.
  useEffect(() => {
    if (checkingAuth) return;
    if (idsParam) {
      setNavIds(idsParam.split(",").filter(Boolean));
      return;
    }
    let active = true;
    supabase
      .from("investigations")
      .select("id")
      .order("started_at", { ascending: false })
      .then(({ data }) => {
        if (!active) return;
        setNavIds(((data ?? []) as { id: string }[]).map((r) => r.id));
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsParam, checkingAuth]);

  const { prevId, nextId } = useMemo(() => {
    if (!navIds) return { prevId: null as string | null, nextId: null as string | null };
    const idx = navIds.indexOf(id);
    if (idx === -1) return { prevId: null, nextId: null };
    return {
      prevId: idx > 0 ? navIds[idx - 1] : null,
      nextId: idx < navIds.length - 1 ? navIds[idx + 1] : null,
    };
  }, [navIds, id]);

  function navQuery() {
    return idsParam ? `?ids=${encodeURIComponent(idsParam)}` : "";
  }

  async function confirmDelete() {
    if (!investigation) return;
    setDeleting(true);
    const { error } = await supabase
      .from("investigations")
      .delete()
      .eq("id", investigation.id);
    setDeleting(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.replace("/teacher/dashboard");
  }

  if (checkingAuth || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-parchment/60">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => router.push("/teacher/dashboard")}
            className="text-sm text-parchment/60 underline decoration-dotted underline-offset-2 hover:text-ochre-300 focus:outline-none focus:ring-2 focus:ring-ochre-500 rounded"
          >
            ← Back to Dashboard
          </button>

          {navIds && (prevId || nextId) && (
            <div className="flex gap-2">
              <button
                onClick={() => prevId && router.push(`/teacher/student/${prevId}${navQuery()}`)}
                disabled={!prevId}
                className="rounded border border-char-600 px-3 py-1.5 text-sm hover:border-ochre-500 hover:text-ochre-300 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ochre-500"
              >
                ← Previous Student
              </button>
              <button
                onClick={() => nextId && router.push(`/teacher/student/${nextId}${navQuery()}`)}
                disabled={!nextId}
                className="rounded border border-char-600 px-3 py-1.5 text-sm hover:border-ochre-500 hover:text-ochre-300 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ochre-500"
              >
                Next Student →
              </button>
            </div>
          )}
        </div>

        {error && (
          <div role="alert" className="mt-4 rounded border border-ember-600 bg-ember-600/10 px-3 py-2 text-sm text-ember-400">
            {error}
          </div>
        )}

        {investigation && (
          <>
            <div className="mt-5 rounded border border-char-700 bg-char-900 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-parchment">{investigation.student_name}</h1>
                  <p className="mt-1 text-sm text-parchment/60">
                    {investigation.class_name || "No class listed"}
                  </p>
                </div>
                <span
                  className={
                    "rounded px-2 py-1 text-xs uppercase tracking-wide " +
                    (investigation.status === "submitted"
                      ? "text-ochre-300"
                      : "text-parchment/60")
                  }
                >
                  {statusLabel(investigation)}
                </span>
              </div>

              <dl className="mt-4 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-parchment/40">Started</dt>
                  <dd className="text-parchment/80">{fmtDate(investigation.started_at)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-parchment/40">Last Activity</dt>
                  <dd className="text-parchment/80">{fmtDate(investigation.updated_at)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-parchment/40">Submitted</dt>
                  <dd className="text-parchment/80">
                    {investigation.submitted_at ? fmtDate(investigation.submitted_at) : "Not yet submitted"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-6 space-y-6">
              <section className="rounded border border-char-700 bg-char-900/40 p-5">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-ochre-400">Fire</h2>
                {investigation.fire_completed_at ? (
                  <div className="mt-3 space-y-3 text-sm">
                    <p className="text-parchment/70">
                      Completed {fmtDate(investigation.fire_completed_at)}
                    </p>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-parchment/40">
                        Selected Effects
                      </div>
                      <p className="mt-1 text-parchment/90">
                        {[investigation.fire_effect_1, investigation.fire_effect_2]
                          .filter(Boolean)
                          .map(
                            (k) =>
                              fireContent.effectOptions.find((o) => o.key === k)?.label ?? k
                          )
                          .join(", ") || "—"}
                      </p>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-parchment/40">
                        Student Response
                      </div>
                      <p className="mt-1 whitespace-pre-wrap rounded border border-char-700 bg-char-950/40 p-3 leading-relaxed text-parchment/90">
                        {investigation.fire_response}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-parchment/40">Not yet completed.</p>
                )}
              </section>

              <section className="rounded border border-char-700 bg-char-900/40 p-5">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-ochre-400">Cave Art</h2>
                {investigation.cave_art_completed_at ? (
                  <div className="mt-3 space-y-3 text-sm">
                    <p className="text-parchment/70">
                      Completed {fmtDate(investigation.cave_art_completed_at)}
                    </p>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-parchment/40">
                        Selected Interpretation
                      </div>
                      <p className="mt-1 text-parchment/90">
                        {caveArtContent.interpretationOptions.find(
                          (o) => o.key === investigation.cave_art_interpretation
                        )?.label ?? investigation.cave_art_interpretation ?? "—"}
                      </p>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-parchment/40">
                        Student Evidence / Explanation
                      </div>
                      <p className="mt-1 whitespace-pre-wrap rounded border border-char-700 bg-char-950/40 p-3 leading-relaxed text-parchment/90">
                        {investigation.cave_art_response}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-parchment/40">Not yet completed.</p>
                )}
              </section>

              <section className="rounded border border-char-700 bg-char-900/40 p-5">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-ochre-400">Stone Tools</h2>
                {investigation.stone_tools_completed_at ? (
                  <div className="mt-3 space-y-3 text-sm">
                    <p className="text-parchment/70">
                      Completed {fmtDate(investigation.stone_tools_completed_at)}
                    </p>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-parchment/40">
                        Student Response
                      </div>
                      <p className="mt-1 whitespace-pre-wrap rounded border border-char-700 bg-char-950/40 p-3 leading-relaxed text-parchment/90">
                        {investigation.stone_tools_response}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-parchment/40">Not yet completed.</p>
                )}
              </section>

              <section className="rounded border border-char-700 bg-char-900/40 p-5">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-ochre-400">
                  Final Conclusion
                </h2>
                {investigation.final_response ? (
                  <p className="mt-3 whitespace-pre-wrap rounded border border-char-700 bg-char-950/40 p-3 text-sm leading-relaxed text-parchment/90">
                    {investigation.final_response}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-parchment/40">Not yet submitted.</p>
                )}
              </section>
            </div>

            <div className="mt-8 border-t border-char-800 pt-5">
              <button
                onClick={() => setPendingDelete(true)}
                className="rounded border border-char-600 px-3 py-1.5 text-xs text-parchment/50 hover:border-ember-500 hover:text-ember-400 focus:outline-none focus:ring-2 focus:ring-ochre-500"
              >
                Delete Investigation
              </button>
            </div>
          </>
        )}
      </div>

      {pendingDelete && investigation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setPendingDelete(false)} />
          <div className="relative w-full max-w-sm rounded border border-char-600 bg-char-900 p-6">
            <h3 className="text-lg font-bold text-parchment">
              Delete {investigation.student_name}&rsquo;s investigation?
            </h3>
            <p className="mt-2 text-sm text-parchment/70">
              This will permanently remove the student&rsquo;s saved responses. This action
              cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setPendingDelete(false)}
                className="rounded border border-char-600 px-4 py-2 text-sm hover:border-ochre-500 hover:text-ochre-300 focus:outline-none focus:ring-2 focus:ring-ochre-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded bg-ember-500 px-4 py-2 text-sm font-semibold text-char-950 hover:bg-ember-400 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ember-300"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
