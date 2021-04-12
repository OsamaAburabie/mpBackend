const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    status: { type: String, required: true, default: "pending" },
    email: { type: String, required: true },
    userId: { type: String, required: true },
    active: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

module.exports = Ticket = mongoose.model("Ticket", ticketSchema);
