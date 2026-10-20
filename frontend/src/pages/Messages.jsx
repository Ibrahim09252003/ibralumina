import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useMessages } from "../context/MessageContext";
import { errorToast } from "../utils/alerts";

/* Role-based messaging rules:
   buyer   → manager
   manager → admin, buyer
   admin   → admin, manager                                          */
const canMessage = (fromRole, toRole) => {
  if (fromRole === "admin")   return toRole === "admin" || toRole === "manager";
  if (fromRole === "manager") return toRole === "admin" || toRole === "buyer";
  if (fromRole === "buyer")   return toRole === "manager";
  return false;
};

const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

const fmtDay = (iso) => {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

function Messages() {
  const { user, accounts } = useAuth();
  const { messages, sendMessage, markRead, unreadCount } = useMessages();

  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");

  const chatBodyRef = useRef(null);
  const composerRef = useRef(null);

  /* ── Threads: one entry per person the user has exchanged messages with ── */
  const threads = useMemo(() => {
    const mine = messages.filter((m) => m.fromId === user.id || m.toId === user.id);
    const map = new Map();
    mine.forEach((m) => {
      const otherId = m.fromId === user.id ? m.toId : m.fromId;
      if (!map.has(otherId)) map.set(otherId, []);
      map.get(otherId).push(m);
    });
    return [...map.entries()].map(([otherId, msgs]) => {
      msgs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      const other =
        accounts.find((a) => a.id === otherId) ||
        { id: otherId, name: "Unknown user", role: "buyer" };
      const unread = msgs.filter(
        (m) => m.toId === user.id && !(m.readBy || []).includes(user.id)
      ).length;
      return { otherId, other, messages: msgs, last: msgs[msgs.length - 1], unread };
    });
  }, [messages, user.id, accounts]);

  /* ── Sidebar items = existing threads + people we're allowed to start a chat with ── */
  const sidebarItems = useMemo(() => {
    const threadIds = new Set(threads.map((t) => t.otherId));
    const items = [...threads];

    accounts.forEach((a) => {
      if (a.id === user.id) return;
      if (threadIds.has(a.id)) return;
      if (!canMessage(user.role, a.role)) return;
      items.push({ otherId: a.id, other: a, messages: [], last: null, unread: 0 });
    });

    const q = search.trim().toLowerCase();
    return items
      .filter((it) =>
        !q
          ? true
          : it.other.name?.toLowerCase().includes(q) ||
            it.other.username?.toLowerCase().includes(q) ||
            it.other.role?.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        const aT = a.last ? new Date(a.last.createdAt).getTime() : 0;
        const bT = b.last ? new Date(b.last.createdAt).getTime() : 0;
        return bT - aT;
      });
  }, [threads, accounts, user.id, user.role, search]);

  const active = useMemo(
    () => (selectedId == null ? null : sidebarItems.find((it) => it.otherId === selectedId) || null),
    [selectedId, sidebarItems]
  );

  /* ── Auto-scroll on new message ── */
  const activeLen = active?.messages.length ?? 0;
  useEffect(() => {
    const el = chatBodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [active?.otherId, activeLen]);

  /* ── Focus composer when opening a chat ── */
  useEffect(() => {
    if (active) composerRef.current?.focus();
  }, [active?.otherId]);

  /* ── Mark read ── */
  useEffect(() => {
    if (active && active.unread > 0) markRead(active.otherId);
  }, [active, markRead]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!active) return;
    if (!draft.trim()) return;
    const res = sendMessage({ toId: active.otherId, body: draft });
    if (!res.success) return errorToast(res.error);
    setDraft("");
    composerRef.current?.focus();
  };

  return (
    <div className="page messages-page">
      <div className="products-header">
        <div>
          <span className="eyebrow">Inbox</span>
          <h1>
            Messages
            {unreadCount > 0 && <span className="unread-pill">{unreadCount}</span>}
          </h1>
        </div>
      </div>

      <div className="messages-shell">
        {/* ── LEFT ── */}
        <aside className="msg-sidebar">
          <div className="msg-search">
            <input
              type="text"
              placeholder="Search people…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="msg-list">
            {sidebarItems.length === 0 ? (
              <p className="empty-state" style={{ padding: 24, margin: 12 }}>
                {search ? "No one matches your search." : "No conversations yet."}
              </p>
            ) : (
              sidebarItems.map((it) => {
                const isActive = selectedId === it.otherId;
                const preview = it.last
                  ? `${it.last.fromId === user.id ? "You: " : ""}${it.last.body}`
                  : `Start a conversation · ${it.other.role}`;
                return (
                  <button
                    key={it.otherId}
                    className={`msg-item ${isActive ? "active" : ""}`}
                    onClick={() => setSelectedId(it.otherId)}
                  >
                    <span className="msg-avatar">
                      {(it.other.name || "?").charAt(0).toUpperCase()}
                    </span>
                    <span className="msg-body">
                      <span className="msg-name">
                        {it.other.name}
                        <span className={`role-badge role-${it.other.role}`}>
                          {it.other.role}
                        </span>
                      </span>
                      <span className="msg-preview">{preview}</span>
                    </span>
                    {it.unread > 0 && <span className="msg-badge">{it.unread}</span>}
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* ── RIGHT ── */}
        <section className="msg-chat">
          {!active ? (
            <div className="chat-empty">
              <div>
                <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
                <p>Pick a conversation, or search for someone to message.</p>
              </div>
            </div>
          ) : (
            <>
              <header className="chat-header">
                <span className="msg-avatar">
                  {(active.other.name || "?").charAt(0).toUpperCase()}
                </span>
                <div>
                  <strong>{active.other.name}</strong>
                  <small>@{active.other.username} · {active.other.role}</small>
                </div>
              </header>

              <div className="chat-body" ref={chatBodyRef}>
                {active.messages.length === 0 ? (
                  <div className="chat-empty" style={{ background: "transparent", padding: 24 }}>
                    <p>No messages yet — say hi 👋</p>
                  </div>
                ) : (
                  active.messages.map((m, i) => {
                    const prev = active.messages[i - 1];
                    const showDay =
                      !prev ||
                      new Date(m.createdAt).toDateString() !==
                        new Date(prev.createdAt).toDateString();
                    const mine = m.fromId === user.id;
                    return (
                      <Fragment key={m.id}>
                        {showDay && <div className="chat-date">{fmtDay(m.createdAt)}</div>}
                        <div className={`bubble ${mine ? "out" : "in"}`}>
                          {m.body}
                          <small>{fmtTime(m.createdAt)}</small>
                        </div>
                      </Fragment>
                    );
                  })
                )}
              </div>

              <form className="composer" onSubmit={handleSend}>
                <input
                  ref={composerRef}
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={`Message ${active.other.name}…`}
                  autoComplete="off"
                />
                <button type="submit" disabled={!draft.trim()} aria-label="Send">
                  ➤
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default Messages;