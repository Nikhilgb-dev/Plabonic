import express from "express";
import { protect, adminOnly } from "../middlewares/auth.middleware.js";
import {
  createFeedback,
  getAllFeedbacks,
  getCompanyFeedbacks,
  getMyFeedbacks,
  replyToFeedback,
  getPublicFeedbacks,
} from "../controllers/feedback.controller.js";

const router = express.Router();

router.post("/", protect, createFeedback);
router.get("/public", getPublicFeedbacks);
router.get("/my", protect, getMyFeedbacks);
router.get("/company/:companyId", protect, getCompanyFeedbacks);
router.get("/admin/all", protect, adminOnly, getAllFeedbacks);

// 🆕 Reply route
router.put("/:id/reply", protect, adminOnly, replyToFeedback);

export default router;
