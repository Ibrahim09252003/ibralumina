import { Link } from "react-router-dom";

const VALUES = [
  { icon: "🔍", title: "Curated, not crowded", text: "We stock fewer than 40 products at a time. If it isn't genuinely good, it doesn't make the shelf." },
  { icon: "🌱", title: "Built to last",         text: "We favour repairable, recyclable and durable over disposable. Better gear, less waste." },
  { icon: "💬", title: "People over pixels",    text: "Real humans answer your messages — no bots, no scripts, no ticket numbers." },
  { icon: "🇵🇭", title: "Proudly local", text: "Designed and shipped from Cabanatuan City, with free nationwide delivery." },
];

const STATS = [
  { value: "2019", label: "Founded" },
  { value: "12k+", label: "Customers" },
  { value: "28",   label: "Products" },
  { value: "4.8★", label: "Avg. rating" },
];

const TEAM = [
  { name: "Ibrahim Fernandez", role: "Founder & CEO",      initial: "IF" },
  { name: "Camille Reyes",     role: "Head of Curation",   initial: "CR" },
  { name: "Noel Santos",       role: "Lead Engineer",      initial: "NS" },
  { name: "Trisha Lim",        role: "Customer Experience", initial: "TL" },
];

function About() {
  return (
    <div className="page">
      <section className="about-hero">
        <span className="eyebrow">Our story</span>
        <h1>We make good gear easy to find.</h1>
        <p>
          IbraLumina started in 2019 as a two-person operation in a Cabanatuan City
          apartment. We were tired of scrolling through thousands of near-identical
          listings, so we decided to do the work ourselves — testing, comparing and
          selecting only the products we'd actually recommend to a friend.
        </p>
        <p>
          Today we ship nationwide, but the rule hasn't changed: if it wouldn't make
          it into our own homes, it doesn't make it onto the site.
        </p>
      </section>

      <div className="about-stats">
        {STATS.map((s) => (
          <div className="about-stat" key={s.label}>
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="content">
        <h2>What we stand for</h2>
        <div className="value-grid">
          {VALUES.map((v) => (
            <div className="value-card" key={v.title}>
              <div className="vc-icon">{v.icon}</div>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </div>
          ))}
        </div>

        <h2>How we work</h2>
        <ul>
          <li><strong>Source carefully.</strong> We work with a small number of manufacturers we've visited or vetted in person.</li>
          <li><strong>Test everything.</strong> Each product spends at least two weeks in daily use before it goes live.</li>
          <li><strong>Price honestly.</strong> No inflated "was" prices, no countdown timers designed to rush you.</li>
          <li><strong>Support after the sale.</strong> A 2-year warranty and a 30-day return window on everything.</li>
        </ul>

        <h2>Under the hood</h2>
        <p>
          This storefront is a React + Vite single-page application. State is managed
          with the Context API (auth, products, cart), persisted to
          <code style={{ background: "var(--brand-50)", padding: "2px 8px", borderRadius: 6, margin: "0 4px", color: "var(--brand-700)", fontWeight: 700 }}>localStorage</code>
          so your cart survives a refresh, and all interactions use SweetAlert2 for
          accessible, branded confirmations.
        </p>

        <h2>The team</h2>
        <div className="value-grid">
          {TEAM.map((t) => (
            <div className="value-card" key={t.name}>
              <div className="quote-avatar" style={{ marginBottom: 12 }}>{t.initial}</div>
              <h3>{t.name}</h3>
              <p>{t.role}</p>
            </div>
          ))}
        </div>

        <p style={{ marginTop: 28 }}>
          Questions? Head over to our <Link to="/contact">contact page</Link> — we
          usually reply within a few hours.
        </p>
      </div>
    </div>
  );
}

export default About;