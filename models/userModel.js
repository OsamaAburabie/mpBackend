const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    type: { type: String },
    taskerId: { type: String },
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
const connectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  uid: { type: String, required: true },
});

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 5 },
    displayName: { type: String, required: true },
    img: {
      type: String,
      default:
        "https://scontent.famm6-1.fna.fbcdn.net/v/t31.18172-8/23632407_1481745538541088_4407289845242811931_o.jpg?_nc_cat=106&ccb=1-3&_nc_sid=09cbfe&_nc_ohc=c9YJstHkbe0AX8z0Fwj&_nc_ht=scontent.famm6-1.fna&oh=04774438877236f1bf10d2fa470a791c&oe=60A3DB77",
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
