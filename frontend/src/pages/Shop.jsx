import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { useRatings } from "../context/RatingContext";
import { computeRating } from "../utils/rating";
import { successToast, errorToast } from "../utils/alerts";
import { peso } from "../utils/format";

function Shop() {
  const { products } = useProducts();
  const { addToCart, cart } = useCart();
  const { getProductRatings } = useRatings();

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sort, setSort] = useState("featured");

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [products]
  );

  const filtered = useMemo(() => {
    const list = products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = !filterCategory || p.category === filterCategory;
      return matchSearch && matchCat;
    });
    switch (sort) {
      case "price-asc":  return [...list].sort((a, b) => a.price - b.price);
      case "price-desc": return [...list].sort((a, b) => b.price - a.price);
      case "rating":     return [...list].sort(
        (a, b) => computeRating(b, getProductRatings(b.id)).avg
                - computeRating(a, getProductRatings(a.id)).avg
      );
      default: return list;
    }
  }, [products, search, filterCategory, sort, getProductRatings]);

  const handleAdd = (product) => {
    if (product.stock <= 0) return errorToast("This item is out of stock.");
    const inCart = cart.find((i) => i.id === product.id);
    const currentQty = inCart ? inCart.quantity : 0;
    if (currentQty + 1 > product.stock) return errorToast(`Only ${product.stock} left in stock.`);
    addToCart(product, 1);
    successToast(`${product.name} added to cart`);
  };

  return (
    <div className="page shop-page">
      <div className="products-header">
        <div>
          <span className="eyebrow">Catalog</span>
          <h1>Shop all products</h1>
        </div>
        <Link to="/cart" className="button primary">View cart</Link>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="filter-select">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="filter-select">
          <option value="featured">Featured</option>
          <option value="price-asc">Price: low → high</option>
          <option value="price-desc">Price: high → low</option>
          <option value="rating">Top rated</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          No products match your search. Try a different keyword or category.
        </div>
      ) : (
        <div className="product-grid">
          {filtered.map((p) => {
            const inCart = cart.find((i) => i.id === p.id);
            const outOfStock = p.stock <= 0;
            const { avg, count } = computeRating(p, getProductRatings(p.id));

            return (
              <article className="product-card" key={p.id}>
                <div className="product-media">
                  <img src={p.image} alt={p.name} loading="lazy" />
                  {outOfStock
                    ? <span className="stock-flag out">Out of stock</span>
                    : p.stock < 10
                      ? <span className="stock-flag low">Only {p.stock} left</span>
                      : null}
                </div>

                <div className="product-info">
                  <span className="product-category">{p.category}</span>
                  <h3>{p.name}</h3>
                  <p className="product-rating">
                    <span className="stars">
                      {"★".repeat(Math.round(avg))}
                      {"☆".repeat(5 - Math.round(avg))}
                    </span>
                    <span className="count">{avg} ({count})</span>
                  </p>
                  <p className="product-price">{peso(p.price)}</p>
                  <p className={`product-stock ${p.stock < 10 ? "low" : ""}`}>
                    {outOfStock ? "Currently unavailable" : `In stock: ${p.stock}`}
                  </p>

                  <div className="product-actions">
                    <button
                      className="button primary small full-width"
                      onClick={() => handleAdd(p)}
                      disabled={outOfStock}
                    >
                      {outOfStock
                        ? "Out of stock"
                        : inCart
                          ? `Add more (${inCart.quantity} in cart)`
                          : "Add to cart"}
                    </button>
                    <Link
                      to={`/shop/${p.id}`}
                      className="button small ghost full-width"
                    >
                      View details
                    </Link>
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

export default Shop;