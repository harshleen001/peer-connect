// Backend/routes/communityReaction.routes.js
// Backend/routes/communityReaction.routes.js
import express from "express";
import mongoose from "mongoose";
import { auth } from "../middleware/auth.js";
import CommunityReaction from "../models/CommunityReaction.js";
import CommunityPost from "../models/CommunityPost.js";
import Notification from "../models/Notification.js";

const router = express.Router();

/**
 * Add or update reaction (mentee only)
 */
router.post("/:postId/react", auth(), async (req, res) => {
  try {
    if (req.user.role !== "mentee") {
      return res.status(403).json({ message: "Only mentees can react" });
    }

    const { reaction } = req.body;
    if (!["👍", "❤️", "🔥"].includes(reaction)) {
      return res.status(400).json({ message: "Invalid reaction" });
    }

    // ✅ Save or update reaction
    const react = await CommunityReaction.findOneAndUpdate(
      { postId: req.params.postId, userId: req.user.id },
      { reaction },
      { new: true, upsert: true }
    );

    // ✅ Count total reactions for this post
    const totalReactions = await CommunityReaction.countDocuments({ postId: req.params.postId });

    // ✅ Fetch post to know which mentor owns it
    const post = await CommunityPost.findById(req.params.postId);

    // ✅ If milestone reached (10, 20, 30... reactions), notify mentor
    if (post && totalReactions % 10 === 0) {
      await Notification.create({
        userId: post.mentorId,
        message: `Your post reached ${totalReactions} reactions 🎉`,
        type: "xp", // can also create new type "community"
        link: `/community/${post.communityId}/posts/${post._id}`,
      });
    }

    res.json({ message: "Reaction added/updated", react, totalReactions });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


/**
 * Summary of reactions for a post (mentor can view)
 */
router.get("/:postId/summary", auth(), async (req, res) => {
  try {
    const postId = req.params.postId;

    // Group by reaction type
    const reactionStats = await CommunityReaction.aggregate([
      { $match: { postId: new mongoose.Types.ObjectId(postId) } },
      { $group: { _id: "$reaction", count: { $sum: 1 } } }
    ]);

    const breakdown = {};
    let total = 0;
    reactionStats.forEach(r => {
      breakdown[r._id] = r.count;
      total += r.count;
    });

    // Latest 5 reactors
    const latest = await CommunityReaction.find({ postId })
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      postId,
      totalReactions: total,
      reactionBreakdown: breakdown,
      latestReactors: latest.map(r => ({
        name: r.userId.name,
        reaction: r.reaction
      }))
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


/**
 * Get all reactions for a post
 */
router.get("/:postId/reactions", auth(), async (req, res) => {
  try {
    const reactions = await CommunityReaction.find({ postId: req.params.postId })
      .populate("userId", "name year role");

    res.json({
      count: reactions.length,
      reactions
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
