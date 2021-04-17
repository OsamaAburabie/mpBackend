const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 5 },
    displayName: { type: String, required: true },
    role: { type: String, required: true, default: "customer" },
    active: { type: Boolean, required: true, default: true },
    connections: [Object],
    pendingConnections: [Object],
    rating: [Object],
  },
  { timestamps: true }
);

module.exports = User = mongoose.model("User", userSchema);
