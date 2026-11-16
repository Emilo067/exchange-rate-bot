import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { getClientMessages } from "../../../entities/message/api/getClientMessages";
import { ClientsPage } from "./ClientsPage";

vi.mock("../../../entities/client/api/getClients", () => ({
  getClients: vi.fn().mockResolvedValue([
    {
      id: "client-1",
      first_name: "Emil",
      username: "emilo000",
      last_message_at: "2026-10-25T08:04:50.000Z",
    },
  ]),
}));

vi.mock("../../../entities/message/api/getClientMessages", () => ({
  getClientMessages: vi.fn().mockResolvedValue([
    {
      id: "message-1",
      client_id: "client-1",
      sender: "client",
      text: "RUB",
      created_at: "2026-10-25T08:04:50.000Z",
    },
  ]),
}));

describe("ClientsPage", () => {
  it("shows the selected client's name in the dialog header", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ClientsPage />
      </QueryClientProvider>,
    );

    fireEvent.click(await screen.findByRole("button", { name: /emil/i }));

    expect(
      await screen.findByRole("heading", { name: "Emil", level: 2 }),
    ).toBeInTheDocument();
  });

  it("keeps the dialog header available while messages load", async () => {
    vi.mocked(getClientMessages).mockImplementationOnce(
      () => new Promise(() => undefined),
    );
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ClientsPage />
      </QueryClientProvider>,
    );

    fireEvent.click(await screen.findByRole("button", { name: /emil/i }));

    expect(
      await screen.findByRole("heading", { name: "Emil", level: 2 }),
    ).toBeInTheDocument();
  });
});
