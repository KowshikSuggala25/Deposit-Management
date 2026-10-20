const mongoose = require("mongoose");
const AccountHolder = require("../models/AccountHolder");
const Deposit = require("../models/Deposit");
const asyncHandler = require("../middleware/asyncHandler");
const getPagination = require("../utils/pagination");
const httpError = require("../utils/httpError");

const categories = ["gold", "cash"];
const labelFor = (category) => (category === "gold" ? "Gold Finance" : "Cash Finance");
const ensureCategory = (category) => {
  if (!categories.includes(category)) throw httpError(400, "Invalid finance category");
};

const getFinanceDashboard = asyncHandler(async (req, res) => {
  const { category } = req.params;
  ensureCategory(category);
  const { search = "", page = 1, limit = 9 } = req.query;
  const { page: currentPage, limit: perPage, skip } = getPagination(page, limit);
  const holderQuery = { category };
  if (search.trim()) holderQuery.$or = [
    { name: { $regex: search.trim(), $options: "i" } },
    { phoneNumber: { $regex: search.trim(), $options: "i" } },
  ];
  const [totalAccountHolders, depositSummary, totalFiltered, holders] = await Promise.all([
    AccountHolder.countDocuments({ category }),
    Deposit.aggregate([
      { $match: { category, isFinished: { $ne: true } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    AccountHolder.countDocuments(holderQuery),
    AccountHolder.aggregate([
      { $match: holderQuery }, { $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: perPage },
      { $lookup: { from: "deposits", let: { id: "$_id" }, pipeline: [
        { $match: { $expr: { $and: [{ $eq: ["$holderId", "$$id"] }, { $eq: ["$isFinished", false] }] } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ], as: "totals" } },
      { $project: { name: 1, phoneNumber: 1, category: 1, createdAt: 1, totalDepositedAmount: { $ifNull: [{ $arrayElemAt: ["$totals.total", 0] }, 0] } } },
    ]),
  ]);
  res.json({ success: true, data: {
    finance: { category, name: labelFor(category), totalAccountHolders, totalDepositedAmount: depositSummary[0]?.total || 0 },
    holders,
    pagination: { page: currentPage, limit: perPage, total: totalFiltered, totalPages: Math.max(Math.ceil(totalFiltered / perPage), 1) },
  }});
});

const createFinanceHolder = asyncHandler(async (req, res) => {
  const { category } = req.params;
  ensureCategory(category);
  const { name, phoneNumber } = req.body;
  const holder = await AccountHolder.create({ category, name: name.trim(), phoneNumber: phoneNumber.trim() });
  res.status(201).json({ success: true, data: holder });
});

const updateFinanceHolder = asyncHandler(async (req, res) => {
  const { category, holderId } = req.params;
  ensureCategory(category);
  if (!mongoose.isValidObjectId(holderId)) throw httpError(400, "Invalid holder id");
  const holder = await AccountHolder.findOneAndUpdate(
    { _id: holderId, category }, { name: req.body.name.trim(), phoneNumber: req.body.phoneNumber.trim() }, { new: true, runValidators: true }
  );
  if (!holder) throw httpError(404, "Customer not found");
  res.json({ success: true, data: holder });
});

module.exports = { getFinanceDashboard, createFinanceHolder, updateFinanceHolder, ensureCategory };
