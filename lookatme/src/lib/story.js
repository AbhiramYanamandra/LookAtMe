/**
 * Pure maths for the pinned project story. The section scrolls through `count`
 * chapters; each chapter is `before`, `active` or `after`, and while active it
 * reveals its content in steps (title, visual, three facts, link) as the
 * visitor scrolls. Everything is a function of scroll progress, so scrolling
 * back up undoes it.
 */
export const STEP_AT = [0, 0.14, 0.34, 0.5, 0.66, 0.8];
export const STEP_COUNT = STEP_AT.length;

const clamp = (value) => Math.max(0, Math.min(1, value));

export function chapterState(progress, count) {
  const p = clamp(progress);
  return Array.from({ length: count }, (_, index) => {
    const start = index / count;
    const end = (index + 1) / count;
    const last = index === count - 1;
    const state = p < start ? "before" : p >= end && !last ? "after" : "active";
    const local = clamp((p - start) / (end - start));
    const step =
      state === "before" ? 0 : state === "after" ? STEP_COUNT : STEP_AT.filter((threshold) => local >= threshold).length;
    return { index, state, local, step };
  });
}

/** Scroll position (from the section's top) at which chapter `index` has begun. */
export function chapterScroll(index, count, travel) {
  return ((index + 0.02) / count) * travel;
}
