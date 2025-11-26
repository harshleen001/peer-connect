import { io } from "socket.io-client";

// point to your backend origin
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const socket = io(API_BASE_URL, {
  transports: ["websocket"],
  autoConnect: false, // we’ll connect manually
});

// identify user after login
export const initSocket = (userId) => {
  if (!userId) return;
  if (!socket.connected) socket.connect();
  socket.emit("identify", { userId });
  console.log("🔌 Socket connected as:", userId);
};

export default socket;
