import { Server } from "socket.io";
import Message from "../models/Message.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import Community from "../models/Community.js";

let io;

export function setupSocket(server) {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // ---------- IDENTIFY USER ----------
    socket.on("identify", async ({ userId }) => {
      if (!userId) return;
      socket.join(userId); // personal room for notifications
      try {
        await User.findByIdAndUpdate(
          userId,
          { isOnline: true, socketId: socket.id },
          { upsert: true, new: true }
        );
      } catch (err) {
        console.error("User update error:", err);
      }
    });

    // ---------- ROOM EVENTS ----------
    socket.on("joinRoom", (roomId) => {
      if (!roomId) return;
      socket.join(roomId);
    });

    socket.on("leaveRoom", (roomId) => {
      if (!roomId) return;
      socket.leave(roomId);
    });

    // ---------- PRIVATE MESSAGE ----------
    socket.on("sendMessage", async (payload) => {
      // payload: { roomId, senderId, text, attachments, receivers }
      try {
        const msg = new Message({
          roomId: payload.roomId,
          senderId: payload.senderId,
          text: payload.text,
          attachments: payload.attachments || [],
        });
        await msg.save();

        // emit to the room
        io.to(payload.roomId).emit("receiveMessage", msg);

        // create notifications for receivers
        if (payload.receivers && Array.isArray(payload.receivers)) {
          const sender = await User.findById(payload.senderId).select("name");
          for (const rid of payload.receivers) {
            const notif = await Notification.create({
              userId: rid,
              type: "chat",
              message: `${sender?.name || "Someone"} sent you a message`,
              link: `/messages?roomId=${payload.roomId}`,
              data: {
                roomId: payload.roomId,
                messageId: msg._id.toString(),
                fromName: sender?.name || "",
              },
            });
            io.to(String(rid)).emit("receiveNotification", notif);
          }
        }
      } catch (err) {
        console.error("sendMessage error:", err);
      }
    });

    // ---------- MARK MESSAGE AS READ ----------
    socket.on("markAsRead", async ({ messageId, userId }) => {
      try {
        await Message.findByIdAndUpdate(messageId, {
          $addToSet: { readBy: userId },
        });
      } catch (err) {
        console.error("markAsRead error:", err);
      }
    });

    // ---------- COMMUNITY CHAT ----------
    socket.on("joinCommunity", async ({ communityId, userId }) => {
      const roomId = `community_${communityId}`;
      socket.join(roomId);
      console.log(`${userId} joined ${roomId}`);
    });

    socket.on("sendCommunityMessage", async (payload) => {
      // payload = { communityId, senderId, text }
      try {
        const community = await Community.findById(payload.communityId);
        if (!community) return;

        // allow only mentors
        if (!community.mentors.includes(payload.senderId)) {
          socket.emit("errorMessage", {
            error: "Only mentors can post in community chats.",
          });
          return;
        }

        const roomId = `community_${payload.communityId}`;
        const msg = new Message({
          roomId,
          senderId: payload.senderId,
          text: payload.text,
          messageType: "community",
        });
        await msg.save();

        io.to(roomId).emit("receiveCommunityMessage", msg);
      } catch (err) {
        console.error("sendCommunityMessage error:", err);
      }
    });

    // ---------- REACTIONS (ONLY MENTORS) ----------
    socket.on("reactToMessage", async ({ messageId, emoji, userId }) => {
      try {
        const msg = await Message.findById(messageId);
        if (!msg) return;

        // check mentor permissions for community messages
        if (msg.messageType === "community") {
          const communityId = msg.roomId.replace("community_", "");
          const community = await Community.findById(communityId);
          if (!community.mentors.includes(userId)) {
            socket.emit("errorMessage", {
              error: "Only mentors can react in community chats.",
            });
            return;
          }
        }

        // Add reaction
        msg.reactions.set(emoji, [
          ...(msg.reactions.get(emoji) || []),
          userId,
        ]);
        await msg.save();

        io.emit("updateMessageReaction", { messageId, emoji, userId });
      } catch (err) {
        console.error("reactToMessage error:", err);
      }
    });

    // ---------- DISCONNECT ----------
    socket.on("disconnect", async () => {
      console.log("Socket disconnected:", socket.id);
      try {
        await User.findOneAndUpdate(
          { socketId: socket.id },
          { isOnline: false, socketId: null }
        );
      } catch (err) {
        console.error("disconnect update error:", err);
      }
    });
  });
}


export function getIO() {
  return io;
}

export default { setupSocket, getIO };