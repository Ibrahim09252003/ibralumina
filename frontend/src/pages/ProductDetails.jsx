import { useParams, Link, useNavigate } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import { askConfirm, successToast } from "../utils/alerts";
import { useRatings } from "../context/RatingContext";
import { computeRating } from "../utils/rating";
import { peso } from "../utils/format";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProduct, deleteProduct } = useProducts();
  const { getProductRatings } = useRatings();
  const product = getProduct(id);

  if (!product) {
    return (
      <div className="page">
        <div className="empty-cart">
          <div className="empty-cart-icon">🔍</div>
          <h1>Product not found</h1>
          <p>It may have been deleted or the link is incorrect.</p>
          <Link to="/products" className="button primary">Back to products</Link>
        </div>
      </div>
    );
  }

  const reviews = getProductRatings(product.id);
  const { avg, count } = computeRating(product, reviews);

  const handleDelete = async () => {
    const ok = await askConfirm({
      title: "Delete this product?",
      text: `"${product.name}" will be permanently removed.`,
      confirmText: "Delete",
      icon: "warning",
    });
    if (!ok) return;
    deleteProduct(product.id);
    successToast("Product deleted");
    navigate("/products");
  };

  return (
    <div className="page product-detail">
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
            {product.stock < 10 && <span className="low-badge">Low stock</span>}
          </p>
          <p className="detail-rating">★ {avg} / 5.0 <span className="count">({count} ratings)</span></p>
          <p className="detail-description">{product.description}</p>

          {reviews.length > 0 && (
            <div className="detail-reviews">
              <h3>Buyer reviews</h3>
              {reviews.map((r) => (
                <div key={r.id} className="review-row">
                  <span className="review-stars">
                    {"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}
                  </span>
                  {r.comment && <p>{r.comment}</p>}
                </div>
              ))}
            </div>
          )}

          <div className="detail-actions">
            <Link to="/products" className="button">← Back</Link>
            <Link to={`/products/edit/${product.id}`} className="button edit">Edit</Link>
            <button className="button delete" onClick={handleDelete}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;