import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import Notification from "../models/notification.model.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate("job", "title")
    .populate("company", "name logo");
  res.json(notifications);
});

router.put("/:id/read", protect, async (req, res) => {
  const n = await Notification.findByIdAndUpdate(
    req.params.id,
    { isRead: true },
    { new: true }
  );
  res.json(n);
});

router.delete("/", protect, async (req, res) => {
  await Notification.deleteMany({ user: req.user._id });
  res.json({ message: "Notifications cleared" });
});

export default router;
