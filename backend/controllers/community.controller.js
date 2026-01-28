import Community from "../models/community.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.util.js";

// CREATE
export const createCommunity = async (req, res) => {
  try {
    let coverImage = "";
    if (req.file) {
      coverImage = await uploadToCloudinary(req.file, "community_covers");
    }

    const community = await Community.create({
      ...req.body,
      createdBy: req.user._id,
      coverImage,
    });
    res.status(201).json(community);
  } catch (err) {
    res.status(400).json({ message: "We couldn't process that request. Please check your input and try again." });
  }
};

// READ ALL
export const getCommunities = async (req, res) => {
  try {
    const communities = await Community.find().populate(
      "createdBy",
      "name email"
    );
    res.json(communities);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong on our side. Please try again." });
  }
};

// READ ONE
export const getCommunityById = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );
    if (!community)
      return res.status(404).json({ message: "We could not find that community." });
    res.json(community);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong on our side. Please try again." });
  }
};

// UPDATE
export const updateCommunity = async (req, res) => {
  try {
    const community = await Community.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!community)
      return res.status(404).json({ message: "We could not find that community." });
    res.json(community);
  } catch (err) {
    res.status(400).json({ message: "We couldn't process that request. Please check your input and try again." });
  }
};

// DELETE
export const deleteCommunity = async (req, res) => {
  try {
    const community = await Community.findByIdAndDelete(req.params.id);
    if (!community)
      return res.status(404).json({ message: "We could not find that community." });
    res.json({ message: "Community deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong on our side. Please try again." });
  }
};


