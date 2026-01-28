import Company from "../models/company.model.js";
import User from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.util.js";
import bcrypt from "bcryptjs";
import Application from "../models/application.model.js";
import Notification from "../models/notification.model.js";
import Job from "../models/job.model.js";
import generateToken from "../utils/generateToken.util.js";
import AbuseReport from "../models/abuseReport.model.js";

export const registerCompany = async (req, res) => {
  try {
    const {
      name,
      domain,
      industry,
      size,
      type,
      tagline,
      description,
      email,
      contactNumber,
      password,
      registrationName,
      panOrTanOrGst,
      dateOfIncorporation,
      registeredOfficeAddress,
      directorAndKmpDetails,
      authorizedSignatory,
      acceptTerms,
    } = req.body;

    const normalizedIncorporationDate = dateOfIncorporation
      ? new Date(dateOfIncorporation)
      : undefined;

    // Check if company admin email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "That email is already in use. Try another or sign in." });

    // Upload logo if provided
    let logo = "";
    if (req.files?.logo && req.files.logo[0]) {
      logo = await uploadToCloudinary(req.files.logo[0], "company_logos");
    }

    // Upload verification docs if provided
    let verificationDocs = [];
    if (req.files?.verificationDocs && req.files.verificationDocs.length > 0) {
      for (const file of req.files.verificationDocs) {
        const uploaded = await uploadToCloudinary(file, "company_docs");
        verificationDocs.push(uploaded);
      }
    }

    // Create the company entry
    const company = await Company.create({
      name,
      domain,
      industry,
      size,
      type,
      tagline,
      description,
      email,
      contactNumber,
      registrationName,
      panOrTanOrGst,
      dateOfIncorporation: normalizedIncorporationDate,
      registeredOfficeAddress,
      directorAndKmpDetails,
      authorizedSignatory: JSON.parse(authorizedSignatory || "{}"),
      logo,
      verificationDocs,
      termsAccepted: acceptTerms,
      address: registeredOfficeAddress || address,
    });

    const hashedPassword = await bcrypt.hash(password, 10);
    const companyAdmin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "company_admin",
      company: company._id,
    });

    // Link back to company
    company.admins.push(companyAdmin._id);
    await company.save();

    res.status(201).json({
      message: "Company registered successfully",
      company,
      companyAdmin: {
        _id: companyAdmin._id,
        email: companyAdmin.email,
        role: companyAdmin.role,
        token: generateToken(companyAdmin._id, companyAdmin.role),
      },
    });
  } catch (err) {
    console.error("Error in registerCompany:", err);
    res.status(400).json({ message: "We couldn't process that request. Please check your input and try again." });
  }
};

// ========== ADMIN REGISTRATION ==========
export const createCompanyByAdmin = async (req, res) => {
  try {
    const {
      name,
      domain,
      industry,
      size,
      type,
      tagline,
      description,
      email,
      password,
      contactNumber,
      registrationName,
      panOrTanOrGst,
      dateOfIncorporation,
      registeredOfficeAddress,
      directorAndKmpDetails,
      authorizedSignatoryName,
      authorizedSignatoryDesignation,
      acceptTerms,
    } = req.body;

    if (!name || !domain || !email || !password) {
      return res.status(400).json({
        message: "Name, domain, email, and password are required fields",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "That email is already in use. Try another or sign in." });
    }

    let logo = "";
    if (req.files?.logo && req.files.logo[0]) {
      logo = await uploadToCloudinary(req.files.logo[0], "company_logos");
    }

    let verificationDocs = [];
    if (req.files?.verificationDocs && req.files.verificationDocs.length > 0) {
      for (const file of req.files.verificationDocs) {
        const uploaded = await uploadToCloudinary(file, "company_docs");
        verificationDocs.push(uploaded);
      }
    }

    let signature = "";
    if (req.files?.["authorizedSignatory[signature]"]?.[0]) {
      signature = await uploadToCloudinary(
        req.files["authorizedSignatory[signature]"][0],
        "signatures"
      );
    }

    const normalizedIncorporationDate = dateOfIncorporation
      ? new Date(dateOfIncorporation)
      : undefined;

    const company = await Company.create({
      name,
      domain,
      industry,
      size,
      type,
      tagline,
      description,
      email,
      contactNumber,
      logo,
      verificationDocs,
      address: registeredOfficeAddress || address,
      registrationName,
      panOrTanOrGst,
      dateOfIncorporation: normalizedIncorporationDate,
      registeredOfficeAddress,
      directorAndKmpDetails,
      authorizedSignatory: {
        name: authorizedSignatoryName || "",
        designation: authorizedSignatoryDesignation || "",
        signature,
      },
      termsAccepted: acceptTerms,
    });

    const hashedPassword = await bcrypt.hash(password, 10);
    const companyAdmin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "company_admin",
      company: company._id,
    });

    company.admins.push(companyAdmin._id);
    await company.save();

    res.status(201).json({
      message: "Company created successfully by admin",
      company,
      companyAdmin: {
        _id: companyAdmin._id,
        email: companyAdmin.email,
        role: companyAdmin.role,
      },
    });
  } catch (err) {
    console.error("Error in createCompanyByAdmin:", err);
    res.status(400).json({ message: "We couldn't process that request. Please check your input and try again." });
  }
};

