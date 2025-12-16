// ✅ company.routes.js (correct order)
import express from "express";
import {
  getMyCompanyProfile,
  getCompanyDashboard,
  getMyJobs,
  createJobForCompany,
  updateMyJob,
  deleteMyJob,
  getMyEmployees,
  fireEmployee,
  getCompanyApplicants,
  getAllCompanies,
  getCompanyById,
  verifyCompany,
  deleteCompany,
  createCompanyByAdmin,
  registerCompany,
  createEmployeeForCompany,
  updateCompanyApplicationStatus,
  updateMyCompany,
  getMyCompany,
  addCompanyRemark,
  companyNotifications,
  getCompanyAbuseReports,
  updateAbuseReport,
} from "../controllers/company.controller.js";
import { companyLogin } from "../controllers/companyAuth.controller.js";
import {
  protect,
  companyAdminOnly,
  adminOnly,
} from "../middlewares/auth.middleware.js";
import { upload } from "../utils/cloudinary.util.js";

const router = express.Router();

router.post(
  "/register",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "verificationDocs" },
    { name: "authorizedSignatory[signature]", maxCount: 1 },
  ]),
  registerCompany
);

router.post("/login", companyLogin);

// ---- Company Admin Routes ----
router.get("/me", protect, companyAdminOnly, getMyCompanyProfile);
router.get("/me/dashboard", protect, companyAdminOnly, getCompanyDashboard);
router.get("/me/jobs", protect, companyAdminOnly, getMyJobs);
router.post("/me/jobs", protect, companyAdminOnly, createJobForCompany);
router.put("/me/jobs/:id", protect, companyAdminOnly, updateMyJob);
router.delete("/me/jobs/:id", protect, companyAdminOnly, deleteMyJob);
router.get("/me/employees", protect, companyAdminOnly, getMyEmployees);
router.put("/me/employees/:id/fire", protect, companyAdminOnly, fireEmployee);
router.get("/me/applicants", protect, companyAdminOnly, getCompanyApplicants);
router.get("/me/abuse-reports", protect, companyAdminOnly, getCompanyAbuseReports);
router.put("/me/abuse-reports/:id", protect, companyAdminOnly, updateAbuseReport);

router.put("/:id/remark", protect, adminOnly, addCompanyRemark);
router.get("/me/remarks", protect, companyNotifications);

router.post(
  "/me/employees",
  protect,
  companyAdminOnly,
  upload.single("profilePhoto"),
  createEmployeeForCompany
);

router.put(
  "/me/applicants/:id/status",
  protect,
  companyAdminOnly,
  updateCompanyApplicationStatus
);

// ---- Admin Routes ----
// router.post("/admin/create", protect, adminOnly, createCompanyByAdmin);
router.post(
  "/admin/create",
  protect,
  adminOnly,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "verificationDocs" },
    { name: "authorizedSignatory[signature]", maxCount: 1 },
  ]),
  createCompanyByAdmin
);
router.put("/:id/verify", protect, adminOnly, verifyCompany);
router.delete("/:id", protect, adminOnly, deleteCompany);

router.get("/me", protect, companyAdminOnly, getMyCompany);
router.put(
  "/me",
  protect,
  companyAdminOnly,
  upload.single("logo"),
  updateMyCompany
);

// ---- Must always come LAST ----
router.get("/", getAllCompanies);
router.get("/:id", getCompanyById); // dynamic route LAST!

export default router;
