import { io } from "socket.io-client";

// point to your backend origin
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

let socket = null;

// initialize and connect the socket for a given userId (reads token from localStorage if present)
export function initSocket(userId) {
  if (!userId) return null;

  if (!socket) {
    const token = localStorage.getItem("token");
    socket = io(API_BASE_URL, {
      auth: token ? { token } : undefined,
      transports: ["websocket"],
      autoConnect: false,
      path: "/socket.io",
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  }

  if (!socket.connected) socket.connect();
  socket.emit("identify", { userId });
  console.log("🔌 Socket connected as:", userId);
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export default socket;