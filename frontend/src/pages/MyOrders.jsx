import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductContext";
import { useAuth } from "../context/AuthContext";
import { useRatings } from "../context/RatingContext";
import Modal from "../components/Modal";
import {
  askConfirm, popError, infoToast, successToast, errorToast,
} from "../utils/alerts";
import { peso } from "../utils/format";

function MyOrders() {
  const { orders, updateOrderStatus, deleteOrder } = useCart();
  const { reduceStock } = useProducts();
  const { user } = useAuth();
  const { getRating, submitRating } = useRatings();

  const [ratingTarget, setRatingTarget] = useState(null);
  const [stars, setStars] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [comment, setComment] = useState("");

  const openRate = (item) => {
    const mine = getRating(item.id, user.id);
    setRatingTarget(item);
    setStars(mine?.stars || 0);
    setComment(mine?.comment || "");
    setHoverStar(0);
  };

  const closeRate = () => {
    setRatingTarget(null);
    setStars(0);
    setHoverStar(0);
    setComment("");
  };

  const handleSubmitRating = (e) => {
    e.preventDefault();
    if (!ratingTarget) return;
    if (stars < 1) return errorToast("Please pick at least 1 star.");
    const res = submitRating(ratingTarget.id, user.id, stars, comment.trim());
    if (!res.success) return errorToast(res.error);
    successToast("Thanks for your rating!");
    closeRate();
  };

  const handleCancel = async (order) => {
    if (order.status === "Delivered") {
      return popError("Can't cancel", "Delivered orders can no longer be cancelled.");
    }
    if (order.status === "Cancelled") {
      return popError("Already cancelled", "This order was cancelled earlier.");
    }

    const ok = await askConfirm({
      title: "Cancel this order?",
      text: "The stock will be restored to inventory.",
      confirmText: "Yes, cancel it",
      icon: "warning",
    });
    if (!ok) return;

  try {
    await updateOrderStatus(order.id, "Cancelled");
    infoToast("Order cancelled — stock restored");
  } catch (err) {
    popError("Couldn't cancel", err.message);
  }
};

  const handleDelete = async (orderId) => {
    const ok = await askConfirm({
      title: "Delete this order?",
      text: "It will be removed from your order history permanently.",
      confirmText: "Delete",
      icon: "warning",
    });
    if (!ok) return;
    deleteOrder(orderId);
    infoToast("Order deleted");
  };

  const nextStatus = (current) => {
    if (current === "Pending") return "Shipped";
    if (current === "Shipped") return "Delivered";
    return null;
  };

  if (orders.length === 0) {
    return (
      <div className="page">
        <div className="empty-cart">
          <div className="empty-cart-icon">📦</div>
          <h1>No orders yet</h1>
          <p>Once you place an order it will show up here.</p>
          <Link to="/shop" className="button primary">Start shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page orders-page">
      <div className="products-header">
        <div>
          <span className="eyebrow">History</span>
          <h1>My orders</h1>
        </div>
        <Link to="/shop" className="button primary">+ New order</Link>
      </div>

      <div className="orders-list">
        {orders.map((order) => {
          const next = nextStatus(order.status);
          const isDelivered = order.status === "Delivered";

          return (
            <div className="order-card" key={order.id}>
              <div className="order-header">
                <div>
                  <h3>Order #{order.id.toString().slice(-8)}</h3>
                  <p className="order-date">{new Date(order.date).toLocaleString()}</p>
                </div>
                <span className={`status-badge status-${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>

              <div className="order-items">
                {order.items.map((item) => {
                  const mine = getRating(item.id, user.id);
                  return (
                    <div className="order-item" key={item.id}>
                      <img src={item.image} alt={item.name} />
                      <div>
                        <p className="order-item-name">{item.name}</p>
                        <p className="order-item-meta">
                          {peso(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <div className="order-item-right">
                        <p className="order-item-total">
                          {peso(item.price * item.quantity)}
                        </p>
                        {isDelivered && (
                          <button
                            className="button small ghost"
                            onClick={() => openRate(item)}
                          >
                            {mine ? `★ ${mine.stars}/5 · Edit` : "Rate"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="order-footer">
                <div className="order-total">
                  Total: <strong>{peso(order.total)}</strong>
                </div>
                <div className="order-actions">
                  {next && order.status !== "Cancelled" && (
                    <button
                      className="button small primary"
                      onClick={() => {
                        updateOrderStatus(order.id, next);
                        infoToast(`Order marked as ${next}`);
                      }}
                    >
                      Mark as {next}
                    </button>
                  )}
                  {order.status === "Pending" && (
                    <button className="button small edit" onClick={() => handleCancel(order)}>
                      Cancel
                    </button>
                  )}
                  <button
                    className="button small delete"
                    onClick={() => handleDelete(order.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {ratingTarget && (
        <Modal onClose={closeRate}>
          <h2 className="modal-title">Rate “{ratingTarget.name}”</h2>

          <form onSubmit={handleSubmitRating}>
            <div className="form-group">
              <label>Your rating *</label>
              <div className="rating-stars-input" onMouseLeave={() => setHoverStar(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={(hoverStar || stars) >= n ? "on" : ""}
                    onMouseEnter={() => setHoverStar(n)}
                    onClick={() => setStars(n)}
                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Comment (optional)</label>
              <textarea
                rows="4"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you think?"
              />
            </div>

            <div className="form-actions">
              <button type="button" className="button" onClick={closeRate}>Cancel</button>
              <button type="submit" className="button primary">Submit rating</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default MyOrders;