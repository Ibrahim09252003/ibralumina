const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    id:       { type: Number, required: true, unique: true, index: true },
    firstName:{ type: String, default: "", trim: true },
    lastName: { type: String, default: "", trim: true },
    name:     { type: String, required: [true, "Name is required"], trim: true },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      index: true,
    },
    phone:    { type: String, default: "", trim: true },
    avatar:   { type: String, default: "" }, 
    password: { type: String, required: [true, "Password is required"] },
    role: {
      type: String,
      enum: ["admin", "manager", "buyer"],
      default: "buyer",
    },
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.set("toJSON", {
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
    delete ret.password;   // never leak the hash, even by accident
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);