export const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find().populate("admins", "name email");
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong on our side. Please try again." });
  }
};

// ========== GET ONE ==========
export const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).populate(
      "admins",
      "name email"
    );
    if (!company) return res.status(404).json({ message: "We could not find that company." });
    res.json(company);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong on our side. Please try again." });
  }
};

export const verifyCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: "We could not find that company." });

    // Toggle verified status
    company.verified = !company.verified;
    await company.save();

    res.json(company);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong on our side. Please try again." });
  }
};

// Delete company
export const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) return res.status(404).json({ message: "We could not find that company." });

    const jobs = await Job.find({ company: company._id }).select("_id");
    const jobIds = jobs.map((j) => j._id);

    if (jobIds.length) {
      await Application.deleteMany({ job: { $in: jobIds } });
      await Notification.deleteMany({ job: { $in: jobIds } });
      await AbuseReport.deleteMany({ job: { $in: jobIds } });
      await Job.deleteMany({ _id: { $in: jobIds } });
    }

    await Notification.deleteMany({ company: company._id });
    await User.deleteMany({ company: company._id });

    res.json({ message: "Company deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong on our side. Please try again." });
  }
};

export const deleteMyJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: "We could not find that job." });
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong on our side. Please try again." });
  }
};

export const updateMyJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!job) return res.status(404).json({ message: "We could not find that job." });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong on our side. Please try again." });
  }
};

export const getMyCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.user.company);
    if (!company) return res.status(404).json({ message: "We could not find that company." });
    res.json(company);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong on our side. Please try again." });
  }
};

export const updateMyCompany = async (req, res) => {
  try {
    const {
      name,
      domain,
      industry,
      size,
      type,
      tagline,
      description,
      registrationName,
      panOrTanOrGst,
      dateOfIncorporation,
      registeredOfficeAddress,
      directorAndKmpDetails,
      authorizedSignatory,
    } = req.body;
    const company = await Company.findById(req.user.company);
    if (!company) return res.status(404).json({ message: "We could not find that company." });

    if (name) company.name = name;
    if (domain) company.domain = domain;
    if (industry) company.industry = industry;
    if (size) company.size = size;
    if (type) company.type = type;
    if (tagline) company.tagline = tagline;
    if (description) company.description = description;
    if (req.body.address) company.address = req.body.address;
    if (registrationName) company.registrationName = registrationName;
    if (panOrTanOrGst) company.panOrTanOrGst = panOrTanOrGst;
    if (dateOfIncorporation) company.dateOfIncorporation = dateOfIncorporation;
    if (registeredOfficeAddress) {
      company.registeredOfficeAddress = registeredOfficeAddress;
      company.address = registeredOfficeAddress;
    }
    if (directorAndKmpDetails)
      company.directorAndKmpDetails = directorAndKmpDetails;
    if (authorizedSignatory) {
      try {
        company.authorizedSignatory = typeof authorizedSignatory === "string"
          ? JSON.parse(authorizedSignatory)
          : authorizedSignatory;
      } catch (err) {
        console.warn("Invalid authorizedSignatory data:", err);
      }
    }

    // optional logo upload
    if (req.file) {
      company.logo = await uploadToCloudinary(req.file, "company_logos");
    }

    await company.save();
    res.json({ message: "Company info updated successfully", company });
  } catch (err) {
    res.status(400).json({ message: "We couldn't process that request. Please check your input and try again." });
  }
};

