import mongoose from "mongoose";

const siteStatSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("SiteStat", siteStatSchema);
