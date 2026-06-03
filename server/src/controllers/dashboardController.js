const Bank = require("../models/Bank");
const AccountHolder = require("../models/AccountHolder");
const Deposit = require("../models/Deposit");
const asyncHandler = require("../middleware/asyncHandler");
const getPagination = require("../utils/pagination");

const getDashboard = asyncHandler(async (req, res) => {
  const { search = "", page = 1, limit = 9 } = req.query;
  const { page: currentPage, limit: perPage, skip } = getPagination(page, limit);

  const searchQuery = search.trim()
    ? {
        bankName: { $regex: search.trim(), $options: "i" },
      }
    : {};

  const [totalBanks, totalAccountHolders, depositSummary, totalFilteredBanks, banks] = await Promise.all([
    Bank.countDocuments(),
    AccountHolder.countDocuments(),
    Deposit.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]),
    Bank.countDocuments(searchQuery),
    Bank.aggregate([
      { $match: searchQuery },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: perPage },
      {
        $lookup: {
          from: "accountholders",
          localField: "_id",
          foreignField: "bankId",
          as: "holders",
        },
      },
      {
        $lookup: {
          from: "deposits",
          let: { holderIds: "$holders._id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$holderId", "$$holderIds"],
                },
              },
            },
            {
              $group: {
                _id: null,
                totalAmount: { $sum: "$amount" },
              },
            },
          ],
          as: "depositTotals",
        },
      },
      {
        $project: {
          bankName: 1,
          createdAt: 1,
          accountHolderCount: { $size: "$holders" },
          totalDepositedAmount: {
            $ifNull: [{ $arrayElemAt: ["$depositTotals.totalAmount", 0] }, 0],
          },
        },
      },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      summary: {
        totalBanks,
        totalAccountHolders,
        totalDepositedAmount: depositSummary[0]?.total || 0,
      },
      banks,
      pagination: {
        page: currentPage,
        limit: perPage,
        total: totalFilteredBanks,
        totalPages: Math.max(Math.ceil(totalFilteredBanks / perPage), 1),
      },
    },
  });
});

module.exports = {
  getDashboard,
};
