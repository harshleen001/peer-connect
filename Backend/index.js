import "dotenv/config.js";
import express from "express";
import cors from "cors";
import http from "http";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import userRoutes from "./routes/user.routes.js";
import mentorRoutes from "./routes/mentor.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import leaderboardRoutes from "./routes/leaderboard.routes.js";
import recommendationRoutes from "./routes/recommendation.routes.js";
import { auth } from "./middleware/auth.js";
import requestRoutes from "./routes/request.routes.js";
import connectionRoutes from "./routes/connection.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import communityRoutes from "./routes/community.routes.js";
import communityPostRoutes  from "./routes/communityPost.routes.js";  
import followRoutes from "./routes/follow.routes.js";
import communityReactionRoutes from "./routes/communityReaction.routes.js";
import pollRoutes from "./routes/poll.routes.js";
import path from "path";

import fs from "fs";



const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);

app.use("/api/user", userRoutes);

app.use("/api/mentors", mentorRoutes);

app.use("/api/reviews", reviewRoutes);

app.use("/api/chats", chatRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/leaderboard", leaderboardRoutes);

app.use("/api/recommendations", auth(), recommendationRoutes);

app.use("/api/requests", auth(), requestRoutes);

app.use("/api/connections", connectionRoutes);

app.use("/api/profile", profileRoutes);

app.use("/api/admin", adminRoutes);

app.use('/api/community', communityRoutes);

app.use('/api/community-post', communityPostRoutes);

app.use('/api/community-reaction', communityReactionRoutes);

app.use('/api/poll', pollRoutes);

app.use("/api/follow", followRoutes);

const server = http.createServer(app);
import { setupSocket } from "./middleware/socket.js";
setupSocket(server);



const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use("/api/uploads", express.static(uploadDir));
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

connectDB().then(() => {
  const port = process.env.PORT || 5000;
  server.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  });
});