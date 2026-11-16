# Admin Messenger Panel Design

## Goal

Create a separate browser-based administration panel for viewing clients and their conversation history. The existing Telegram Svelte Mini App in `mini-app/` is out of scope and must remain unchanged.

## Scope and constraints

- Create an independent `admin-panel/` Vite project using React and TypeScript.
- Organize frontend source files according to Feature-Sliced Design (FSD).
- Use TanStack Query for remote-state loading, caching, and request state.
- Call Supabase Edge Functions with the browser `fetch` API only. Do not add or use the Supabase client SDK in `admin-panel/`.
- Read the Supabase project base URL from `VITE_SUPABASE_URL`; commit an `.env.example` but never a real `.env` file.
- Use `get-clients` and `get-messages` at `${VITE_SUPABASE_URL}/functions/v1/<function-name>`.
- Do not alter the existing Svelte Mini App.

## Data contracts

`GET /functions/v1/get-clients` returns:

```ts
type ClientsResponse = {
  clients: Array<{
    id: string;
    first_name: string | null;
    username: string | null;
    last_message_at: string | null;
  }>;
};
```

`GET /functions/v1/get-messages` returns:

```ts
type MessagesResponse = {
  messages: Array<{
    id: string;
    client_id: string;
    sender: string;
    text: string;
    created_at: string;
  }>;
};
```

The current messages Edge Function has no `client_id` request parameter and returns all messages. The frontend loads it only after a client selection and filters the result by `message.client_id === clientId`. Messages are displayed in chronological order despite the endpoint returning reverse chronological order.

## Architecture

`app/` owns the React and Query providers plus global CSS. `shared/api/` owns the typed fetch boundary and normalizes non-2xx responses into an application error. `entities/client` and `entities/message` own domain types, query functions, and small display components.

`features/select-client` owns the selected-client state and selection action. `widgets/client-list` renders the clients query and selection controls; `widgets/conversation` renders the selected conversation query. `pages/clients-page` composes both widgets into the messenger layout.

## User experience

- Desktop view: a left dialog list and a right conversation pane.
- Narrow view: the selected conversation replaces the list; a back control restores the list.
- A dialog item displays client name, optional `@username`, and the last-message date if present.
- The first available client becomes selected after clients load, unless the user has already made a selection.
- The conversation shows sender-distinguished bubbles, message text, and localized creation time.
- Provide explicit loading, empty, error, and retry states for both client and message requests.
- Do not request messages until a client is selected.

## Error handling

Missing `VITE_SUPABASE_URL`, a non-success HTTP response, or malformed JSON is exposed as a readable query error. Retry buttons call the applicable TanStack Query refetch operation. An empty message collection for a selected client is a normal empty state, not an error.

## Testing and verification

Use Vitest and React Testing Library. Tests must first prove the typed fetch boundary rejects failed HTTP responses and that the message query returns only a selected client’s messages in ascending time order. Component tests must prove the list’s retry/error state and selection-driven conversation rendering. The implementation must pass tests and `vite build`.
