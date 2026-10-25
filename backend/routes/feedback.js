const express = require("express");
const { body, query } = require("express-validator");
const { submitFeedback, getFeedback } = require("../controllers/feedbackController");
const validate = require("../middleware/validate");

const router = express.Router();

const noHtmlTags = (value) => !/[<>]/.test(value);

router.post(
  "/",
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2, max: 60 })
      .withMessage("Name must be between 2 and 60 characters")
      .custom(noHtmlTags)
      .withMessage("Name cannot contain HTML tags"),
    body("email")
      .trim()
      .isEmail()
      .withMessage("A valid email is required")
      .isLength({ max: 254 })
      .withMessage("Email is too long")
      .normalizeEmail(),
    body("comment")
      .trim()
      .isLength({ min: 3, max: 1000 })
      .withMessage("Comment must be between 3 and 1000 characters")
      .custom(noHtmlTags)
      .withMessage("Comment cannot contain HTML tags"),
  ],
  validate,
  submitFeedback
);

router.get(
  "/",
  [query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("limit must be between 1 and 50")],
  validate,
  getFeedback
);

module.exports = router;
