/**
 * Shared, framework-free phase clock for the first-load intro, in the same
 * spirit as hero-entrance-state.js. The intro writes it; the name entrance,
 * the role typer and the pulse read it. With no intro running the phase is
 * simply "done", so everything behaves as it always has.
 */
import { atLeast } from "./intro.js";

const state = { phase: "done", listeners: new Set() };

export function getPhase() {
  return state.phase;
}

export function setPhase(phase) {
  if (phase === state.phase) return;
  state.phase = phase;
  state.listeners.forEach((listener) => listener(phase));
}

export function subscribePhase(listener) {
  state.listeners.add(listener);
  return () => state.listeners.delete(listener);
}

/** Run `callback` once the intro reaches `target` (now, if it already has). Returns an unsubscribe. */
export function whenPhase(target, callback) {
  if (atLeast(state.phase, target)) {
    callback();
    return () => {};
  }
  const stop = subscribePhase((phase) => {
    if (atLeast(phase, target)) {
      stop();
      callback();
    }
  });
  return stop;
}
