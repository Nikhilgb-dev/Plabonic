import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    roleAndResponsibility: String,
    skillsRequired: String,
    preferredQualifications: String,
    location: String,
    minSalary: { type: Number },
    maxSalary: { type: Number },
    salaryType: {
      type: String,
      enum: ["Monthly", "LPA", "CTC"],
      default: "Monthly",
    },
    employmentType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship", "Remote", "Hybrid", "Work from home"],
    },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    status: {
      type: String,
      enum: ["open", "closed", "pending"],
      default: "open",
    },
    expiresAt: { type: Date },
    isExpired: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    blocked: { type: Boolean, default: false },
    remarks: { type: String, default: "" },
  },
  { timestamps: true }
);

jobSchema.pre("save", function (next) {
  if (!this.expiresAt) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    this.expiresAt = expiry;
  }
  next();
});

export default mongoose.model("Job", jobSchema);
