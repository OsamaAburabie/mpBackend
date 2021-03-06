const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    type: { type: String },
    taskerId: { type: String },
    taskId: { type: String },
    seen: { type: Number, default: 0 },
    text: { type: String },
    notifId: { type: String },
  },
  { timestamps: true }
);
const dontTasksSchema = new mongoose.Schema(
  {
    taskId: { type: String, required: true },
  },
  { timestamps: true }
);
const connectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    uid: { type: String, required: true },
    taskTitle: { type: String },
    taskDesc: { type: String },
    taskId: { type: String },
    taskLocation: { type: String },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 5 },
    displayName: { type: String, required: true },
    img: {
      type: String,
      default:
        "https://cdn3.iconfinder.com/data/icons/avatars-round-flat/33/avat-01-512.png",
    },
    role: { type: String, required: true, default: "customer" },
    active: { type: Boolean, required: true, default: true },
    connections: [connectionSchema],
    pendingConnections: [connectionSchema],
    rating: [Object],
    doneTasks: [dontTasksSchema],
    notification: [notificationSchema],
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = User = mongoose.model("User", userSchema);
