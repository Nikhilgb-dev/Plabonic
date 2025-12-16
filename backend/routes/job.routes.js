import express from "express";
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  applyJob,
  getJobCategories,
  getMyApplicationProfile,
  reportAbuse,
} from "../controllers/job.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

import { upload } from "../utils/cloudinary.util.js";

const router = express.Router();

router.post("/", protect, createJob);

router.post("/:id/apply", protect, upload.single("resume"), applyJob);
router.post("/:id/report-abuse", protect, reportAbuse);
router.get("/", getJobs);
router.get("/my-profile", protect, getMyApplicationProfile);
router.get("/:id", getJobById);
router.get("/categories", getJobCategories);
router.put("/:id", protect, updateJob);
router.delete("/:id", protect, deleteJob);

export default router;
