# Life in the Stone Age

An interactive archaeological-investigation activity for a Grade 10 Ancient
History class. Students explore a reconstructed Stone Age cave, investigate
real archaeological evidence about fire, cave art and stone tools, and write
short responses that are saved to a database. Teachers review submissions in
a password-protected dashboard.

Central inquiry question: **"What can archaeological evidence tell us about
the lives of prehistoric humans?"**

---

## 1. Technology stack

- **Next.js 14** (App Router, TypeScript, React) — one project serves both
  the student activity and the teacher dashboard.
- **Tailwind CSS** — styling.
- **Supabase** — Postgres database + authentication (used only for the
  teacher login).

Why this stack: it is a single, ordinary web app (no separate backend
service to run), deploys in one click to Vercel (or any Node host), and
Supabase gives you a managed database and login system without you having
to write your own auth code.

## 2. Project structure

```
src/
  app/
    page.tsx                     Student activity (entry screen + cave)
    layout.tsx, globals.css      App shell / global styles
    teacher/
      page.tsx                  Teacher login
      dashboard/page.tsx        Teacher dashboard
    api/investigation/
      route.ts                  POST — start a new investigation
      [id]/route.ts             GET/PATCH — load & save one investigation
  components/                    All UI components (cave scene, the three
                                 investigation panels, synthesis, modals)
  content/                       ALL historical/educational text lives here,
                                 separate from UI code (fire.ts, caveArt.ts,
                                 stoneTools.ts, sources.ts)
  lib/
    supabaseClient.ts            Browser Supabase client (anon key only)
    supabaseServer.ts            Server-only Supabase client (service role key)
    investigationClient.ts       Fetch helpers the browser uses to talk to /api
  types/investigation.ts         Shared TypeScript types
supabase/schema.sql              Full database schema + Row Level Security
public/images/                   The five supplied image assets (see §6)
```

If you ever want to edit the reading text, the evidence questions, or the
response prompts, you only need to edit the files in `src/content/` — you do
not need to touch any component code.

## 3. How image hotspots are positioned

