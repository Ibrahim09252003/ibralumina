const express = require("express");
const router = express.Router();
const {
  getOrders, createOrder, updateOrderStatus, deleteOrder,
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/")
  .get(getOrders)
  .post(createOrder);

router.put("/:id/status", updateOrderStatus);
router.delete("/:id", deleteOrder);

module.exports = router;