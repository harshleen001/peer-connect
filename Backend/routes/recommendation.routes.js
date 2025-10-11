import express from "express";
import User from "../models/User.js";

const router = express.Router();

/**
 * GET recommendations for logged-in mentee
 */
router.get("/", async (req, res) => {
  try {
    // mentee info (from token)
    const menteeId = req.user.id;
    const mentee = await User.findById(menteeId);

    if (!mentee || mentee.role !== "mentee") {
      return res.status(403).json({ message: "Only mentees can get recommendations" });
    }

    // find mentors with overlapping skills + mentee interests
    const mentors = await User.find({ role: "mentor" });

    const recommendations = mentors.map((mentor) => {
      // count overlap between mentee.interests and mentor.skills
      const overlap = mentor.skills.filter((skill) =>
        mentee.interests.includes(skill)
      );

      const similarity = overlap.length;

      // simple scoring: similarity + rating + menteesHelped
      const score =
        similarity * 50 +
        (mentor.rating || 0) * 20 +
        (mentor.menteesHelped || 0) * 10;

      return {
        mentorId: mentor._id,
        name: mentor.name,
        skills: mentor.skills,
        rating: mentor.rating,
        menteesHelped: mentor.menteesHelped,
        overlap,
        score,
      };
    });

    // sort by score
    recommendations.sort((a, b) => b.score - a.score);

    res.json(recommendations.slice(0, 5)); // top 5 mentors
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
