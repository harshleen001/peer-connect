// Backend/models/Poll.js
import mongoose from "mongoose";

const pollSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "CommunityPost", required: true, unique: true },
  question: { type: String, required: true },
  options: [{
    text: { type: String, required: true },
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    count: { type: Number, default: 0 }
  }],
  totalVotes: { type: Number, default: 0 },
  voters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Track who voted
  endsAt: { type: Date }, // Optional: poll expiration
  createdAt: { type: Date, default: Date.now }
});

// Index for faster lookups
pollSchema.index({ postId: 1 });

export default mongoose.model("Poll", pollSchema);

