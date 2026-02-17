import { io } from "socket.io-client";

let socket = null;

export function connectSocket(onEvent) {
  if (socket) return socket;

  socket = io("http://localhost:8000", {
    transports: ["websocket"],
    withCredentials: true,
    auth: {
      apiKey: "SEACRET1234567",
    },
  });


  socket.on("connect", () => {
    console.log("🔌 socket.io connected", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("❌ socket.io disconnected");
  });

  socket.on("connect_error", (err) => {
    console.log("❌ socket connect_error:", err?.message || err);
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

  socket.on("audit_log_added", (data) =>
    onEvent?.({ event: "audit_log_added", ...data })
  );

  socket.on("cart_paid", (data) =>
    onEvent?.({ event: "cart_paid", ...data })
  );

  socket.on("cart_updated", (data) =>
    onEvent?.({ event: "cart_updated", ...data })
  );

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}