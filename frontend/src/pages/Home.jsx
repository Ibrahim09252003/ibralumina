import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/ProductContext";
import { CATEGORIES } from "../data/categories";
import { peso } from "../utils/format";

const FEATURES = [
  { icon: "🚚", title: "Free Nationwide Shipping", text: "On every order over ₱2,500 — delivered in 2–4 days." },
  { icon: "🛡️", title: "2-Year Warranty",           text: "Every IbraLumina product is covered, no questions asked." },
  { icon: "↩️", title: "30-Day Easy Returns",       text: "Changed your mind? Send it back, we'll refund you." },
  { icon: "💬", title: "Real Human Support",        text: "Chat with our team 7 days a week, 9am–7pm." },
];

const TESTIMONIALS = [
  {
    stars: "★★★★★",
    text: "The Aurora headphones completely changed my commute. The noise cancelling is unreal for the price.",
    name: "Mika R.",
    role: "Product Designer",
    initial: "M",
  },
  {
    stars: "★★★★★",
    text: "Ordered a desk lamp and keyboard on a Tuesday, they arrived Thursday. Packaging felt like a gift.",
    name: "Paolo S.",
    role: "Software Engineer",
    initial: "P",
  },
  {
    stars: "★★★★☆",
    text: "Great curation. Everything on the site feels like it was chosen by someone who actually uses it.",
    name: "Andrea L.",
    role: "Content Creator",
    initial: "A",
  },
];

function Home() {
  const { user } = useAuth();
  const { products } = useProducts();

  const isBuyer = user?.role === "buyer";
  const isAdmin = user && (user.role === "admin" || user.role === "manager");

  const featured = [...products].sort((a, b) => b.rating - a.rating).slice(0, 4);

  return (
    <div className="page">
      {/* ─────────── HERO ─────────── */}
      <section className="hero">
        <div className="hero-glow" aria-hidden="true" />
        <span className="hero-pill">✨ New season drop — up to 40% off</span>

        <h1>
          Everyday tech &amp; lifestyle,{" "}
          <span className="grad-text">beautifully curated.</span>
        </h1>

        <p>
          {isBuyer
            ? "Welcome back. Discover fresh arrivals picked for the way you live and work."
            : "IbraLumina brings together the gear we actually use — audio, workspace, wearables and the small things that make a big difference."}
        </p>

        <div className="hero-actions">
          {!user && (
            <>
              <Link to="/register" className="button primary">Create an account</Link>
              <Link to="/login" className="button ghost">Sign in</Link>
            </>
          )}
          {isBuyer && (
            <>
              <Link to="/shop" className="button primary">Start shopping</Link>
              <Link to="/orders" className="button ghost">Track my orders</Link>
            </>
          )}
          {isAdmin && (
            <>
              <Link to="/dashboard" className="button primary">Open dashboard</Link>
              <Link to="/products" className="button ghost">Manage products</Link>
            </>
          )}
        </div>

        <div className="hero-stats">
          <div className="hero-stat"><strong>18+</strong><span>Curated products</span></div>
          <div className="hero-stat"><strong>8</strong><span>Categories</span></div>
          <div className="hero-stat"><strong>12k+</strong><span>Happy customers</span></div>
          <div className="hero-stat"><strong>4.8★</strong><span>Average rating</span></div>
        </div>
      </section>

      {/* ─────────── CATEGORIES ─────────── */}
      <div className="section-head">
        <div>
          <span className="eyebrow">Browse</span>
          <h2>Shop by category</h2>
          <p>Eight collections, each hand-picked for quality and longevity.</p>
        </div>
      </div>

      <div className="category-grid" style={{ marginBottom: 64 }}>
        {CATEGORIES.map((c) => (
          <Link key={c.name} to={isBuyer ? "/shop" : "/register"} className="category-tile">
            <span className="ct-icon">{c.icon}</span>
            <strong>{c.name}</strong>
            <small>{c.blurb}</small>
          </Link>
        ))}
      </div>

      {/* ─────────── FEATURED ─────────── */}
      <div className="section-head">
        <div>
          <span className="eyebrow">Top rated</span>
          <h2>Featured this week</h2>
          <p>The pieces our customers keep coming back for.</p>
        </div>
        {isBuyer && <Link to="/shop" className="button small ghost">View all</Link>}
      </div>

      <div className="product-grid" style={{ marginBottom: 64 }}>
        {featured.map((p) => (
          <article className="product-card" key={p.id}>
            <div className="product-media">
              <img src={p.image} alt={p.name} loading="lazy" />
              {p.stock < 10 && <span className="stock-flag low">Only {p.stock} left</span>}
            </div>
            <div className="product-info">
              <span className="product-category">{p.category}</span>
              <h3>{p.name}</h3>
              <p className="product-rating">★ {p.rating} / 5.0</p>
              <p className="product-price">{peso(p.price)}</p>
              {isBuyer && (
                <Link to="/shop" className="button primary small full-width">Shop now</Link>
              )}
            </div>
          </article>
        ))}
      </div>

      {/* ─────────── WHY IBRA-LUMINA ─────────── */}
      <div className="section-head">
        <div>
          <span className="eyebrow">Why IbraLumina</span>
          <h2>Built around the customer</h2>
        </div>
      </div>

      <section className="feature-grid">
        {FEATURES.map((f) => (
          <div className="feature-card" key={f.title}>
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </div>
        ))}
      </section>

      {/* ─────────── TESTIMONIALS ─────────── */}
      <div className="section-head">
        <div>
          <span className="eyebrow">Reviews</span>
          <h2>What people are saying</h2>
        </div>
      </div>

      <section className="quote-grid">
        {TESTIMONIALS.map((t) => (
          <div className="quote-card" key={t.name}>
            <div className="quote-stars">{t.stars}</div>
            <p>“{t.text}”</p>
            <div className="quote-author">
              <div className="quote-avatar">{t.initial}</div>
              <div>
                <strong>{t.name}</strong>
                <small>{t.role}</small>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ─────────── CTA ─────────── */}
      <section className="cta-banner">
        <h2>Ready to upgrade your everyday?</h2>
        <p>
          Join 12,000+ customers who get first access to new drops, member-only
          pricing and free shipping on their first order.
        </p>
        <Link to={isBuyer ? "/shop" : "/register"} className="button">
          {isBuyer ? "Browse the shop" : "Get started — it's free"}
        </Link>
      </section>
    </div>
  );
}

export default Home;