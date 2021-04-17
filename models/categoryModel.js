const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  picture: { type: String, required: true },
});

module.exports = Category = mongoose.model("Category", categorySchema);
