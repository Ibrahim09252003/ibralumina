const express = require("express");
const router = express.Router();
const {
  submitContact, listContacts, markContactRead, deleteContact, clearAllContacts,
} = require("../controllers/contactController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Public — anyone (including guests) can submit the Contact form
router.post("/", submitContact);

// Admin-only inbox management
router.get("/",                 protect, authorize("admin"), listContacts);
router.delete("/",              protect, authorize("admin"), clearAllContacts);
router.put("/:id/read",         protect, authorize("admin"), markContactRead);
router.delete("/:id",           protect, authorize("admin"), deleteContact);

module.exports = router;