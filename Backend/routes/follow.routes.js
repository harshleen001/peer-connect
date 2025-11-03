import express from "express";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// POST /api/follow/:mentorId  -> Auth required; current user follows mentorId
router.post("/:mentorId", auth(), async (req, res) => {
  try {
    const { mentorId } = req.params;
    const userId = req.user.id;

    if (userId === mentorId) return res.status(400).json({ message: "Cannot follow yourself" });

    const mentor = await User.findById(mentorId);
    const me = await User.findById(userId);

    if (!mentor || !me) return res.status(404).json({ message: "User not found" });
    if (mentor.role !== "mentor") return res.status(400).json({ message: "Can only follow mentors" });

    // init arrays if undefined
    mentor.followers = mentor.followers || [];
    me.following = me.following || [];

    if (mentor.followers.includes(userId)) {
      return res.status(400).json({ message: "Already following" });
    }

    mentor.followers.push(userId);
    me.following.push(mentorId);

    await mentor.save();
    await me.save();

    res.json({ message: "Followed", mentorId, userId });
  } catch (err) {
    console.error("POST /api/follow error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE /api/follow/:mentorId -> unfollow
router.delete("/:mentorId", auth(), async (req, res) => {
  try {
    const { mentorId } = req.params;
    const userId = req.user.id;

    const mentor = await User.findById(mentorId);
    const me = await User.findById(userId);
    if (!mentor || !me) return res.status(404).json({ message: "User not found" });

    mentor.followers = (mentor.followers || []).filter(id => id.toString() !== userId);
    me.following = (me.following || []).filter(id => id.toString() !== mentorId);

    await mentor.save();
    await me.save();

    res.json({ message: "Unfollowed" });
  } catch (err) {
    console.error("DELETE /api/follow error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/follow/:mentorId/followers - list followers
router.get("/:mentorId/followers", async (req, res) => {
  try {
    const mentor = await User.findById(req.params.mentorId).populate("followers", "name email profilePicture");
    if (!mentor) return res.status(404).json({ message: "Not found" });
    res.json(mentor.followers || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
