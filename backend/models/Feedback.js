const mongoose = require("mongoose");

// Schema-level guard against angle brackets: even if a request somehow bypasses the
// express-validator checks in routes/feedback.js, Mongoose itself will still refuse
// to save anything containing "<" or ">", which blocks stored HTML/script injection.
const noHtmlTags = [/^[^<>]*$/, "HTML tags are not allowed"];

const feedbackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 60,
      match: noHtmlTags,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      maxlength: 254,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    comment: {
      type: String,
      required: [true, "A comment is required"],
      trim: true,
      minlength: 3,
      maxlength: 1000,
      match: noHtmlTags,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
