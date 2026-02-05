import { useEffect } from "react";
import { connectSocket, disconnectSocket } from "../utils/socket";
import { emitInventoryUpdate } from "../utils/inventoryBus";
import { emitAdminEvent } from "../utils/adminBus"; 

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

const INVENTORY_EVENTS = new Set(["item_added", "item_removed", "inventory_update"]);
const ADMIN_EVENTS = new Set(["audit_log_added", "cart_paid", "cart_updated"]); 

export default function SocketBridge() {
  useEffect(() => {
    const user = getUser();
    if (!user) return;

    connectSocket((data) => {
      const evt = data?.event;

      if (INVENTORY_EVENTS.has(evt)) {
        emitInventoryUpdate({ evt, ...data });
        return;
      }

      if (ADMIN_EVENTS.has(evt)) {
        emitAdminEvent({ evt, ...data });
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

        if (INVENTORY_EVENTS.has(evt)) {
          emitInventoryUpdate({ evt, ...data });
          return;
        }

        if (ADMIN_EVENTS.has(evt)) {
          emitAdminEvent({ evt, ...data });
        }
      });
    };

    window.addEventListener("auth-change", onAuthChange);
    return () => window.removeEventListener("auth-change", onAuthChange);
  }, []);

  return null;
}
