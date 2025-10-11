// Backend/models/CommunityReaction.js
import mongoose from "mongoose";

const communityReactionSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "CommunityPost", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reaction: { type: String, enum: ["👍", "❤️", "🔥"], required: true },
  createdAt: { type: Date, default: Date.now }
});

// ✅ Prevent duplicate reactions from same user on same post
communityReactionSchema.index({ postId: 1, userId: 1 }, { unique: true });

export default mongoose.model("CommunityReaction", communityReactionSchema);
