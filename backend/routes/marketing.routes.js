import express from "express";
import {
  createMarketingCard,
  createMarketingEnquiry,
  getMarketingCardById,
  getMarketingCards,
  getMarketingEnquiries,
} from "../controllers/marketing.controller.js";
import { adminOnly, protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/cards", getMarketingCards);
router.get("/cards/:id", getMarketingCardById);
router.post("/cards", protect, adminOnly, createMarketingCard);
router.post("/cards/:id/enquiries", createMarketingEnquiry);
router.get("/enquiries", protect, adminOnly, getMarketingEnquiries);

export default router;
