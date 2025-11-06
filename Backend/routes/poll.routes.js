// Backend/routes/poll.routes.js
import express from "express";
import { auth } from "../middleware/auth.js";
import Poll from "../models/Poll.js";
import CommunityPost from "../models/CommunityPost.js";
import Community from "../models/Community.js";

const router = express.Router();

/**
 * Create a poll for a post (mentor only)
 */
router.post("/:postId/create", auth(), async (req, res) => {
  try {
    if (req.user.role !== "mentor") {
      return res.status(403).json({ message: "Only mentors can create polls" });
    }

    const { question, options } = req.body;
    const post = await CommunityPost.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if mentor owns the post
    if (post.mentorId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only create polls for your own posts" });
    }

    // Check if poll already exists
    const existingPoll = await Poll.findOne({ postId: req.params.postId });
    if (existingPoll) {
      return res.status(400).json({ message: "Poll already exists for this post" });
    }

    // Validate poll data
    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: "Poll must have a question and at least 2 options" });
    }

    if (options.length > 10) {
      return res.status(400).json({ message: "Poll can have maximum 10 options" });
    }

    // Create poll
    const poll = await Poll.create({
      postId: req.params.postId,
      question,
      options: options.map(opt => ({ text: opt, votes: [], count: 0 }))
    });

    // Mark post as having a poll
    await CommunityPost.findByIdAndUpdate(req.params.postId, { hasPoll: true });

    res.status(201).json(poll);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * Vote on a poll (mentees only)
 */
router.post("/:postId/vote", auth(), async (req, res) => {
  try {
    if (req.user.role !== "mentee") {
      return res.status(403).json({ message: "Only mentees can vote on polls" });
    }

    const { optionIndex } = req.body;
    const poll = await Poll.findOne({ postId: req.params.postId });

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    // Check if user already voted
    if (poll.voters.includes(req.user.id)) {
      return res.status(400).json({ message: "You have already voted on this poll" });
    }

    // Validate option index
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ message: "Invalid option index" });
    }

    // Add vote
    poll.options[optionIndex].votes.push(req.user.id);
    poll.options[optionIndex].count += 1;
    poll.voters.push(req.user.id);
    poll.totalVotes += 1;

    await poll.save();

    // Return poll with user vote info
    res.json({ 
      message: "Vote recorded", 
      poll: {
        ...poll.toObject(),
        hasVoted: true,
        userVoteIndex: optionIndex
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * Get poll details for a post
 */
router.get("/:postId", auth(), async (req, res) => {
  try {
    const poll = await Poll.findOne({ postId: req.params.postId })
      .populate("voters", "name");

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    // Check if user has voted
    const hasVoted = poll.voters.some(v => 
      (typeof v === 'object' ? v._id.toString() : v.toString()) === req.user.id
    );

    res.json({
      ...poll.toObject(),
      hasVoted,
      userVoteIndex: hasVoted ? poll.options.findIndex(opt => 
        opt.votes.some(v => 
          (typeof v === 'object' ? v._id.toString() : v.toString()) === req.user.id
        )
      ) : null
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * Delete poll (mentor only, only their own polls)
 */
router.delete("/:postId", auth(), async (req, res) => {
  try {
    if (req.user.role !== "mentor") {
      return res.status(403).json({ message: "Only mentors can delete polls" });
    }

    const poll = await Poll.findOne({ postId: req.params.postId });
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    const post = await CommunityPost.findById(req.params.postId);
    if (!post || post.mentorId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete polls from your own posts" });
    }

    await Poll.findByIdAndDelete(poll._id);
    await CommunityPost.findByIdAndUpdate(req.params.postId, { hasPoll: false });

    res.json({ message: "Poll deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * Re-vote on a poll (mentees only) - allows changing vote
 */
router.patch("/:postId/vote", auth(), async (req, res) => {
  try {
    if (req.user.role !== "mentee") {
      return res.status(403).json({ message: "Only mentees can re-vote on polls" });
    }

    const { optionIndex } = req.body;
    const poll = await Poll.findOne({ postId: req.params.postId });

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    // Find the option where user has already voted
    const prevOptionIndex = poll.options.findIndex(opt =>
      opt.votes.some(v => v.toString() === req.user.id)
    );

    if (prevOptionIndex === -1) {
      return res.status(400).json({ message: "You haven't voted yet. Use POST instead." });
    }

    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ message: "Invalid option index" });
    }

    // If voting for the same option, just return success
    if (prevOptionIndex === optionIndex) {
      return res.json({ 
        message: "Vote unchanged", 
        poll: {
          ...poll.toObject(),
          hasVoted: true,
          userVoteIndex: optionIndex
        }
      });
    }

    // Remove user from old option
    poll.options[prevOptionIndex].votes = poll.options[prevOptionIndex].votes.filter(v => v.toString() !== req.user.id);
    poll.options[prevOptionIndex].count -= 1;

    // Add user to new option
    poll.options[optionIndex].votes.push(req.user.id);
    poll.options[optionIndex].count += 1;

    await poll.save();

    // Return poll with user vote info
    res.json({ 
      message: "Vote updated successfully", 
      poll: {
        ...poll.toObject(),
        hasVoted: true,
        userVoteIndex: optionIndex
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});



export default router;

