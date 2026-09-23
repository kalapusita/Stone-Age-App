"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Investigation } from "@/types/investigation";
import { fireContent } from "@/content/fire";
import { caveArtContent } from "@/content/caveArt";
import { fmtDate, Check, toCsvValue } from "@/lib/teacherFormat";

type StatusFilter = "all" | "submitted" | "in_progress";
type SortKey = "name" | "class" | "status" | "activity";
type SortDir = "asc" | "desc";

function activityTime(r: Investigation): number {
  return new Date(r.submitted_at || r.updated_at).getTime();
}

function SortHeader({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  dir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const active = sortKey === activeKey;
  return (
    <th className="px-3 py-2.5">
      <button
        onClick={() => onSort(sortKey)}
        className={
          "flex items-center gap-1 uppercase tracking-wide hover:text-ochre-300 focus:outline-none focus:ring-2 focus:ring-ochre-500 rounded " +
          (active ? "text-ochre-400" : "")
        }
      >
        {label}
        {active && <span aria-hidden="true">{dir === "asc" ? "▲" : "▼"}</span>}
      </button>
    </th>
  );
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [rows, setRows] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("activity");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

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

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "activity" ? "desc" : "asc");
    }
  }

  const classOptions = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) {
      if (r.class_name) set.add(r.class_name);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = rows.filter((r) => {
      if (classFilter !== "all" && r.class_name !== classFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (q && !r.student_name.toLowerCase().includes(q)) return false;
      return true;
    });

    const dirMul = sortDir === "asc" ? 1 : -1;
    filtered.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.student_name.toLowerCase().localeCompare(b.student_name.toLowerCase());
          break;
        case "class":
          cmp = (a.class_name || "").toLowerCase().localeCompare((b.class_name || "").toLowerCase());
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
        case "activity":
          cmp = activityTime(a) - activityTime(b);
          break;
      }
      return cmp * dirMul;
    });

    return filtered;
  }, [rows, search, classFilter, statusFilter, sortKey, sortDir]);

  const stats = useMemo(() => {
    const submitted = filteredRows.filter((r) => r.status === "submitted").length;
    return {
      total: filteredRows.length,
      submitted,
      inProgress: filteredRows.length - submitted,
    };
  }, [filteredRows]);

  function openStudent(r: Investigation) {
    const ids = filteredRows.map((row) => row.id).join(",");
    router.push(`/teacher/student/${r.id}?ids=${encodeURIComponent(ids)}`);
  }

  function exportCsv() {
    const headers = [
      "Student Name",
      "Class",
      "Status",
      "Started",
      "Last Activity",
      "Fire Selections",
      "Fire Response",
      "Cave Art Interpretation",
      "Cave Art Response",
      "Stone Tools Response",
      "Final Response",
      "Submitted At",
    ];

    const lines = [headers.map(toCsvValue).join(",")];
    for (const r of filteredRows) {
      const fireLabels = [r.fire_effect_1, r.fire_effect_2]
        .filter(Boolean)
        .map((k) => fireContent.effectOptions.find((o) => o.key === k)?.label ?? k)
        .join("; ");
      const caveArtLabel = r.cave_art_interpretation
        ? caveArtContent.interpretationOptions.find((o) => o.key === r.cave_art_interpretation)
            ?.label ?? r.cave_art_interpretation
        : "";

      const values = [
        r.student_name,
        r.class_name || "",
        r.status === "submitted" ? "Submitted" : "In Progress",
        r.started_at,
        r.updated_at,
        fireLabels,
        r.fire_response || "",
        caveArtLabel,
        r.cave_art_response || "",
        r.stone_tools_response || "",
        r.final_response || "",
        r.submitted_at || "",
      ];
      lines.push(values.map(toCsvValue).join(","));
    }

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stone-age-investigations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

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
              {stats.total} Student{stats.total === 1 ? "" : "s"} · {stats.submitted} Submitted ·{" "}
              {stats.inProgress} In Progress
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportCsv}
              disabled={filteredRows.length === 0}
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

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..."
            className="w-full max-w-xs rounded border border-char-600 bg-char-950/60 px-3 py-2 text-sm text-parchment placeholder:text-parchment/40 focus:border-ochre-500 focus:outline-none focus:ring-1 focus:ring-ochre-500"
          />
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="rounded border border-char-600 bg-char-950/60 px-3 py-2 text-sm text-parchment focus:border-ochre-500 focus:outline-none focus:ring-1 focus:ring-ochre-500"
          >
            <option value="all">All Classes</option>
            {classOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="rounded border border-char-600 bg-char-950/60 px-3 py-2 text-sm text-parchment focus:border-ochre-500 focus:outline-none focus:ring-1 focus:ring-ochre-500"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="in_progress">In Progress</option>
          </select>
        </div>

        <div className="mt-4 overflow-x-auto rounded border border-char-700">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-char-900 text-xs uppercase tracking-wide text-parchment/60">
              <tr>
                <SortHeader label="Student" sortKey="name" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                <SortHeader label="Class" sortKey="class" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                <th className="px-3 py-2.5">Fire</th>
                <th className="px-3 py-2.5">Cave Art</th>
                <th className="px-3 py-2.5">Stone Tools</th>
                <th className="px-3 py-2.5">Final</th>
                <SortHeader label="Status" sortKey="status" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                <SortHeader label="Submitted" sortKey="activity" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-parchment/50">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-parchment/50">
                    No investigations yet. Student submissions will appear here once they begin
                    the activity.
                  </td>
                </tr>
              )}
              {!loading && rows.length > 0 && filteredRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-parchment/50">
                    No students match the current search and filters.
                  </td>
                </tr>
              )}
              {filteredRows.map((r) => (
                <tr
                  key={r.id}
                  className="cursor-pointer border-t border-char-800 hover:bg-char-900/60"
                  onClick={() => openStudent(r)}
                >
                  <td className="px-3 py-2.5 font-medium text-parchment underline decoration-dotted underline-offset-2">
                    {r.student_name}
                  </td>
                  <td className="px-3 py-2.5 text-parchment/70">{r.class_name || "—"}</td>
                  <td className="px-3 py-2.5"><Check done={!!r.fire_completed_at} /></td>
                  <td className="px-3 py-2.5"><Check done={!!r.cave_art_completed_at} /></td>
                  <td className="px-3 py-2.5"><Check done={!!r.stone_tools_completed_at} /></td>
                  <td className="px-3 py-2.5"><Check done={!!r.final_response} /></td>
                  <td className="px-3 py-2.5">
                    <span
                      className={
                        "rounded px-1.5 py-0.5 text-xs " +
                        (r.status === "submitted"
                          ? "text-ochre-300"
                          : "text-parchment/60")
                      }
                    >
                      {r.status === "submitted" ? "Submitted" : "In Progress"}
                    </span>
                    {r.status !== "submitted" && (
                      <div className="mt-0.5 text-[11px] text-parchment/40">
                        Last active {fmtDate(r.updated_at)}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-parchment/60">
                    {r.status === "submitted" ? fmtDate(r.submitted_at) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
