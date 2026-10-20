const express = require("express");
const { body, param } = require("express-validator");
const {
  getHolderDetails,
  createDeposit,
  updateDeposit,
  finishDeposit,
  undoFinishDeposit,
  deleteHolder,
  deleteDeposit,
} = require("../controllers/holderController");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.get(
  "/:holderId",
  [param("holderId").isMongoId().withMessage("Invalid holder id")],
  validateRequest,
  getHolderDetails
);

router.post(
  "/:holderId/deposits",
  [
    param("holderId").isMongoId().withMessage("Invalid holder id"),
    body("depositDate").notEmpty().withMessage("Date is required").isISO8601().withMessage("Invalid date"),
    body("amount").isFloat({ gt: 0 }).withMessage("Amount must be greater than zero"),
    body("interestRate").optional().isFloat({ min: 0 }).withMessage("Interest rate cannot be negative"),
    body("expectedAmountPeriod").optional().isIn(["month", "year"]).withMessage("Invalid expected amount period"),
  ],
  validateRequest,
  createDeposit
);

router.put(
  "/deposits/:depositId",
  [
    param("depositId").isMongoId().withMessage("Invalid deposit id"),
    body("depositDate").notEmpty().withMessage("Date is required").isISO8601().withMessage("Invalid date"),
    body("amount").isFloat({ gt: 0 }).withMessage("Amount must be greater than zero"),
    body("interestRate").optional().isFloat({ min: 0 }).withMessage("Interest rate cannot be negative"),
    body("expectedAmountPeriod").optional().isIn(["month", "year"]).withMessage("Invalid expected amount period"),
  ],
  validateRequest,
  updateDeposit
);

router.post(
  "/deposits/:depositId/finish",
  [param("depositId").isMongoId().withMessage("Invalid deposit id")],
  validateRequest,
  finishDeposit
);

router.post(
  "/deposits/:depositId/undo-finish",
  [param("depositId").isMongoId().withMessage("Invalid deposit id")],
  validateRequest,
  undoFinishDeposit
);

router.delete(
  "/:holderId",
  [param("holderId").isMongoId().withMessage("Invalid holder id")],
  validateRequest,
  deleteHolder
);

router.delete(
  "/deposits/:depositId",
  [param("depositId").isMongoId().withMessage("Invalid deposit id")],
  validateRequest,
  deleteDeposit
);

module.exports = router;
