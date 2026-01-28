import express from "express";
import multer from "multer";
import {
  createFreelancer,
  getAllFreelancers,
  getFreelancerById,
  updateFreelancer,
  deleteFreelancer,
  getMyFreelancerApplications,
  getFreelancerApplications,
  applyToFreelancer,
  getMyFreelancerProfile,
  updateMyFreelancerProfile,
  updateApplicationStatus,
  withdrawFreelancerApplication,
  updateFreelancerApplication,
  respondToFreelancerOffer,
} from "../controllers/freelancer.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", protect, upload.single("photo"), createFreelancer);
router.post("/register", upload.single("photo"), createFreelancer);

router.get("/", getAllFreelancers);

router.get("/me/applications", protect, getMyFreelancerApplications);
router.get("/me", protect, getMyFreelancerProfile);
router.put("/me", protect, upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'resume', maxCount: 1 }]), updateMyFreelancerProfile);

router.put("/applications/:id/status", protect, updateApplicationStatus);
router.put("/applications/:id", protect, upload.single("resume"), updateFreelancerApplication);
router.put("/applications/:id/respond", protect, respondToFreelancerOffer);
router.delete("/applications/:id", protect, withdrawFreelancerApplication);

router.post("/:id/apply", protect, upload.single("resume"), applyToFreelancer);
router.get("/:id/applications", protect, getFreelancerApplications);

router.get("/:id", getFreelancerById);
router.put("/:id", protect, upload.single("photo"), updateFreelancer);
router.delete("/:id", protect, deleteFreelancer);

export default router;
