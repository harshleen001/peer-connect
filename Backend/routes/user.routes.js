// Backend/routes/user.routes.js
import { Router } from "express";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";
import bcrypt from "bcryptjs";
import express from "express";
const router = Router();

// GET /user/me -> protected, returns logged-in user (no password)
router.get("/me", auth(), async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

// PATCH /user/me -> update allowed fields
router.patch("/me", auth(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fields allowed to be updated from frontend profile edit
    const allowed = [
      "name",
      "year",
      "branch",
      "phone",
      "address",
      "resumeLink",
      "profilePicture",
      "bio",
      "skills",
      "interests",
      "achievements",
      // keep other safe fields if you want
    ];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    // Return sanitized user (no password)
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.__v;

    res.json(userObj);
  } catch (err) {
    console.error("PATCH /user/me error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Change password endpoint (unchanged)
router.patch("/change-password", auth(), async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Both old and new password are required" });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("PATCH /change-password error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

import path from "path";
import { upload } from "../middleware/upload.js";

// Serve static files from /uploads
router.use("/uploads", (req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});
router.use("/uploads", express.static(path.resolve("uploads")));

// ✅ Upload resume
router.post("/upload/resume", auth(), upload.single("resume"), async (req, res) => {
  try {
    console.log("📁 Resume upload hit");
    console.log("File info:", req.file);

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const fileUrl = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user.id, { resumeLink: fileUrl }, { new: true });
    res.json({ message: "Resume uploaded", resumeLink: fileUrl, user });
  } catch (err) {
    console.error("❌ Resume upload error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// ✅ Upload profile picture
router.post("/upload/profile-picture", auth(), upload.single("profilePicture"), async (req, res) => {
  try {
    console.log("🖼️ Profile picture upload hit");
    console.log("File info:", req.file);

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const fileUrl = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user.id, { profilePicture: fileUrl }, { new: true });
    res.json({ message: "Profile picture uploaded", profilePicture: fileUrl, user });
  } catch (err) {
    console.error("❌ Profile picture upload error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});



export default router;
