import { createClient } from "@supabase/supabase-js";

// Server-only Supabase client using the SERVICE ROLE key.
//
// IMPORTANT: this file must only ever be imported from server-side code
// (Next.js Route Handlers under src/app/api/**). It is never imported by
// any "use client" component, and the service role key is never sent to
// the browser. The service role key bypasses Row Level Security, which
// is why access control for students (matching on their random
// investigation id) is enforced here in application code rather than in
// the database.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !serviceRoleKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "Supabase server env vars are missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
}

export function getSupabaseServerClient() {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
