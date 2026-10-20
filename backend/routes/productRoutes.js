const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkStock,
} = require("../controllers/productController");
const { protect, authorize } = require("../middleware/authMiddleware");

// ── Public reads (buyers browse without logging in) ──
router.get("/", getProducts);

// ── Admin-only stock adjustment (utility) ──
router.post("/bulk-stock", protect, authorize("admin"), bulkStock);

// ── Admin-only create ──
router.post("/", protect, authorize("admin"), createProduct);

// ── Per-product routes ──
router.get("/:id", getProductById);
router.put("/:id", protect, authorize("admin", "manager"), updateProduct);
router.delete("/:id", protect, authorize("admin", "manager"), deleteProduct);

module.exports = router;