import express from "express";
import { auth } from "../middleware/auth.js";
import UserConnection from "../models/UserConnection.js";

const router = express.Router();

router.get("/", auth(), async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === "mentor") filter.mentorId = req.user.id;
    else filter.menteeId = req.user.id;

    const connections = await UserConnection.find(filter)
      .populate("mentorId", "name email skills rating profilePicture isOnline lastSeenAt")
      .populate("menteeId", "name email year interests profilePicture isOnline lastSeenAt");

    res.json(connections);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.delete("/:id", auth(), async (req, res) => {
  try {
    await UserConnection.findByIdAndDelete(req.params.id);
    res.json({ message: "Connection removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
