import { Link } from "react-router-dom";

const SOCIALS = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/ibrahim.teano.fernandez/",
    path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
    fill: true,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/ib_09071967/",
    path: "M12 2.2c3.2 0 3.6 0 4.9.07 1.2.06 1.8.25 2.2.42.6.23 1 .5 1.4.95.45.44.72.85.95 1.44.17.42.36 1.02.42 2.21.06 1.27.07 1.65.07 4.86s0 3.6-.07 4.86c-.06 1.19-.25 1.79-.42 2.21a3.9 3.9 0 0 1-.95 1.44c-.44.45-.85.72-1.44.95-.42.17-1.02.36-2.21.42-1.27.06-1.65.07-4.86.07s-3.6 0-4.86-.07c-1.19-.06-1.79-.25-2.21-.42a3.9 3.9 0 0 1-1.44-.95 3.9 3.9 0 0 1-.95-1.44c-.17-.42-.36-1.02-.42-2.21C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.86c.06-1.19.25-1.79.42-2.21.23-.59.5-1 .95-1.44a3.9 3.9 0 0 1 1.44-.95c.42-.17 1.02-.36 2.21-.42C8.4 2.2 8.8 2.2 12 2.2zm0 3.3a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zm0 10.7a4.2 4.2 0 1 1 0-8.4 4.2 4.2 0 0 1 0 8.4zm6.8-11a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z",
    fill: true,
  },
  {
    name: "X",
    href: "https://x.com/VitalBAS1S",
    path: "M18.9 2H22l-7 8 8.2 12h-6.6l-5.2-7.6L5.4 22H2.3l7.5-8.6L1.9 2h6.8l4.7 6.9L18.9 2zm-1.1 18h1.7L7.3 3.8H5.5L17.8 20z",
    fill: true,
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@vital_basis",
    path: "M16.5 2h-3v12.6a2.6 2.6 0 1 1-2.1-2.55V9a5.6 5.6 0 1 0 5.1 5.57V8.9a6.4 6.4 0 0 0 3.5 1.06V7a3.6 3.6 0 0 1-3.5-3.5V2z",
    fill: true,
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@user-bd8xj4fc1p",
    path: "M21.6 7.2s-.2-1.4-.8-2c-.75-.8-1.6-.8-2-.85C16 4.2 12 4.2 12 4.2h-.02s-4 0-6.8.22c-.4.05-1.25.05-2 .85-.6.6-.8 2-.8 2S2.2 8.8 2.2 10.5v1.6c0 1.6.2 3.3.2 3.3s.2 1.4.8 2c.75.8 1.75.78 2.2.86 1.6.15 6.6.2 6.6.2s4 0 6.8-.22c.4-.05 1.25-.05 2-.85.6-.6.8-2 .8-2s.2-1.6.2-3.3v-1.6c0-1.6-.2-3.3-.2-3.3zM9.9 14.4V8.6l5.4 2.9-5.4 2.9z",
    fill: true,
  },
];

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-glow" aria-hidden="true" />

      <div className="footer-main">
        {/* ── Brand ── */}
        <div className="footer-col footer-brand">
          <Link to="/" className="footer-logo">
            <span className="footer-logo-mark">◆</span> IbraLumina
          </Link>
          <p>
            Thoughtfully designed tech &amp; lifestyle essentials for people who care
            about the details. Curated in Nueva Ecija, shipped worldwide.
          </p>

          <div className="footer-socials">
            {SOCIALS.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="social-btn"
                aria-label={s.name}
                title={s.name}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* ── Shop ── */}
        <div className="footer-col">
          <h4>Shop</h4>
          <ul>
            <li><Link to="/shop">All Products</Link></li>
            <li><Link to="/shop">New Arrivals</Link></li>
            <li><Link to="/shop">Best Sellers</Link></li>
            <li><Link to="/cart">Your Cart</Link></li>
            <li><Link to="/orders">Track Order</Link></li>
          </ul>
        </div>

        {/* ── Company ── */}
        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li><Link to="/about">About IbraLumina</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/about">Careers</Link></li>
            <li><Link to="/about">Sustainability</Link></li>
            <li><Link to="/about">Press Kit</Link></li>
          </ul>
        </div>

        {/* ── Contact ── */}
        <div className="footer-col">
          <h4>Get in Touch</h4>
          <ul className="footer-contact">
            <li>
              <span className="fc-icon">📍</span>
              <span>Bantug Bulalo, Burgos Extension,<br />Cabanatuan City, Nueva Ecija 3100</span>
            </li>
            <li>
              <span className="fc-icon">📞</span>
              <a href="tel:+63281234567">+63 (2) 8123-4567</a>
            </li>
            <li>
              <span className="fc-icon">✉️</span>
              <a href="mailto:hello@ibralumina.shop">hello@ibralumina.shop</a>
            </li>
            <li>
              <span className="fc-icon">🕘</span>
              <span>Mon–Sat · 9:00 AM – 7:00 PM</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {year} IbraLumina Trading Co. All rights reserved.</p>
        <div className="footer-pay">
          <span>Visa</span>
          <span>Mastercard</span>
          <span>GCash</span>
          <span>Maya</span>
          <span>PayPal</span>
        </div>
        <div className="footer-legal">
          <Link to="/about">Privacy</Link>
          <Link to="/about">Terms</Link>
          <Link to="/contact">Support</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;