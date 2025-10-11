// Backend/routes/user.routes.js
import { Router } from "express";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";
import bcrypt from "bcryptjs";
const router = Router();

// ✅ Protected route to get logged-in user info
router.get("/me", auth(), async (req, res) => {
  const user = await User.findById(req.user.id).select("-password -__v");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

router.patch("/me", auth(), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Allowed fields
    const allowedUpdates = ["name", "year", "skills", "interests", "achievements"];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      year: user.year,
      skills: user.skills,
      interests: user.interests,
      achievements: user.achievements,
      rating: user.rating,
      menteesHelped: user.menteesHelped,
      verifiedMentor: user.verifiedMentor,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

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
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
