import { useQuery } from "@tanstack/react-query";
import { getClients } from "../../../entities/client/api/getClients";
import { getClientMessages } from "../../../entities/message/api/getClientMessages";
import { useSelectedClient } from "../../../features/select-client/model/useSelectedClient";

export function ClientsPage() {
  const [selected, setSelected] = useSelectedClient();
  const clients = useQuery({ queryKey: ["clients"], queryFn: getClients });
  const selectedClient = clients.data?.find((client) => client.id === selected);
  const messages = useQuery({
    queryKey: ["messages", selected],
    queryFn: () => getClientMessages(selected!),
    enabled: !!selected,
  });

  if (clients.isLoading) return <main>Loading clients…</main>;
  if (clients.isError)
    return (
      <main>
        Could not load clients{" "}
        <button onClick={() => clients.refetch()}>Retry</button>
      </main>
    );

  return (
    <main className="messenger">
      <aside className="client-panel">
        <div className="panel-heading">
          <p className="eyebrow">Admin panel</p>
          <h1>Dialogs</h1>
          <span>{clients.data?.length ?? 0} clients</span>
        </div>
        <div className="client-list">
          {clients.data?.length ? (
            clients.data.map((client) => (
              <button
                className={selected === client.id ? "active" : ""}
                key={client.id}
                onClick={() => setSelected(client.id)}
                aria-pressed={selected === client.id}
              >
                <span className="client-avatar" aria-hidden="true">
                  {(client.first_name || client.username || "?").slice(0, 1).toUpperCase()}
                </span>
                <span className="client-details">
                  <strong>{client.first_name || client.username || "Unknown client"}</strong>
                  <small>{client.username ? `@${client.username}` : "No username"}</small>
                </span>
              </button>
            ))
          ) : (
            <p className="empty-copy">No clients yet</p>
          )}
        </div>
      </aside>

      <section className="dialog-panel" aria-live="polite">
        {!selected ? (
          <div className="dialog-placeholder">
            <span className="placeholder-icon" aria-hidden="true">↗</span>
            <h2>Select a dialog</h2>
            <p>Choose a client on the left to view their conversation.</p>
          </div>
        ) : (
          <>
            <header className="dialog-header">
              <button className="back" onClick={() => setSelected(null)} aria-label="Back to dialogs">
                ←
              </button>
              <span className="client-avatar" aria-hidden="true">
                {(selectedClient?.first_name || selectedClient?.username || "?")
                  .slice(0, 1)
                  .toUpperCase()}
              </span>
              <div>
                <h2>{selectedClient?.first_name || selectedClient?.username || "Unknown client"}</h2>
                <p>{selectedClient?.username ? `@${selectedClient.username}` : "Client conversation"}</p>
              </div>
            </header>
            {messages.isLoading ? (
              <p className="dialog-state">Loading messages…</p>
            ) : messages.isError ? (
              <p className="dialog-state">
                Could not load messages{" "}
                <button onClick={() => messages.refetch()}>Retry</button>
              </p>
            ) : (
              <div className="message-list">
                {messages.data?.length ? (
                messages.data.map((message) => (
                  <article className={`message ${message.sender}`} key={message.id}>
                    <b>{message.sender}</b>
                    <p>{message.text}</p>
                    <time>{new Date(message.created_at).toLocaleString()}</time>
                  </article>
                ))
                ) : (
                  <p className="empty-copy">No messages with this client</p>
                )}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
