const listeners = new Set();

export function onAdminEvent(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function emitAdminEvent(payload) {
  for (const cb of listeners) cb(payload);
}
