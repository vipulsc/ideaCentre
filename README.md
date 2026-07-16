## Google Auth Setup

Google login is configured with NextAuth.

Use `.env.local` for credentials:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

## Supabase Setup

Supabase is wired with typed clients for browser/server/admin use:
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/supabase/admin.ts`

Required `.env.local` keys:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, do not expose in client)
- `GEMINI_API_KEY` (Google AI Studio — AI generation features)

Copy the template: `cp .env.example .env.local`

Database migrations are under `supabase/migrations`:
- `001_init_schema.sql` creates core IdeaCentre tables.
- `002_enable_rls_for_new_public_tables.sql` adds an event trigger to auto-enable RLS on every new `public` table.

Run these SQL files in Supabase SQL editor (in order) or with Supabase CLI migration workflow.

Quick connectivity check:
- Start app with `npm run dev`
- Hit `GET /api/db/health`
- Expect `{ "ok": true }` after migrations are applied and `SUPABASE_SERVICE_ROLE_KEY` is set.