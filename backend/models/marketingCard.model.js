import mongoose from "mongoose";

const marketingBadgeSchema = new mongoose.Schema(
  {
    trusted: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    recommended: { type: Boolean, default: false },
  },
  { _id: false }
);

const marketingCardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    originalPrice: { type: Number, min: 0 },
    price: { type: Number, required: true, min: 0 },
    coverImage: { type: String, required: true },
    logo: { type: String, required: true },
    badges: { type: marketingBadgeSchema, default: () => ({}) },
    gallery: { type: [String], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const MarketingCard = mongoose.model("MarketingCard", marketingCardSchema);

export default MarketingCard;
