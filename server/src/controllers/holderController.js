const mongoose = require("mongoose");
const AccountHolder = require("../models/AccountHolder");
const Bank = require("../models/Bank");
const Deposit = require("../models/Deposit");
const asyncHandler = require("../middleware/asyncHandler");
const getPagination = require("../utils/pagination");
const buildDateRange = require("../utils/dateFilters");
const httpError = require("../utils/httpError");
const getExpectedAmount = require("../utils/expectedAmount");

const getHolderDetails = asyncHandler(async (req, res) => {
  const { holderId } = req.params;
  const { search = "", range, startDate, endDate, page = 1, limit = 10 } = req.query;

  if (!mongoose.isValidObjectId(holderId)) {
    throw httpError(400, "Invalid holder id");
  }

  const holder = await AccountHolder.findById(holderId).lean();

  if (!holder) {
    throw httpError(404, "Account holder not found");
  }

  const bank = holder.bankId ? await Bank.findById(holder.bankId).lean() : null;

  const dateRange = buildDateRange({ range, startDate, endDate });

  const baseMatch = {
    holderId: new mongoose.Types.ObjectId(holderId),
  };

  if (dateRange) {
    baseMatch.depositDate = {
      $gte: dateRange.start,
      $lte: dateRange.end,
    };
  }

  const trimmedSearch = search.trim();
  const { page: currentPage, limit: perPage, skip } = getPagination(page, limit);

  const buildSearchPipeline = [];

  if (trimmedSearch) {
    buildSearchPipeline.push(
      {
        $addFields: {
          formattedDate: {
            $dateToString: {
              format: "%d-%b-%Y",
              date: "$depositDate",
            },
          },
          amountString: {
            $toString: "$amount",
          },
        },
      },
      {
        $match: {
          $or: [
            { formattedDate: { $regex: trimmedSearch, $options: "i" } },
            { amountString: { $regex: trimmedSearch, $options: "i" } },
          ],
        },
      }
    );
  }

  const [filteredDepositsCount, filteredDeposits, totalStats] = await Promise.all([
    Deposit.aggregate([
      { $match: baseMatch },
      ...buildSearchPipeline,
      { $count: "count" },
    ]),
    Deposit.aggregate([
      { $match: baseMatch },
      ...buildSearchPipeline,
      { $sort: { depositDate: 1 } },
      { $skip: skip },
      { $limit: perPage },
      {
        $project: {
          depositDate: 1,
          amount: 1,
          interestRate: 1,
          expectedAmountPeriod: 1,
          isFinished: 1,
          finishedDepositId: 1,
          originalDepositId: 1,
          createdAt: 1,
        },
      },
    ]),
    Deposit.aggregate([
      {
        $match: {
          holderId: new mongoose.Types.ObjectId(holderId),
          isFinished: { $ne: true },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalCount: { $sum: 1 },
        },
      },
    ]),
  ]);

  const total = filteredDepositsCount[0]?.count || 0;

  res.json({
    success: true,
    data: {
      holder: {
        _id: holder._id,
        name: holder.name,
        phoneNumber: holder.phoneNumber,
        bankId: bank?._id || null,
        bankName: bank?.bankName || (holder.category === "gold" ? "Gold Finance" : "Cash Finance"),
        category: holder.category || "bank",
      },
      stats: {
        totalDepositsCount: totalStats[0]?.totalCount || 0,
        totalDepositedAmount: totalStats[0]?.totalAmount || 0,
      },
      deposits: filteredDeposits.map((deposit) => ({
        ...deposit,
        expectedAmount: getExpectedAmount(
          deposit.amount,
          deposit.interestRate,
          deposit.depositDate,
          deposit.expectedAmountPeriod,
          holder.category || "bank"
        ),
      })),
      pagination: {
        page: currentPage,
        limit: perPage,
        total,
        totalPages: Math.max(Math.ceil(total / perPage), 1),
      },
    },
  });
});

const createDeposit = asyncHandler(async (req, res) => {
  const { holderId } = req.params;
  const { depositDate, amount, interestRate = 0, expectedAmountPeriod = "year" } = req.body;

  if (!mongoose.isValidObjectId(holderId)) {
    throw httpError(400, "Invalid holder id");
  }

  const holder = await AccountHolder.findById(holderId);

  if (!holder) {
    throw httpError(404, "Account holder not found");
  }

  const createdDeposit = await Deposit.create({
    holderId,
    category: holder.category || "bank",
    depositDate,
    amount,
    interestRate,
    expectedAmountPeriod,
  });

  res.status(201).json({
    success: true,
    message: "Deposit added successfully",
    data: createdDeposit,
  });
});

