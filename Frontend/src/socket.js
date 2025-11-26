import { io } from "socket.io-client";

let socket = null;

export function getSocket() {
  if (!socket) {
    const token = localStorage.getItem("token");
    const userId = JSON.parse(localStorage.getItem("user") || "{}")?._id;
    
    if (!userId) return null;

    const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    socket = io(API_BASE, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("Socket connected");
      socket.emit("identify", { userId });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

