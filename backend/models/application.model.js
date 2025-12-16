import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema(
  {
    companyName: { type: String },
    jobTitle: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    currentlyWorking: { type: Boolean, default: false },
    description: { type: String },
  },
  { _id: false }
);

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    altPhone: { type: String, default: "" },
  },
  { _id: false }
);

const educationSchema = new mongoose.Schema(
  {
    school: String,
    degree: String,
    fieldOfStudy: String,
    startDate: Date,
    endDate: Date,
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  link: { type: String },
  description: { type: String, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
});

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },

    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Freelancer",
      default: null,
    },

    resume: {
      type: String,
      required: true,
    },

    coverLetter: {
      type: String,
    },

    // Contact snapshot (saved at time of application)
    contact: {
      type: contactSchema,
      required: true,
    },

    // Experience structure
    experience: {
      isFresher: { type: Boolean, required: true },
      years: { type: Number, default: 0 },
      history: [experienceSchema],
    },

    education: [educationSchema],

    project: [projectSchema],

    // hiring lifecycle status
    status: {
      type: String,
      enum: ["applied", "reviewed", "interview", "offer", "hired", "accepted", "rejected"],
      default: "applied",
    },

    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    metadata: {
      type: Object,
      default: {},
    },

    timeline: {
      appliedAt: { type: Date, default: Date.now },
      reviewedAt: Date,
      interviewAt: Date,
      offeredAt: Date,
      hiredAt: Date,
      rejectedAt: Date,
    },

    recruiterNotes: [
      {
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        note: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    rejectionReason: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// prevent duplicate applications (user cannot apply to same job twice)
applicationSchema.index({ job: 1, user: 1 }, { unique: true });

// helpful indexes
applicationSchema.index({ company: 1, status: 1 });
applicationSchema.index({ "experience.isFresher": 1 });
applicationSchema.index({ "timeline.appliedAt": -1 });

const Application = mongoose.model("Application", applicationSchema);

export default Application;
