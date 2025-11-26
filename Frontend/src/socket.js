import { io } from "socket.io-client";

<<<<<<< HEAD
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
=======
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

>>>>>>> 527f453f27f46d7751e05d97ac7aa948fda49ae1
