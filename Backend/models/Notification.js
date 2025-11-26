import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["chat", "request", "rating", "xp", "community", "info"],
      required: true,
    },
    link: { type: String }, // e.g. "/chat/123"
    isRead: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
    data: { type: mongoose.Schema.Types.Mixed }, // contextual payload
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
