// Backend/routes/communityPost.routes.js
import express from "express";
import { auth } from "../middleware/auth.js";
import Community from "../models/Community.js";
import CommunityPost from "../models/CommunityPost.js";
import Notification from "../models/Notification.js";

const router = express.Router();

/**
 * Mentor creates a post in a community
 */
router.post("/:communityId/posts", auth(), async (req, res) => {
  try {
    if (req.user.role !== "mentor") {
      return res.status(403).json({ message: "Only mentors can post in communities" });
    }

    const { content, mediaUrl } = req.body;
    const community = await Community.findById(req.params.communityId);

    if (!community) return res.status(404).json({ message: "Community not found" });
    if (community.mentorId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the community creator can post" });
    }

    const post = await CommunityPost.create({
      communityId: req.params.communityId,
      mentorId: req.user.id,
      content,
      mediaUrl
    });

    // ✅ Notify all community members (except mentor)
    const memberIds = community.members.filter(
      (m) => m.toString() !== req.user.id
    );

    const notifications = memberIds.map((memberId) => ({
      userId: memberId,
      message: `New post in ${community.name} by ${req.user.id}`,
      type: "community",
      link: `/community/${community._id}/posts/${post._id}`
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * Get all posts in a community
 */
router.get("/:communityId/posts", auth(), async (req, res) => {
  try {
    const posts = await CommunityPost.find({ communityId: req.params.communityId })
      .populate("mentorId", "name email")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * Get feed for logged-in user (all posts from joined communities)
 */
router.get("/feed/my", auth(), async (req, res) => {
  try {
    // Find communities user is a member of
    const communities = await Community.find({ members: req.user.id }).select("_id");
    const communityIds = communities.map(c => c._id);

    if (communityIds.length === 0) {
      return res.json({ message: "No joined communities yet", posts: [] });
    }

    // Get posts from those communities
    const posts = await CommunityPost.find({ communityId: { $in: communityIds } })
      .populate("mentorId", "name email")
      .populate("communityId", "name")
      .sort({ createdAt: -1 });

    res.json({ count: posts.length, posts });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
