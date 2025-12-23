import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    link: { type: String },
    achievements: [{ type: String }],
    otherDetails: { type: String },
  },
  { _id: false }
);

const freelancerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    qualification: { type: String, required: true },
    contact: { type: String, required: true },
    email: { type: String, required: true },
    location: { type: String, required: true },

    preferences: [
      {
        type: String,
        enum: ["Remote", "On-site", "Contract", "Agreement", "MOU"],
      },
    ],

    descriptionOfWork: {
      type: String,
    },

    aboutFreelancer: {
      type: String,
    },

    photo: { type: String },

    services: [serviceSchema],

    pricing: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },

    // Additional freelancer profile fields
    dateOfBirth: Date,
    gender: String,
    educationalQualification: String,
    skills: [String],
    yearsOfExperience: Number,
    currentEmployer: String,
    portfolioUrl: String,
    linkedin: String,
    github: String,
    twitter: String,
    whatsappNumber: String,
    certifications: [String],
    languagesKnown: [String],
    availabilityHours: Number,
    preferredWorkingTime: String,
    expectedHourlyRate: Number,
    expectedProjectRate: Number,
    paymentMethodPreference: String,
    toolsProficiency: [String],
    pastClients: [String],
    resume: String,
    interviewAvailability: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    isVerified: { type: Boolean, default: false },
    termsAccepted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    expiryDate: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  },
  { timestamps: true }
);

export default mongoose.model("Freelancer", freelancerSchema);
