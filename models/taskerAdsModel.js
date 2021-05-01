const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    username: { type: String },
    text: { type: String },
  },
  { timestamps: true }
);

const TaskerAdsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    desc: { type: String, required: true },
    img: {
      type: String,
      default:
        "https://orange-master-piece-1.s3.eu-central-1.amazonaws.com/userAvatar/maham.png",
    },
    price: { type: Number, required: true },
    taskerInfo: { type: Object },
    taskerId: { type: String, required: true },
    location: { type: String, required: true },
    tags: [String],
    comments: [commentSchema],
    catId: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = Ads = mongoose.model("Ads", TaskerAdsSchema);
