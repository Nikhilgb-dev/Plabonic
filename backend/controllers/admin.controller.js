import User from "../models/user.model.js";
import Application from "../models/application.model.js";
import Job from "../models/job.model.js";
import Company from "../models/company.model.js";
import Community from "../models/community.model.js";
import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import Freelancer from "../models/freelancer.model.js";
import AbuseReport from "../models/abuseReport.model.js";
import bcrypt from "bcryptjs";

// ====================== USERS ======================
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashed, role });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const { name, password } = req.body;
    const admin = await User.findById(req.user._id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (name) admin.name = name;
    if (password) admin.password = await bcrypt.hash(password, 10);
    await admin.save();

    res.json({ message: "Admin profile updated", admin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) updates.profilePhoto = req.file.path;

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ====================== JOBS ======================
export const createJob = async (req, res) => {
  try {
    const job = await Job.create({ ...req.body, postedBy: req.user._id });
    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate("postedBy", "name email").populate("company", "name logo");
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAdminJobStats = async (req, res) => {
  try {
    const now = new Date();

    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({
      isExpired: false,
      expiresAt: { $gte: now },
      status: "open",
    });
    const expiredJobs = await Job.countDocuments({
      isExpired: true,
    });
    const pendingJobs = await Job.countDocuments({
      status: "pending",
    });

    res.json({
      totalJobs,
      activeJobs,
      expiredJobs,
      pendingJobs,
    });
  } catch (err) {
    console.error("Error in getAdminJobStats:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getAllApplications = async (req, res) => {
  try {
    const page = parseInt(req.query.page || "1");
    const limit = parseInt(req.query.limit || "20");
    const skip = (page - 1) * limit;

    const total = await Application.countDocuments();

    const applications = await Application.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name email profilePhoto headline location termsAccepted")
      .populate("job", "title location company")
      .populate({
        path: "job",
        populate: { path: "company", select: "name logo" },
      });

    res.json({ total, page, limit, applications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { status, notes, rejectionReason } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application)
      return res.status(404).json({ message: "Application not found" });

    if (
      ![
        "applied",
        "reviewed",
        "interview",
        "offer",
        "hired",
        "rejected",
      ].includes(status)
    ) {
      return res.status(400).json({ message: "Invalid status" });
    }

    if (
      ["reviewed", "interview", "offer", "hired", "rejected"].includes(status)
    ) {
      const jobData = await Job.findById(application.job).populate(
        "company",
        "name"
      );
      await Notification.create({
        user: application.user,
        job: application.job,
        company: jobData.company._id,
        message: `Your application for "${jobData.title}" at ${jobData.company.name} was ${status}.`,
      });
    }

    application.status = status;
    if (notes) application.metadata.notes = notes;
    if (rejectionReason !== undefined) application.rejectionReason = rejectionReason;
    await application.save();

    res.json({ message: "Application status updated", application });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const verifyJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    job.isVerified = !job.isVerified;
    await job.save();

    res.json({ message: `Job ${job.isVerified ? 'verified' : 'unverified'}`, job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ====================== COMMUNITIES ======================
export const createCommunity = async (req, res) => {
  try {
    const community = await Community.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json(community);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.find().populate(
      "createdBy",
      "name email"
    );
    res.json(communities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCommunity = async (req, res) => {
  try {
    const community = await Community.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!community)
      return res.status(404).json({ message: "Community not found" });
    res.json(community);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteCommunity = async (req, res) => {
  try {
    const community = await Community.findByIdAndDelete(req.params.id);
    if (!community)
      return res.status(404).json({ message: "Community not found" });
    res.json({ message: "Community deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ====================== POSTS ======================
export const createPost = async (req, res) => {
  try {
    const post = await Post.create({ ...req.body, author: req.user._id });
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("author", "name email");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ====================== FREELANCERS ======================
export const getAllFreelancers = async (req, res) => {
  try {
    const freelancers = await Freelancer.find().populate("createdBy", "name email");
    res.json(freelancers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyFreelancer = async (req, res) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id);
    if (!freelancer) return res.status(404).json({ message: "Freelancer not found" });

    freelancer.isVerified = !freelancer.isVerified;
    await freelancer.save();

    res.json({ message: `Freelancer ${freelancer.isVerified ? 'verified' : 'unverified'}`, freelancer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteFreelancer = async (req, res) => {
  try {
    const freelancer = await Freelancer.findByIdAndDelete(req.params.id);
    if (!freelancer) return res.status(404).json({ message: "Freelancer not found" });
    res.json({ message: "Freelancer deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ====================== ABUSE REPORTS ======================
export const getAllAbuseReports = async (req, res) => {
  try {
    const reports = await AbuseReport.find()
      .sort({ createdAt: -1 })
      .populate("reportedBy", "name email")
      .populate("job", "title blocked")
      .populate({
        path: "job",
        populate: { path: "company", select: "name blocked" },
      })
      .populate("resolvedBy", "name email");

    res.json(reports);
  } catch (err) {
    console.error("Error in getAllAbuseReports:", err);
    res.status(500).json({ message: err.message });
  }
};

export const updateAbuseReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const report = await AbuseReport.findById(req.params.id);

    if (!report) return res.status(404).json({ message: "Abuse report not found" });

    if (!["pending", "reviewed", "resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    report.status = status;
    await report.save();

    res.json({ message: "Abuse report status updated", report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const blockCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: "Company not found" });

    company.blocked = !company.blocked;
    await company.save();

    res.json({ message: `Company ${company.blocked ? 'blocked' : 'unblocked'}`, company });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const reviewCompanyResponse = async (req, res) => {
  try {
    const { action } = req.body; // "approve" or "reject"
    const report = await AbuseReport.findById(req.params.id);

    if (!report) return res.status(404).json({ message: "Abuse report not found" });

    if (action === "approve") {
      report.responseReviewed = true;
      report.responseReviewDate = new Date();
      report.status = "resolved";
      report.resolvedBy = req.user._id;
      report.resolutionDate = new Date();
    } else if (action === "reject") {
      report.responseReviewed = false;
      report.status = "pending"; // or keep as responded, but require new response
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    await report.save();

    res.json({ message: "Company response reviewed", report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const blockJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    job.blocked = !job.blocked;
    await job.save();

    res.json({ message: `Job ${job.blocked ? 'blocked' : 'unblocked'}`, job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
