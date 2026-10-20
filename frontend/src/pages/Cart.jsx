import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductContext";
import { askConfirm, popError, successToast, infoToast } from "../utils/alerts";
import { peso } from "../utils/format";

function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart, checkout, cartTotal } = useCart();
  const { products } = useProducts();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    // Stock verification
    for (const item of cart) {
      const p = products.find((pr) => pr.id === item.id);
      if (!p || p.stock < item.quantity) {
        return popError(
          "Not enough stock",
          `Only ${p?.stock ?? 0} × ${item.name} left in stock.`
        );
      }
    }

    const ok = await askConfirm({
      title: "Place your order?",
      html: `You're about to order <strong>${cart.reduce((s, i) => s + i.quantity, 0)} item(s)</strong> for <strong>${peso(cartTotal)}</strong>.`,
      confirmText: "Place order",
      icon: "question",
    });
    if (!ok) return;
    
     try {
    await checkout();                       // ← no argument
    successToast("Order placed successfully!");
    navigate("/orders");
  } catch (err) {
    popError("Order failed", err.message);
  }
};

  const handleClear = async () => {
    const ok = await askConfirm({
      title: "Clear your cart?",
      text: "All items will be removed. This can't be undone.",
      confirmText: "Clear cart",
      icon: "warning",
    });
    if (!ok) return;
    clearCart();
    infoToast("Cart cleared");
  };

  const handleRemove = async (item) => {
    const ok = await askConfirm({
      title: "Remove item?",
      text: `"${item.name}" will be removed from your cart.`,
      confirmText: "Remove",
      icon: "warning",
    });
    if (!ok) return;
    removeFromCart(item.id);
    infoToast("Item removed");
  };

  if (cart.length === 0) {
    return (
      <div className="page">
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h1>Your cart is empty</h1>
          <p>Browse the catalog and add something you love.</p>
          <Link to="/shop" className="button primary">Go shopping</Link>
        </div>
      </div>
    );
  }

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="page cart-page">
      <div className="products-header">
        <div>
          <span className="eyebrow">Checkout</span>
          <h1>Shopping cart</h1>
        </div>
        <button className="button delete" onClick={handleClear}>Clear cart</button>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {cart.map((item) => {
            const product = products.find((p) => p.id === item.id);
            const maxStock = product ? product.stock : 0;

            return (
              <div className="cart-item" key={item.id}>
                <img src={item.image} alt={item.name} />

                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p className="cart-item-price">{peso(item.price)}</p>
                  <p className="cart-item-stock">Available: {maxStock}</p>
                </div>

                <div className="cart-item-qty">
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    aria-label="Decrease quantity"
                  >−</button>
                  <span>{item.quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= maxStock}
                    aria-label="Increase quantity"
                  >+</button>
                </div>

                <div className="cart-item-subtotal">
                  {peso(item.price * item.quantity)}
                </div>

                <button className="button small delete" onClick={() => handleRemove(item)}>
                  Remove
                </button>
              </div>
            );
          })}
        </div>

        <aside className="cart-summary">
          <h2>Order summary</h2>

          <div className="summary-row"><span>Items</span><span>{totalItems}</span></div>
          <div className="summary-row"><span>Subtotal</span><span>{peso(cartTotal)}</span></div>
          <div className="summary-row"><span>Shipping</span><span>Free</span></div>
          <div className="summary-row total"><span>Total</span><span>{peso(cartTotal)}</span></div>

          <button className="button primary full-width" onClick={handleCheckout}>
            Place order
          </button>

          <Link
            to="/shop"
            className="button full-width"
            style={{ marginTop: 10 }}
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}

export default Cart;