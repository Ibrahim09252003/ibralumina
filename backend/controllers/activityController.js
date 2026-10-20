const ActivityLog = require("../models/ActivityLog");

const MAX_LOGS_PER_USER = 500;

const nextId = async () => {
  const last = await ActivityLog.findOne().sort({ id: -1 });
  return last ? last.id + 1 : 1;
};

/* Internal helper — call from other controllers. Never throws. */
const logActivity = async (userId, action, category, description, metadata = {}) => {
  try {
    if (!userId || !action || !description) return;
    await ActivityLog.create({
      id: await nextId(),
      userId,
      action,
      category,
      description,
      metadata,
    });

    // Trim oldest entries if this user exceeds the cap
    const count = await ActivityLog.countDocuments({ userId });
    if (count > MAX_LOGS_PER_USER) {
      const excess = count - MAX_LOGS_PER_USER;
      const oldest = await ActivityLog.find({ userId })
        .sort({ createdAt: 1 })
        .limit(excess);
      const ids = oldest.map((o) => o._id);
      await ActivityLog.deleteMany({ _id: { $in: ids } });
    }
  } catch (err) {
    console.error("Activity log error:", err.message);
  }
};

/* ── GET /api/activity (own logs) ─────────────── */
const listMyActivity = async (req, res, next) => {
  try {
    const list = await ActivityLog.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(MAX_LOGS_PER_USER);
    res.json(list);
  } catch (err) { next(err); }
};

/* ── POST /api/activity (client-emitted event) ── */
const logMyActivity = async (req, res, next) => {
  try {
    const { action, category, description, metadata } = req.body || {};
    if (!action || !description) {
      res.status(400);
      throw new Error("action and description are required");
    }
    await logActivity(
      req.user._id,
      String(action),
      category || "system",
      String(description).slice(0, 500),
      metadata || {}
    );
    res.status(201).json({ message: "Logged" });
  } catch (err) { next(err); }
};

/* ── DELETE /api/activity (clear all mine) ────── */
const clearMyActivity = async (req, res, next) => {
  try {
    const result = await ActivityLog.deleteMany({ userId: req.user._id });
    res.json({ message: "Activity cleared", deleted: result.deletedCount });
  } catch (err) { next(err); }
};

/* ── DELETE /api/activity/:id (one entry) ─────── */
const deleteMyActivity = async (req, res, next) => {
  try {
    const doc = await ActivityLog.findOneAndDelete({
      id: Number(req.params.id),
      userId: req.user._id,   // scoping prevents deleting other users' logs
    });
    if (!doc) { res.status(404); throw new Error("Activity entry not found"); }
    res.json({ message: "Activity deleted", id: doc.id });
  } catch (err) { next(err); }
};

module.exports = {
  logActivity, listMyActivity, logMyActivity, clearMyActivity, deleteMyActivity,
};