export const getMyCompanyProfile = async (req, res) => {
  try {
    if (!req.user.company)
      return res
        .status(400)
        .json({ message: "No company linked to this account" });

    const company = await Company.findById(req.user.company).populate(
      "admins",
      "name email"
    );
    if (!company) return res.status(404).json({ message: "We could not find that company." });
    res.json(company);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong on our side. Please try again." });
  }
};

/**
 * GET /api/companies/me/jobs
 * List jobs posted by this company (paginated)
 */
export const getMyJobs = async (req, res) => {
  try {
    const companyId = req.user.company;
    const page = parseInt(req.query.page || "1");
    const limit = parseInt(req.query.limit || "20");
    const skip = (page - 1) * limit;

    const jobs = await Job.find({ company: companyId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("postedBy", "name email");

    const normalized = jobs.map((job) => {
      if (!job.expiresAt) {
        const fallback = new Date(job.createdAt);
        fallback.setDate(fallback.getDate() + 30);
        job.expiresAt = fallback;
      }
      return job;
    });

    const total = await Job.countDocuments({ company: companyId });

    res.json({ total, page, limit, jobs: normalized });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong on our side. Please try again." });
  }
};

export const createEmployeeForCompany = async (req, res) => {
  try {
    const companyId = req.user.company;
    if (!companyId)
      return res
        .status(400)
        .json({ message: "No company linked to this account" });

    const {
      name,
      email,
      password,
      role,
      position,
      department,
      phone,
      joinDate,
    } = req.body;

    if (!name || !email || !password)
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });

    // Check for duplicates
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "That email is already in use. Try another or sign in." });

    // Handle optional photo upload
    let profilePhoto = "";
    if (req.file) {
      profilePhoto = await uploadToCloudinary(req.file, "employee_profiles");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "employee",
      company: companyId,
      position,
      department,
      phone,
      joinDate: joinDate || new Date(),
      profilePhoto,
    });

    res.status(201).json({
      message: "Employee created successfully",
      employee: {
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        company: employee.company,
        token: generateToken(employee._id, employee.role),
      },
    });
  } catch (err) {
    console.error("Error in createEmployeeForCompany:", err);
    res.status(400).json({ message: "We couldn't process that request. Please check your input and try again." });
  }
};

