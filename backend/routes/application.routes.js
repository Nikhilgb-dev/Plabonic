import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import Application from "../models/application.model.js";

const router = express.Router();

// GET applications by logged-in user
router.get("/me", protect, async (req, res) => {
  const apps = await Application.find({ user: req.user._id })
    .populate({
      path: "job",
      populate: { path: "company", select: "name logo email contactNumber" },
    })
    .sort({ createdAt: -1 });
  res.json({ applications: apps });
});

// DELETE (withdraw)
router.delete("/:id", protect, async (req, res) => {
  const app = await Application.findById(req.params.id);
  if (!app) return res.status(404).json({ message: "We could not find that application." });
  if (app.user.toString() !== req.user._id.toString())
    return res.status(403).json({ message: "You do not have permission to do that." });

  await app.deleteOne();
  res.json({ message: "Application withdrawn" });
});

// PUT accept/reject offer (only when status is "hired")
router.put("/:id/respond", protect, async (req, res) => {
  const { action } = req.body; // "accept" or "reject"
  if (!["accept", "reject"].includes(action)) {
    return res.status(400).json({ message: "That action is not allowed. Choose accept or reject." });
  }

  const app = await Application.findById(req.params.id).populate({
    path: "job",
    populate: { path: "company", select: "name logo" },
  });

  if (!app) return res.status(404).json({ message: "We could not find that application." });
  if (app.user.toString() !== req.user._id.toString())
    return res.status(403).json({ message: "You do not have permission to do that." });
  if (app.status !== "hired")
    return res.status(400).json({ message: "You can only respond to applications that are marked as hired." });

  app.status = action === "accept" ? "accepted" : "rejected";
  if (action === "accept") {
    app.timeline.acceptedAt = new Date();
  } else {
    app.timeline.rejectedAt = new Date();
  }

  await app.save();
  res.json({ message: `Offer ${action}ed successfully`, application: app });
});

export default router;

