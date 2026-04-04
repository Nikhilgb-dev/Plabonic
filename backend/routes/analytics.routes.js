import express from "express";
import { recordVisit, getAnalyticsOverview } from "../controllers/analytics.controller.js";
import { protect, adminOnly } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/visit", recordVisit);
router.get("/overview", protect, adminOnly, getAnalyticsOverview);

export default router;
