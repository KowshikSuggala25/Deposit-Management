const mongoose = require("mongoose");
const AccountHolder = require("../models/AccountHolder");
const Bank = require("../models/Bank");
const Deposit = require("../models/Deposit");
const asyncHandler = require("../middleware/asyncHandler");
const getPagination = require("../utils/pagination");
const buildDateRange = require("../utils/dateFilters");
const httpError = require("../utils/httpError");

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

  const bank = await Bank.findById(holder.bankId).lean();

  if (!bank) {
    throw httpError(404, "Bank not found");
  }

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
          createdAt: 1,
        },
      },
    ]),
    Deposit.aggregate([
      {
        $match: {
          holderId: new mongoose.Types.ObjectId(holderId),
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
        bankId: bank._id,
        bankName: bank.bankName,
      },
      stats: {
        totalDepositsCount: totalStats[0]?.totalCount || 0,
        totalDepositedAmount: totalStats[0]?.totalAmount || 0,
      },
      deposits: filteredDeposits,
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
  const { depositDate, amount } = req.body;

  if (!mongoose.isValidObjectId(holderId)) {
    throw httpError(400, "Invalid holder id");
  }

  const holder = await AccountHolder.findById(holderId);

  if (!holder) {
    throw httpError(404, "Account holder not found");
  }

  const createdDeposit = await Deposit.create({
    holderId,
    depositDate,
    amount,
  });

  res.status(201).json({
    success: true,
    message: "Deposit added successfully",
    data: createdDeposit,
  });
});

const updateDeposit = asyncHandler(async (req, res) => {
  const { depositId } = req.params;
  const { depositDate, amount } = req.body;

  if (!mongoose.isValidObjectId(depositId)) {
    throw httpError(400, "Invalid deposit id");
  }

  const deposit = await Deposit.findById(depositId);

  if (!deposit) {
    throw httpError(404, "Deposit not found");
  }

  deposit.depositDate = depositDate;
  deposit.amount = amount;
  await deposit.save();

  res.json({
    success: true,
    message: "Deposit updated successfully",
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
  deleteHolder,
  deleteDeposit,
};