export const updateCompanyApplicationStatus = async (req, res) => {
  try {
    const applicationId = req.params.id;
    console.log("req.body:", req.body);
    const payload = req.body || {};
    console.log("Backend payload:", payload);
    console.log("Rejection reason:", payload.rejectionReason);

    // Load application with job + company and user for notifications
    const application = await Application.findById(applicationId)
      .populate({
        path: "job",
        select: "title company",
        populate: { path: "company", select: "name" },
      })
      .populate("user", "name email");

    if (!application) {
      return res.status(404).json({ message: "We could not find that application." });
    }

    // Safety: ensure the job belongs to the company of the logged-in user
    const jobCompanyId = application.job?.company?.toString();
    const userCompanyId = req.user?.company?.toString();
    if (
      req.user.role !== "company_admin" &&
      (!jobCompanyId || jobCompanyId !== userCompanyId)
    ) {
      return res
        .status(403)
        .json({ message: "You do not have permission to do that. to modify this application" });
    }

    // Keep previous status to detect changes
    const prevStatus = application.status;

    // Allowed fields to update
    const allowed = [
      "status",
      "rejectionReason",
      "metadata.notes",
      "metadata.interviewDate",
      "metadata.feedback",
      "metadata.rating",
      "resume",
    ];

    // Apply updates safely
    // supports nested metadata.* fields
    for (const key of Object.keys(payload)) {
      if (allowed.includes(key)) {
        // nested metadata fields
        if (key.startsWith("metadata.")) {
          const metaKey = key.split(".")[1];
          application.metadata = application.metadata || {};
          application.metadata[metaKey] = payload[key];
        } else {
          application[key] = payload[key];
        }
      }
    }

    // Save application
    await application.save();
    console.log("After save, rejectionReason:", application.rejectionReason);

    // If status changed -> create notification (only for meaningful statuses)
    const newStatus = application.status;
    const meaningful = [
      "applied",
      "reviewed",
      "interview",
      "offer",
      "hired",
      "rejected",
    ];
    if (newStatus !== prevStatus && meaningful.includes(newStatus)) {
      // Make sure job is loaded with company name
      const jobTitle = application.job?.title || "your job";
      const companyName = application.job?.company?.name || "the company";

      await Notification.create({
        user: application.user._id,
        job: application.job._id,
        company: application.job.company._id,
        message: `Your application for "${jobTitle}" at ${companyName} is now "${newStatus}".`,
      });

      console.log(
        `✅ Notification created for user ${application.user._id} for application ${application._id}`
      );
    } else {
      console.log(
        `ℹ️ Application ${application._id} updated but status unchanged (${prevStatus} -> ${newStatus})`
      );
    }

    // Return updated application (populated)
    const updated = await Application.findById(application._id)
      .populate("user", "name email profilePhoto")
      .populate({
        path: "job",
        populate: { path: "company", select: "name logo" },
      });

    res.json({ message: "Application updated", application: updated });
  } catch (err) {
    console.error("❌ Error updating company application status:", err);
    res.status(500).json({ message: "Something went wrong on our side. Please try again." });
  }
};

export const createJobForCompany = async (req, res) => {
  try {
    if (!req.user.company)
      return res
        .status(400)
        .json({ message: "No company linked to this account" });

    const company = await Company.findById(req.user.company);
    if (!company) return res.status(404).json({ message: "We could not find that company." });

    if (company.blocked) {
      return res.status(403).json({ message: "Company is blocked from posting jobs. Please contact admin." });
    }

    const {
      title,
      description,
      location,
      minSalary,
      maxSalary,
      employmentType,
      status,
      expiresAt,
    } = req.body;

    if (!title || !description || !location)
      return res
        .status(400)
        .json({ message: "Title, description, and location are required" });

    const payload = {
      title,
      description,
      location,
      minSalary: minSalary ? parseFloat(minSalary) : undefined,
      maxSalary: maxSalary ? parseFloat(maxSalary) : undefined,
      employmentType,
      status: status || "open",
      expiresAt,
      postedBy: req.user._id,
      company: req.user.company,
    };

    const job = await Job.create(payload);
    res.status(201).json(job);
  } catch (err) {
    console.error("Error creating company job:", err);
    res.status(400).json({ message: "We couldn't process that request. Please check your input and try again." });
  }
};

export const getMyEmployees = async (req, res) => {
  try {
    const companyId = req.user.company;
    const employees = await User.find({ company: companyId }).select(
      "-password"
    );
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong on our side. Please try again." });
  }
};

export const fireEmployee = async (req, res) => {
  try {
    const companyId = req.user.company;
    const employeeId = req.params.id;

    const employee = await User.findById(employeeId);
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    // safety: ensure the employee belongs to this company
    if (
      !employee.company ||
      employee.company.toString() !== companyId.toString()
    ) {
      return res
        .status(403)
        .json({ message: "You do not have permission to do that. to modify this employee" });
    }

    // Remove company association and optionally demote role to 'user'
    employee.company = undefined;
    employee.role = "user";
    await employee.save();

    res.json({ message: "Employee fired/removed from company", employee });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong on our side. Please try again." });
  }
};

