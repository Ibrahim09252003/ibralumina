import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductContext";
import { peso } from "../utils/format";

function BuyerDashboard() {
  const { user } = useAuth();
  const { cart, orders, cartCount, cartTotal } = useCart();
  const { products } = useProducts();

  const totalSpent = orders.reduce((s, o) => s + o.total, 0);
  const featured = [...products].sort((a, b) => b.rating - a.rating).slice(0, 4);

  return (
    <div className="page dashboard">
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">My account</span>
          <h1>Hi, {user.name.split(" ")[0]} 👋</h1>
        </div>
        <Link to="/shop" className="button primary">Continue shopping</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-info">
            <span className="stat-value">{cartCount}</span>
            <span className="stat-label">Items in cart</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-value">{peso(cartTotal)}</span>
            <span className="stat-label">Cart total</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <span className="stat-value">{orders.length}</span>
            <span className="stat-label">My orders</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💵</div>
          <div className="stat-info">
            <span className="stat-value">{peso(totalSpent)}</span>
            <span className="stat-label">Total spent</span>
          </div>
        </div>
      </div>

      <div className="buyer-sections">
        <div className="buyer-section">
          <div className="section-header">
            <h2>🛒 My cart</h2>
            <Link to="/cart" className="button small">View cart</Link>
          </div>

          {cart.length === 0 ? (
            <p className="empty-state" style={{ padding: "32px 16px" }}>
              Your cart is empty. Start shopping!
            </p>
          ) : (
            <div className="mini-list">
              {cart.slice(0, 4).map((item) => (
                <div key={item.id} className="mini-item">
                  <img src={item.image} alt={item.name} />
                  <div>
                    <p className="mini-name">{item.name}</p>
                    <p className="mini-meta">{peso(item.price)} × {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="buyer-section">
          <div className="section-header">
            <h2>📦 Recent orders</h2>
            <Link to="/orders" className="button small">View all</Link>
          </div>

          {orders.length === 0 ? (
            <p className="empty-state" style={{ padding: "32px 16px" }}>No orders yet.</p>
          ) : (
            <div className="mini-list">
              {orders.slice(0, 4).map((o) => (
                <div key={o.id} className="mini-order">
                  <div>
                    <p className="mini-name">Order #{o.id.toString().slice(-6)}</p>
                    <p className="mini-meta">
                      {new Date(o.date).toLocaleDateString()} · {o.items.length} item(s)
                    </p>
                  </div>
                  <div>
                    <p className="mini-total">{peso(o.total)}</p>
                    <span className={`status-badge status-${o.status.toLowerCase()}`}>
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="recent-section">
        <div className="section-head">
          <h2>✨ Featured for you</h2>
          <Link to="/shop" className="button small ghost">Browse all</Link>
        </div>

        <div className="recent-grid">
          {featured.map((p) => (
            <div className="recent-card" key={p.id}>
              <img src={p.image} alt={p.name} loading="lazy" />
              <div className="recent-info">
                <h3>{p.name}</h3>
                <p>{peso(p.price)} · ★ {p.rating}</p>
                <Link to="/shop" className="button small primary">Shop now</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BuyerDashboard;