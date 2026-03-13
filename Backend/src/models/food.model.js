const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  name: String,
  description: String,
  video: String,
  likeCount: {
    type: Number,
    default: 0
  },
  savesCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model("food", foodSchema);