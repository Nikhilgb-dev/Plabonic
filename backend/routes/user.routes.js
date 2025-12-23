import express from "express";
import {
  getProfile,
  updateProfile,
  toggleFollow,
  getMyProfile,
  updateMyProfile,
  deleteMyAccount,
  getSavedJobs,
  saveJob,
  unsaveJob,
  saveFreelancer,
  unsaveFreelancer,
} from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { upload } from "../utils/cloudinary.util.js";

const router = express.Router();

// Self profile (CRUD-like for own account)
router.get("/me", protect, getProfile);
router.get("/me", protect, getMyProfile);
router.put("/me", protect, upload.fields([{ name: 'profilePhoto', maxCount: 1 }, { name: 'resume', maxCount: 1 }]), updateMyProfile);
router.delete("/me", protect, deleteMyAccount);
// Follow/unfollow other users
router.post("/:id/follow", protect, toggleFollow);
// Saved jobs
router.get("/saved-jobs", protect, getSavedJobs);
// Save/unsave jobs
router.post("/jobs/:jobId/save", protect, saveJob);
router.delete("/jobs/:jobId/save", protect, unsaveJob);
// Save/unsave freelancers
router.post("/freelancers/:freelancerId/save", protect, saveFreelancer);
router.delete("/freelancers/:freelancerId/save", protect, unsaveFreelancer);

export default router;
