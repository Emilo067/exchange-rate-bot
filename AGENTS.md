# AGENTS.md

## Project overview

This repository contains an exchange-rate platform with four independently runnable parts:

- `src/`: Node.js 20+ Telegram bot and Fastify webhook, written as ESM JavaScript using Clean Architecture.
- `mini-app/`: Svelte 5 + Vite Telegram Mini App. It is a separate package with its own lockfile.
- `admin-panel/`: React 19 + TypeScript + Vite admin UI. It is a separate package with its own lockfile.
- `supabase/functions/`: Deno/Supabase Edge Functions for the production Telegram webhook and admin data APIs.

Read `README.md` for setup and deployment details and `docs/architecture.md` for backend dependency rules. C4 diagrams live in `docs/*.puml`.

## Repository map

- `src/domain/`: pure business rules; must not import other application layers.
- `src/application/`: use cases and external-service contracts in `ports/`; may depend only on domain code and its own ports.
- `src/presentation/`: HTTP server and Telegram webhook request handling.
- `src/infrastructure/`: adapters for Telegram, exchange-rate providers, and Supabase.
- `src/main/`: composition root; concrete adapters are constructed and wired here.
- `test/`: backend tests using the built-in `node:test` runner.
- `mini-app/src/`: standalone Svelte Mini App.
- `admin-panel/src/`: React admin UI organized by `app`, `pages`, `features`, `entities`, and `shared`.
- `supabase/functions/_shared/`: shared Deno helpers for Edge Functions.
- `scripts/`: webhook and LocalTunnel utilities; these can change external Telegram webhook state.

## Package management and commands

Use `pnpm`; do not mix package managers or regenerate a lockfile with npm/yarn.

Backend, from the repository root:

```bash
pnpm install
pnpm test
pnpm dev:backend
```

Mini App:

```bash
pnpm --dir mini-app install
pnpm --dir mini-app build
pnpm --dir mini-app dev
```

Admin panel:

```bash
pnpm --dir admin-panel install
pnpm --dir admin-panel test -- --run
pnpm --dir admin-panel build
pnpm --dir admin-panel dev
```

Prefer the smallest relevant verification first, then run the full suite/build for the affected package. The Mini App currently has no automated test command, so at minimum run its production build after changes.

## Implementation conventions

- Preserve ESM imports and explicit `.js` extensions in backend JavaScript.
- Keep domain and application code independent of Fastify, Telegram, Supabase, Deno, Vercel, and environment variables.
- Define a new external dependency as an application port and implement it in `src/infrastructure/`; wire it in `src/main/server.js` and, when relevant, the production Edge Function.
- Keep the provider fallback behavior: Frankfurter is attempted before Open Exchange, and one provider failure must not prevent trying the next.
- Add or update backend tests under the matching `test/` layer using `node:test` and `node:assert/strict`.
- Add admin-panel tests next to the relevant source as `*.test.ts` or `*.test.tsx`, using Vitest and Testing Library.
- Follow the formatting style of the file being edited. The backend generally uses single quotes; the admin panel generally uses double quotes.
- Preserve Telegram theme CSS variables and accessibility behavior in the Mini App.
- Do not edit generated output such as `node_modules/`, `dist/`, `*.tsbuildinfo`, or Vite log files.

## Configuration and safety

- Never print, commit, or copy values from `.env` or `supabase/functions/.env`. Use `.env.example` only to document variable names and safe placeholders.
- Expected configuration includes Telegram credentials, Supabase credentials, webhook secrets, provider configuration, and deployment URLs; verify exact names in `.env.example` and the consuming code.
- Do not run `pnpm tunnel`, `pnpm webhook:prod`, `scripts/set-telegram-webhook.js`, Supabase deploy commands, or other deployment/webhook mutations unless the user explicitly asks. These affect external services.
- The production webhook validates `X-Telegram-Bot-Api-Secret-Token`; do not weaken or bypass that check.
- Supabase service-role credentials are server-side only and must never be exposed to either frontend bundle.

## Keeping documentation current

Update `README.md` when setup, scripts, environment variables, or deployment behavior changes. Update `docs/architecture.md` and the relevant C4 diagram when boundaries or dependencies between components change.
