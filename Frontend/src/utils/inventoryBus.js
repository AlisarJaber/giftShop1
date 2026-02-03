export const INVENTORY_EVENT = "inventory-update";

export function emitInventoryUpdate(payload) {
  window.dispatchEvent(new CustomEvent(INVENTORY_EVENT, { detail: payload }));
}

export function onInventoryUpdate(handler) {
  const fn = (e) => handler?.(e.detail);
  window.addEventListener(INVENTORY_EVENT, fn);
  return () => window.removeEventListener(INVENTORY_EVENT, fn);
}
