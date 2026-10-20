import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { askConfirm, successToast, errorToast, infoToast } from "../utils/alerts";

const ROLES = ["admin", "manager", "buyer"];

const EMPTY_FORM = {
  name: "",
  username: "",
  email: "",
  phone: "",
  role: "buyer",
  password: "",
};

function ManageAccounts() {
  const {
    accounts, user,
    createAccount, resetPassword, deleteAccount,
  } = useAuth();

  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [modal, setModal]           = useState(null); // { mode: "create" | "password", account? }
  const [form, setForm]             = useState(EMPTY_FORM);
  const [pwd, setPwd]               = useState("");
  const [error, setError]           = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return accounts.filter((a) => {
      const matchQ =
        !q ||
        a.name?.toLowerCase().includes(q) ||
        a.username?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q);
      const matchRole = !roleFilter || a.role === roleFilter;
      return matchQ && matchRole;
    });
  }, [accounts, search, roleFilter]);

  /* ── modal helpers ── */

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setError("");
    setModal({ mode: "create" });
  };

  const openPassword = (a) => {
    setPwd("");
    setError("");
    setModal({ mode: "password", account: a });
  };

  const closeModal = () => {
    setModal(null);
    setError("");
  };

  /* ── actions ── */

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim())     { setError("Full name is required."); return; }
    if (!form.username.trim()) { setError("Username is required."); return; }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    const res = await createAccount({
      name: form.name,
      username: form.username,
      email: form.email,
      phone: form.phone,
      role: form.role,
      password: form.password,
    });
    if (!res.success) { setError(res.error); return; }
    successToast("Account created");
    closeModal();
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    const res = await resetPassword(modal.account.id, pwd);
    if (!res.success) { setError(res.error); return; }
    successToast(`New password set for ${modal.account.name}`);
    closeModal();
  };

  const handleDelete = async (a) => {
    if (a.id === user.id) {
      return errorToast("You can't delete the account you're signed in with.");
    }
    const ok = await askConfirm({
      title: "Delete this account?",
      text: `${a.name} (@${a.username}) will lose access permanently.`,
      confirmText: "Delete",
      icon: "warning",
    });
    if (!ok) return;

    const res = await deleteAccount(a.id);
    if (!res.success) return errorToast(res.error);
    infoToast("Account deleted");
  };

  return (
    <div className="page accounts-page">
      <div className="products-header">
        <div>
          <span className="eyebrow">Administration</span>
          <h1>Manage accounts</h1>
        </div>
        <button className="button primary" onClick={openCreate}>+ Add account</button>
      </div>

      <div className="filters">
        <input
          className="search-input"
          placeholder="Search by name, username or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="filter-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No accounts match your search.</div>
      ) : (
        <div className="account-table-wrap">
          <table className="account-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Username</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th className="ta-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div className="account-user">
                      <span className="account-avatar">
                        {a.avatar && a.avatar.startsWith("data:image/") ? (
                          <img
                            src={a.avatar}
                            alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                          />
                        ) : (
                          a.avatar || (a.name || a.username || "?").charAt(0).toUpperCase()
                        )}
                      </span>
                      <div>
                        <strong>{a.name || "—"}</strong>
                        <small>
                          {a.id === user.id ? "You · " : ""}
                          Joined{" "}
                          {a.registeredAt
                            ? new Date(a.registeredAt).toLocaleDateString()
                            : "—"}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>@{a.username}</td>
                  <td>{a.email || "—"}</td>
                  <td>{a.phone || "—"}</td>
                  <td><span className={`role-badge role-${a.role}`}>{a.role}</span></td>
                  <td>
                    <div className="account-actions">
                      <button
                        className="button small edit"
                        onClick={() => openPassword(a)}
                        disabled={a.role === "admin"}
                        title={
                          a.id === user.id
                            ? "Change your own password from Profile → Change password"
                            : a.role === "admin"
                              ? "Admin passwords can't be reset from here"
                              : "Reset password"
                        }
                      >
                        Reset password
                      </button>

                      <button
                        className="button small delete"
                        onClick={() => handleDelete(a)}
                        disabled={a.id === user.id || a.role === "admin"}
                        title={
                          a.id === user.id   ? "You can't delete your own account" :
                          a.role === "admin" ? "Admin accounts can't be deleted"   :
                                               "Delete account"
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">
              {modal.mode === "create"   && "Add account"}
              {modal.mode === "password" && `Reset password — ${modal.account.name}`}
            </h2>

            {error && <div className="error-message">⚠️ {error}</div>}

            {modal.mode === "password" ? (
              <form onSubmit={handleResetPassword}>
                <div className="form-group">
                  <label>New password *</label>
                  <input
                    type="text"
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    placeholder="Min 6 characters"
                    autoFocus
                    required
                  />
                  <small className="form-hint">
                    Share this with the user. They can change it after signing in.
                  </small>
                </div>
                <div className="form-actions">
                  <button type="button" className="button" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="button primary">Set password</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCreate}>
                <div className="form-group">
                  <label>Full name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Username *</label>
                    <input
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <select
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                {form.role === "admin" && (
                  <div className="warning-note">
                    ⚠️ Admin accounts have full access and can't be deleted or demoted
                    later. Grant this role carefully.
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="text"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min 6 characters"
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="button" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="button primary">Create account</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageAccounts;