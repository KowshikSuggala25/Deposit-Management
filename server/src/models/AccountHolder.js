const mongoose = require("mongoose");

const accountHolderSchema = new mongoose.Schema(
  {
    bankId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bank",
      required: false,
      index: true,
    },
    category: {
      type: String,
      enum: ["bank", "gold", "cash"],
      default: "bank",
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      match: /^\d{10}$/,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

accountHolderSchema.index({ bankId: 1, name: 1 });
accountHolderSchema.index({ category: 1, name: 1 });

module.exports = mongoose.model("AccountHolder", accountHolderSchema);
