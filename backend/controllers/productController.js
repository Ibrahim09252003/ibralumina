const Product = require("../models/Product");
const { logActivity } = require("./activityController");

/* ── GET /api/products ─────────────────────────── */
const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ id: 1 });
    res.json(products);
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/products/:id ─────────────────────── */
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findOne({ id: Number(req.params.id) });
    if (!product) {
      res.status(404);
      throw new Error(`Product with id ${req.params.id} not found`);
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
};

/* ── POST /api/products ────────────────────────── */
const createProduct = async (req, res, next) => {
  try {
    const { name, price, category } = req.body;

    if (!name || price === undefined || !category) {
      res.status(400);
      throw new Error("Name, price and category are required");
    }
    if (Number.isNaN(Number(price)) || Number(price) < 0) {
      res.status(400);
      throw new Error("Price must be a positive number");
    }

    const last = await Product.findOne().sort({ id: -1 });
    const nextId = last ? last.id + 1 : 1;

    const product = await Product.create({
      id: nextId,
      name: name.trim(),
      description: req.body.description?.trim() || "",
      price: Number(price),
      stock: Number(req.body.stock) || 0,
      category: category.trim(),
      image: req.body.image?.trim() || "",
      rating: Number(req.body.rating) || 0,
    });
      await logActivity(
      req.user._id, "product.create", "product",
      `Created product "${product.name}" (#${product.id})`
    );

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

/* ── PUT /api/products/:id ─────────────────────── */
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ id: Number(req.params.id) });
    if (!product) {
      res.status(404);
      throw new Error(`Product with id ${req.params.id} not found`);
    }

    const { name, description, price, stock, category, image, rating } = req.body;

    if (name        !== undefined) product.name = name.trim();
    if (description !== undefined) product.description = description.trim();
    if (price       !== undefined) product.price = Number(price);
    if (stock       !== undefined) product.stock = Number(stock);
    if (category    !== undefined) product.category = category.trim();
    if (image       !== undefined) product.image = image.trim();
    if (rating      !== undefined) product.rating = Number(rating);

    const updated = await product.save();
    await logActivity(
      req.user._id, "product.update", "product",
      `Updated product "${updated.name}" (#${updated.id})`
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

/* ── DELETE /api/products/:id ──────────────────── */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndDelete({ id: Number(req.params.id) });
    if (!product) {
      res.status(404);
      throw new Error(`Product with id ${req.params.id} not found`);
    }
    await logActivity(
      req.user._id, "product.delete", "product",
      `Deleted product "${product.name}" (#${product.id})`
    );
    res.json({ message: "Product deleted", id: product.id });
  } catch (err) {
    next(err);
  }
};

/* ── POST /api/products/bulk-stock ─────────────── */
/* Body: { updates: [{ id, delta }] }               */
/* delta can be positive (add) or negative (sub)    */
const bulkStock = async (req, res, next) => {
  try {
    const { updates } = req.body;
    if (!Array.isArray(updates)) {
      res.status(400);
      throw new Error("updates must be an array");
    }

    for (const { id, delta } of updates) {
      const product = await Product.findOne({ id: Number(id) });
      if (!product) continue;
      product.stock = Math.max(0, product.stock + Number(delta));
      await product.save();
    }

    res.json({ message: "Stock adjusted" });
  } catch (err) {
    next(err);
  }
};

/* ── Exports (must be LAST in the file) ────────── */
module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkStock,
};