// Backend/routes/connections.routes.js
import express from "express";
import Request from "../models/Request.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /api/connections
 * Get all accepted connections for logged-in user (both mentors & mentees)
 */
router.get("/", auth(), async (req, res) => {
  try {
    const requests = await Request.find({
      $or: [
        { menteeId: req.user.id, status: "accepted" },
        { mentorId: req.user.id, status: "accepted" }
      ]
    })
      .populate("menteeId", "name email year skills interests")
      .populate("mentorId", "name email skills rating");

    // Format response: show "the other user" in the connection
    const connections = requests.map(r => {
      if (r.menteeId._id.toString() === req.user.id) {
        // logged-in user is mentee → return mentor details
        return {
          role: "mentor",
          ...r.mentorId.toObject()
        };
      } else {
        // logged-in user is mentor → return mentee details
        return {
          role: "mentee",
          ...r.menteeId.toObject()
        };
      }
    });

    res.json(connections);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
