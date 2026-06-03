const mongoose = require("mongoose");

const depositSchema = new mongoose.Schema(
  {
    holderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountHolder",
      required: true,
      index: true,
    },
    depositDate: {
      type: Date,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
  },
  {
    timestamps: true,
  }
);

depositSchema.index({ holderId: 1, depositDate: -1 });

module.exports = mongoose.model("Deposit", depositSchema);
