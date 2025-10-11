// Backend/models/Community.js
import mongoose from "mongoose";

const communitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Community", communitySchema);
