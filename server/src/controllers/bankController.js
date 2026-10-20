const mongoose = require("mongoose");
const Bank = require("../models/Bank");
const AccountHolder = require("../models/AccountHolder");
const Deposit = require("../models/Deposit");
const asyncHandler = require("../middleware/asyncHandler");
const getPagination = require("../utils/pagination");
const httpError = require("../utils/httpError");

const createBank = asyncHandler(async (req, res) => {
  const bank = await Bank.create({
    bankName: req.body.bankName.trim(),
  });

  res.status(201).json({
    success: true,
    message: "Bank created successfully",
    data: bank,
  });
});

const updateBank = asyncHandler(async (req, res) => {
  const { bankId } = req.params;
  const { bankName } = req.body;

  if (!mongoose.isValidObjectId(bankId)) {
    throw httpError(400, "Invalid bank id");
  }

  const bank = await Bank.findById(bankId);

  if (!bank) {
    throw httpError(404, "Bank not found");
  }

  bank.bankName = bankName.trim();
  await bank.save();

  res.json({
    success: true,
    message: "Bank updated successfully",
    data: bank,
  });
});

const deleteBank = asyncHandler(async (req, res) => {
  const { bankId } = req.params;

  if (!mongoose.isValidObjectId(bankId)) {
    throw httpError(400, "Invalid bank id");
  }

  const bank = await Bank.findById(bankId);

  if (!bank) {
    throw httpError(404, "Bank not found");
  }

  const holders = await AccountHolder.find({ bankId }, "_id");
  const holderIds = holders.map((holder) => holder._id);

  await Promise.all([
    Deposit.deleteMany({ holderId: { $in: holderIds } }),
    AccountHolder.deleteMany({ bankId }),
    Bank.findByIdAndDelete(bankId),
  ]);

  res.json({
    success: true,
    message: "Bank deleted successfully",
  });
});

const getBankDetails = asyncHandler(async (req, res) => {
  const { bankId } = req.params;
  const { search = "", page = 1, limit = 10 } = req.query;

  if (!mongoose.isValidObjectId(bankId)) {
    throw httpError(400, "Invalid bank id");
  }

  console.log("Requested bankId:", bankId);
console.log("Length:", bankId.length);
console.log("Valid ObjectId:", mongoose.isValidObjectId(bankId));

const allBanks = await Bank.find().lean();

console.log(
  "Available Banks:",
  allBanks.map((b) => ({
    id: b._id.toString(),
    name: b.bankName,
  }))
);
const bank = await Bank.findOne({
  _id: new mongoose.Types.ObjectId(bankId),
}).lean();
console.log("Found Bank:", bank);

  if (!bank) {
    throw httpError(404, "Bank not found");
  }

  const { page: currentPage, limit: perPage, skip } = getPagination(page, limit);

  const holderMatch = {
    bankId: new mongoose.Types.ObjectId(bankId),
  };

  if (search.trim()) {
    holderMatch.$or = [
      { name: { $regex: search.trim(), $options: "i" } },
      { phoneNumber: { $regex: search.trim(), $options: "i" } },
    ];
  }

  const [allHoldersCount, filteredHoldersCount, holderList, bankDepositTotals] = await Promise.all([
    AccountHolder.countDocuments({ bankId }),
    AccountHolder.countDocuments(holderMatch),
    AccountHolder.aggregate([
      { $match: holderMatch },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: perPage },
      {
        $lookup: {
          from: "deposits",
          localField: "_id",
          foreignField: "holderId",
          pipeline: [{ $match: { isFinished: { $ne: true } } }],
          as: "deposits",
        },
      },
      {
        $project: {
          name: 1,
          phoneNumber: 1,
          createdAt: 1,
          totalDepositedAmount: { $sum: "$deposits.amount" },
          totalDepositsCount: { $size: "$deposits" },
        },
      },
    ]),
    Deposit.aggregate([
      {
        $lookup: {
          from: "accountholders",
          localField: "holderId",
          foreignField: "_id",
          as: "holder",
        },
      },
      { $unwind: "$holder" },
      {
        $match: {
          "holder.bankId": new mongoose.Types.ObjectId(bankId),
          isFinished: { $ne: true },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      bank: {
        ...bank,
        totalAccountHolders: allHoldersCount,
        totalDepositedAmount: bankDepositTotals[0]?.totalAmount || 0,
      },
      holders: holderList,
      pagination: {
        page: currentPage,
        limit: perPage,
        total: filteredHoldersCount,
        totalPages: Math.max(Math.ceil(filteredHoldersCount / perPage), 1),
      },
    },
  });
});

const createHolder = asyncHandler(async (req, res) => {
  const { bankId } = req.params;
  const { name, phoneNumber } = req.body;

  if (!mongoose.isValidObjectId(bankId)) {
    throw httpError(400, "Invalid bank id");
  }

  const bank = await Bank.findById(bankId);

  if (!bank) {
    throw httpError(404, "Bank not found");
  }

  const holder = await AccountHolder.create({
    bankId,
    category: "bank",
    name: name.trim(),
    phoneNumber: phoneNumber.trim(),
  });

  res.status(201).json({
    success: true,
    message: "Account holder added successfully",
    data: holder,
  });
});

const updateHolder = asyncHandler(async (req, res) => {
  const { bankId, holderId } = req.params;
  const { name, phoneNumber } = req.body;

  if (!mongoose.isValidObjectId(bankId) || !mongoose.isValidObjectId(holderId)) {
    throw httpError(400, "Invalid id");
  }

  const holder = await AccountHolder.findOne({
    _id: holderId,
    bankId,
  });

  if (!holder) {
    throw httpError(404, "Account holder not found");
  }

  holder.name = name.trim();
  holder.phoneNumber = phoneNumber.trim();
  await holder.save();

  res.json({
    success: true,
    message: "Account holder updated successfully",
    data: holder,
  });
});

module.exports = {
  createBank,
  updateBank,
  deleteBank,
  getBankDetails,
  createHolder,
  updateHolder,
};
