# Admin Messenger Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone React administration panel for browsing clients and their message histories.

**Architecture:** The independent `admin-panel/` Vite project uses FSD layers. A typed `fetch` API boundary calls Supabase Edge Functions; TanStack Query supplies query state to client-list and conversation widgets. `get-messages` is filtered and sorted in the message entity query because the current Edge Function returns every message.

**Tech Stack:** React, TypeScript, Vite, TanStack Query, Vitest, React Testing Library, CSS.

**Spec:** `docs/superpowers/specs/2026-10-08-admin-messenger-panel-design.md`

## Global Constraints

- Create only `admin-panel/`; do not modify `mini-app/`.
- Use FSD folders: `app`, `pages`, `widgets`, `features`, `entities`, and `shared`.
- Read the base URL from `VITE_SUPABASE_URL`; ship `.env.example`, never `.env`.
- Use browser `fetch` to call Edge Functions; do not add or use a Supabase SDK.
- Load messages only when a client has been selected.

## Review Focus

- Missing `VITE_SUPABASE_URL` must produce a readable error before a malformed network URL is requested.
- A non-2xx Edge Function response must reject with a readable error.
- Mixed-client, reverse-chronological API data must show only selected-client messages in ascending chronological order.
- An empty clients response and an empty selected-client conversation must use normal empty states.
- Narrow screens must allow returning from the conversation to the dialog list.

---

## File structure

```text
admin-panel/
  .env.example
  package.json
  vite.config.ts
  tsconfig.json
  src/
    app/{App.tsx,main.tsx,providers/QueryProvider.tsx,styles/global.css}
    pages/clients-page/ui/ClientsPage.tsx
    widgets/client-list/ui/ClientList.tsx
    widgets/conversation/ui/Conversation.tsx
    features/select-client/model/useSelectedClient.ts
    entities/client/{model/types.ts,api/getClients.ts,ui/ClientDialog.tsx}
    entities/message/{model/types.ts,api/getClientMessages.ts,ui/MessageBubble.tsx}
    shared/api/{edgeFunction.ts,error.ts}
    shared/lib/formatters.ts
```

### Task 1: Scaffold the standalone panel and its test runner

**Files:**
- Create: `admin-panel/package.json`, `admin-panel/vite.config.ts`, `admin-panel/tsconfig.json`, `admin-panel/.env.example`
- Create: `admin-panel/src/test/setup.ts`

**Interfaces:**
- Produces a React/TypeScript Vite project with `test` and `build` scripts.
- Adds `VITE_SUPABASE_URL=` documentation without a secret value.

- [ ] **Step 1: Write the failing configuration test**

Create `admin-panel/src/shared/api/edgeFunction.test.ts` importing the planned `edgeFunctionUrl` function and asserting it throws when the configured base URL is empty.

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --dir admin-panel test --run src/shared/api/edgeFunction.test.ts`

Expected: FAIL because the project/test command or `edgeFunctionUrl` does not exist.

- [ ] **Step 3: Add the Vite, React, TypeScript, Vitest, and testing-library project configuration**

Set `test` to `vitest` and `build` to `tsc -b && vite build`. Configure jsdom and `src/test/setup.ts` for Testing Library matchers.

- [ ] **Step 4: Run the test to verify the runner is ready**

Run: `pnpm --dir admin-panel test --run src/shared/api/edgeFunction.test.ts`

Expected: FAIL only because `edgeFunctionUrl` is not yet implemented.

- [ ] **Step 5: Commit**

```bash
git add admin-panel
git commit -m "chore: scaffold admin panel"
```

### Task 2: Implement the typed Edge Function boundary

**Files:**
- Create: `admin-panel/src/shared/api/error.ts`, `admin-panel/src/shared/api/edgeFunction.ts`
- Test: `admin-panel/src/shared/api/edgeFunction.test.ts`

**Interfaces:**
- Produces `edgeFunctionUrl(functionName: string): string`.
- Produces `getEdgeFunction<T>(functionName: string): Promise<T>`.

- [ ] **Step 1: Extend the failing test**

Mock `fetch` with a 500 response and assert `getEdgeFunction('get-clients')` rejects. Add a success case asserting the URL is `${VITE_SUPABASE_URL}/functions/v1/get-clients` and parsed JSON is returned.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --dir admin-panel test --run src/shared/api/edgeFunction.test.ts`

