const Order = require("../models/Order");
const Product = require("../models/Product");
const { logActivity } = require("./activityController");

/* ── GET /api/orders ──────────────────────────── */
/* Buyer → own orders only. Admin/manager → all. */
const getOrders = async (req, res, next) => {
  try {
    const filter =
      req.user.role === "buyer" ? { userId: req.user._id } : {};
    const orders = await Order.find(filter).sort({ date: -1 });
    res.json(orders);
  } catch (err) { next(err); }
};

/* ── POST /api/orders ─────────────────────────── */
/* Body: { items: [{ id, quantity }] }            */
const createOrder = async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400); throw new Error("Order must contain at least one item");
    }

    const detailed = [];
    let total = 0;

    for (const line of items) {
      const product = await Product.findOne({ id: Number(line.id) });
      if (!product) {
        res.status(404); throw new Error(`Product ${line.id} not found`);
      }
      if (product.stock < line.quantity) {
        res.status(400);
        throw new Error(`Only ${product.stock} × ${product.name} left in stock`);
      }

      detailed.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: line.quantity,
      });
      total += product.price * line.quantity;

      // decrement stock
      product.stock -= line.quantity;
      await product.save();
    }

    const order = await Order.create({
      id: Date.now(),
      userId: req.user._id,
      items: detailed,
      total,
      status: "Pending",
      date: new Date(),
    });
    await logActivity(
      req.user._id, "order.create", "order",
      `Placed order #${order.id} · ${detailed.length} item(s) · ₱${total.toFixed(2)}`
    );

    res.status(201).json(order);
  } catch (err) { next(err); }
};

/* ── PUT /api/orders/:id/status ───────────────── */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ["Pending", "Shipped", "Delivered", "Cancelled"];
    if (!allowed.includes(status)) {
      res.status(400); throw new Error("Invalid status");
    }

    const order = await Order.findOne({ id: Number(req.params.id) });
    if (!order) { res.status(404); throw new Error("Order not found"); }

    // Buyer can only cancel their own order
    if (req.user.role === "buyer") {
      if (order.userId.toString() !== req.user._id.toString()) {
        res.status(403); throw new Error("Not your order");
      }
      if (status !== "Cancelled") {
        res.status(403); throw new Error("Buyers can only cancel orders");
      }
    }

    // Restore stock if cancelling
    if (status === "Cancelled" && order.status !== "Cancelled") {
      for (const item of order.items) {
        const product = await Product.findOne({ id: item.productId });
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }

    order.status = status;
    await order.save();
    await logActivity(
      req.user._id, "order.status", "order",
      `Order #${order.id} status → ${status}`
    );
    res.json(order);
  } catch (err) { next(err); }
};

/* ── DELETE /api/orders/:id ───────────────────── */
const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ id: Number(req.params.id) });
    if (!order) { res.status(404); throw new Error("Order not found"); }

    if (
      req.user.role === "buyer" &&
      order.userId.toString() !== req.user._id.toString()
    ) {
      res.status(403); throw new Error("Not your order");
    }

    await Order.deleteOne({ id: order.id });
    await logActivity(
      req.user._id, "order.delete", "order",
      `Deleted order #${order.id}`
    );
    res.json({ message: "Order deleted", id: order.id });
  } catch (err) { next(err); }
};

module.exports = { getOrders, createOrder, updateOrderStatus, deleteOrder };