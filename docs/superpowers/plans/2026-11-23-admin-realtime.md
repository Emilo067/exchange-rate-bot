# Admin Realtime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Secure the admin panel with email/password access and show newly received Telegram messages in the selected dialog without refreshing the page.

**Architecture:** The browser receives an Auth session from Supabase and accesses `clients` and `messages` directly through `@supabase/supabase-js`. PostgreSQL RLS checks membership in `public.admin_users`; Supabase Realtime delivers filtered `INSERT` events from `public.messages` into the React Query cache.

**Tech Stack:** Supabase Auth, PostgreSQL RLS and Realtime Postgres Changes, Supabase CLI declarative schemas, React 19, TypeScript, TanStack React Query.

**Spec:** `docs/superpowers/specs/2026-11-23-admin-realtime-design.md`

## Global Constraints

- No test files will be added or changed for this feature at the user's request.
- The frontend contains only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; service-role credentials remain server-side.
- Database changes use `supabase/schemas/` and a generated migration.
- Do not deploy migrations or functions without explicit approval.

## Review Focus

- An unauthenticated browser must receive neither historical messages nor realtime events.
- An authenticated user not present in `admin_users` must see an access-denied state and no data.
- Reconnects or missed WebSocket events must refetch data instead of permanently losing a message.
- The subscription must be removed on client changes and component unmount to prevent duplicate inserts.
- Only the selected client's event may update the currently open dialog.

---

### Task 1: Add authorization schema and Realtime publication

**Files:**
- Create: `supabase/schemas/public/tables/admin_users.sql`
- Modify: `supabase/schemas/public/tables/clients.sql`
- Modify: `supabase/schemas/public/tables/messages.sql`
- Modify: `supabase/config.toml` only if the CLI needs a declarative extension declaration
- Create: `supabase/migrations/<timestamp>_secure_admin_realtime.sql` (generated)

**Produces:** `public.admin_users`, RLS policies allowing `SELECT` on `clients` and `messages` only to allow-listed Auth users, and `messages` in the `supabase_realtime` publication.

- [ ] Define `admin_users` with `user_id uuid primary key references auth.users(id) on delete cascade`, enable RLS, and omit all browser-accessible policies.
- [ ] Declare `is_admin()` as a `SECURITY DEFINER` helper with `SET search_path = ''`, returning whether `auth.uid()` is listed in `public.admin_users`.
- [ ] Add `SELECT` policies on `clients` and `messages` for `authenticated` that call `public.is_admin()`; retain RLS and avoid policies for `anon`.
- [ ] Add `public.messages` to the `supabase_realtime` publication declaratively.
- [ ] Generate and inspect the migration; apply it only to the local Supabase stack.

### Task 2: Add the browser Supabase client and Auth boundary

**Files:**
- Modify: `admin-panel/package.json`, `admin-panel/pnpm-lock.yaml`
- Modify: `admin-panel/.env.example`
- Create: `admin-panel/src/shared/api/supabase.ts`
- Create: `admin-panel/src/features/auth/ui/LoginPage.tsx`
- Create: `admin-panel/src/features/auth/ui/AccessDenied.tsx`
- Modify: `admin-panel/src/app/App.tsx`

**Produces:** An authenticated Auth session gate and a single configured browser Supabase client.

- [ ] Add `@supabase/supabase-js` to the admin-panel package.
- [ ] Document `VITE_SUPABASE_ANON_KEY` in `.env.example` without writing a real key.
- [ ] Create a typed browser client from the two public Vite variables; fail clearly if either is absent.
- [ ] Render email/password sign-in form when no session exists; refresh session state on Auth changes.
- [ ] Check allow-list membership after sign-in and render an access-denied state for non-admin accounts.

### Task 3: Replace public reads and subscribe to new messages

**Files:**
- Create: `admin-panel/src/entities/client/api/supabaseClients.ts`
- Create: `admin-panel/src/entities/message/api/supabaseMessages.ts`
- Create: `admin-panel/src/entities/message/model/useMessageRealtime.ts`
- Modify: `admin-panel/src/pages/clients-page/ui/ClientsPage.tsx`

**Produces:** Secure direct initial queries plus a lifecycle-safe filtered Realtime subscription.

- [ ] Replace Edge Function reads with direct Supabase queries under the authenticated session.
- [ ] Subscribe to `INSERT` changes on `public.messages` filtered by the selected `client_id`.
- [ ] On a new event, append the message only if absent from `['messages', selectedClientId]` cache; invalidate/refetch on subscription errors and reconnect status.
- [ ] Remove the channel when selection changes or the page unmounts.
- [ ] Invalidate the clients query after new messages so list ordering/timestamps remain current.

### Task 4: Build and provision the first administrator

**Files:**
- Modify: `README.md` with setup and deployment instructions for admin Auth, the allow-list, and Realtime.

**Produces:** An operator procedure for creating the first Auth user, inserting its Auth UUID into `admin_users`, setting the public frontend environment values, and deploying the approved migration.

- [ ] Run `pnpm --dir admin-panel build`.
- [ ] Run local Supabase migration generation/application and inspect the generated SQL.
- [ ] Document the one-time production provisioning commands, but do not run them until explicitly approved.
- [ ] Manually verify locally: sign-in, denied non-admin state, initial message load, and a newly inserted message appearing in the selected dialog.