Expected: FAIL because API functions do not exist.

- [ ] **Step 3: Implement `edgeFunctionUrl` and `getEdgeFunction`**

Trim a trailing slash from `VITE_SUPABASE_URL`, reject a missing value, call `fetch`, reject non-OK responses, and parse JSON. Use a dedicated `EdgeFunctionError` for user-displayable messages.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --dir admin-panel test --run src/shared/api/edgeFunction.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add admin-panel/src/shared
git commit -m "feat: add edge function client"
```

### Task 3: Model and query clients and messages

**Files:**
- Create: `admin-panel/src/entities/client/model/types.ts`, `admin-panel/src/entities/client/api/getClients.ts`
- Create: `admin-panel/src/entities/message/model/types.ts`, `admin-panel/src/entities/message/api/getClientMessages.ts`
- Test: `admin-panel/src/entities/message/api/getClientMessages.test.ts`

**Interfaces:**
- Produces `Client`, `Message`, `getClients(): Promise<Client[]>`, and `getClientMessages(clientId: string): Promise<Message[]>`.
- Consumes `getEdgeFunction<T>` from Task 2.

- [ ] **Step 1: Write the failing message-query test**

Mock `get-messages` data containing two client IDs in descending time order. Assert `getClientMessages('client-1')` returns only client 1 messages sorted by ascending `created_at`.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --dir admin-panel test --run src/entities/message/api/getClientMessages.test.ts`

Expected: FAIL because the query module does not exist.

- [ ] **Step 3: Implement the entity types and query functions**

Read `{ clients }` from `get-clients`, `{ messages }` from `get-messages`, filter by `client_id`, and sort a copied message array ascending by timestamp.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --dir admin-panel test --run src/entities/message/api/getClientMessages.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add admin-panel/src/entities
git commit -m "feat: add client and message queries"
```

### Task 4: Compose the FSD messenger interface

**Files:**
- Create: all UI and provider files from the File structure section
- Test: `admin-panel/src/widgets/client-list/ui/ClientList.test.tsx`, `admin-panel/src/pages/clients-page/ui/ClientsPage.test.tsx`

**Interfaces:**
- Consumes `getClients`, `getClientMessages`, `Client`, and `Message` from Task 3.
- Produces an application mounted by `src/app/main.tsx`.

- [ ] **Step 1: Write failing widget/page tests**

Test that a failed clients request shows an error and retry control. Test that selecting a rendered client triggers its conversation and displays its message text, while no messages query is made before selection.

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --dir admin-panel test --run src/widgets/client-list/ui/ClientList.test.tsx src/pages/clients-page/ui/ClientsPage.test.tsx`

Expected: FAIL because widgets and page do not exist.

- [ ] **Step 3: Implement FSD UI and query providers**

Use query keys `['clients']` and `['messages', clientId]`. Store selected client ID in `useSelectedClient`. Select the first client when data first becomes available; render error, retry, loading, and empty states. Render chronological message bubbles and add responsive CSS that exposes a back action on narrow screens.

- [ ] **Step 4: Run component tests to verify they pass**

Run: `pnpm --dir admin-panel test --run src/widgets/client-list/ui/ClientList.test.tsx src/pages/clients-page/ui/ClientsPage.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add admin-panel/src
git commit -m "feat: add client messenger interface"
```

### Task 5: Verify the complete panel

**Files:**
- Modify: `admin-panel/README.md` only if setup needs clarification beyond `.env.example`.

**Interfaces:**
- Consumes the built application from Tasks 1–4.

- [ ] **Step 1: Run all panel tests**

Run: `pnpm --dir admin-panel test --run`

Expected: PASS with no failed tests.

- [ ] **Step 2: Run production build**

Run: `pnpm --dir admin-panel build`

Expected: Vite completes successfully.

- [ ] **Step 3: Check the diff**

Run: `git diff --check`

Expected: no whitespace errors; changes are limited to `admin-panel/` and planning documentation.

- [ ] **Step 4: Commit verification/documentation updates**

```bash
git add admin-panel
git commit -m "test: verify admin panel build"
```
