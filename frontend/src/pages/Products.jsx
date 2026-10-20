import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import { askConfirm, successToast } from "../utils/alerts";
import { useRatings } from "../context/RatingContext";
import { computeRating } from "../utils/rating";
import { peso } from "../utils/format";
import { useAuth } from "../context/AuthContext";

function Products() {
  const { products, deleteProduct } = useProducts();
  const { getProductRatings } = useRatings();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [products]
  );

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCategory || p.category === filterCategory;
    return matchSearch && matchCat;
  });

  const handleDelete = async (id, name) => {
    const ok = await askConfirm({
      title: "Delete this product?",
      text: `"${name}" will be permanently removed from the catalog.`,
      confirmText: "Delete",
      icon: "warning",
    });
    if (!ok) return;
    deleteProduct(id);
    successToast("Product deleted");
  };

  return (
    <div className="page products-page">
      <div className="products-header">
        <div>
          <span className="eyebrow">Inventory</span>
          <h1>Manage products</h1>
        </div>
        {isAdmin && (
          <Link to="/products/add" className="button primary">+ Add product</Link>
        )}
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No products found.</div>
      ) : (
        <div className="product-grid">
          {filtered.map((p) => {
            const { avg } = computeRating(p, getProductRatings(p.id));

            return (
              <article className="product-card" key={p.id}>
              <div className="product-media">
                <img src={p.image} alt={p.name} loading="lazy" />
                {p.stock < 10 && (
                  <span className="stock-flag low">
                    {p.stock === 0 ? "Out of stock" : `Low: ${p.stock}`}
                  </span>
                )}
              </div>

              <div className="product-info">
                <span className="product-category">{p.category}</span>
                <h3>{p.name}</h3>
                <p className="product-price">{peso(p.price)}</p>
                <p className="product-rating">
                  ★ {avg} {avg === 0 && <span className="count">(no ratings)</span>}
                </p>
                <p className={`product-stock ${p.stock < 10 ? "low" : ""}`}>
                  Stock: {p.stock} {p.stock < 10 && "⚠️"}
                </p>

                <div className="product-actions">
                  <Link to={`/products/${p.id}`} className="button small">View</Link>
                  <Link to={`/products/edit/${p.id}`} className="button small edit">Edit</Link>
                  <button
                    className="button small delete"
                    onClick={() => handleDelete(p.id, p.name)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Products;