/**
 * Shared, framework-free state for coordinating the carousel with the
 * wordmark entrance. `spread` (0 → 1) suppresses carousel visibility while
 * the name forms. Objects keep their normal positions and drift speed.
 */
const state = { spread: 0, listeners: new Set() };

export function getSpread() {
  return state.spread;
}

export function setSpread(value, force = false) {
  const next = Math.max(0, Math.min(1, value));
  if (next === state.spread && !force) return;
  state.spread = next;
  state.listeners.forEach((listener) => listener(next));
}

export function subscribeSpread(listener) {
  state.listeners.add(listener);
  return () => state.listeners.delete(listener);
}
