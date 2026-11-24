# Admin Realtime Design

## Intent

Messages received from Telegram must appear in the selected conversation in the admin panel without a page refresh. Only an approved administrator may read clients, messages, or Realtime events.

## Chosen approach

Use Supabase Auth with email and password, direct browser access through `@supabase/supabase-js`, RLS policies backed by an `admin_users` allow-list, and a filtered Supabase Realtime Postgres Changes subscription for `public.messages`.

## Approaches considered

1. **Browser Postgres Changes plus Auth/RLS — chosen.** Native Supabase realtime, no custom WebSocket server, and access enforcement happens in PostgreSQL.
2. **Polling the existing Edge Functions.** Simpler, but not realtime and adds repeated requests.
3. **Custom WebSocket relay.** Keeps database details off the browser, but introduces unnecessary server infrastructure for one admin panel.

## Data and security

- Add `public.admin_users(user_id uuid primary key references auth.users(id))`; it is managed only by the server/database owner.
- Enable policies on `public.clients` and `public.messages` that permit `SELECT` only when `auth.uid()` exists in `admin_users`.
- Keep the tables in RLS mode; do not grant anonymous read access.
- Add `messages` to the `supabase_realtime` publication.
- The panel uses only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; the service-role key never enters the browser bundle.
- An administrator account is created manually in Supabase Auth, then its Auth user ID is inserted into `admin_users` as a one-time provisioning step.

## Panel behavior

- An unauthenticated visitor sees an email/password login form.
- An authenticated but unapproved account receives no data and sees an access-denied state.
- On success, clients and messages load directly through the browser Supabase client.
- While a dialog is selected, the panel subscribes to `INSERT` events in `public.messages` filtered by `client_id`.
- A received event updates the React Query cache; Realtime is a refresh signal rather than the source of truth, so reconnects also invalidate/refetch affected queries.
- The subscription is removed when the selected dialog changes or the panel unmounts.

## Non-goals

- No registration page, password recovery flow, multi-admin management UI, message sending UI, or automated tests in this task.
- Existing Edge Functions remain deployed but the admin panel no longer uses their public read endpoints.

## Constraints

- No test files will be added or changed for this feature at the user's request.
- Database changes follow the repository's declarative schema and generated migration workflow.
