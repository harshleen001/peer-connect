// Backend/routes/community.routes.js
import express from "express";
import { auth } from "../middleware/auth.js";
import Community from "../models/Community.js";
import CommunityPost from "../models/CommunityPost.js";
import CommunityReaction from "../models/CommunityReaction.js";

const router = express.Router();

/**
 * Create a new community (mentor only)
 */
router.post("/", auth(), async (req, res) => {
  try {
    if (req.user.role !== "mentor") {
      return res.status(403).json({ message: "Only mentors can create communities" });
    }

    const { name, description } = req.body;
    const community = await Community.create({
      name,
      description,
      mentorId: req.user.id,
      members: [req.user.id] // creator auto-joins
    });

    res.status(201).json(community);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * Mentee joins a community
 */
router.post("/:id/join", auth(), async (req, res) => {
  try {
    if (req.user.role !== "mentee") {
      return res.status(403).json({ message: "Only mentees can join communities" });
    }

    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ message: "Community not found" });

    if (community.members.includes(req.user.id)) {
      return res.status(400).json({ message: "Already a member" });
    }

    community.members.push(req.user.id);
    await community.save();

    res.json({ message: "Joined community successfully", community });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * Get all communities
 */
router.get("/", auth(), async (req, res) => {
  try {
    const communities = await Community.find()
      .populate("mentorId", "name email")
      .populate("members", "name role");

    res.json(communities);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.delete("/:id/leave", auth(), async (req, res) => {
  try {
    if (req.user.role !== "mentee") {
      return res.status(403).json({ message: "Only mentees can leave communities" });
    }

    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ message: "Community not found" });

    // Remove mentee from members list
    community.members = community.members.filter(
      (memberId) => memberId.toString() !== req.user.id
    );

    await community.save();

    res.json({ message: "Left community successfully", community });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * Get all communities the logged-in user has joined
 */
router.get("/my", auth(), async (req, res) => {
  try {
    const communities = await Community.find({ members: req.user.id })
      .populate("mentorId", "name email")
      .populate("members", "name role");

    res.json(communities);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * Get trending communities
 * Ranked by members + reactions
 */
router.get("/trending", auth(), async (req, res) => {
  try {
    // Step 1: get all communities
    const communities = await Community.find()
      .populate("mentorId", "name email")
      .lean();

    // Step 2: calculate reactions per community
    for (let community of communities) {
      const posts = await CommunityPost.find({ communityId: community._id }).select("_id");
      const postIds = posts.map(p => p._id);

      const reactionCount = await CommunityReaction.countDocuments({ postId: { $in: postIds } });

      community.memberCount = community.members.length;
      community.reactionCount = reactionCount;
      community.score = community.memberCount * 2 + community.reactionCount; // simple formula
    }

    // Step 3: sort by score
    communities.sort((a, b) => b.score - a.score);

    res.json(communities);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * Delete a community (mentor owner only)
 * Also deletes posts and reactions under the community
 */
router.delete("/:id", auth(), async (req, res) => {
  try {
    if (req.user.role !== "mentor") {
      return res.status(403).json({ message: "Only mentors can delete communities" });
    }

    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ message: "Community not found" });

    if (community.mentorId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this community" });
    }

    // Delete related posts and reactions
    const posts = await CommunityPost.find({ communityId: community._id }).select("_id");
    const postIds = posts.map(p => p._id);
    if (postIds.length) {
      await CommunityReaction.deleteMany({ postId: { $in: postIds } });
      await CommunityPost.deleteMany({ _id: { $in: postIds } });
    }

    await community.deleteOne();

    res.json({ message: "Community deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
