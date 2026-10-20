import { useState } from "react";
import { useContactInbox } from "../context/ContactInboxContext";
import { askConfirm, successToast, errorToast, infoToast } from "../utils/alerts";

const formatDate = (iso) => {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60)     return "just now";
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric",
  });
};

function ContactInbox() {
  const { messages, loading, unreadCount, refresh, markRead, removeOne, clearAll } =
    useContactInbox();

  const [filter, setFilter] = useState("all");   // all | unread
  const [search, setSearch] = useState("");

  const filtered = messages.filter((m) => {
    if (filter === "unread" && m.read) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      m.name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.subject?.toLowerCase().includes(q) ||
      m.message?.toLowerCase().includes(q)
    );
  });

  const handleDelete = async (m) => {
    const ok = await askConfirm({
      title: "Delete this message?",
      text: `From ${m.name} (${m.email}) — "${m.subject}". This can't be undone.`,
      confirmText: "Delete",
      icon: "warning",
    });
    if (!ok) return;
    try {
      await removeOne(m.id);
      infoToast("Message deleted");
    } catch (err) {
      errorToast(err.message);
    }
  };

  const handleClearAll = async () => {
    const ok = await askConfirm({
      title: "Clear the entire inbox?",
      text: `All ${messages.length} message${messages.length === 1 ? "" : "s"} will be permanently deleted.`,
      confirmText: "Delete all",
      icon: "warning",
    });
    if (!ok) return;
    try {
      await clearAll();
      successToast("Inbox cleared");
    } catch (err) {
      errorToast(err.message);
    }
  };

  const handleToggleRead = async (m) => {
    try {
      await markRead(m.id, !m.read);
    } catch (err) {
      errorToast(err.message);
    }
  };

  return (
    <div className="page inbox-page">
      <div className="products-header">
        <div>
          <span className="eyebrow">Administration</span>
          <h1>
            Contact Inbox
            {unreadCount > 0 && <span className="unread-pill">{unreadCount}</span>}
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>
            Public messages from the Contact form. Delete trolls and spam as needed.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="button" onClick={refresh} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          {messages.length > 0 && (
            <button className="button delete" onClick={handleClearAll}>
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon">📬</div>
          <div className="stat-info">
            <span className="stat-value">{messages.length}</span>
            <span className="stat-label">Total messages</span>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">🔔</div>
          <div className="stat-info">
            <span className="stat-value">{unreadCount}</span>
            <span className="stat-label">Unread</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-value">{messages.length - unreadCount}</span>
            <span className="stat-label">Read</span>
          </div>
        </div>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by name, email, subject or content…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All messages</option>
          <option value="unread">Unread only</option>
        </select>
      </div>

      {loading && messages.length === 0 ? (
        <div className="empty-state">Loading inbox…</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          {messages.length === 0
            ? "Inbox is empty. Messages sent through the Contact page will appear here."
            : "No messages match your search."}
        </div>
      ) : (
        <div className="contact-inbox-list">
          {filtered.map((m) => (
            <article key={m.id} className={`contact-msg ${m.read ? "read" : "unread"}`}>
              <div className="contact-msg-head">
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h3 className="contact-msg-subject">
                    {!m.read && <span className="unread-dot" aria-hidden="true" />}
                    {m.subject}
                  </h3>
                  <p className="contact-msg-from">
                    <strong>{m.name}</strong>
                    <span className="dot">·</span>
                    <a href={`mailto:${m.email}`}>{m.email}</a>
                    <span className="dot">·</span>
                    <span>{formatDate(m.createdAt)}</span>
                  </p>
                </div>
                <div className="contact-msg-actions">
                  <button className="button small ghost" onClick={() => handleToggleRead(m)}>
                    {m.read ? "Mark unread" : "Mark read"}
                  </button>
                  <button className="button small delete" onClick={() => handleDelete(m)}>
                    Delete
                  </button>
                </div>
              </div>
              <p className="contact-msg-body">{m.message}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default ContactInbox;