const jwt = require("jsonwebtoken");
const User = require("../models/User");

/* ── Verify JWT ── */
const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
      res.status(401);
      throw new Error("Not authorized — no token provided");
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ id: decoded.id });
    if (!user) {
      res.status(401);
      throw new Error("Not authorized — user no longer exists");
    }

    req.user = user;    // full user doc, minus password is handled at serialization
    next();
  } catch (err) {
    if (!res.statusCode || res.statusCode === 200) res.status(401);
    next(err);
  }
};

/* ── Role guard (use after protect) ── */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    return next(new Error(`Access denied — requires role: ${roles.join(" or ")}`));
  }
  next();
};

module.exports = { protect, authorize };