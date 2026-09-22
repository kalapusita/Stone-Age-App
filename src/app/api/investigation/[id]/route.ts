import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Fields a student's browser is ever allowed to write. Anything else in
// the request body is ignored, so a tampered request can't set fields
// like `status` to "submitted" without going through the intended
// validation below, or overwrite server-managed timestamps arbitrarily.
const ALLOWED_FIELDS = new Set([
  "fire_effect_1",
  "fire_effect_2",
  "fire_response",
  "cave_art_interpretation",
  "cave_art_response",
  "stone_tools_response",
  "final_response",
]);

function isValidId(id: string) {
  return UUID_RE.test(id);
}

// GET /api/investigation/[id]
// Lets a returning student's browser reload their own in-progress
// investigation (identified by the random id it stored locally).
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isValidId(params.id)) {
    return NextResponse.json({ error: "Invalid investigation id." }, { status: 400 });
  }
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("investigations")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load investigation." }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Investigation not found." }, { status: 404 });
  }
  return NextResponse.json({ investigation: data });
}

// PATCH /api/investigation/[id]
// Body: { fields: { ...allowed fields... }, complete_section?: "fire" | "caveArt" | "stoneTools", submit?: boolean }
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isValidId(params.id)) {
    return NextResponse.json({ error: "Invalid investigation id." }, { status: 400 });
  }

  try {
    const body = await req.json();
    const fields = body.fields ?? {};
    const update: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(fields)) {
      if (ALLOWED_FIELDS.has(key)) {
        update[key] = value;
      }
    }

    const supabase = getSupabaseServerClient();

    // Look up current status/completion to prevent re-submission from
    // creating a second record or silently overwriting a submitted
    // investigation's final answer in a confusing way.
    const { data: existing, error: fetchErr } = await supabase
      .from("investigations")
      .select("id, status")
      .eq("id", params.id)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!existing) {
      return NextResponse.json({ error: "Investigation not found." }, { status: 404 });
    }

    const nowIso = new Date().toISOString();

    if (body.complete_section === "fire") {
      update.fire_completed_at = nowIso;
    } else if (body.complete_section === "caveArt") {
      update.cave_art_completed_at = nowIso;
    } else if (body.complete_section === "stoneTools") {
      update.stone_tools_completed_at = nowIso;
    }

    if (body.submit === true) {
      // submitted_at is only ever set the first time; later edits to an
      // already-submitted investigation update the same row (status
      // stays "submitted") rather than creating a duplicate.
      update.status = "submitted";
      if (existing.status !== "submitted") {
        update.submitted_at = nowIso;
      }
    }

    const { data, error } = await supabase
      .from("investigations")
      .update(update)
      .eq("id", params.id)
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ investigation: data });
  } catch (err) {
    console.error("Failed to update investigation:", err);
    return NextResponse.json(
      { error: "Could not save your work. Please try again." },
      { status: 500 }
    );
  }
}
