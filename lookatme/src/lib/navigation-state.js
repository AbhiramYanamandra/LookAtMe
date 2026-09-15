/**
 * Tiny shared store describing how the current page was reached, so motion
 * components can agree without prop drilling:
 *  - "click": an internal link the visitor pressed (content fade)
 *  - "history": Back/Forward (brief fade, content shown as already revealed)
 *  - "initial": first load
 */
const state = { type: "initial" };

export function setNavigationType(type) {
  state.type = type;
}

export function getNavigationType() {
  return state.type;
}

if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => setNavigationType("history"));
}
