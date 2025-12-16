import express from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  createJob,
  getAllJobs,
  updateJob,
  deleteJob,
  verifyJob,
  createCommunity,
  getAllCommunities,
  updateCommunity,
  deleteCommunity,
  createPost,
  getAllPosts,
  updatePost,
  deletePost,
  getAllApplications,
  updateApplicationStatus,
  getAdminJobStats,
  getAllFreelancers,
  verifyFreelancer,
  deleteFreelancer,
  getAllAbuseReports,
  updateAbuseReportStatus,
  blockCompany,
  reviewCompanyResponse,
  blockJob,
  exportUsersExcel,
  exportCompaniesExcel,
  exportJobsExcel,
  exportFreelancersExcel,
} from "../controllers/admin.controller.js";
import { protect, adminOnly } from "../middlewares/auth.middleware.js";
import { upload } from "../utils/cloudinary.util.js";

const router = express.Router();

// USER CRUD
router.post("/users", protect, adminOnly, createUser);
router.get("/users", protect, adminOnly, getAllUsers);
router.get("/users/:id", protect, adminOnly, getUserById);
router.put(
  "/users/:id",
  protect,
  adminOnly,
  upload.single("profilePhoto"),
  updateUser
);
router.delete("/users/:id", protect, adminOnly, deleteUser);

// JOB CRUD
router.post("/jobs", protect, adminOnly, createJob);
router.get("/jobs", protect, adminOnly, getAllJobs);
router.put("/jobs/:id", protect, adminOnly, updateJob);
router.put("/jobs/:id/verify", protect, adminOnly, verifyJob);
router.delete("/jobs/:id", protect, adminOnly, deleteJob);
router.get("/applications", protect, adminOnly, getAllApplications);

router.put(
  "/applications/:id/status",
  protect,
  adminOnly,
  updateApplicationStatus
);

router.get("/jobs/stats", protect, adminOnly, getAdminJobStats);
router.get("/export/jobs", protect, adminOnly, exportJobsExcel);
router.get("/export/users", protect, adminOnly, exportUsersExcel);


// COMMUNITY CRUD
router.post("/communities", protect, adminOnly, createCommunity);
router.get("/communities", protect, adminOnly, getAllCommunities);
router.put("/communities/:id", protect, adminOnly, updateCommunity);
router.delete("/communities/:id", protect, adminOnly, deleteCommunity);

// POST CRUD
router.post("/posts", protect, adminOnly, createPost);
router.get("/posts", protect, adminOnly, getAllPosts);
router.put("/posts/:id", protect, adminOnly, updatePost);
router.delete("/posts/:id", protect, adminOnly, deletePost);

// FREELANCER CRUD
router.get("/freelancers", protect, adminOnly, getAllFreelancers);
router.put("/freelancers/:id/verify", protect, adminOnly, verifyFreelancer);
router.delete("/freelancers/:id", protect, adminOnly, deleteFreelancer);
router.get("/export/freelancers", protect, adminOnly, exportFreelancersExcel);

// ABUSE REPORTS
router.get("/abuse-reports", protect, adminOnly, getAllAbuseReports);
router.put("/abuse-reports/:id/status", protect, adminOnly, updateAbuseReportStatus);
router.put("/abuse-reports/:id/review", protect, adminOnly, reviewCompanyResponse);

// COMPANIES
router.put("/companies/:id/block", protect, adminOnly, blockCompany);
router.get("/export/companies", protect, adminOnly, exportCompaniesExcel);

// JOBS
router.put("/jobs/:id/block", protect, adminOnly, blockJob);

export default router;
