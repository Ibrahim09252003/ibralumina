const ContactMessage = require("../models/ContactMessage");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ── POST /api/contact (public) ─────────────────── */
const submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      res.status(400); throw new Error("All fields are required");
    }
    if (!EMAIL_RE.test(email.trim())) {
      res.status(400); throw new Error("Invalid email address");
    }
    if (message.trim().length < 10) {
      res.status(400); throw new Error("Message must be at least 10 characters");
    }
    if (message.trim().length > 5000) {
      res.status(400); throw new Error("Message is too long (max 5000 characters)");
    }

    const last = await ContactMessage.findOne().sort({ id: -1 });
    const nextId = last ? last.id + 1 : 1;

    const doc = await ContactMessage.create({
      id: nextId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
    });

    res.status(201).json(doc);
  } catch (err) { next(err); }
};

/* ── GET /api/contact (admin) ───────────────────── */
const listContacts = async (req, res, next) => {
  try {
    const list = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) { next(err); }
};

/* ── PUT /api/contact/:id/read (admin) ──────────── */
const markContactRead = async (req, res, next) => {
  try {
    const doc = await ContactMessage.findOne({ id: Number(req.params.id) });
    if (!doc) { res.status(404); throw new Error("Message not found"); }
    doc.read = req.body?.read !== false;
    await doc.save();
    res.json(doc);
  } catch (err) { next(err); }
};

/* ── DELETE /api/contact/:id (admin) ────────────── */
const deleteContact = async (req, res, next) => {
  try {
    const doc = await ContactMessage.findOneAndDelete({ id: Number(req.params.id) });
    if (!doc) { res.status(404); throw new Error("Message not found"); }
    res.json({ message: "Message deleted", id: doc.id });
  } catch (err) { next(err); }
};

/* ── DELETE /api/contact (admin, clear all) ─────── */
const clearAllContacts = async (req, res, next) => {
  try {
    const result = await ContactMessage.deleteMany({});
    res.json({ message: "Inbox cleared", deleted: result.deletedCount });
  } catch (err) { next(err); }
};

module.exports = {
  submitContact, listContacts, markContactRead, deleteContact, clearAllContacts,
};