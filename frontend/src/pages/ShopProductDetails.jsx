import { useParams, Link } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useRatings } from "../context/RatingContext";
import { computeRating } from "../utils/rating";
import { peso, censorName, censorUsername } from "../utils/format";
import { successToast, errorToast } from "../utils/alerts";

function ShopProductDetails() {
  const { id } = useParams();
  const { getProduct } = useProducts();
  const { addToCart, cart } = useCart();
  const { accounts } = useAuth();
  const { getProductRatings } = useRatings();

  const product = getProduct(id);

  if (!product) {
    return (
      <div className="page">
        <div className="empty-cart">
          <div className="empty-cart-icon">🔍</div>
          <h1>Product not found</h1>
          <p>It may have been removed or the link is incorrect.</p>
          <Link to="/shop" className="button primary">Back to shop</Link>
        </div>
      </div>
    );
  }

  const reviews = [...getProductRatings(product.id)].sort(
    (a, b) =>
      new Date(b.updatedAt || b.createdAt) -
      new Date(a.updatedAt || a.createdAt)
  );
  const { avg, count } = computeRating(product, reviews);

  const inCart = cart.find((i) => i.id === product.id);
  const outOfStock = product.stock <= 0;

  const handleAdd = () => {
    if (outOfStock) return errorToast("This item is out of stock.");
    const currentQty = inCart ? inCart.quantity : 0;
    if (currentQty + 1 > product.stock) {
      return errorToast(`Only ${product.stock} left in stock.`);
    }
    addToCart(product, 1);
    successToast(`${product.name} added to cart`);
  };

  const lookupUser = (userId) => accounts.find((a) => a.id === userId);

  return (
    <div className="page shop-detail-page">
      <div className="products-header">
        <div>
          <span className="eyebrow">Product details</span>
          <h1>{product.name}</h1>
        </div>
        <Link to="/shop" className="button">← Back to shop</Link>
      </div>

      {/* ── PRODUCT ── */}
      <div className="detail-card">
        <div className="detail-image">
          <img src={product.image} alt={product.name} />
        </div>

        <div className="detail-info">
          <span className="detail-category">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="detail-price">{peso(product.price)}</p>

          <p className="detail-stock">
            Stock: <strong>{product.stock}</strong>
            {product.stock === 0 && (
              <span className="low-badge">Out of stock</span>
            )}
            {product.stock > 0 && product.stock < 10 && (
              <span className="low-badge">Low stock</span>
            )}
          </p>

          <p className="detail-rating">
            ★ {avg} / 5.0
            <span className="count"> ({count} ratings)</span>
          </p>

          <p className="detail-description">{product.description}</p>

          <div className="detail-actions">
            <button
              className="button primary"
              onClick={handleAdd}
              disabled={outOfStock}
            >
              {outOfStock
                ? "Out of stock"
                : inCart
                  ? `Add more (${inCart.quantity} in cart)`
                  : "Add to cart"}
            </button>
            <Link to="/cart" className="button ghost">Go to cart</Link>
          </div>
        </div>
      </div>

      {/* ── REVIEWS ── */}
      <section className="reviews-section">
        <div className="section-head">
          <div>
            <span className="eyebrow">Reviews</span>
            <h2>What buyers are saying</h2>
            <p>
              {reviews.length === 0
                ? "Be the first to share your thoughts."
                : `${reviews.length} review${reviews.length > 1 ? "s" : ""} from verified buyers`}
            </p>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="empty-state">
            No reviews yet — ratings from delivered orders will appear here.
          </div>
        ) : (
          <div className="reviews-list">
            {reviews.map((r) => {
              const reviewer = lookupUser(r.userId);
              const displayName = reviewer?.name || "Anonymous Buyer";
              const username = reviewer?.username || "user";
              const initial = displayName.charAt(0).toUpperCase();

              return (
                <article key={r.id} className="review-item">
                  <div className="review-avatar">{initial}</div>

                  <div className="review-body">
                    <div className="review-head">
                      <strong>{censorName(displayName)}</strong>
                      <span className="review-username">
                        @{censorUsername(username)}
                      </span>
                      <span className="review-date">
                        {new Date(r.updatedAt || r.createdAt).toLocaleDateString(
                          undefined,
                          { year: "numeric", month: "short", day: "numeric" }
                        )}
                      </span>
                    </div>

                    <div className="review-stars">
                      {"★".repeat(r.stars)}
                      {"☆".repeat(5 - r.stars)}
                    </div>

                    {r.comment && <p className="review-text">{r.comment}</p>}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default ShopProductDetails;