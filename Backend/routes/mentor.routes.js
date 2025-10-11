import express from "express";
import User from "../models/User.js";

const router = express.Router();

/**
 * GET /api/mentors
 * Query params:
 *  - skills=ML,WebDev
 *  - year=2nd Year
 *  - search=riya
 *  - sort=rating|mentees|new
 *  - page=1  limit=12
 */
router.get("/", async (req, res) => {
  try {
    const {
      skills,
      year,
      search,
      sort = "rating",
      page = 1,
      limit = 12,
      verified, // optional: true to show only verified mentors
    } = req.query;

    const q = { role: "mentor" };

    if (skills) {
      q.skills = { $in: skills.split(",").map((s) => s.trim()) };
    }
    if (year) q.year = year;
    if (verified === "true") q.verifiedMentor = true;

    if (search) {
      const rx = new RegExp(search, "i");
      q.$or = [{ name: rx }, { achievements: rx }, { skills: { $elemMatch: { $regex: rx } } }];
    }

    const sortBy =
      sort === "mentees" ? { menteesHelped: -1 }
      : sort === "new"    ? { createdAt: -1 }
      :                     { rating: -1, menteesHelped: -1 }; // default

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [data, total] = await Promise.all([
      User.find(q)
        .select("name year skills achievements rating menteesHelped verifiedMentor")
        .sort(sortBy)
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(q),
    ]);

    res.json({
      data,
      page: Number(page),
      total,
      pages: Math.ceil(total / Number(limit) || 1),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
