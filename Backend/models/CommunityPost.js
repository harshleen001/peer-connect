// Backend/models/CommunityPost.js
import mongoose from "mongoose";

const communityPostSchema = new mongoose.Schema({
  communityId: { type: mongoose.Schema.Types.ObjectId, ref: "Community", required: true },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  mediaUrl: String, // optional image / file link
  hasPoll: { type: Boolean, default: false }, // Indicates if post has a poll

  // ✅ reaction counters for fast access
  reactionSummary: {
    thumbsUp: { type: Number, default: 0 },
    heart: { type: Number, default: 0 },
    fire: { type: Number, default: 0 }
  },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("CommunityPost", communityPostSchema);
