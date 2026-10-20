const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: Number, required: true },
    name:      { type: String, required: true },
    price:     { type: Number, required: true },
    image:     { type: String, default: "" },
    quantity:  { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    id:     { type: Number, required: true, unique: true, index: true },  // Date.now()
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items:  { type: [orderItemSchema], required: true },
    total:  { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

orderSchema.set("toJSON", {
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
    delete ret.userId;   // frontend doesn't need it; hides ownership
    return ret;
  },
});

module.exports = mongoose.model("Order", orderSchema);