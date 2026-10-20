import { useMemo, useState } from "react";
import { useActivity } from "../context/ActivityContext";
import { askConfirm, successToast, errorToast, infoToast } from "../utils/alerts";

const CATEGORY_META = {
  auth:    { icon: "🔐", label: "Authentication" },
  profile: { icon: "👤", label: "Profile"        },
  product: { icon: "📦", label: "Products"       },
  order:   { icon: "🛒", label: "Orders"         },
  account: { icon: "👥", label: "Accounts"       },
  message: { icon: "💬", label: "Messages"       },
  contact: { icon: "✉️", label: "Contact"        },
  system:  { icon: "⚙️", label: "System"         },
};

const meta = (cat) => CATEGORY_META[cat] || CATEGORY_META.system;

const fmtTime = (iso) => {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const fmtAbsolute = (iso) =>
  new Date(iso).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit",
  });

function ActivityLog() {
  const { logs, loading, refresh, clearAll, removeOne } = useActivity();

  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter((l) => {
      if (category && l.category !== category) return false;
      if (!q) return true;
      return (
        l.action?.toLowerCase().includes(q) ||
        l.description?.toLowerCase().includes(q) ||
        l.category?.toLowerCase().includes(q)
      );
    });
  }, [logs, search, category]);

  const stats = useMemo(() => {
    const now = Date.now();
    const oneDay = 86400000;
    const oneWeek = oneDay * 7;
    let today = 0, week = 0;
    const cats = new Set();
    logs.forEach((l) => {
      const age = now - new Date(l.createdAt).getTime();
      if (age < oneDay)  today++;
      if (age < oneWeek) week++;
      cats.add(l.category);
    });
    return { total: logs.length, today, week, categories: cats.size };
  }, [logs]);

  const handleClear = async () => {
    if (logs.length === 0) return infoToast("Nothing to clear.");
    const ok = await askConfirm({
      title: "Clear your activity log?",
      text: `All ${logs.length} entr${logs.length === 1 ? "y" : "ies"} will be permanently deleted.`,
      confirmText: "Clear all",
      icon: "warning",
    });
    if (!ok) return;
    try {
      await clearAll();
      successToast("Activity log cleared");
    } catch (err) {
      errorToast(err.message);
    }
  };

  const handleDelete = async (l) => {
    const ok = await askConfirm({
      title: "Delete this entry?",
      text: l.description,
      confirmText: "Delete",
      icon: "warning",
    });
    if (!ok) return;
    try {
      await removeOne(l.id);
      infoToast("Entry deleted");
    } catch (err) {
      errorToast(err.message);
    }
  };

  return (
    <div className="page activity-page">
      <div className="products-header">
        <div>
          <span className="eyebrow">My account</span>
          <h1>Activity log</h1>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>
            A private timeline of everything your account has done. Spot anything unfamiliar? Change your password immediately.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="button" onClick={refresh} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          {logs.length > 0 && (
            <button className="button delete" onClick={handleClear}>Clear all</button>
          )}
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total events</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🌅</div>
          <div className="stat-info">
            <span className="stat-value">{stats.today}</span>
            <span className="stat-label">Today</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <span className="stat-value">{stats.week}</span>
            <span className="stat-label">This week</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏷️</div>
          <div className="stat-info">
            <span className="stat-value">{stats.categories}</span>
            <span className="stat-label">Categories used</span>
          </div>
        </div>
      </div>

      <div className="filters">
        <input
          className="search-input"
          placeholder="Search activity (description, action, category)…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="filter-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {Object.entries(CATEGORY_META).map(([key, m]) => (
            <option key={key} value={key}>{m.icon} {m.label}</option>
          ))}
        </select>
      </div>

      {loading && logs.length === 0 ? (
        <div className="empty-state">Loading your activity…</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          {logs.length === 0
            ? "No activity yet — sign in, place an order, or edit a product and it will appear here."
            : "No entries match your search."}
        </div>
      ) : (
        <ol className="activity-list">
          {filtered.map((l) => {
            const m = meta(l.category);
            return (
              <li key={l.id} className="activity-item">
                <span className={`activity-icon cat-${l.category}`} aria-hidden="true">
                  {m.icon}
                </span>
                <div className="activity-body">
                  <div className="activity-main">
                    <span className="activity-description">{l.description}</span>
                    <span className={`activity-badge cat-${l.category}`}>{m.label}</span>
                  </div>
                  <div className="activity-meta">
                    <span className="activity-code">{l.action}</span>
                    <span className="dot">·</span>
                    <span title={fmtAbsolute(l.createdAt)}>{fmtTime(l.createdAt)}</span>
                    <span className="dot">·</span>
                    <span>{fmtAbsolute(l.createdAt)}</span>
                  </div>
                </div>
                <button
                  className="activity-delete"
                  onClick={() => handleDelete(l)}
                  aria-label="Delete entry"
                  title="Delete entry"
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

export default ActivityLog;