`main-cave-scene.png` is shown at its original aspect ratio (`object-contain`
inside a container locked to the image's own aspect ratio, `1536 / 1024`), so
it is never stretched or cropped, on any screen size. The three hotspots
(Making Fire / Cave Art / Making Stone Tools) are positioned with CSS
percentages (`left`, `top`) over that box, so they stay aligned with the
artwork at every screen width. If you replace the cave image with a
different picture, open `src/components/CaveScene.tsx` and adjust the
`HOTSPOTS` array's `left`/`top` percentages to match the new artwork.

Hotspots are small circular markers (not large buttons) that glow gently on
hover/focus and show a text label — they never cover the artwork. They are
real `<button>` elements, so they work with keyboard Tab + Enter/Space as
well as mouse and touch.

## 4. Supabase data model

One table, `investigations` (see `supabase/schema.sql` for the full,
runnable SQL):

| Column | Notes |
|---|---|
| `id` | UUID, generated automatically. This is the student's "session id". |
| `student_name`, `class_name`, `started_at` | Set when the student begins. |
| `fire_effect_1`, `fire_effect_2`, `fire_response`, `fire_completed_at` | Fire investigation |
| `cave_art_interpretation`, `cave_art_response`, `cave_art_completed_at` | Cave Art investigation |
| `stone_tools_response`, `stone_tools_completed_at` | Stone Tools investigation |
| `final_response`, `submitted_at` | Final synthesis |
| `status` | `in_progress` or `submitted` |

Students never sign up or log in. When a student clicks "Begin Exploration",
the app creates one row and remembers its `id` in the browser's
`localStorage`. Every save after that (each section, and the final
submission) updates that same row — so re-submitting or re-editing never
creates a duplicate record.

## 5. How student data is protected

Students have no accounts, which makes "don't let students read each
other's answers" a real design question. This app solves it as follows:

- The **anon** (public) role has **no direct database access at all** —
  `supabase/schema.sql` enables Row Level Security and creates no policy
  for anon, which means "deny everything" by default.
- All reads/writes on behalf of a student go through this app's own
  server-side API routes (`src/app/api/investigation/**`), which use the
  Supabase **service role key**. That key is only ever read from
  `src/lib/supabaseServer.ts`, which is never imported by browser code, so
  it never reaches the client.
- A student's only "credential" is the random UUID stored in their own
  browser. The API route requires that exact id to read or update a row.
  This is a reasonable capability-based control for a no-login classroom
  activity, and it means one student cannot list or guess other students'
  submissions from the browser console (there is no endpoint that returns
  more than one row to an anonymous caller).
- The **teacher dashboard** reads data differently: it uses the Supabase
  browser client directly, but only after a teacher has signed in with
  Supabase Auth. The RLS policy `"Teachers can read all investigations"`
  grants `select`/`delete` only to the `authenticated` role — so only a
  signed-in teacher account can see the full list.

## 6. Teacher authentication & dashboard

The teacher dashboard lives at **`/teacher`** (login) and
**`/teacher/dashboard`** (the actual dashboard, which redirects back to
`/teacher` if you're not signed in).

To create your teacher account:

1. In the Supabase dashboard, go to **Authentication → Users → Add user**.
2. Enter your email and a password. You can either invite yourself by email
   or set the password directly — either works.
3. Go to `/teacher` in the deployed app and sign in with those credentials.

You can add more than one teacher account the same way. There is no
self-service sign-up page by design — only accounts you create in Supabase
can sign in.

From the dashboard you can:
- See every student's progress at a glance (✓ per section, status,
  submitted date).
- Click a row to see that student's full responses for Fire, Cave Art,
  Stone Tools and the Final Conclusion.
- **Export CSV** of all investigations.
- **Delete** a submission (with a confirmation step first).

## 7. Local development

Requirements: Node.js 18+ and a free [Supabase](https://supabase.com)
project.

```bash
# 1. Install dependencies
npm install

# 2. Create your local environment file
cp .env.example .env.local
# then fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
# and SUPABASE_SERVICE_ROLE_KEY from Supabase → Project Settings → API

# 3. Create the database table
# Open Supabase → SQL Editor, paste the contents of supabase/schema.sql, run it.

# 4. Start the app
npm run dev
```

Then open http://localhost:3000 for the student activity, and
http://localhost:3000/teacher for the teacher dashboard.

## 8. Deployment

The simplest path is [Vercel](https://vercel.com):

1. Push this project to a GitHub repository.
2. In Vercel, "Import Project" from that repository.
3. Add the same three environment variables from `.env.local` in the
   Vercel project's **Settings → Environment Variables**.
4. Deploy. Vercel will give you a URL such as
   `https://your-app.vercel.app` (student activity) and
   `https://your-app.vercel.app/teacher` (teacher login).

Any other Node.js hosting platform that supports Next.js will also work —
the requirements are just the three environment variables and `npm run
build && npm start`.

**Never** commit `.env.local` to version control, and never paste the
service role key into any file under `src/app/**` that is not inside
`src/app/api/**` — those are the only files that run on the server.

## 9. Where the five supplied images belong

Place these exact filenames in `public/images/` (already done if you
received this project with the images included):

| File | Used for |
|---|---|
| `main-cave-scene.png` | The main explorable cave scene (entry background + main hotspot image) |
| `fire-evidence-gesher.jpg` | "Archaeological Evidence" figure in the Fire investigation |
| `cave-art-chauvet.jpg` | "Archaeological Evidence" figure in the Cave Art investigation |
| `stone-tools-oldowan.jpg` | First step of the technology progression in the Stone Tools investigation |
| `stone-tools-handaxe.jpg` | Second step of the technology progression in the Stone Tools investigation |

All five are displayed with `object-contain`, so their original aspect
ratios are always preserved — none of them are stretched, squashed or
cropped.

## 10. Historical accuracy & sourcing notes

- The main cave scene is explicitly labeled in-app (via the "ⓘ About this
  reconstruction" control) as an artistic teaching reconstruction that
  combines several themes — **not** a depiction of one specific site,
  culture or moment in time.
- Every "Archaeological Evidence" figure is visually labeled as real
  evidence, distinct from the reconstruction artwork.
- The Cave Art investigation explicitly separates **fact/observation**
  ("the paintings exist") from **interpretation** ("what they meant"), and
  tells students plainly that we do not know the paintings' meaning for
  certain.
- The Stone Tools investigation explicitly notes that the
  core → handaxe → specialized-tools progression is a general pattern seen
  over a very long span at some sites, not a single universal, linear
  sequence that happened identically everywhere.
- Sources referenced in-app (see the "Sources & Credits" panel in the
  activity):
  - Smithsonian Human Origins Program — https://humanorigins.si.edu/
  - Chauvet Cave, UNESCO World Heritage Centre — https://whc.unesco.org/en/list/1426
  - Nature — recent published research on evidence for deliberate
    fire-making at Barnham, England, dated to approximately 400,000 years
    ago (consult the publisher's site for the specific article and full
    citation before distributing this activity further).
- **Image credits:** the exact photographer/institution credit and license
  for the four real archaeological-evidence photographs were not supplied
  with this project. Placeholder credit fields are provided in
  `src/content/sources.ts` (`imageCredits`) — please fill these in with the
  correct attribution before distributing the activity outside your own
  classroom, since possession of an image file does not establish that it
  is free to redistribute.

## 11. What to edit if you want to change the wording

- Reading text, questions, and answer options for each investigation:
  `src/content/fire.ts`, `src/content/caveArt.ts`, `src/content/stoneTools.ts`
- "About this reconstruction" text and Sources & Credits list:
  `src/content/sources.ts`
- Visual styling (colors, fonts): `tailwind.config.js`
