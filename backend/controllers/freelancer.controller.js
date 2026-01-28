import Freelancer from "../models/freelancer.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.util.js";
import FreelancerApplication from "../models/freelancerApplication.model.js";
import User from "../models/user.model.js";
import generateToken from "../utils/generateToken.util.js";
import bcrypt from "bcryptjs";

export const createFreelancer = async (req, res) => {
  try {
    const {
      name,
      qualification,
      contact,
      email,
      location,
      preferences,
      descriptionOfWork,
      aboutFreelancer,
      services,
      pricing,
      password, // optional if admin provides it
      acceptTerms,
    } = req.body;

    // parse arrays safely
    const parsedPreferences = Array.isArray(preferences)
      ? preferences
      : JSON.parse(preferences || "[]");
    const parsedServices = Array.isArray(services)
      ? services
      : JSON.parse(services || "[]");
    const parsedPricing =
      typeof pricing === "string" ? JSON.parse(pricing || "{}") : pricing || {};

    let photoUrl = null;
    if (req.file) {
      photoUrl = await uploadToCloudinary(req.file, "freelancers");
    }

    // Prepare freelancer payload
    const freelancerData = {
      name,
      qualification,
      contact,
      email,
      location,
      preferences: parsedPreferences,
      descriptionOfWork,
      aboutFreelancer,
      photo: photoUrl,
      services: parsedServices,
      pricing: parsedPricing,
      isActive: true,
      termsAccepted: acceptTerms,
    };

    // If request comes from an authenticated admin and admin included a password (or we generate one),
    // create a User account for this freelancer and return a token so the frontend can "log them in".
    let createdUser = null;
    let token = null;

    const isAdminCreating = req.user && req.user.role === "admin";
    if (isAdminCreating) {
      // If a user already exists with this email, link that user (or optionally error out)
      const existing = await User.findOne({ email });
      if (existing) {
        createdUser = existing;
        freelancerData.createdBy = existing._id;
      } else {
        // Admin provided password? if not, generate a random one and return it (or email it)
        const plainPassword =
          password && password.length >= 6
            ? password
            : Math.random().toString(36).slice(-8);

        const hashed = await bcrypt.hash(plainPassword, 10);
        createdUser = await User.create({
          name,
          email,
          password: hashed,
          role: "freelancer", // or change to "freelancer" if you add that role in user.model
          profilePhoto: photoUrl || "",
        });

        freelancerData.createdBy = createdUser._id;

        // Create JWT for the freelancer so frontend can log them in immediately
        token = generateToken(createdUser._id, createdUser.role);

        // NOTE: for security, you might want to email the generated password to freelancer instead of returning in API.
        // Returning the plain password is acceptable only if your admin UI is secure and you understand the risks.
      }
    } else {
      // If not admin-created, but logged-in user exists, set createdBy
      if (req.user) {
        freelancerData.createdBy = req.user._id;
      }
    }

    const freelancer = await Freelancer.create(freelancerData);

    // respond
    const responsePayload = {
      message: "Freelancer added successfully",
      freelancer,
    };

    if (token && createdUser) {
      responsePayload.token = token;
      responsePayload.freelancerUser = {
        _id: createdUser._id,
        email: createdUser.email,
        role: createdUser.role,
      };
      // optionally return the generated plain password if you created one and want to show to admin:
      // responsePayload.plainPassword = plainPassword;
    }

    return res.status(201).json(responsePayload);
  } catch (err) {
    console.error("❌ Error creating freelancer:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const applyToFreelancer = async (req, res) => {
  try {
    const { id } = req.params; // freelancer ID
    const freelancer = await Freelancer.findById(id);
    if (!freelancer)
      return res.status(404).json({ message: "Freelancer not found" });

    const { clientName, contactNumber, officialEmail, requirements, message } =
      req.body;

    // Validate requirements word count
    const wordCount = requirements.trim().split(/\s+/).length;
    if (wordCount < 50) {
      return res.status(400).json({
        message: "Requirements must be at least 50 words",
      });
    }

    // Handle resume upload
    let resumeUrl = null;
    if (req.file) {
      resumeUrl = await uploadToCloudinary(req.file, "resumes");
    }

    // Prevent duplicate application
    const existing = await FreelancerApplication.findOne({
      freelancer: id,
      user: req.user._id,
    });
    if (existing)
      return res
        .status(400)
        .json({ message: "Already applied for this freelancer" });

    const application = await FreelancerApplication.create({
      freelancer: id,
      user: req.user._id,
      clientName,
      contactNumber,
      officialEmail,
      requirements,
      resume: resumeUrl,
      message: message || "",
      status: "applied",
    });

    res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (err) {
    console.error("❌ Error applying to freelancer:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get all applications for a freelancer (for company/freelancer owner)
export const getFreelancerApplications = async (req, res) => {
  try {
    const { id } = req.params; // freelancer ID
    const applications = await FreelancerApplication.find({ freelancer: id })
      .populate("user", "name email profilePhoto")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all applications by the current user
export const getMyFreelancerApplications = async (req, res) => {
  try {
    const applications = await FreelancerApplication.find({
      user: req.user._id,
    })
      .populate("freelancer", "name qualification location photo contact email")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllFreelancers = async (req, res) => {
  try {
    const freelancers = await Freelancer.find().sort({ createdAt: -1 });

    let applied = [];
    if (req.user) {
      const userApps = await FreelancerApplication.find({
        user: req.user._id,
      }).select("freelancer");
      applied = userApps.map((a) => a.freelancer.toString());
    }

    const result = freelancers.map((f) => ({
      ...f.toObject(),
      hasApplied: applied.includes(f._id.toString()),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFreelancerById = async (req, res) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id);
    if (!freelancer) return res.status(404).json({ message: "Not found" });
    res.json(freelancer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateFreelancer = async (req, res) => {
  try {
    const updates = req.body;
    if (req.file) {
      updates.photo = await uploadToCloudinary(req.file, "freelancers");
    }

    const freelancer = await Freelancer.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!freelancer)
      return res.status(404).json({ message: "Freelancer not found" });
    res.json({ message: "Freelancer updated successfully", freelancer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteFreelancer = async (req, res) => {
  try {
    const freelancer = await Freelancer.findByIdAndDelete(req.params.id);
    if (!freelancer)
      return res.status(404).json({ message: "Freelancer not found" });
    res.json({ message: "Freelancer deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyFreelancerProfile = async (req, res) => {
  try {
    const freelancer = await Freelancer.findOne({
      $or: [{ createdBy: req.user._id }, { email: req.user.email }],
    });
    if (!freelancer)
      return res.status(404).json({ message: "Freelancer profile not found" });
    res.json(freelancer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateMyFreelancerProfile = async (req, res) => {
  try {
    const freelancer = await Freelancer.findOne({
      $or: [{ createdBy: req.user._id }, { email: req.user.email }],
    });
    if (!freelancer)
      return res.status(404).json({ message: "Freelancer profile not found" });

    const updates = { ...req.body };
    delete updates.createdBy; // Should not be updated
    delete updates.isVerified; // Should not be updated by user
    delete updates.isActive; // Should not be updated by user
    delete updates.expiryDate; // Should not be updated by user

    // Handle photo upload
    if (req.files && req.files.photo) {
      updates.photo = await uploadToCloudinary(req.files.photo[0], "freelancers");
    }

    // Handle resume upload
    if (req.files && req.files.resume) {
      updates.resume = await uploadToCloudinary(req.files.resume[0], "resumes");
    }

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        freelancer[key] = updates[key];
      }
    });

    await freelancer.save();
    res.json({
      message: "Freelancer profile updated successfully",
      freelancer,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const updateData = { status };
    if (rejectionReason !== undefined) {
      updateData.rejectionReason = rejectionReason;
    }
    const application = await FreelancerApplication.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("user", "name email");

    if (!application)
      return res.status(404).json({ message: "Application not found" });

    res.json({ message: "Status updated successfully", application });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const withdrawFreelancerApplication = async (req, res) => {
  try {
    const application = await FreelancerApplication.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id, // Ensure user can only withdraw their own applications
    });

    if (!application)
      return res.status(404).json({ message: "Application not found" });

    res.json({ message: "Application withdrawn successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateFreelancerApplication = async (req, res) => {
  try {
    const application = await FreelancerApplication.findById(req.params.id);
    if (!application) return res.status(404).json({ message: "Application not found" });

    if (application.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (["hired", "accepted", "rejected"].includes(application.status)) {
      return res.status(400).json({ message: "Cannot edit this application at its current status" });
    }

    const { clientName, contactNumber, officialEmail, requirements, message } = req.body;

    if (requirements !== undefined) {
      const trimmed = String(requirements).trim();
      if (!trimmed) {
        return res.status(400).json({ message: "Requirements are required" });
      }
      const wordCount = trimmed.split(/\s+/).length;
      if (wordCount < 50) {
        return res.status(400).json({ message: "Requirements must be at least 50 words" });
      }
      application.requirements = trimmed;
    }

    if (clientName !== undefined) application.clientName = clientName;
    if (contactNumber !== undefined) application.contactNumber = contactNumber;
    if (officialEmail !== undefined) application.officialEmail = officialEmail;
    if (message !== undefined) application.message = message;

    if (req.file) {
      application.resume = await uploadToCloudinary(req.file, "resumes");
    }

    await application.save();
    res.json({ message: "Application updated successfully", application });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const respondToFreelancerOffer = async (req, res) => {
  try {
    const { action } = req.body; // "accept" or "reject"
    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action. Must be 'accept' or 'reject'" });
    }

    const application = await FreelancerApplication.findById(req.params.id).populate("freelancer", "name qualification location photo");

    if (!application) return res.status(404).json({ message: "Application not found" });
    if (application.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });
    if (application.status !== "hired")
      return res.status(400).json({ message: "Can only respond to hired applications" });

    application.status = action === "accept" ? "accepted" : "rejected";
    await application.save();

    res.json({ message: `Offer ${action}ed successfully`, application });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
