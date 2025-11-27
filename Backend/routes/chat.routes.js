// Backend/routes/chat.routes.js
import express from "express";
import Chat from "../models/Chat.js";
import Request from "../models/Request.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";
import { getIO } from "../middleware/socket.js";

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

    // ✅ Get the last message (the one we just added) with populated senderId
    const savedChat = await Chat.findById(chat._id)
      .populate("messages.senderId", "name role")
      .populate("participants", "name role");
    const lastMessage = savedChat.messages[savedChat.messages.length - 1];

    // ✅ find the receiver (other participant in chat)
    const receiverId = chat.participants.find(
      (p) => p.toString() !== req.user.id
    );

    // ✅ create notification for the receiver
    let receiverNotif = null;
    if (receiverId) {
      const sender = await User.findById(req.user.id).select("name");
      receiverNotif = await Notification.create({
        userId: receiverId,
        message: `${sender?.name || "Someone"} sent you a message`,
        type: "chat",
        link: `/messages?chatId=${chat._id}`,
        data: { chatId: chat._id.toString(), fromName: sender?.name || "" },
      });
    }

    // ✅ Emit socket event to all participants in the chat room
    const io = getIO();
    if (io) {
      const roomId = chat._id.toString();
      // Emit to the chat room
      io.to(roomId).emit("chatMessage", {
        chatId: chat._id.toString(),
        message: {
          _id: lastMessage._id,
          senderId: lastMessage.senderId,
          text: lastMessage.text,
          timestamp: lastMessage.timestamp,
          isRead: lastMessage.isRead,
        },
        chat: {
          _id: savedChat._id,
          participants: savedChat.participants,
          lastMessage: lastMessage,
        },
      });
      if (receiverId && receiverNotif) {
        io.to(String(receiverId)).emit("receiveNotification", receiverNotif);
      }
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
