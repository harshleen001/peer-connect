// Backend/routes/profile.routes.js
import express from "express";
import User from "../models/User.js";
import Review from "../models/Review.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /api/profile/:id
 * View another user's profile (mentor or mentee)
 */
router.get("/:id", auth(), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password -__v");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let profile = user.toObject();

    // ✅ If mentor, include reviews + average rating
    if (user.role === "mentor") {
      const reviews = await Review.find({ mentorId: id })
        .populate("menteeId", "name year")
        .sort({ timestamp: -1 });

      profile.reviews = reviews;
      profile.reviewCount = reviews.length;
    }

    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
