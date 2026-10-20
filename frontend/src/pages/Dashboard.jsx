import { Link } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import { peso } from "../utils/format";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { products } = useProducts();

  const total = products.length;
  const categories = new Set(products.map((p) => p.category)).size;
  const lowStock = products.filter((p) => p.stock < 10).length;
  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);
  const recentProducts = [...products].slice(-4).reverse();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <div className="page dashboard">
      <div className="dashboard-header">
      <div>
        <span className="eyebrow">Overview</span>
        <h1>Dashboard</h1>
      </div>
      {isAdmin && (
        <Link to="/products/add" className="button primary">+ Add product</Link>
      )}
    </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <span className="stat-value">{total}</span>
            <span className="stat-label">Total products</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏷️</div>
          <div className="stat-info">
            <span className="stat-value">{categories}</span>
            <span className="stat-label">Categories</span>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <span className="stat-value">{lowStock}</span>
            <span className="stat-label">Low stock items</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-value">{peso(totalValue)}</span>
            <span className="stat-label">Inventory value</span>
          </div>
        </div>
      </div>

      <div className="recent-section">
        <div className="section-head">
          <h2>Recently added</h2>
          <Link to="/products" className="button small ghost">View all</Link>
        </div>

        {recentProducts.length === 0 ? (
          <div className="empty-state">No products yet.</div>
        ) : (
          <div className="recent-grid">
            {recentProducts.map((p) => (
              <div className="recent-card" key={p.id}>
                <img src={p.image} alt={p.name} loading="lazy" />
                <div className="recent-info">
                  <h3>{p.name}</h3>
                  <p>{peso(p.price)} · Stock: {p.stock}</p>
                  <Link to={`/products/${p.id}`} className="button small">View</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;