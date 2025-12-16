import mongoose from "mongoose";

const freelancerApplicationSchema = new mongoose.Schema(
  {
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Freelancer",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },
    officialEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    requirements: {
      type: String,
      required: true,
      minlength: [50, "Requirements must be at least 50 words"],
    },
    resume: {
      type: String, // Cloudinary URL
      required: true,
    },
    message: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["applied", "reviewed", "shortlisted", "hired", "accepted", "rejected"],
      default: "applied",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "FreelancerApplication",
  freelancerApplicationSchema
);
