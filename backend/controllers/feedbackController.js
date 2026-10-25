const Feedback = require("../models/Feedback");

// @route  POST /api/feedback
// @desc   Submit a new piece of feedback (name, email, comment)
// @access Public
exports.submitFeedback = async (req, res) => {
  try {
    const { name, email, comment } = req.body;

    const feedback = await Feedback.create({ name, email, comment });

    return res.status(201).json({
      message: "Feedback received — thank you",
      feedback: {
        id: feedback._id,
        name: feedback.name,
        comment: feedback.comment,
        createdAt: feedback.createdAt,
      },
    });
  } catch (error) {
    // Log the real error server-side only — never send DB/internal error detail to the client
    console.error("submitFeedback error:", error);
    return res.status(500).json({ message: "Something went wrong while saving your feedback" });
  }
};

// @route  GET /api/feedback
// @desc   List feedback entries, most recent first (email intentionally omitted from the public list)
// @access Public
exports.getFeedback = async (req, res) => {
  try {
    // Clamp any requested page size instead of trusting client input directly
    const requestedLimit = parseInt(req.query.limit, 10);
    const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 50) : 50;

    const entries = await Feedback.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("name comment createdAt");

    return res.status(200).json({ feedback: entries });
  } catch (error) {
    console.error("getFeedback error:", error);
    return res.status(500).json({ message: "Something went wrong while loading feedback" });
  }
};
