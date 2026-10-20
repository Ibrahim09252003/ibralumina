import { useState } from "react";
import api from "../services/api";
import { successToast, errorToast } from "../utils/alerts";

const SOCIALS = [
  { name: "Facebook",  handle: "@ibraluminastore",   href: "https://www.facebook.com/ibrahim.teano.fernandez/" },
  { name: "Instagram", handle: "@ibraluminastore",   href: "https://www.instagram.com/ib_09071967/" },
  { name: "X",         handle: "@ibraluminastore",   href: "https://x.com/VitalBAS1S" },
  { name: "TikTok",    handle: "@ibraluminastore",   href: "https://www.tiktok.com/@vital_basis" },
  { name: "YouTube",   handle: "@ibraluminastore",   href: "https://www.youtube.com/@user-bd8xj4fc1p" },
];

const FAQ = [
  {
    q: "How long does shipping take?",
    a: "Metro Manila: 1–2 business days. Provincial: 3–5 business days. Free on orders over ₱2,500.",
  },
  {
    q: "What is your return policy?",
    a: "30 days from delivery, unused and in original packaging. We'll cover return shipping for defective items.",
  },
  {
    q: "Do you offer a warranty?",
    a: "Yes — every IbraLumina product carries a 2-year limited warranty against manufacturing defects.",
  },
];

const SUBJECTS = [
  "Account concern",
  "Order support",
  "Product question",
  "Payment issue",
  "Returns & warranty",
  "Wholesale / partnership",
  "Something else",
];

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [openFaq, setOpenFaq] = useState(0);
  const [sending, setSending] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      return errorToast("Please fill in your name, email, subject and message.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return errorToast("Please enter a valid email address.");
    }
    if (form.message.trim().length < 10) {
      return errorToast("Message must be at least 10 characters.");
    }

    setSending(true);
    try {
      await api.post("/contact", {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject,
        message: form.message.trim(),
      });
      successToast("Message sent — an admin will review it shortly.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      errorToast(err.message || "Could not send your message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page">
      <div className="section-head">
        <div>
          <span className="eyebrow">Get in touch</span>
          <h1 style={{ fontSize: "clamp(26px, 4vw, 38px)" }}>We'd love to hear from you</h1>
          <p>Support, wholesale, partnerships or just to say hi — all messages land in the same inbox.</p>
        </div>
      </div>

      <div className="contact-layout">
        {/* ── LEFT: info ── */}
        <div>
          <div className="contact-cards">
            <div className="contact-card">
              <div className="cc-icon">📍</div>
              <h3>Visit the studio</h3>
              <p>
                Bantug Bulalo, Burgos Extension<br />
                Cabanatuan City, Nueva Ecija 3100<br />
                Philippines
              </p>
            </div>

            <div className="contact-card">
              <div className="cc-icon">📞</div>
              <h3>Call us</h3>
              <p>
                <a href="tel:+63281234567">+63 (2) 8123-4567</a><br />
                <a href="tel:+639171234567">+63 917 123 4567</a>
              </p>
            </div>

            <div className="contact-card">
              <div className="cc-icon">✉️</div>
              <h3>Email</h3>
              <p>
                <a href="mailto:ibte.fernandez.au@phinmaed.com">ibte.fernandez.au@phinmaed.com</a><br />
                <a href="mailto:support@ibralumina.shop">support@ibralumina.shop</a>
              </p>
            </div>

            <div className="contact-card">
              <div className="cc-icon">🕘</div>
              <h3>Opening hours</h3>
              <p>Mon – Fri · 9:00 AM – 7:00 PM<br />Sat · 10:00 AM – 5:00 PM<br />Sun · Closed</p>
            </div>
          </div>

          <h2 style={{ fontSize: 18, marginBottom: 12 }}>Follow IbraLumina</h2>
          <div className="social-row">
            {SOCIALS.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="social-chip"
              >
                {s.name} <span style={{ color: "var(--muted)", fontWeight: 600 }}>{s.handle}</span>
              </a>
            ))}
          </div>

          <div className="map-frame" style={{ marginTop: 22 }}>
            <iframe
              title="IbraLumina store location — Cabanatuan City"
              src="https://www.openstreetmap.org/export/embed.html?bbox=120.967972%2C15.485819%2C120.983972%2C15.497819&layer=mapnik&marker=15.491819%2C120.975972"
              loading="lazy"
            />
          </div>
        </div>

        {/* ── RIGHT: form + FAQ ── */}
        <div>
          <div className="content" style={{ padding: "26px 26px 30px" }}>
            <h2 style={{ marginTop: 0 }}>Send us a message</h2>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>
              All messages go to the admin inbox for review. We reply within one business day.
            </p>

            <form onSubmit={handleSubmit} style={{ marginTop: 18 }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Your name *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Juan Dela Cruz"
                    maxLength={120}
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="juan@example.com"
                    maxLength={200}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Subject *</label>
                <select name="subject" value={form.subject} onChange={handleChange} required>
                  <option value="">Choose a topic…</option>
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Message *</label>
                <textarea
                  name="message"
                  rows="5"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help…"
                  maxLength={5000}
                />
                <small className="form-hint">{form.message.length} / 5000 characters</small>
              </div>

              <button type="submit" className="button primary full-width" disabled={sending}>
                {sending ? "Sending…" : "Send message"}
              </button>
            </form>
          </div>

          <div className="content" style={{ marginTop: 20, padding: "26px" }}>
            <h2 style={{ marginTop: 0 }}>Frequently asked</h2>
            {FAQ.map((f, i) => (
              <div
                key={f.q}
                style={{
                  borderBottom: i < FAQ.length - 1 ? "1px solid var(--border)" : "none",
                  padding: "14px 0",
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    width: "100%",
                    textAlign: "left",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--ink)",
                  }}
                >
                  {f.q}
                  <span style={{ color: "var(--brand)", fontSize: 18 }}>
                    {openFaq === i ? "−" : "+"}
                  </span>
                </button>
                {openFaq === i && (
                  <p style={{ marginTop: 10, marginBottom: 0, fontSize: 14 }}>
                    {f.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;