import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import { useAuth } from "../context/AuthContext";

function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProduct, addProduct, updateProduct, loading } = useProducts();
  const isEdit = !!id;
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [formData, setFormData] = useState({
    name: "", price: "", category: "", description: "", image: "", stock: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Guards against re-hydrating (and wiping user input) when products refresh.
  const loadedIdRef = useRef(null);

  /* ── Load the existing product into the form when editing ── */
  useEffect(() => {
    if (!isEdit) return;
    if (loadedIdRef.current === id) return;      // already hydrated for this id
    const product = getProduct(id);
    if (!product) return;                        // products may still be loading

    setFormData({
      name:        product.name        ?? "",
      price:       product.price       ?? "",
      category:    product.category    ?? "",
      description: product.description ?? "",
      image:       product.image       ?? "",
      stock:       product.stock       ?? "",
    });
    loadedIdRef.current = id;
  }, [id, isEdit, getProduct]);

  /* ── Redirect non-admins away from the create form ── */
  useEffect(() => {
    if (!isEdit && !isAdmin) navigate("/products", { replace: true });
  }, [isEdit, isAdmin, navigate]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim() || formData.price === "" || !formData.category.trim()) {
      setError("Name, price, and category are required.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name:        formData.name,
        price:       Number(formData.price),
        category:    formData.category,
        description: formData.description,
        image:       formData.image,
        stock:       Number(formData.stock) || 0,
      };

      if (isEdit) await updateProduct(id, payload);
      else        await addProduct(payload);

      navigate("/products");
    } catch (err) {
      setError(err.message || "Could not save the product.");
      setSubmitting(false);
    }
  };

  /* ── Edit mode with a missing / deleted product ── */
  if (isEdit && !loading && !getProduct(id)) {
    return (
      <div className="page form-page">
        <div className="empty-cart">
          <div className="empty-cart-icon">🔍</div>
          <h1>Product not found</h1>
          <p>It may have been deleted, or the link is incorrect.</p>
          <Link to="/products" className="button primary">Back to products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page form-page">
      <div className="form-card">
        <h1>{isEdit ? "✏️ Edit Product" : "➕ Add New Product"}</h1>
        <p>{isEdit ? "Update product details." : "Fill in the details below."}</p>
        <p className="form-hint" style={{ marginTop: -10, marginBottom: 18 }}>
          Ratings are submitted by buyers, not staff — the average updates automatically.
        </p>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Product Name *</label>
              <input name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Price (₱) *</label>
              <input name="price" type="number" step="0.01" min="0"
                value={formData.price} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <input name="category" value={formData.category} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Stock</label>
              <input name="stock" type="number" min="0" value={formData.stock} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label>Image URL</label>
            <input name="image" type="url" value={formData.image} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" rows="4" value={formData.description} onChange={handleChange} />
          </div>
          <div className="form-actions">
            <Link to="/products" className="button">Cancel</Link>
            <button type="submit" className="button primary" disabled={submitting}>
              {submitting ? "Saving…" : isEdit ? "Update Product" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductForm;