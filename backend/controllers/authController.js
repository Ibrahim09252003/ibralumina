const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { logActivity } = require("./activityController");

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const userOut = (u) => ({
  id: u.id,
  firstName: u.firstName,
  lastName: u.lastName,
  name: u.name,
  username: u.username,
  email: u.email,
  phone: u.phone,
  avatar: u.avatar || "",  
  role: u.role,
  registeredAt: u.registeredAt,
});

/* ── POST /api/auth/register ──────────────────── */
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, username, email, phone, password } = req.body;

    if (!firstName || !lastName || !username || !email || !password) {
      res.status(400);
      throw new Error("Missing required fields");
    }
    if (password.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }
    if (await User.findOne({ username: username.toLowerCase() })) {
      res.status(409);
      throw new Error("Username is already taken");
    }
    if (await User.findOne({ email: email.toLowerCase() })) {
      res.status(409);
      throw new Error("Email is already registered");
    }

    const last = await User.findOne().sort({ id: -1 });
    const nextId = last ? last.id + 1 : 1;
    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      id: nextId,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      phone: phone || "",
      password: hash,
      role: "buyer",           // public registration is always buyer
    });

    await logActivity(user._id, "auth.register", "auth", "Account created");
    res.status(201).json({ token: signToken(user), user: userOut(user) });
  } catch (err) {
    next(err);
  }
};

/* ── POST /api/auth/login ─────────────────────── */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400);
      throw new Error("Username and password required");
    }

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      res.status(401);
      throw new Error("Invalid username or password");
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      res.status(401);
      throw new Error("Invalid username or password");
    }

    await logActivity(user._id, "auth.login", "auth", "Signed in");
    res.json({ token: signToken(user), user: userOut(user) });
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/auth/me ─────────────────────────── */
const getMe = async (req, res, next) => {
  try {
    res.json({ user: userOut(req.user) });
  } catch (err) {
    next(err);
  }
};

/* ── PUT /api/auth/me ─────────────────────────── */
const updateMe = async (req, res, next) => {
  try {
    const me = req.user;
    const { name, username, email, phone, avatar } = req.body;   // ← add avatar

    if (username && username.toLowerCase() !== me.username) {
      const clash = await User.findOne({ username: username.toLowerCase() });
      if (clash) { res.status(409); throw new Error("Username is already taken"); }
      me.username = username.toLowerCase();
    }
    if (email && email.toLowerCase() !== (me.email || "")) {
      const clash = await User.findOne({ email: email.toLowerCase() });
      if (clash) { res.status(409); throw new Error("Email is already registered"); }
      me.email = email.toLowerCase();
    }

    if (name  !== undefined) me.name  = name.trim();
    if (phone !== undefined) me.phone = phone.trim();

    // NEW — server-side guard on avatar payload size
    if (avatar !== undefined) {
      if (typeof avatar !== "string" || avatar.length > 2_000_000) {
        res.status(400);
        throw new Error("Avatar is too large (max ~2 MB). Try a smaller image.");
      }
      me.avatar = avatar;
    }

    if (name     !== undefined) me.name     = name.trim();
    if (phone    !== undefined) me.phone    = phone.trim();

    const changed = [];
    if (name     !== undefined) changed.push("name");
    if (username !== undefined) changed.push("username");
    if (email    !== undefined) changed.push("email");
    if (phone    !== undefined) changed.push("phone");

    const saved = await me.save();

    if (changed.length) {
      await logActivity(
        saved._id,
        "profile.update",
        "profile",
        `Profile updated (${changed.join(", ")})`
      );
    }

    res.json({ user: userOut(saved) });
  } catch (err) {
    next(err);
  }
};

/* ── PUT /api/auth/me/password ────────────────── */
const changeMyPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400); throw new Error("Both passwords required");
    }
    if (newPassword.length < 6) {
      res.status(400); throw new Error("New password must be at least 6 characters");
    }
    if (currentPassword === newPassword) {
      res.status(400); throw new Error("New password must differ from current one");
    }

    const me = req.user;
    const ok = await bcrypt.compare(currentPassword, me.password);
    if (!ok) { res.status(401); throw new Error("Current password is incorrect"); }

    me.password = await bcrypt.hash(newPassword, 10);
    await me.save();
    await logActivity(me._id, "profile.password", "auth", "Password changed");
    res.json({ message: "Password updated" });
  } catch (err) {
    next(err);
  }
};

/* ── DELETE /api/auth/me ──────────────────────── */
const deleteMe = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) { res.status(400); throw new Error("Password required"); }

    const me = req.user;
    if (me.role === "admin") {
      res.status(403); throw new Error("Admin accounts cannot be deleted from the UI");
    }

    const ok = await bcrypt.compare(password, me.password);
    if (!ok) { res.status(401); throw new Error("Password is incorrect"); }

    await logActivity(me._id, "account.delete", "account", "Account deleted (self)");

    await User.deleteOne({ id: me.id });
    const Order = require("../models/Order");
    await Order.deleteMany({ userId: me._id });

    const ActivityLog = require("../models/ActivityLog");
    await ActivityLog.deleteMany({ userId: me._id });      // cascade

    res.json({ message: "Account deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, updateMe, changeMyPassword, deleteMe };