// Backend/routes/communityReaction.routes.js
import express from "express";
import mongoose from "mongoose";
import { auth } from "../middleware/auth.js";
import CommunityReaction from "../models/CommunityReaction.js";
import CommunityPost from "../models/CommunityPost.js";
import Notification from "../models/Notification.js";

const router = express.Router();

/**
 * Helper function to get reaction summary for a single post
 * @param {mongoose.Types.ObjectId} postId - The post ID
 * @returns {Promise<Object>} Reaction summary with heart, thumbsUp, fire counts
 */
export const getReactionSummary = async (postId) => {
  const reactions = await CommunityReaction.aggregate([
    { $match: { postId: new mongoose.Types.ObjectId(postId) } },
    { $group: { _id: "$reaction", count: { $sum: 1 } } }
  ]);

  const reactionSummary = {
    heart: 0,
    thumbsUp: 0,
    fire: 0
  };

  reactions.forEach(r => {
    if (r._id === '❤️') reactionSummary.heart = r.count;
    if (r._id === '👍') reactionSummary.thumbsUp = r.count;
    if (r._id === '🔥') reactionSummary.fire = r.count;
  });

  return reactionSummary;
};

/**
 * Helper function to get reaction summaries for multiple posts
 * @param {Array<mongoose.Types.ObjectId>} postIds - Array of post IDs
 * @returns {Promise<Map>} Map of postId -> reactionSummary
 */
export const getReactionSummaries = async (postIds) => {
  if (!postIds || postIds.length === 0) {
    return new Map();
  }

  const reactions = await CommunityReaction.aggregate([
    { $match: { postId: { $in: postIds.map(id => new mongoose.Types.ObjectId(id)) } } },
    { $group: { _id: { postId: "$postId", reaction: "$reaction" }, count: { $sum: 1 } } }
  ]);

  const summaryMap = new Map();
  
  // Initialize all posts with zero counts
  postIds.forEach(id => {
    summaryMap.set(id.toString(), {
      heart: 0,
      thumbsUp: 0,
      fire: 0
    });
  });

  // Fill in actual counts
  reactions.forEach(r => {
    const postId = r._id.postId.toString();
    const summary = summaryMap.get(postId) || { heart: 0, thumbsUp: 0, fire: 0 };
    
    if (r._id.reaction === '❤️') summary.heart = r.count;
    if (r._id.reaction === '👍') summary.thumbsUp = r.count;
    if (r._id.reaction === '🔥') summary.fire = r.count;
    
    summaryMap.set(postId, summary);
  });

  return summaryMap;
};

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
    if (post && totalReactions % 10 === 0 && totalReactions > 0) {
      await Notification.create({
        userId: post.mentorId,
        message: `Your post reached ${totalReactions} reactions 🎉`,
        type: "xp", // can also create new type "community"
        link: `/community-chats/${post.communityId}/posts/${post._id}`,
        data: { postId: post._id.toString(), communityId: post.communityId.toString(), reactionCount: totalReactions },
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
