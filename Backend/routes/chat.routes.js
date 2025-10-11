// Backend/routes/chat.routes.js
import express from "express";
import Chat from "../models/Chat.js";
import Request from "../models/Request.js";
import Notification from "../models/Notification.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

/**
 * Create a new chat (only if mentor accepted the mentee's request)
 */
router.post("/start", auth(), async (req, res) => {
  try {
    const { mentorId } = req.body;
    const menteeId = req.user.id;

    // Only mentees should initiate chats
    if (req.user.role !== "mentee") {
      return res.status(403).json({ message: "Only mentees can start chats" });
    }

    // ✅ Check if request is accepted
    const request = await Request.findOne({
      menteeId,
      mentorId,
      status: "accepted",
    });

    if (!request) {
      return res.status(403).json({
        message: "You need an accepted request from the mentor to start a chat",
      });
    }

    // ✅ Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [mentorId, menteeId] },
    });

    if (!chat) {
      chat = new Chat({ participants: [mentorId, menteeId], messages: [] });
      await chat.save();
    }

    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * Send a message inside an existing chat
 */
router.post("/:chatId/message", auth(), async (req, res) => {
  try {
    const { text } = req.body;

    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    // ✅ Only participants can send messages
    if (!chat.participants.includes(req.user.id)) {
      return res.status(403).json({ message: "You are not part of this chat" });
    }

    const message = {
      senderId: req.user.id,
      text,
      timestamp: new Date(),
      isRead: false,
    };

    chat.messages.push(message);
    await chat.save();

    // ✅ find the receiver (other participant in chat)
    const receiverId = chat.participants.find(
      (p) => p.toString() !== req.user.id
    );

    // ✅ create notification for the receiver
    if (receiverId) {
      await Notification.create({
        userId: receiverId,
        message: `New message received`,
        type: "chat",
        link: `/chat/${chat._id}`,
      });
    }

    res.json({ message: "Message sent & receiver notified", chat });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * Get all messages in a chat
 */
router.get("/:chatId", auth(), async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId).populate(
      "messages.senderId",
      "name role"
    );

    if (!chat) return res.status(404).json({ message: "Chat not found" });

    res.json(chat.messages);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * Get all chats of logged-in user
 */
router.get("/", auth(), async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user.id })
      .populate("participants", "name role")
      .sort({ "messages.timestamp": -1 }); // latest message on top

    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
