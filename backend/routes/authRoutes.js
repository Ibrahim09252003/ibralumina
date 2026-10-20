const express = require("express");
const router = express.Router();
const {
  register, login, getMe, updateMe, changeMyPassword, deleteMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);
router.put("/me/password", protect, changeMyPassword);
router.delete("/me", protect, deleteMe);

module.exports = router;