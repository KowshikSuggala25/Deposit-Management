const express = require("express");
const { body, param } = require("express-validator");
const { getFinanceDashboard, createFinanceHolder, updateFinanceHolder } = require("../controllers/financeController");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();
const categoryParam = param("category").isIn(["gold", "cash"]).withMessage("Invalid finance category");
router.get("/:category", [categoryParam], validateRequest, getFinanceDashboard);
router.post("/:category/holders", [
  categoryParam,
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("phoneNumber").trim().matches(/^\d{10}$/).withMessage("Phone number must be 10 digits"),
], validateRequest, createFinanceHolder);
router.put("/:category/holders/:holderId", [
  categoryParam, param("holderId").isMongoId(),
  body("name").trim().notEmpty(), body("phoneNumber").trim().matches(/^\d{10}$/),
], validateRequest, updateFinanceHolder);
module.exports = router;
