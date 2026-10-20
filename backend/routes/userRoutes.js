const express = require("express");
const router = express.Router();
const {
  listUsers, createUser, updateUser, resetUserPassword, deleteUser, getContacts,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

// ── Messaging contacts — any signed-in user ──
// MUST come before the admin-only router.use() below,
// otherwise it gets 403'd for buyers/managers.
router.get("/contacts", protect, getContacts);

// ── Everything below is admin-only ──
router.use(protect, authorize("admin"));

router.route("/")
  .get(listUsers)
  .post(createUser);

router.route("/:id")
  .put(updateUser)
  .delete(deleteUser);

router.put("/:id/password", resetUserPassword);

module.exports = router;