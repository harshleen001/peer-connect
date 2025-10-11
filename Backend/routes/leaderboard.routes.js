import express from "express";
import Leaderboard from "../models/Leaderboard.js";
import User from "../models/User.js";

const router = express.Router();

/**
 * GET leaderboard (top mentors)
 */
router.get("/", async (req, res) => {
  try {
    // fetch all mentors
    const mentors = await User.find({ role: "mentor" });

    // calculate score = (rating * 20) + (menteesHelped * 10)
    const leaderboardData = mentors.map((mentor) => {
      const score = (mentor.rating || 0) * 20 + (mentor.menteesHelped || 0) * 10;
      const badges = [];

      if (mentor.rating >= 4.5) badges.push("⭐ Top Rated Mentor");
      if (mentor.menteesHelped >= 10) badges.push("🔥 Active Mentor");

      return {
        mentorId: mentor._id,
        name: mentor.name,
        rating: mentor.rating,
        menteesHelped: mentor.menteesHelped,
        score,
        badges,
      };
    });

    // sort by score (desc)
    leaderboardData.sort((a, b) => b.score - a.score);

    // assign rank
    leaderboardData.forEach((mentor, index) => {
      mentor.rank = index + 1;
    });

    res.json(leaderboardData);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * GET leaderboard stats for a single mentor
 */
router.get("/:mentorId", async (req, res) => {
  try {
    // fetch all mentors
    const mentors = await User.find({ role: "mentor" });

    // calculate scores
    let leaderboardData = mentors.map((mentor) => {
      const score = (mentor.rating || 0) * 20 + (mentor.menteesHelped || 0) * 10;
      const badges = [];

      if (mentor.rating >= 4.5) badges.push("⭐ Top Rated Mentor");
      if (mentor.menteesHelped >= 10) badges.push("🔥 Active Mentor");

      return {
        mentorId: mentor._id.toString(),
        name: mentor.name,
        rating: mentor.rating,
        menteesHelped: mentor.menteesHelped,
        score,
        badges,
      };
    });

    // sort by score
    leaderboardData.sort((a, b) => b.score - a.score);

    // assign ranks
    leaderboardData.forEach((mentor, index) => {
      mentor.rank = index + 1;
    });

    // find requested mentor
    const mentorStats = leaderboardData.find(
      (m) => m.mentorId === req.params.mentorId
    );

    if (!mentorStats) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    res.json(mentorStats);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


export default router;
