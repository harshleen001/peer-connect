import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  senderId: { type: String, required: true },
  text: { type: String, required: true },
  attachments: { type: Array, default: [] },
  readBy: { type: [String], default: [] },
  reactions: { type: Map, of: [String], default: {} }, // e.g., { 👍: [user1, user2] }
  createdAt: { type: Date, default: Date.now },
  messageType: { type: String, enum: ["direct", "community"], default: "direct" }
});

export default mongoose.model("Message", messageSchema);