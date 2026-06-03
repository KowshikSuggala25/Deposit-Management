const express = require("express");
const { body, param } = require("express-validator");
const {
  createBank,
  updateBank,
  createHolder,
  updateHolder,
  deleteBank,
  getBankDetails,
} = require("../controllers/bankController");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.get("/:bankId", [param("bankId").isMongoId().withMessage("Invalid bank id")], validateRequest, getBankDetails);

router.post(
  "/",
  [body("bankName").trim().notEmpty().withMessage("Bank name is required")],
  validateRequest,
  createBank
);

router.put(
  "/:bankId",
  [
    param("bankId").isMongoId().withMessage("Invalid bank id"),
    body("bankName").trim().notEmpty().withMessage("Bank name is required"),
  ],
  validateRequest,
  updateBank
);

router.delete(
  "/:bankId",
  [param("bankId").isMongoId().withMessage("Invalid bank id")],
  validateRequest,
  deleteBank
);

router.post(
  "/:bankId/holders",
  [
    param("bankId").isMongoId().withMessage("Invalid bank id"),
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("phoneNumber")
      .trim()
      .matches(/^\d{10}$/)
      .withMessage("Phone number must be 10 digits"),
  ],
  validateRequest,
  createHolder
);

router.put(
  "/:bankId/holders/:holderId",
  [
    param("bankId").isMongoId().withMessage("Invalid bank id"),
    param("holderId").isMongoId().withMessage("Invalid holder id"),
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("phoneNumber")
      .trim()
      .matches(/^\d{10}$/)
      .withMessage("Phone number must be 10 digits"),
  ],
  validateRequest,
  updateHolder
);

module.exports = router;
