const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    // Numeric id kept for frontend compatibility.
    // (MongoDB's _id is the real PK; this is a friendly alias.)
    id: { type: Number, required: true, unique: true, index: true },

    name:        { type: String, required: [true, "Product name is required"], trim: true },
    description: { type: String, default: "", trim: true },
    price:       { type: Number, required: [true, "Price is required"], min: [0, "Price cannot be negative"] },
    stock:       { type: Number, default: 0, min: [0, "Stock cannot be negative"] },
    category:    { type: String, required: [true, "Category is required"], trim: true },
    image:       { type: String, default: "" },
    rating:      { type: Number, default: 0, min: 0, max: 5 },
  },
  { timestamps: true }
);

// Ensure `id` is returned (not `_id`) and hide Mongoose internals in JSON
productSchema.set("toJSON", {
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model("Product", productSchema);