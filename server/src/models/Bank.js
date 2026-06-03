const mongoose = require("mongoose");

const bankSchema = new mongoose.Schema(
  {
    bankName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
  },
  {
    timestamps: true,
  }
);

bankSchema.index({ bankName: 1 });

module.exports = mongoose.model("Bank", bankSchema);
