import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────
   Rule-based "Lumi" assistant.
   Each rule = { test: RegExp, reply: string }.
   First match wins; otherwise FALLBACK is used.
   ───────────────────────────────────────────── */
const RULES = [
  { test: /^(hi|hello|hey|good (morning|afternoon|evening))\b/i,
    reply: "Hello! 👋 I'm Lumi, your IbraLumina assistant. Ask me about shipping, returns, orders, or products — or tap a quick reply below." },

  { test: /(ship|deliver|how long|arrive)/i,
    reply: "🚚 Shipping is free on orders over ₱2,500. Metro Manila arrives in 1–2 business days; provincial areas in 3–5 business days. You'll get a tracking update once your order is marked Shipped." },

  { test: /(return|refund|money back)/i,
    reply: "↩️ You have 30 days from delivery to return unused items in original packaging. We cover return shipping for defective products. Just message a manager from the Messages page and they'll arrange it." },

  { test: /(warranty|guarantee|defect)/i,
    reply: "🛡️ Every IbraLumina product includes a 2-year limited warranty against manufacturing defects. Keep your order ID handy — support will handle the rest." },

  { test: /(track|where.*order|order.*status|shipped|my orders)/i,
    reply: "📦 Open **My Orders** from the menu to see live status (Pending → Shipped → Delivered). Buyers can cancel a Pending order and the stock is restored automatically." },

  { test: /(pay|payment|gcash|maya|card|visa|mastercard|paypal)/i,
    reply: "💳 We accept Visa, Mastercard, GCash, Maya and PayPal. All checkout confirmations are handled securely through SweetAlert2 prompts." },

  { test: /(contact|support|help|human|email|phone|call)/i,
    reply: "💬 The fastest way to reach a human is the Messages page — buyers chat with a manager, managers can escalate to an admin. Or use the Contact page for email and phone details." },

  { test: /(account|register|sign.?up|password|login)/i,
    reply: "🔐 Use the Register link to create a buyer account. Forgot your password? An admin can reset it for you from Manage Accounts — just ask via the Contact page." },

  { test: /(price|discount|sale|promo|coupon|cheap)/i,
    reply: "🏷️ Current prices are shown on every product card. New season drops and member pricing appear on the Home page hero — keep an eye there." },

  { test: /(product|catalog|what.*sell|stock|available)/i,
    reply: "🛍️ We stock 18 curated products across Audio, Wearables, Workspace, Photography, Home, Fitness, Fashion and Accessories. Browse them all on the Shop page." },

  { test: /(thank|thanks|ty)\b/i,
    reply: "Anytime! 😊 If you need anything else, just ask." },

  { test: /(bye|goodbye|see you)/i,
    reply: "Take care! 👋 Come back soon." },
];

const FALLBACK =
  "I'm not sure I caught that. 🤔 Try asking about shipping, returns, warranty, order tracking, payments, or contact info — or message a human from the Messages page.";

const QUICK = ["Shipping", "Returns", "Warranty", "Track order", "Contact"];

const answer = (text) => {
  for (const rule of RULES) if (rule.test.test(text)) return rule.reply;
  return FALLBACK;
};

const fmt = (d) =>
  d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! I'm Lumi 👋 — IbraLumina's assistant. Ask me anything, or tap a quick reply below.", at: new Date() },
  ]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = (text) => {
    const clean = text.trim();
    if (!clean) return;
    setMessages((m) => [...m, { from: "user", text: clean, at: new Date() }]);
    setDraft("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { from: "bot", text: answer(clean), at: new Date() }]);
    }, 550);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    send(draft);
  };

  return (
    <>
      <button
        type="button"
        className={`chatbot-toggle ${open ? "open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat"}
        title={open ? "Close chat" : "Chat with Lumi"}
      >
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <div className="chatbot-panel" role="dialog" aria-label="Chatbot">
          <header className="chatbot-header">
            <span className="chatbot-avatar">🤖</span>
            <div>
              <strong>Lumi</strong>
              <small>IbraLumina assistant · online</small>
            </div>
          </header>

          <div className="chatbot-body" ref={bodyRef}>
            {messages.map((m, i) => (
              <div key={i} className={`bubble ${m.from === "user" ? "out" : "in"}`}>
                {m.text}
                <small>{fmt(m.at)}</small>
              </div>
            ))}
            {typing && (
              <div className="bubble in typing">
                <span /><span /><span />
              </div>
            )}
          </div>

          <div className="chatbot-quick">
            {QUICK.map((q) => (
              <button key={q} type="button" onClick={() => send(q)}>
                {q}
              </button>
            ))}
          </div>

          <form className="chatbot-form" onSubmit={onSubmit}>
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask Lumi anything…"
              aria-label="Chat message"
            />
            <button type="submit" disabled={!draft.trim()} aria-label="Send">
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}