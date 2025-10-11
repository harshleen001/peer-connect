// Backend/models/Interaction.js
import mongoose from "mongoose";

const interactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: [
      "community_created",   // mentor creates community
      "community_joined",    // mentee joins
      "community_posted",    // mentor posts
      "community_reacted",   // mentee reacts
      "request_sent",        // mentee sends request
      "request_accepted",    // mentor accepts
      "chat_started",        // first message
      "chat_message"         // every chat message
    ],
    required: true
  },
  targetId: { type: mongoose.Schema.Types.ObjectId }, // e.g., communityId, mentorId, chatId, postId
  metadata: { type: Object }, // optional extra info like reaction type
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Interaction", interactionSchema);
