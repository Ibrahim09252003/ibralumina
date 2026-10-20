const express = require("express");
const router = express.Router();
const {
  listMyActivity, logMyActivity, clearMyActivity, deleteMyActivity,
} = require("../controllers/activityController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/")
  .get(listMyActivity)
  .post(logMyActivity)
  .delete(clearMyActivity);

router.delete("/:id", deleteMyActivity);

module.exports = router;