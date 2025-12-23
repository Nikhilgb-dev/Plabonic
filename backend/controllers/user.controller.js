import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import Job from "../models/job.model.js";
import generateToken from "../utils/generateToken.util.js";
import { uploadToCloudinary } from "../utils/cloudinary.util.js";

// ========== CREATE USER (Admin only) ==========
export const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ========== GET ALL USERS (Admin only) ==========
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.password; // Never update password here, use separate endpoint if needed
    delete updates.email; // Email should not be updated easily
    delete updates.role; // Role should not be updated by user
    delete updates.company; // Company reference should not be updated by user
    delete updates.followers; // Followers should not be updated by user
    delete updates.following; // Following should not be updated by user
    delete updates.savedJobs; // Saved jobs should not be updated by user
    delete updates.savedFreelancers; // Saved freelancers should not be updated by user
    delete updates.termsAccepted; // Terms accepted should not be updated
    delete updates.joinDate; // Join date should not be updated

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update fields
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        user[key] = updates[key];
      }
    });

    // optional profile photo upload
    if (req.files && req.files.profilePhoto) {
      user.profilePhoto = await uploadToCloudinary(req.files.profilePhoto[0], "profile_photos");
    }

    // optional resume upload
    if (req.files && req.files.resume) {
      user.resume = await uploadToCloudinary(req.files.resume[0], "resumes");
    }

    await user.save();
    res.json({
      message: "Profile updated successfully",
      user: { ...user.toObject(), password: undefined },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ===== DELETE MY ACCOUNT =====
export const deleteMyAccount = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ========== GET SINGLE USER ==========
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ========== UPDATE USER (self or admin) ==========
export const updateUser = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) updates.profilePhoto = req.file.path;

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ========== DELETE USER (Admin only) ==========
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ========== CURRENT LOGGED-IN USER ==========
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) updates.profilePhoto = req.file.path;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ========== FOLLOW / UNFOLLOW ==========
export const toggleFollow = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser)
      return res.status(404).json({ message: "Target user not found" });

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== targetUserId
      );
      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== currentUserId.toString()
      );
    } else {
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
    }

    await currentUser.save();
    await targetUser.save();

    res.json({ message: isFollowing ? "Unfollowed" : "Followed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ========== SAVE / UNSAVE JOB ==========
export const saveJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.savedJobs.includes(jobId)) {
      return res.status(400).json({ message: "Job already saved" });
    }

    user.savedJobs.push(jobId);
    await user.save();

    res.json({ message: "Job saved successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const unsaveJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId);
    await user.save();

    res.json({ message: "Job unsaved successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ========== GET SAVED JOBS ==========
export const getSavedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "savedJobs",
      populate: { path: "company", select: "name logo" },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.savedJobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ========== SAVE / UNSAVE FREELANCER ==========
export const saveFreelancer = async (req, res) => {
  try {
    const freelancerId = req.params.freelancerId;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.savedFreelancers.includes(freelancerId)) {
      return res.status(400).json({ message: "Freelancer already saved" });
    }

    user.savedFreelancers.push(freelancerId);
    await user.save();

    res.json({ message: "Freelancer saved successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const unsaveFreelancer = async (req, res) => {
  try {
    const freelancerId = req.params.freelancerId;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.savedFreelancers = user.savedFreelancers.filter(id => id.toString() !== freelancerId);
    await user.save();

    res.json({ message: "Freelancer unsaved successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