const updateDeposit = asyncHandler(async (req, res) => {
  const { depositId } = req.params;
  const { depositDate, amount, interestRate, expectedAmountPeriod } = req.body;

  if (!mongoose.isValidObjectId(depositId)) {
    throw httpError(400, "Invalid deposit id");
  }

  const deposit = await Deposit.findById(depositId);

  if (!deposit) {
    throw httpError(404, "Deposit not found");
  }

  deposit.depositDate = depositDate;
  deposit.amount = amount;
  if (interestRate !== undefined) {
    deposit.interestRate = interestRate;
  }
  if (expectedAmountPeriod !== undefined) {
    deposit.expectedAmountPeriod = expectedAmountPeriod;
  }
  await deposit.save();

  res.json({
    success: true,
    message: "Deposit updated successfully",
    data: deposit,
  });
});

const finishDeposit = asyncHandler(async (req, res) => {
  const { depositId } = req.params;

  if (!mongoose.isValidObjectId(depositId)) {
    throw httpError(400, "Invalid deposit id");
  }

  const deposit = await Deposit.findById(depositId);

  if (!deposit) {
    throw httpError(404, "Deposit not found");
  }

  if (deposit.isFinished) {
    throw httpError(400, "Deposit is already finished");
  }

  const holder = await AccountHolder.findById(deposit.holderId).select("category");
  const finishedDeposit = await Deposit.create({
    holderId: deposit.holderId,
    category: holder?.category || deposit.category || "bank",
    depositDate: new Date(),
    amount: deposit.amount,
    interestRate: deposit.interestRate,
    expectedAmountPeriod: deposit.expectedAmountPeriod,
    isFinished: true,
    originalDepositId: deposit._id,
  });

  deposit.isFinished = true;
  deposit.finishedDepositId = finishedDeposit._id;
  await deposit.save();

  res.status(201).json({
    success: true,
    message: "Deposit finished successfully",
    data: finishedDeposit,
  });
});

const undoFinishDeposit = asyncHandler(async (req, res) => {
  const { depositId } = req.params;

  if (!mongoose.isValidObjectId(depositId)) {
    throw httpError(400, "Invalid deposit id");
  }

  const deposit = await Deposit.findById(depositId);

  if (!deposit) {
    throw httpError(404, "Deposit not found");
  }

  if (!deposit.isFinished || !deposit.finishedDepositId) {
    throw httpError(400, "This deposit cannot be undone");
  }

  const finishedDeposit = await Deposit.findOne({
    _id: deposit.finishedDepositId,
    originalDepositId: deposit._id,
  });

  if (!finishedDeposit) {
    throw httpError(404, "Finished deposit copy not found");
  }

  deposit.isFinished = false;
  deposit.finishedDepositId = null;
  await deposit.save();
  await Deposit.findByIdAndDelete(finishedDeposit._id);

  res.json({
    success: true,
    message: "Deposit finish undone successfully",
    data: deposit,
  });
});

const deleteHolder = asyncHandler(async (req, res) => {
  const { holderId } = req.params;

  if (!mongoose.isValidObjectId(holderId)) {
    throw httpError(400, "Invalid holder id");
  }

  const holder = await AccountHolder.findById(holderId);

  if (!holder) {
    throw httpError(404, "Account holder not found");
  }

  await Promise.all([Deposit.deleteMany({ holderId }), AccountHolder.findByIdAndDelete(holderId)]);

  res.json({
    success: true,
    message: "Account holder deleted successfully",
  });
});

const deleteDeposit = asyncHandler(async (req, res) => {
  const { depositId } = req.params;

  if (!mongoose.isValidObjectId(depositId)) {
    throw httpError(400, "Invalid deposit id");
  }

  const deposit = await Deposit.findById(depositId);

  if (!deposit) {
    throw httpError(404, "Deposit not found");
  }

  await Deposit.findByIdAndDelete(depositId);

  res.json({
    success: true,
    message: "Deposit deleted successfully",
  });
});

module.exports = {
  getHolderDetails,
  createDeposit,
  updateDeposit,
  finishDeposit,
  undoFinishDeposit,
  deleteHolder,
  deleteDeposit,
};
