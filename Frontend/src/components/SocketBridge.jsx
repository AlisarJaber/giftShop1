import { useEffect } from "react";
import { connectSocket, disconnectSocket } from "../utils/socket";
import { emitInventoryUpdate } from "../utils/inventoryBus";

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export default function SocketBridge() {

  useEffect(() => {
    const user = getUser();
    if (!user) return;

    connectSocket((data) => {
      const evt = data?.event;
      if (evt === "item_added" || evt === "item_removed" || evt === "inventory_update") {
        emitInventoryUpdate({ evt, ...data });
      }
    });

    return () => disconnectSocket();
  }, []);

  useEffect(() => {
    const onAuthChange = () => {
      disconnectSocket();

      const user = getUser();
      if (!user) return;

      connectSocket((data) => {
        const evt = data?.event;
        if (evt === "item_added" || evt === "item_removed" || evt === "inventory_update") {
          emitInventoryUpdate({ evt, ...data });
        }
      });
    };

    window.addEventListener("auth-change", onAuthChange);
    return () => window.removeEventListener("auth-change", onAuthChange);
  }, []);

  return null;
}