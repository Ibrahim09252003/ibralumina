const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    id:      { type: Number, required: true, unique: true, index: true },
    userId:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    action:  { type: String, required: true, trim: true },                 // "auth.login"
    category: {
      type: String,
      enum: ["auth", "profile", "product", "order", "account", "message", "contact", "system"],
      default: "system",
      index: true,
    },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    metadata:    { type: mongoose.Schema.Types.Mixed, default: {} },
    createdAt:   { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

activityLogSchema.set("toJSON", {
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
    delete ret.userId;
    delete ret.metadata;
    return ret;
  },
});

module.exports = mongoose.model("ActivityLog", activityLogSchema);