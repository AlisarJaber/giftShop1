import { io } from "socket.io-client";

let socket = null;

export function connectSocket(onEvent) {
  if (socket) return socket;

  socket = io("http://localhost:8000", {
    withCredentials: true,          // ✅ שולח cookie access_token
    transports: ["websocket"],
    query: { apiKey: "SEACRET1234567" }, // ✅ apiKey ב-query
  });

  socket.on("connect", () => {
    console.log("🔌 socket.io connected", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("❌ socket.io disconnected");
  });

  socket.on("connected", (data) => onEvent?.({ event: "connected", ...data }));
  socket.on("item_added", (data) => onEvent?.({ event: "item_added", ...data }));
  socket.on("item_removed", (data) => onEvent?.({ event: "item_removed", ...data }));
  socket.on("inventory_update", (data) => onEvent?.({ event: "inventory_update", ...data }));

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
