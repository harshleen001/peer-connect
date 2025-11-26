import express from "express";
import User from "../models/User.js";
import Review from "../models/Review.js";
import Chat from "../models/Chat.js";
import Community from "../models/Community.js";
import CommunityPost from "../models/CommunityPost.js";
import CommunityReaction from "../models/CommunityReaction.js";
import Request from "../models/Request.js";
import UserConnection from "../models/UserConnection.js";
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
    const totalCommunities = await Community.countDocuments();
    const totalPosts = await CommunityPost.countDocuments();
    const totalReactions = await CommunityReaction.countDocuments();
    const totalRequests = await Request.countDocuments();
    const totalConnections = await UserConnection.countDocuments();

    res.json({
      totalUsers,
      totalMentors,
      totalMentees,
      totalReviews,
      totalChats,
      totalCommunities,
      totalPosts,
      totalReactions,
      totalRequests,
      totalConnections,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/reviews", auth(), checkAdmin(), async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("mentorId", "name email year role")
      .populate("menteeId", "name email year role")
      .sort({ timestamp: -1 });

    res.json({ count: reviews.length, reviews });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * Get all communities (admin)
 */
router.get("/communities", auth(), checkAdmin(), async (req, res) => {
  try {
    const communities = await Community.find()
      .populate("mentorId", "name email role")
      .populate("members", "name role");
    res.json({ count: communities.length, communities });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * Get all posts (admin) with reaction summaries
 */
router.get("/posts", auth(), checkAdmin(), async (req, res) => {
  try {
    const posts = await CommunityPost.find()
      .populate("mentorId", "name email role")
      .populate("communityId", "name")
      .sort({ createdAt: -1 });

    // Aggregate reactions per post
    const postIds = posts.map((p) => p._id);
    const reactionAgg = await CommunityReaction.aggregate([
      { $match: { postId: { $in: postIds } } },
      { $group: { _id: { postId: "$postId", reaction: "$reaction" }, count: { $sum: 1 } } },
    ]);
    const map = new Map();
    postIds.forEach((id) => map.set(id.toString(), { heart: 0, thumbsUp: 0, fire: 0 }));
    reactionAgg.forEach((r) => {
      const pid = r._id.postId.toString();
      const s = map.get(pid) || { heart: 0, thumbsUp: 0, fire: 0 };
      if (r._id.reaction === "❤️") s.heart = r.count;
      if (r._id.reaction === "👍") s.thumbsUp = r.count;
      if (r._id.reaction === "🔥") s.fire = r.count;
      map.set(pid, s);
    });
    const postsWithCounts = posts.map((p) => ({ ...p.toObject(), reactionSummary: map.get(p._id.toString()) }));
    res.json({ count: postsWithCounts.length, posts: postsWithCounts });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * Get all requests (admin)
 */
router.get("/requests", auth(), checkAdmin(), async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("menteeId", "name email role")
      .populate("mentorId", "name email role")
      .sort({ createdAt: -1 });
    res.json({ count: requests.length, requests });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * Get all connections (admin)
 */
router.get("/connections", auth(), checkAdmin(), async (req, res) => {
  try {
    const connections = await UserConnection.find()
      .populate("mentorId", "name email role")
      .populate("menteeId", "name email role")
      .sort({ createdAt: -1 });
    res.json({ count: connections.length, connections });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
