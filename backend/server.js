require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

// Connect to MongoDB before starting the server
connectDB();

const app = express();

// ── Global middleware ──
app.use(cors());            // allow requests from http://localhost:5173
app.use(express.json({ limit: "5mb" }));    // parse JSON bodies

// ── Health check ──
app.get("/", (req, res) => {
  res.json({ message: "IbraLumina API is running", status: "ok" });
});

// ── Routes ──
app.use("/api/products", productRoutes);
app.use("/api/auth",     require("./routes/authRoutes"));
app.use("/api/users",    require("./routes/userRoutes"));
app.use("/api/orders",   require("./routes/orderRoutes"));
app.use("/api/contact",  require("./routes/contactRoutes"));
app.use("/api/activity", require("./routes/activityRoutes"));

// ── Error handling (must be last) ──
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});