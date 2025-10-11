import express from "express";
import User from "../models/User.js";
import Review from "../models/Review.js";
import Chat from "../models/Chat.js";
import { auth } from "../middleware/auth.js";
import { checkAdmin } from "../middleware/checkAdmin.js";

const router = express.Router();

/**
 * GET all users
 */
router.get("/users", auth(), checkAdmin(), async (req, res) => {
  try {
    const users = await User.find().select("-password -__v");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * DELETE a user
 */
router.delete("/users/:id", auth(), checkAdmin(), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * Verify a mentor
 */
router.patch("/mentors/:id/verify", auth(), checkAdmin(), async (req, res) => {
  try {
    const mentor = await User.findByIdAndUpdate(
      req.params.id,
      { verifiedMentor: true },
      { new: true }
    ).select("-password -__v");

    if (!mentor) return res.status(404).json({ message: "Mentor not found" });

    res.json({ message: "Mentor verified", mentor });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * Get stats (dashboard)
 */
router.get("/stats", auth(), checkAdmin(), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMentors = await User.countDocuments({ role: "mentor" });
    const totalMentees = await User.countDocuments({ role: "mentee" });
    const totalReviews = await Review.countDocuments();
    const totalChats = await Chat.countDocuments();

    res.json({
      totalUsers,
      totalMentors,
      totalMentees,
      totalReviews,
      totalChats,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
