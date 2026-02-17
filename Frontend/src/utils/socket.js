import { io } from "socket.io-client";

let socket = null;

function getToken() {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    null
  );
}

export function connectSocket(onEvent) {
  if (socket) return socket;

  const token = getToken();

  socket = io("http://localhost:8000", {
    transports: ["websocket"],
    auth: {
      apiKey: "SEACRET1234567",
      token,
    },
  });

  socket.on("connect", () => {
    console.log("🔌 socket.io connected", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("❌ socket.io disconnected");
  });

  socket.on("connected", (data) =>
    onEvent?.({ event: "connected", ...data })
  );

  socket.on("item_added", (data) =>
    onEvent?.({ event: "item_added", ...data })
  );

  socket.on("item_removed", (data) =>
    onEvent?.({ event: "item_removed", ...data })
  );

  socket.on("inventory_update", (data) =>
    onEvent?.({ event: "inventory_update", ...data })
  );

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
