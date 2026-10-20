import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PasswordInput from "../components/PasswordInput";
import { successToast, errorToast, popInfo } from "../utils/alerts";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  /* ── Paste protection ──────────────────────────────────────────────
     Copy/pasting credentials into the login form is a common vector for
     clipboard hijacking and injected payloads, so we block it here.
     ----------------------------------------------------------------- */
  const blockPaste = (e) => {
    e.preventDefault();
    errorToast("Pasting is disabled for security — please type it in.");
  };

  const blockPasteHotkey = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
      blockPaste(e);
    }
  };

  const handleForgot = () => {
    popInfo(
      "Forgot your password?",
      "Password resets are handled by an administrator. Please contact the store admin and they'll issue a new password for your account."
    );
  };

  const handleSubmit = async (e) => {            // ← async
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(username.trim(), password);   // ← await
    setLoading(false);

    if (result.success) {
      successToast(`Welcome back, ${result.user.name.split(" ")[0]}!`);
      navigate(result.user.role === "buyer" ? "/buyer" : "/dashboard", { replace: true });
    } else {
      setError(result.error);
      errorToast(result.error);
    }
  };

  return (
    <div className="page login-page">
      <div className="login-card">
        <h1>Welcome back 👋</h1>
        <p className="login-subtitle">Sign in to continue to IbraLumina.</p>

        {error && <div className="error-message">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onPaste={blockPaste}
              onDrop={blockPaste}
              onKeyDown={blockPasteHotkey}
              placeholder="Enter your username"
              autoComplete="off"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="password">Password</label>
              <button
                type="button"
                className="forgot-link"
                onClick={handleForgot}
              >
                Forgot password?
              </button>
            </div>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onPaste={blockPaste}
              onDrop={blockPaste}
              onKeyDown={blockPasteHotkey}
              placeholder="Enter your password"
              autoComplete="off"
              required
            />
          </div>

          <button type="submit" className="button primary full-width" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="register-footer">
          New to IbraLumina? <Link to="/register">Create an account</Link>
        </p>
        <p className="login-footer">
          <Link to="/">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;