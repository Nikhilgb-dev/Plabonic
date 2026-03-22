import express from "express";
import { protect, adminOnly } from "../middlewares/auth.middleware.js";
import {
  createFeedback,
  deleteFeedback,
  getAllFeedbacks,
  getCompanyFeedbacks,
  getMyFeedbacks,
  replyToFeedback,
  getPublicFeedbacks,
  toggleFeedbackHomepageVisibility,
} from "../controllers/feedback.controller.js";

const router = express.Router();

router.post("/", protect, createFeedback);
router.get("/public", getPublicFeedbacks);
router.get("/my", protect, getMyFeedbacks);
router.get("/company/:companyId", protect, getCompanyFeedbacks);
router.get("/admin/all", protect, adminOnly, getAllFeedbacks);
router.delete("/:id", protect, adminOnly, deleteFeedback);
router.put("/:id/reply", protect, adminOnly, replyToFeedback);
router.put("/:id/homepage", protect, adminOnly, toggleFeedbackHomepageVisibility);

export default router;
