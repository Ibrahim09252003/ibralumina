const mongoose = require("mongoose");

const contactMessageSchema = new mongoose.Schema(
  {
    id:      { type: Number, required: true, unique: true, index: true },
    name:    { type: String, required: true, trim: true, maxlength: 120 },
    email:   { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    subject: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, minlength: 10, maxlength: 5000 },
    read:    { type: Boolean, default: false, index: true },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

contactMessageSchema.set("toJSON", {
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model("ContactMessage", contactMessageSchema);