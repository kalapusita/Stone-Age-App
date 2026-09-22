import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

// POST /api/investigation
// Creates a new investigation row when a student begins. Returns the new
// row's id, which the browser stores (localStorage) as its capability
// token for all future reads/writes to this investigation.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const studentName = String(body.student_name ?? "").trim();
    const className = body.class_name ? String(body.class_name).trim() : null;

    if (!studentName) {
      return NextResponse.json(
        { error: "A student name is required." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("investigations")
      .insert({
        student_name: studentName,
        class_name: className,
      })
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ investigation: data });
  } catch (err) {
    console.error("Failed to create investigation:", err);
    return NextResponse.json(
      { error: "Could not start a new investigation. Please try again." },
      { status: 500 }
    );
  }
}
