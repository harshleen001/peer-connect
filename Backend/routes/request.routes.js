import express from "express";
import Request from "../models/Request.js";
import Notification from "../models/Notification.js";
import { auth } from "../middleware/auth.js";
import UserConnection from "../models/UserConnection.js";
import User from "../models/User.js";
import { getIO } from "../middleware/socket.js";


const router = express.Router();

// ✅ Mentee sends a request to a mentor
router.post("/:mentorId", auth(), async (req, res) => {
  try {
    if (req.user.role !== "mentee") {
      return res.status(403).json({ message: "Only mentees can send requests" });
    }

    const { mentorId } = req.params;

    const existing = await Request.findOne({
      menteeId: req.user.id,
      mentorId,
      status: { $in: ["pending", "accepted"] },
    });

    if (existing) {
      return res.status(400).json({ message: "Request already sent" });
    }

    const request = await Request.create({
      menteeId: req.user.id,
      mentorId,
    });

    // 🔔 Notification to mentor (include mentee name & request id)
    const mentee = await User.findById(req.user.id).select("name");
    const mentorNotif = await Notification.create({
      userId: mentorId,
      message: `New mentorship request from ${mentee?.name || "a mentee"}`,
      type: "request",
      link: `/requests`,
      data: { requestId: request._id.toString(), fromName: mentee?.name || "" },
    });

    // 🔔 Emit socket event to mentee confirming request was sent
    const io = getIO();
    if (io) {
      io.to(String(req.user.id)).emit("requestSent", {
        requestId: request._id.toString(),
        mentorId: mentorId,
        status: "pending",
      });
      io.to(String(mentorId)).emit("receiveNotification", mentorNotif);
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Mentor fetches all incoming requests
router.get("/incoming", auth(), async (req, res) => {
  try {
    if (req.user.role !== "mentor") {
      return res.status(403).json({ message: "Only mentors can view incoming requests" });
    }

    const requests = await Request.find({ mentorId: req.user.id, status: "pending" })
      .populate("menteeId", "name email year interests");

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Mentor accepts or rejects request
// ✅ Mentor accepts or rejects request
router.patch("/:requestId", auth(), async (req, res) => {
  try {
    const { status } = req.body; // "accepted" or "rejected"
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const request = await Request.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.mentorId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    request.status = status;
    await request.save();

    // ✅ If accepted, create a connection entry
    if (status === "accepted") {
      const exists = await UserConnection.findOne({
        mentorId: request.mentorId,
        menteeId: request.menteeId,
      });

      if (!exists) {
        await UserConnection.create({
          mentorId: request.mentorId,
          menteeId: request.menteeId,
        });
      }
    }

    // 🔔 Notify mentee about acceptance/rejection (include mentor name)
    const mentor = await User.findById(request.mentorId).select("name");
    await Notification.create({
      userId: request.menteeId,
      message:
        status === "accepted"
          ? `${mentor?.name || "Your mentor"} accepted your mentorship request`
          : `${mentor?.name || "Your mentor"} rejected your mentorship request`,
      type: "request",
      link: `/requests`,
      data: { requestId: request._id.toString(), fromName: mentor?.name || "" },
    });

    // 🔔 Emit socket event to mentee about request status change
    const io = getIO();
    if (io) {
      io.to(String(request.menteeId)).emit("requestStatusChanged", {
        requestId: request._id.toString(),
        mentorId: request.mentorId.toString(),
        status: status,
      });
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// ✅ Mentee fetches all sent requests
router.get("/sent", auth(), async (req, res) => {
  try {
    if (req.user.role !== "mentee") {
      return res.status(403).json({ message: "Only mentees can view their sent requests" });
    }

    const requests = await Request.find({ menteeId: req.user.id })
      .populate("mentorId", "name email skills rating");

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// ✅ Mentee cancels a pending request
router.delete("/:requestId", auth(), async (req, res) => {
  try {
    // Ensure only mentees can cancel
    if (req.user.role !== "mentee") {
      return res.status(403).json({ message: "Only mentees can cancel requests" });
    }

    // Find the request
    const request = await Request.findById(req.params.requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Ensure the mentee owns the request
    if (request.menteeId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Ensure it’s still pending
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Only pending requests can be cancelled" });
    }

    // Delete the request
    await request.deleteOne();

    // Optional: Notify mentor if mentee cancels (include mentee name)
    const mentee = await User.findById(request.menteeId).select("name");
    await Notification.create({
      userId: request.mentorId,
      message: `Connection request from ${mentee?.name || "a mentee"} was cancelled.`,
      type: "info",
      link: `/requests`,
      data: { requestId: request._id.toString(), fromName: mentee?.name || "" },
    });

    res.json({ message: "Request cancelled successfully" });
  } catch (err) {
    console.error("❌ Cancel request error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


export default router;
