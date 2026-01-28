import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.util.js";
import { uploadToCloudinary } from "../utils/cloudinary.util.js";

// ========== USER REGISTRATION ==========
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      headline,
      description,
      location,
      website,
      skills,
      socialLinks,
      acceptTerms,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "An account with this email already exists. Try signing in." });

    const hashed = await bcrypt.hash(password, 10);

    let profilePhotoUrl = "";
    if (req.file) {
      profilePhotoUrl = await uploadToCloudinary(req.file, "profile_photos");
    }

    const user = await User.create({
      name,
      email,
      password: hashed,
      phone,
      profilePhoto: profilePhotoUrl,
      role: "user",
      headline,
      description,
      location,
      website,
      skills,
      socialLinks,
      termsAccepted: acceptTerms,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(400).json({ message: "We couldn't process that request. Please check your input and try again." });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "We could not sign you in. Check your email and password, then try again." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "We could not sign you in. Check your email and password, then try again." });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong on our side. Please try again." });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "We could not find that user." });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong on our side. Please try again." });
  }
};


