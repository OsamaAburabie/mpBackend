const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    username: { type: String },
    text: { type: String },
  },
  { timestamps: true }
);
const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    Notes: { type: String },
    status: { type: String, required: true, default: "pending" },
    taskerId: { type: String, required: true },
    CustomerId: { type: String, required: true },
    CustomerName: { type: String, required: true },
    Location: { type: String, required: true },
    date: { type: Date },
    messages: [messageSchema],
  },
  { timestamps: true }
);

module.exports = Task = mongoose.model("Task", taskSchema);
