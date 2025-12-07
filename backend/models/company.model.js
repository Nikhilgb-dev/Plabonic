import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    domain: { type: String, required: true },
    industry: { type: String },
    size: { type: String },
    type: { type: String },
    address: { type: String },
    logo: { type: String },
    tagline: { type: String },
    description: { type: String },
    password: { type: String },
    email: { type: String, required: true },
    contactNumber: { type: String },
    verificationDocs: [String],
    registrationName: { type: String },
    panOrTanOrGst: { type: String },
    dateOfIncorporation: { type: Date },
    registeredOfficeAddress: { type: String },
    directorAndKmpDetails: { type: String },
    authorizedSignatory: {
      name: String,
      designation: String,
      signature: String,
    },
    verified: { type: Boolean, default: false },
    termsAccepted: { type: Boolean, default: false },
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    remarks: { type: String, default: "" },
    remarksHistory: [
      {
        text: String,
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Company", companySchema);
