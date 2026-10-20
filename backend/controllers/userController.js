const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { logActivity } = require("./activityController");

const userOut = (u) => ({
  id: u.id, firstName: u.firstName, lastName: u.lastName, name: u.name,
  username: u.username, email: u.email, phone: u.phone,
  avatar: u.avatar || "",      
  role: u.role, registeredAt: u.registeredAt,
});

/* ── GET /api/users (admin) ───────────────────── */
const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ id: 1 });
    res.json(users.map(userOut));
  } catch (err) { next(err); }
};

/* ── POST /api/users (admin creates account) ──── */
const createUser = async (req, res, next) => {
  try {
    const { name, username, email, phone, password, role } = req.body;
    if (!name || !username || !password) {
      res.status(400); throw new Error("Name, username and password required");
    }
    if (password.length < 6) {
      res.status(400); throw new Error("Password must be at least 6 characters");
    }
    if (await User.findOne({ username: username.toLowerCase() })) {
      res.status(409); throw new Error("Username is already taken");
    }
    if (email && await User.findOne({ email: email.toLowerCase() })) {
      res.status(409); throw new Error("Email is already registered");
    }

    const last = await User.findOne().sort({ id: -1 });
    const nextId = last ? last.id + 1 : 1;
    const parts = name.trim().split(/\s+/);

    const user = await User.create({
      id: nextId,
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "",
      name: name.trim(),
      username: username.trim().toLowerCase(),
      email: (email || "").toLowerCase(),
      phone: phone || "",
      password: await bcrypt.hash(password, 10),
      role: role || "buyer",
    });
    await logActivity(
      req.user._id, "account.create", "account",
      `Created ${user.role} account @${user.username}`
    );
    res.status(201).json(userOut(user));
  } catch (err) { next(err); }
};

/* ── PUT /api/users/:id (admin edits) ─────────── */
const updateUser = async (req, res, next) => {
  try {
    const target = await User.findOne({ id: Number(req.params.id) });
    if (!target) { res.status(404); throw new Error("Account not found"); }

    const { name, username, email, phone, role, avatar } = req.body;

    // Admin role is immutable
    if (target.role === "admin" && role && role !== "admin") {
      res.status(403); throw new Error("Admin accounts can't be demoted");
    }
    // Can't change your own role
    if (target.id === req.user.id && role && role !== target.role) {
      res.status(403); throw new Error("You can't change your own role");
    }
    if (username && username.toLowerCase() !== target.username) {
      const clash = await User.findOne({ username: username.toLowerCase() });
      if (clash) { res.status(409); throw new Error("Username is already taken"); }
      target.username = username.toLowerCase();
    }
    if (email && email.toLowerCase() !== (target.email || "")) {
      const clash = await User.findOne({ email: email.toLowerCase() });
      if (clash) { res.status(409); throw new Error("Email is already registered"); }
      target.email = email.toLowerCase();
    }

    if (name  !== undefined) target.name  = name.trim();
    if (phone !== undefined) target.phone = phone.trim();
    if (role  !== undefined) target.role  = role;
    if (avatar !== undefined) target.avatar = avatar;

    const saved = await target.save();
    await logActivity(
      req.user._id, "account.update", "account",
      `Updated account @${saved.username}`
    );
    res.json(userOut(saved));
  } catch (err) { next(err); }
};

/* ── PUT /api/users/:id/password (admin resets) ── */
const resetUserPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      res.status(400); throw new Error("Password must be at least 6 characters");
    }
    const target = await User.findOne({ id: Number(req.params.id) });
    if (!target) { res.status(404); throw new Error("Account not found"); }

    target.password = await bcrypt.hash(password, 10);
    await target.save();
    await logActivity(
      req.user._id, "account.password", "account",
      `Reset password for @${target.username}`
    );
    res.json({ message: "Password reset" });
  } catch (err) { next(err); }
};

/* ── DELETE /api/users/:id (admin) ────────────── */
const deleteUser = async (req, res, next) => {
  try {
    const target = await User.findOne({ id: Number(req.params.id) });
    if (!target) { res.status(404); throw new Error("Account not found"); }

    if (target.id === req.user.id) {
      res.status(403); throw new Error("You can't delete your own account");
    }
    if (target.role === "admin") {
      res.status(403); throw new Error("Admin accounts can't be deleted from here");
    }

    await User.deleteOne({ id: target.id });
    const Order = require("../models/Order");
    const ActivityLog = require("../models/ActivityLog");
    await Order.deleteMany({ userId: target._id });
    await ActivityLog.deleteMany({ userId: target._id });

    await logActivity(
      req.user._id, "account.delete", "account",
      `Deleted account @${target.username}`
    );
    res.json({ message: "Account deleted", id: target.id });
  } catch (err) { next(err); }
};

/* ── GET /api/users/contacts ───────────────────── */
/* Anyone signed in. Returns the minimal profile   */
/* list of people they're allowed to message,      */
/* mirroring the canMessage() rule used by the UI. */
const getContacts = async (req, res, next) => {
  try {
    const role = req.user.role;

    let allowedRoles = [];
    if (role === "buyer")   allowedRoles = ["manager"];
    if (role === "manager") allowedRoles = ["admin", "buyer"];
    if (role === "admin")   allowedRoles = ["admin", "manager"];

    const users = await User.find({
      role: { $in: allowedRoles },
      id:   { $ne: req.user.id },      // never include yourself
    }).sort({ id: 1 });

    res.json(
      users.map((u) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        role: u.role,
      }))
    );
  } catch (err) { next(err); }
};

module.exports = {
  listUsers, createUser, updateUser, resetUserPassword, deleteUser,
  getContacts,          // ← add
};