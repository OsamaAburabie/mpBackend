const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    username: { type: String },
    text: { type: String },
  },
  { timestamps: true }
);

const TaskerAdsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  price: { type: Number, required: true },
  taskerInfo: { type: Object },
  location: { type: String, required: true },
  tags: [String],
  comments: [commentSchema],
  catId: { type: String, required: true },
});

module.exports = Ads = mongoose.model("Ads", TaskerAdsSchema);
