"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Investigation } from "@/types/investigation";
import { fireContent } from "@/content/fire";
import { caveArtContent } from "@/content/caveArt";

function fmtDate(v: string | null) {
  if (!v) return "—";
  return new Date(v).toLocaleString();
}

function Check({ done }: { done: boolean }) {
  return done ? (
    <span className="text-ochre-400">✓</span>
  ) : (
    <span className="text-parchment/30">—</span>
  );
}

function toCsvValue(v: unknown) {
  const s = v === null || v === undefined ? "" : String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [rows, setRows] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Investigation | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Investigation | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (!data.session) {
        router.replace("/teacher");
        return;
      }
      setCheckingAuth(false);
      loadRows();
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadRows() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("investigations")
      .select("*")
      .order("started_at", { ascending: false });
    if (error) {
      setError(error.message);
    } else {
      setRows((data ?? []) as Investigation[]);
    }
    setLoading(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/teacher");
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    const { error } = await supabase
      .from("investigations")
      .delete()
      .eq("id", pendingDelete.id);
    setDeleting(false);
    if (error) {
      setError(error.message);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== pendingDelete.id));
    setPendingDelete(null);
    if (selected?.id === pendingDelete.id) setSelected(null);
  }

  function exportCsv() {
    const headers = [
      "student_name",
      "class_name",
      "started_at",
      "fire_effect_1",
      "fire_effect_2",
      "fire_response",
      "fire_completed_at",
      "cave_art_interpretation",
      "cave_art_response",
      "cave_art_completed_at",
      "stone_tools_response",
      "stone_tools_completed_at",
      "final_response",
      "submitted_at",
      "status",
    ];
    const lines = [headers.join(",")];
    for (const r of rows) {
      lines.push(headers.map((h) => toCsvValue((r as any)[h])).join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stone-age-investigations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const stats = useMemo(() => {
    const submitted = rows.filter((r) => r.status === "submitted").length;
    return { total: rows.length, submitted };
  }, [rows]);

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center text-parchment/60">
        Checking session…
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-parchment">Teacher Dashboard</h1>
            <p className="text-sm text-parchment/60">
              {stats.total} investigation{stats.total === 1 ? "" : "s"} · {stats.submitted} submitted
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportCsv}
              disabled={rows.length === 0}
              className="rounded border border-char-600 px-4 py-2 text-sm hover:border-ochre-500 hover:text-ochre-300 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-ochre-500"
            >
              Export CSV
            </button>
            <button
              onClick={handleSignOut}
              className="rounded border border-char-600 px-4 py-2 text-sm hover:border-ember-500 hover:text-ember-400 focus:outline-none focus:ring-2 focus:ring-ochre-500"
            >
              Sign Out
            </button>
          </div>
        </div>

        {error && (
          <div role="alert" className="mt-4 rounded border border-ember-600 bg-ember-600/10 px-3 py-2 text-sm text-ember-400">
            {error}
          </div>
        )}

        <div className="mt-6 overflow-x-auto rounded border border-char-700">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-char-900 text-xs uppercase tracking-wide text-parchment/60">
              <tr>
                <th className="px-3 py-2.5">Student</th>
                <th className="px-3 py-2.5">Class</th>
                <th className="px-3 py-2.5">Fire</th>
                <th className="px-3 py-2.5">Cave Art</th>
                <th className="px-3 py-2.5">Stone Tools</th>
                <th className="px-3 py-2.5">Final</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Submitted</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-parchment/50">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-parchment/50">
                    No investigations yet.
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="cursor-pointer border-t border-char-800 hover:bg-char-900/60"
                  onClick={() => setSelected(r)}
                >
                  <td className="px-3 py-2.5 font-medium text-parchment">{r.student_name}</td>
                  <td className="px-3 py-2.5 text-parchment/70">{r.class_name || "—"}</td>
                  <td className="px-3 py-2.5"><Check done={!!r.fire_completed_at} /></td>
                  <td className="px-3 py-2.5"><Check done={!!r.cave_art_completed_at} /></td>
                  <td className="px-3 py-2.5"><Check done={!!r.stone_tools_completed_at} /></td>
                  <td className="px-3 py-2.5"><Check done={!!r.final_response} /></td>
                  <td className="px-3 py-2.5">
                    <span
                      className={
                        "rounded-full px-2 py-0.5 text-xs " +
                        (r.status === "submitted"
                          ? "bg-ochre-500/20 text-ochre-300"
                          : "bg-char-700 text-parchment/60")
                      }
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-parchment/60">{fmtDate(r.submitted_at)}</td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingDelete(r);
                      }}
                      className="rounded border border-char-600 px-2 py-1 text-xs text-parchment/60 hover:border-ember-500 hover:text-ember-400 focus:outline-none focus:ring-2 focus:ring-ochre-500"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setSelected(null)} />
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto panel-scroll rounded border border-char-600 bg-char-900 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-parchment">{selected.student_name}</h2>
                <p className="text-sm text-parchment/60">
                  {selected.class_name || "No class listed"} · Started {fmtDate(selected.started_at)}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded border border-char-600 px-3 py-1.5 text-sm hover:border-ochre-500 hover:text-ochre-300 focus:outline-none focus:ring-2 focus:ring-ochre-500"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-6">
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-ochre-400">Fire</h3>
                {selected.fire_completed_at ? (
                  <div className="mt-2 space-y-2 text-sm">
                    <p className="text-parchment/80">
                      Selected effects:{" "}
                      <span className="font-medium text-parchment">
                        {[selected.fire_effect_1, selected.fire_effect_2]
                          .filter(Boolean)
                          .map(
                            (k) =>
                              fireContent.effectOptions.find((o) => o.key === k)?.label ?? k
                          )
                          .join(", ")}
                      </span>
                    </p>
                    <p className="whitespace-pre-wrap rounded border border-char-700 bg-char-950/40 p-3 text-parchment/85">
                      {selected.fire_response}
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-parchment/40">Not yet completed.</p>
                )}
              </section>

              <section>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-ochre-400">Cave Art</h3>
                {selected.cave_art_completed_at ? (
                  <div className="mt-2 space-y-2 text-sm">
                    <p className="text-parchment/80">
                      Interpretation:{" "}
                      <span className="font-medium text-parchment">
                        {caveArtContent.interpretationOptions.find(
                          (o) => o.key === selected.cave_art_interpretation
                        )?.label ?? selected.cave_art_interpretation}
                      </span>
                    </p>
                    <p className="whitespace-pre-wrap rounded border border-char-700 bg-char-950/40 p-3 text-parchment/85">
                      {selected.cave_art_response}
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-parchment/40">Not yet completed.</p>
                )}
              </section>

              <section>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-ochre-400">Stone Tools</h3>
                {selected.stone_tools_completed_at ? (
                  <p className="mt-2 whitespace-pre-wrap rounded border border-char-700 bg-char-950/40 p-3 text-sm text-parchment/85">
                    {selected.stone_tools_response}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-parchment/40">Not yet completed.</p>
                )}
              </section>

              <section>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-ochre-400">
                  Final Conclusion
                </h3>
                {selected.final_response ? (
                  <p className="mt-2 whitespace-pre-wrap rounded border border-char-700 bg-char-950/40 p-3 text-sm text-parchment/85">
                    {selected.final_response}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-parchment/40">Not yet submitted.</p>
                )}
              </section>
            </div>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" />
          <div className="relative w-full max-w-sm rounded border border-char-600 bg-char-900 p-6">
            <h3 className="text-lg font-bold text-parchment">Delete submission?</h3>
            <p className="mt-2 text-sm text-parchment/70">
              This will permanently delete {pendingDelete.student_name}&rsquo;s investigation.
              This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setPendingDelete(null)}
                className="rounded border border-char-600 px-4 py-2 text-sm hover:border-ochre-500 hover:text-ochre-300 focus:outline-none focus:ring-2 focus:ring-ochre-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded bg-ember-500 px-4 py-2 text-sm font-semibold text-char-950 hover:bg-ember-400 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ember-300"
              >
                {deleting ? "Deleting…" : "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
