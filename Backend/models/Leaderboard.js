// Backend/models/Leaderboard.js
import mongoose from "mongoose";

const leaderboardSchema = new mongoose.Schema({
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  score: { type: Number, default: 0 }, // based on rating + menteesHelped
  badges: [{ type: String }], // e.g. "Top Mentor – ML"
  rank: { type: Number, default: 0 } // ✅ dynamic, should be recalculated
});

export default mongoose.model("Leaderboard", leaderboardSchema);
