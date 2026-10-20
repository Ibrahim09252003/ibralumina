import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import PasswordInput from "../components/PasswordInput";
import { askConfirm, successToast, errorToast, infoToast } from "../utils/alerts";

const AVATAR_EMOJIS = ["🎧", "⚡", "🌟", "🚀", "🦊", "🐼", "🎨", "🔥", "💎", "🌈", "🍀", "👾"];

/* Resize a user-picked image down to ~256×256 JPEG, returned as a data URL. */
const resizeImage = (file, maxSize = 256) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

function Profile() {
  const { user, updateProfile, changePassword, deleteOwnAccount } = useAuth();
  const { theme, setTheme, themes } = useTheme();
  const navigate = useNavigate();

  const [details, setDetails] = useState({
    name: user.name || "",
    username: user.username || "",
    email: user.email || "",
    phone: user.phone || "",
  });
  const [detailsError, setDetailsError] = useState("");

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwError, setPwError] = useState("");

  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const isAdmin = user.role === "admin";

  /* ── avatar helpers ── */
  const avatarVal    = user.avatar || "";
  const isImageAva   = avatarVal.startsWith("data:image/");
  const isEmojiAva   = !!avatarVal && !isImageAva;
  const displayInitial = (user.name || user.username || "?").charAt(0).toUpperCase();

  const saveAvatar = async (value) => {
    const res = await updateProfile({ avatar: value });
    if (!res.success) return errorToast(res.error);
    successToast(value ? "Avatar updated" : "Avatar reset to default");
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return errorToast("Please pick an image file.");
    if (file.size > 5 * 1024 * 1024)    return errorToast("Image must be under 5 MB.");
    try {
      const dataUrl = await resizeImage(file, 256);
      await saveAvatar(dataUrl);
    } catch {
      errorToast("Couldn't process that image.");
    }
    e.target.value = "";
  };

  /* ── existing handlers ── */
  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setDetailsError("");

    if (!details.name.trim())     return setDetailsError("Full name is required.");
    if (!details.username.trim()) return setDetailsError("Username is required.");
    if (details.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) {
      return setDetailsError("Please enter a valid email address.");
    }

    const res = await updateProfile({
      name: details.name.trim(),
      username: details.username.trim(),
      email: details.email.trim(),
      phone: details.phone.trim(),
    });
    if (!res.success) {
      setDetailsError(res.error);
      errorToast(res.error);
      return;
    }
    successToast("Profile updated");
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwError("");

    if (pw.next.length < 6)     return setPwError("New password must be at least 6 characters.");
    if (pw.next !== pw.confirm) return setPwError("New passwords don't match.");
    if (pw.next === pw.current) return setPwError("New password must be different from the current one.");

    const res = await changePassword(pw.current, pw.next);
    if (!res.success) {
      setPwError(res.error);
      errorToast(res.error);
      return;
    }
    setPw({ current: "", next: "", confirm: "" });
    successToast("Password updated");
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    setDeleteError("");

    if (isAdmin) return setDeleteError("Admin accounts can't be deleted from the UI.");
    if (!deletePassword) return setDeleteError("Enter your password to confirm.");

    const ok = await askConfirm({
      title: "Delete your account?",
      text: "This permanently removes your profile, cart and order history. This can't be undone.",
      confirmText: "Yes, delete it",
      icon: "warning",
    });
    if (!ok) return;

    const res = await deleteOwnAccount(deletePassword);
    if (!res.success) {
      setDeleteError(res.error);
      errorToast(res.error);
      return;
    }
    infoToast("Your account has been deleted");
    navigate("/");
  };

  return (
    <div className="page profile-page">
      <div className="products-header">
        <div>
          <span className="eyebrow">My account</span>
          <h1>Profile &amp; settings</h1>
        </div>
      </div>

      {/* ── Identity card ── */}
      <div className="profile-identity">
        <div className={`profile-avatar ${isImageAva ? "image" : ""}`}>
          {isImageAva
            ? <img src={avatarVal} alt="" />
            : isEmojiAva
              ? <span className="profile-avatar-emoji">{avatarVal}</span>
              : displayInitial}
        </div>
        <div className="profile-identity-info">
          <h2>{user.name}</h2>
          <p>
            @{user.username} ·{" "}
            <span className={`role-badge role-${user.role}`}>{user.role}</span>
          </p>
          {user.registeredAt && (
            <p className="profile-meta">
              Member since {new Date(user.registeredAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* ── Profile picture ── */}
      <section className="profile-section">
        <div className="profile-section-head">
          <h2>Profile picture</h2>
          <p>Pick an emoji, upload a photo, or keep the default letter.</p>
        </div>

        <div className="avatar-picker">
          <button
            type="button"
            className={`avatar-option ${!avatarVal ? "selected" : ""}`}
            onClick={() => saveAvatar("")}
            title="Default"
          >
            <span className="avatar-preview default">{displayInitial}</span>
            <small>Default</small>
          </button>

          {AVATAR_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className={`avatar-option ${avatarVal === emoji ? "selected" : ""}`}
              onClick={() => saveAvatar(emoji)}
              title={emoji}
            >
              <span className="avatar-preview emoji">{emoji}</span>
            </button>
          ))}

          <label
            className={`avatar-option upload ${isImageAva ? "selected" : ""}`}
            title="Upload image"
          >
            {isImageAva ? (
              <span className="avatar-preview image">
                <img src={avatarVal} alt="" />
              </span>
            ) : (
              <span className="avatar-preview upload">📷</span>
            )}
            <small>Upload</small>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              hidden
            />
          </label>
        </div>
      </section>

      {/* ── Appearance ── */}
      <section className="profile-section">
        <div className="profile-section-head">
          <h2>Appearance</h2>
          <p>Choose a colour theme. Your choice is saved to this browser.</p>
        </div>

        <div className="theme-grid">
          {themes.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`theme-card ${theme === t.id ? "selected" : ""}`}
              onClick={() => setTheme(t.id)}
              data-theme-preview={t.id}
            >
              <span className="theme-swatch" />
              <strong>{t.name}</strong>
              <small>{t.desc}</small>
              {theme === t.id && <span className="theme-check">✓</span>}
            </button>
          ))}
        </div>
      </section>

      {/* ── Account details ── */}
      <section className="profile-section">
        <div className="profile-section-head">
          <h2>Account details</h2>
          <p>Update your name, username, email and phone number.</p>
        </div>

        {detailsError && <div className="error-message">⚠️ {detailsError}</div>}

        <form onSubmit={handleDetailsSubmit}>
          <div className="form-group">
            <label>Full name *</label>
            <input
              value={details.name}
              onChange={(e) => setDetails({ ...details, name: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Username *</label>
              <input
                value={details.username}
                onChange={(e) => setDetails({ ...details, username: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={details.email}
                onChange={(e) => setDetails({ ...details, email: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              value={details.phone}
              onChange={(e) => setDetails({ ...details, phone: e.target.value })}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="button primary">Save changes</button>
          </div>
        </form>
      </section>

      {/* ── Change password ── */}
      <section className="profile-section">
        <div className="profile-section-head">
          <h2>Change password</h2>
          <p>You'll need to enter your current password to set a new one.</p>
        </div>

        {pwError && <div className="error-message">⚠️ {pwError}</div>}

        <form onSubmit={handlePasswordSubmit} autoComplete="off">
          <div className="form-group">
            <label>Current password *</label>
            <PasswordInput
              value={pw.current}
              onChange={(e) => setPw({ ...pw, current: e.target.value })}
              placeholder="Enter current password"
              autoComplete="off"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>New password *</label>
              <PasswordInput
                value={pw.next}
                onChange={(e) => setPw({ ...pw, next: e.target.value })}
                placeholder="Min 6 characters"
                autoComplete="new-password"
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm new password *</label>
              <PasswordInput
                value={pw.confirm}
                onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                placeholder="Re-enter new password"
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="button primary">Update password</button>
          </div>
        </form>
      </section>

      {/* ── Danger zone ── */}
      <section className="profile-section danger-zone">
        <div className="profile-section-head">
          <h2>Danger zone</h2>
          <p>
            {isAdmin
              ? "Admin accounts can't be deleted from the UI. Ask a developer to remove it from the data store."
              : "Permanently delete your account, cart and order history."}
          </p>
        </div>

        {deleteError && <div className="error-message">⚠️ {deleteError}</div>}

        <form onSubmit={handleDelete} autoComplete="off">
          <div className="form-group">
            <label>Confirm your password *</label>
            <PasswordInput
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="off"
              disabled={isAdmin}
              required={!isAdmin}
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="button delete"
              disabled={isAdmin}
              title={isAdmin ? "Admin accounts can't be deleted" : undefined}
            >
              Delete my account
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default Profile;