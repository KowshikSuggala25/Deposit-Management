const mongoose = require("mongoose");

const depositSchema = new mongoose.Schema(
  {
    holderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountHolder",
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ["bank", "gold", "cash"],
      default: "bank",
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
    interestRate: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    expectedAmountPeriod: {
      type: String,
      enum: ["month", "year"],
      default: "year",
    },
    isFinished: {
      type: Boolean,
      default: false,
      index: true,
    },
    finishedDepositId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deposit",
      default: null,
    },
    originalDepositId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deposit",
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

depositSchema.index({ holderId: 1, depositDate: -1 });

module.exports = mongoose.model("Deposit", depositSchema);
