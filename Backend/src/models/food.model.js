const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  video: {
    type: String,
    required: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  foodpartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "foodpartner",
    required: true
  },
  likeCount: {
    type: Number,
    default: 0
  },
  savesCount: {
    type: Number,
    default: 0
  }
},
{ timestamps: true }
);

// Indexes for performance
foodSchema.index({ foodpartner: 1 });
foodSchema.index({ createdAt: -1 });

module.exports = mongoose.model("food", foodSchema);