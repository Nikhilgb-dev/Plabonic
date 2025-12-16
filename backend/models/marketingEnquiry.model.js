import mongoose from "mongoose";

const marketingEnquirySchema = new mongoose.Schema(
  {
    card: { type: mongoose.Schema.Types.ObjectId, ref: "MarketingCard", required: true },
    cardName: { type: String, required: true },
    cardTitle: { type: String, required: true },
    cardPrice: { type: Number, required: true },
    buyerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const MarketingEnquiry = mongoose.model("MarketingEnquiry", marketingEnquirySchema);

export default MarketingEnquiry;
