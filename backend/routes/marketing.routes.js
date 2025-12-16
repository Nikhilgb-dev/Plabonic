import express from "express";
import {
  createMarketingCard,
  createMarketingEnquiry,
  deleteMarketingCard,
  getMarketingCardById,
  getMarketingCards,
  getMarketingEnquiries,
  updateMarketingCard,
} from "../controllers/marketing.controller.js";
import { adminOnly, protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/cards", getMarketingCards);
router.get("/cards/:id", getMarketingCardById);
router.post("/cards", protect, adminOnly, createMarketingCard);
router.put("/cards/:id", protect, adminOnly, updateMarketingCard);
router.delete("/cards/:id", protect, adminOnly, deleteMarketingCard);
router.post("/cards/:id/enquiries", createMarketingEnquiry);
router.get("/enquiries", protect, adminOnly, getMarketingEnquiries);

export default router;
