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

    // Additional company profile fields
    yearOfEstablishment: Number,
    companyRegistrationNumber: String,
    gst: String,
    pan: String,
    headquartersLocation: String,
    branchLocations: [String],
    contactPersonName: String,
    contactPersonDesignation: String,
    officialEmail: String,
    companyWebsiteUrl: String,
    linkedin: String,
    socialMediaProfiles: [String],
    numberOfEmployees: Number,
    annualTurnover: String,
    servicesOffered: [String],
    productsOffered: [String],
    certificationsAccreditations: [String],
    keyClientsPartners: [String],
    preferredModeOfCommunication: String,
    billingAddress: String,
    paymentMethodPreference: String,

    verified: { type: Boolean, default: false },
    termsAccepted: { type: Boolean, default: false },
    blocked: { type: Boolean, default: false },
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
