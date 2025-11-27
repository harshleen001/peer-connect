// Backend/routes/communityPost.routes.js
import express from "express";
import { auth } from "../middleware/auth.js";
import multer from "multer";
import path from "path";
import Community from "../models/Community.js";
import CommunityPost from "../models/CommunityPost.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { getReactionSummary, getReactionSummaries } from "./communityReaction.routes.js";
import { getIO } from "../middleware/socket.js";

const router = express.Router();

// Basic disk storage in uploads/ (already served via /api/uploads in index.js)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.resolve("uploads")),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `community-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  }
});
const upload = multer({ storage });

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

    // ✅ Notify all community members (except mentor) with mentor name
    const memberIds = community.members.filter(
      (m) => m.toString() !== req.user.id
    );
    const mentor = await User.findById(req.user.id).select("name");

    const notifications = memberIds.map((memberId) => ({
      userId: memberId,
      message: `${mentor?.name || "Your mentor"} posted in ${community.name}`,
      type: "community",
      link: `/community-chats/${community._id}/posts/${post._id}`,
      data: { communityId: community._id.toString(), postId: post._id.toString(), fromName: mentor?.name || "", communityName: community.name },
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    const io = getIO();
    if (io) {
      io.emit("communityPostCreated", {
        postId: post._id.toString(),
        communityId: String(post.communityId),
      });
    }

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * Get a single post by ID (must come before /:communityId/posts)
 */
router.get("/:communityId/posts/:postId", auth(), async (req, res) => {
  try {
    const post = await CommunityPost.findOne({
      _id: req.params.postId,
      communityId: req.params.communityId
    })
      .populate("mentorId", "name email")
      .populate("communityId", "name description");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Get reaction summary using helper from communityReaction.routes.js
    const reactionSummary = await getReactionSummary(post._id);

    const postWithReactions = {
      ...post.toObject(),
      reactionSummary
    };

    res.json(postWithReactions);
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

    // Get reaction summaries for all posts using helper from communityReaction.routes.js
    const postIds = posts.map(post => post._id);
    const reactionSummaries = await getReactionSummaries(postIds);

    // Combine posts with their reaction summaries
    const postsWithCounts = posts.map(post => {
      const postObj = post.toObject();
      const summary = reactionSummaries.get(post._id.toString()) || { heart: 0, thumbsUp: 0, fire: 0 };
      return {
        ...postObj,
        reactionSummary: summary
      };
    });

    res.json(postsWithCounts);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * Delete a post (mentor only, only their own posts)
 */
router.delete("/:communityId/posts/:postId", auth(), async (req, res) => {
  try {
    if (req.user.role !== "mentor") {
      return res.status(403).json({ message: "Only mentors can delete posts" });
    }

    const post = await CommunityPost.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.mentorId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }

    if (post.communityId.toString() !== req.params.communityId) {
      return res.status(400).json({ message: "Post does not belong to this community" });
    }

    await CommunityPost.findByIdAndDelete(req.params.postId);
    const io = getIO();
    if (io) {
      io.emit("communityPostDeleted", {
        postId: req.params.postId,
        communityId: String(post.communityId),
      });
    }
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * Upload media for a community post (mentor only)
 */
router.post("/:communityId/upload", auth(), upload.single("file"), async (req, res) => {
  try {
    if (req.user.role !== "mentor") {
      return res.status(403).json({ message: "Only mentors can upload" });
    }
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const mediaUrl = `/api/uploads/${req.file.filename}`;
    res.json({ mediaUrl });
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

    const postIds = posts.map((p) => p._id);
    const reactionSummaries = await getReactionSummaries(postIds);
    const postsWithCounts = posts.map((post) => {
      const s = reactionSummaries.get(post._id.toString()) || { heart: 0, thumbsUp: 0, fire: 0 };
      return { ...post.toObject(), reactionSummary: s };
    });

    res.json({ count: postsWithCounts.length, posts: postsWithCounts });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