export const getCompanyApplicants = async (req, res) => {
  try {
    const companyId = req.user.company;
    const page = parseInt(req.query.page || "1");
    const limit = parseInt(req.query.limit || "20");
    const skip = (page - 1) * limit;

    // Find job IDs for this company
    const jobs = await Job.find({ company: companyId }).select("_id");
    const jobIds = jobs.map((j) => j._id);

    const total = await Application.countDocuments({ job: { $in: jobIds } });

    const applications = await Application.find({ job: { $in: jobIds } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name email profilePhoto headline location")
      .populate("job", "title");

    res.json({ total, page, limit, applications });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong on our side. Please try again." });
  }
};

export const getCompanyDashboard = async (req, res) => {
  try {
    const companyId = req.user.company;
    const now = new Date();

    const employeesCount = await User.countDocuments({ company: companyId });
    const totalJobs = await Job.countDocuments({ company: companyId });
    const activeJobs = await Job.countDocuments({
      company: companyId,
      isExpired: false,
      status: "open",
      expiresAt: { $gte: now },
    });
    const expiredJobs = await Job.countDocuments({
      company: companyId,
      isExpired: true,
    });
    const pendingJobs = await Job.countDocuments({
      company: companyId,
      status: "pending",
    });

    // Applicants Stats
    const jobs = await Job.find({ company: companyId }).select("_id");
    const jobIds = jobs.map((j) => j._id);
    const totalApplicants = await Application.countDocuments({
      job: { $in: jobIds },
    });
    const totalHired = await Application.countDocuments({
      job: { $in: jobIds },
      status: "hired",
    });

    res.json({
      employeesCount,
      totalJobs,
      activeJobs,
      expiredJobs,
      pendingJobs,
      totalApplicants,
      totalHired,
    });
  } catch (err) {
    console.error("Error in getCompanyDashboard:", err);
    res.status(500).json({ message: "Something went wrong on our side. Please try again." });
  }
};

export const addCompanyRemark = async (req, res) => {
  try {
    const { remark } = req.body;
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: "We could not find that company." });

    company.remarks = remark;
    company.remarksHistory.push({
      text: remark,
      addedBy: req.user._id,
    });

    await company.save();
    res.json({ message: "Remark added successfully", company });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong on our side. Please try again." });
  }
};

export const companyNotifications = async (req, res) => {
  try {
    const company = await Company.findOne({
      $or: [{ _id: req.user.company }, { admins: req.user._id }],
    }).select("remarks remarksHistory");

    if (!company) return res.status(404).json({ message: "We could not find that company." });
    const sorted = (company.remarksHistory || []).sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    res.json({
      currentRemark: company.remarks,
      remarksHistory: sorted,
    });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong on our side. Please try again." });
  }
};

export const getCompanyAbuseReports = async (req, res) => {
  try {
    const companyId = req.user.company;

    // Find all jobs for this company
    const jobs = await Job.find({ company: companyId }).select("_id");
    const jobIds = jobs.map((j) => j._id);

    // Find abuse reports for these jobs
    const reports = await AbuseReport.find({ job: { $in: jobIds } })
      .sort({ createdAt: -1 })
      .populate("reportedBy", "name email")
      .populate("job", "title")
      .populate("resolvedBy", "name email");

    res.json(reports);
  } catch (err) {
    console.error("Error in getCompanyAbuseReports:", err);
    res.status(500).json({ message: "Something went wrong on our side. Please try again." });
  }
};

export const updateAbuseReport = async (req, res) => {
  try {
    const { companyResponse } = req.body;
    const reportId = req.params.id;
    const companyId = req.user.company;

    const report = await AbuseReport.findById(reportId).populate("job");
    if (!report) return res.status(404).json({ message: "Abuse report not found" });

    // Ensure the report belongs to this company's job
    if (report.job.company.toString() !== companyId.toString()) {
      return res.status(403).json({ message: "You do not have permission to do that. to update this report" });
    }

    report.companyResponse = companyResponse;
    report.status = "responded";

    await report.save();

    res.json({ message: "Abuse report updated", report });
  } catch (err) {
    console.error("Error in updateAbuseReport:", err);
    res.status(500).json({ message: "Something went wrong on our side. Please try again." });
  }
};


