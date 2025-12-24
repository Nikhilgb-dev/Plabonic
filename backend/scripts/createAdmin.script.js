// scripts/createAdmin.script.js
import dotenv from "dotenv";
dotenv.config();

import connectDB from "../config/db.config.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.util.js";

const ADMIN_EMAIL = "reachus@plabonic.com";
const ADMIN_PASSWORD = "Mysore@321";
const ADMIN_NAME = "Plabonic Admin";

const createOrUpdateAdmin = async () => {
  try {
    await connectDB();

    // Check if admin exists
    let user = await User.findOne({ email: ADMIN_EMAIL });

    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);

    if (user) {
      // Update password & role if needed
      user.password = hashed;
      user.role = "admin";
      user.name = user.name || ADMIN_NAME;
      await user.save();
      console.log(`✅ Admin user updated: ${ADMIN_EMAIL}`);
    } else {
      // Create new admin
      user = await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hashed,
        role: "admin",
      });
      console.log(`✅ Admin user created: ${ADMIN_EMAIL}`);
    }

    // Generate a JWT so you can use it immediately (7d expiry as per util)
    const token = generateToken(user._id, user.role);
    console.log("\n--- ADMIN CREDENTIALS ---");
    console.log("Email: ", ADMIN_EMAIL);
    console.log("Password: ", ADMIN_PASSWORD);
    console.log("Role: ", user.role);
    console.log("JWT (use in Authorization: Bearer <token>):\n", token);
    console.log("-------------------------\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating/updating admin:", err);
    process.exit(1);
  }
};

createOrUpdateAdmin();
