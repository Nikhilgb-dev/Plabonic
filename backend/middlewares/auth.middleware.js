import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    console.log("❌ Token missing!");
    return res.status(401).json({ message: "You do not have permission to do that." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.log("❌ No user found for token");
      return res.status(404).json({ message: "We could not find that user." });
    }
    if (user.blocked && user.role !== "admin" && req.method !== "GET") {
      return res
        .status(403)
        .json({ message: "Your account is blocked. Please contact support." });
    }
    req.user = user;
    next();
  } catch (err) {
    console.log("❌ JWT error:", err.message);
    res.status(401).json({ message: "Your session has expired. Please sign in again." });
  }
};

export const companyAdminOnly = (req, res, next) => {
  if (req.user && req.user.role === "company_admin") next();
  else res.status(403).json({ message: "Only company admins can perform this action." });
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") next();
  else res.status(403).json({ message: "Only admins can perform this action." });
};

