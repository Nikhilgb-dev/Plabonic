import mongoose from "mongoose";

const abuseReportSchema = new mongoose.Schema(
  {
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    reason: {
      type: String,
      enum: ["Spam", "Inappropriate Content", "Misleading Information", "Harassment", "Other"],
      required: true,
    },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "responded", "reviewed", "resolved"],
      default: "pending",
    },
    companyResponse: { type: String },
    responseReviewed: { type: Boolean, default: false },
    responseReviewDate: { type: Date },
    resolutionDate: { type: Date },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("AbuseReport", abuseReportSchema);