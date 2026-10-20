import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PasswordInput from "../components/PasswordInput";
import { successToast, errorToast } from "../utils/alerts";

const COUNTRY_CODES = [
  { code: "+63",  flag: "🇵🇭", name: "Philippines" },
  { code: "+1",   flag: "🇺🇸", name: "United States" },
  { code: "+44",  flag: "🇬🇧", name: "United Kingdom" },
  { code: "+61",  flag: "🇦🇺", name: "Australia" },
  { code: "+64",  flag: "🇳🇿", name: "New Zealand" },
  { code: "+81",  flag: "🇯🇵", name: "Japan" },
  { code: "+82",  flag: "🇰🇷", name: "South Korea" },
  { code: "+86",  flag: "🇨🇳", name: "China" },
  { code: "+852", flag: "🇭🇰", name: "Hong Kong" },
  { code: "+65",  flag: "🇸🇬", name: "Singapore" },
  { code: "+60",  flag: "🇲🇾", name: "Malaysia" },
  { code: "+62",  flag: "🇮🇩", name: "Indonesia" },
  { code: "+66",  flag: "🇹🇭", name: "Thailand" },
  { code: "+84",  flag: "🇻🇳", name: "Vietnam" },
  { code: "+91",  flag: "🇮🇳", name: "India" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+49",  flag: "🇩🇪", name: "Germany" },
  { code: "+33",  flag: "🇫🇷", name: "France" },
  { code: "+39",  flag: "🇮🇹", name: "Italy" },
  { code: "+34",  flag: "🇪🇸", name: "Spain" },
  { code: "+7",   flag: "🇷🇺", name: "Russia" },
  { code: "+55",  flag: "🇧🇷", name: "Brazil" },
  { code: "+52",  flag: "🇲🇽", name: "Mexico" },
  { code: "+20",  flag: "🇪🇬", name: "Egypt" },
  { code: "+27",  flag: "🇿🇦", name: "South Africa" },
];

function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    countryCode: "+63",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const preventPaste = (e) => e.preventDefault();

  const nameKeyDown = (e) => {
    if (e.key.length === 1 && !/^[a-zA-Z\s\-']$/.test(e.key)) e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") e.preventDefault();
  };

  const phoneKeyDown = (e) => {
    if (e.key.length === 1 && !/^\d$/.test(e.key)) e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") e.preventDefault();
  };

  const usernameKeyDown = (e) => {
    if (e.key === " ") e.preventDefault();
    if (e.key.length === 1 && !/^[a-zA-Z0-9_]$/.test(e.key)) e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") e.preventDefault();
  };

  const blockPasteKey = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") e.preventDefault();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let clean = value;
    if (name === "firstName" || name === "lastName") clean = value.replace(/[^a-zA-Z\s\-']/g, "");
    if (name === "phone")    clean = value.replace(/\D/g, "");
    if (name === "username") clean = value.replace(/[^a-zA-Z0-9_]/g, "");
    setForm((prev) => ({ ...prev, [name]: clean }));
  };

  const fail = (msg) => {
    setError(msg);
    errorToast(msg);
  };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");

    const fn = form.firstName.trim();
    const ln = form.lastName.trim();

    if (fn.length < 2) return fail("First name must be at least 2 letters.");
    if (ln.length < 2) return fail("Last name must be at least 2 letters.");
    if (/\d/.test(fn) || /\d/.test(ln)) return fail("Names cannot contain numbers.");
    if (form.username.length < 3) return fail("Username must be at least 3 characters.");
    if (/\s/.test(form.username)) return fail("Username cannot contain spaces.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return fail("Please enter a valid email address.");
    if (!/^\d{7,15}$/.test(form.phone)) return fail("Phone number must be 7–15 digits (numbers only).");
    if (form.password.length < 6) return fail("Password must be at least 6 characters.");
    if (form.password !== form.confirmPassword) return fail("Passwords do not match.");

    setLoading(true);
    const result = await register({
      firstName: fn,
      lastName: ln,
      username: form.username.trim(),
      email: form.email.trim(),
      phone: `${form.countryCode}${form.phone}`,
      password: form.password,
    });
    setLoading(false);

    if (result.success) {
      successToast(`Account created — welcome, ${fn}!`);
      navigate("/buyer", { replace: true });
    } else {
      fail(result.error);
    }
  };

  const selected = COUNTRY_CODES.find((c) => c.code === form.countryCode);

  return (
    <div className="page register-page">
      <div className="register-card">
        <h1>Create your account</h1>
        <p className="register-subtitle">
          Join IbraLumina to shop curated tech &amp; lifestyle gear. All fields are required.
        </p>

        {error && <div className="error-message">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="form-row">
            <div className="form-group">
              <label>First name *</label>
              <input
                name="firstName" value={form.firstName} onChange={handleChange}
                onKeyDown={nameKeyDown} onPaste={preventPaste} onDrop={preventPaste}
                placeholder="Juan" autoComplete="off" required
              />
            </div>
            <div className="form-group">
              <label>Last name *</label>
              <input
                name="lastName" value={form.lastName} onChange={handleChange}
                onKeyDown={nameKeyDown} onPaste={preventPaste} onDrop={preventPaste}
                placeholder="Dela Cruz" autoComplete="off" required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Username *</label>
            <input
              name="username" value={form.username} onChange={handleChange}
              onKeyDown={usernameKeyDown} onPaste={preventPaste} onDrop={preventPaste}
              placeholder="juandelacruz" autoComplete="off" required
            />
            <small className="form-hint">Letters, numbers and underscores only</small>
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              name="email" type="email" value={form.email} onChange={handleChange}
              onKeyDown={blockPasteKey} onPaste={preventPaste} onDrop={preventPaste}
              placeholder="juan@example.com" autoComplete="off" required
            />
          </div>

          <div className="form-group">
            <label>Phone number *</label>
            <div className="phone-input">
              <select
                name="countryCode" value={form.countryCode} onChange={handleChange}
                className="country-select" title={selected?.name}
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                ))}
              </select>
              <input
                name="phone" type="tel" inputMode="numeric" value={form.phone}
                onChange={handleChange} onKeyDown={phoneKeyDown}
                onPaste={preventPaste} onDrop={preventPaste}
                placeholder="9123456789" maxLength={15} autoComplete="off" required
              />
            </div>
            <small className="form-hint">
              Selected: {selected?.flag} {selected?.code} — {selected?.name} · digits only
            </small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password *</label>
              <PasswordInput
                name="password" value={form.password} onChange={handleChange}
                onKeyDown={blockPasteKey} onPaste={preventPaste} onDrop={preventPaste}
                placeholder="Min 6 characters" autoComplete="new-password" required
              />
            </div>
            <div className="form-group">
              <label>Confirm password *</label>
              <PasswordInput
                name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                onKeyDown={blockPasteKey} onPaste={preventPaste} onDrop={preventPaste}
                placeholder="Re-enter password" autoComplete="new-password" required
              />
            </div>
          </div>

          <button type="submit" className="button primary full-width" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="register-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;