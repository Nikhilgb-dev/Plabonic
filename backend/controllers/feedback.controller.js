import Feedback from "../models/feedback.model.js";
import Company from "../models/company.model.js";
import User from "../models/user.model.js";

export const createFeedback = async (req, res) => {
  try {
    const { message, rating, targetType, targetId, subject } = req.body;
    const submittedBy = req.user.role === "company_admin" ? "company" : "user";

    if (!message || !targetType)
      return res
        .status(400)
        .json({ message: "Please include a message and a target type." });

    if (submittedBy === "company" && targetType !== "platform") {
      return res
        .status(400)
        .json({ message: "Companies can only send feedback about platform" });
    }

    const feedback = await Feedback.create({
      user: submittedBy === "user" ? req.user._id : null,
      company: submittedBy === "company" ? req.user.company : null,
      targetType,
      targetId: targetType === "company" ? targetId : null,
      message,
      subject,
      rating,
      submittedBy,
    });

    res.status(201).json(feedback);
  } catch (err) {
    console.error("❌ Error in createFeedback:", err);
    res.status(500).json({ message: "Something went wrong on our side. Please try again." });
  }
};

export const replyToFeedback = async (req, res) => {
  try {
    const { reply } = req.body;

    if (!reply || reply.trim() === "")
      return res.status(400).json({ message: "Please write a reply before sending." });

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback)
      return res.status(404).json({ message: "Feedback not found" });

    feedback.reply = reply;
    feedback.repliedAt = new Date();

    await feedback.save();

    res.json({ message: "Reply added successfully", feedback });
  } catch (err) {
    console.error("❌ Error replying to feedback:", err);
    res.status(500).json({ message: "Something went wrong on our side. Please try again." });
  }
};

export const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("user", "name email profilePhoto")
      .populate("company", "name logo")
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong on our side. Please try again." });
  }
};

export const getCompanyFeedbacks = async (req, res) => {
  try {
    const { companyId } = req.params;
    const feedbacks = await Feedback.find({
      targetType: "company",
      targetId: companyId,
    })
      .populate("user", "name email profilePhoto")
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong on our side. Please try again." });
  }
};

export const getMyFeedbacks = async (req, res) => {
  try {
    const filter =
      req.user.role === "company_admin"
        ? { company: req.user.company, submittedBy: "company" }
        : { user: req.user._id, submittedBy: "user" };

    const feedbacks = await Feedback.find(filter).sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong on our side. Please try again." });
  }
};


