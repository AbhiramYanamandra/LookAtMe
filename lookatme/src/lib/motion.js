/**
 * Motion tokens and pure helpers shared by CSS (see globals.css) and the
 * client components. Keep the numbers here and in `:root` in sync.
 */
export const MOTION = {
  press: 100,
  hover: 160,
  grid: 240,
  gridLeave: 100,
  gridEnter: 200,
  reveal: 260,
  page: 260,
  stagger: 40,
  staggerCap: 80,
  entrance: 1500,
};

export const EASE_OUT = "cubic-bezier(0.2, 0.7, 0.2, 1)";

export function easeOutCubic(t) {
  const x = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - x, 3);
}

export function easeInOutCubic(t) {
  const x = Math.max(0, Math.min(1, t));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function smoothStep(t) {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

/** One animation owns the drop and impact, so a delayed effect cannot
 * replace the falling transform before the droplet reaches the lettering. */
export function dropletKeyframes(distance) {
  const end = ENTRANCE.impact[1];
  const at = (ms) => ms / end;
  return [
    { offset: 0, transform: `translate(-50%, -50%) translateY(${-distance}px) scale(.8, 1.1)`, opacity: 0 },
    { offset: at(35), transform: `translate(-50%, -50%) translateY(${-distance * .97}px) scale(.85, 1.12)`, opacity: 1, easing: "cubic-bezier(.45,0,.85,.6)" },
    { offset: at(ENTRANCE.fall[1]), transform: "translate(-50%, -50%) scale(.92, 1.08)", opacity: 1, easing: EASE_OUT },
    { offset: at(ENTRANCE.impact[0] + 25), transform: "translate(-50%, -50%) scale(1.18, .8)", opacity: 1, easing: EASE_OUT },
    { offset: 1, transform: "translate(-50%, -50%) scale(1)", opacity: 0 },
  ];
}

export const ENTRANCE_STORAGE_KEY = "lookatme:hero-entrance";

/** Stagger delay for the n-th element revealed in one batch (capped). */
export function staggerDelay(index) {
  return Math.min(index * MOTION.stagger, MOTION.staggerCap);
}

/**
 * Decide whether the droplet entrance should play.
 * Plays once per browser-tab session, never for reduced-motion visitors.
 */
export function shouldPlayEntrance({ storage, reducedMotion, force = false }) {
  if (reducedMotion) return false;
  if (force) return true;
  try {
    return storage?.getItem(ENTRANCE_STORAGE_KEY) !== "done";
  } catch {
    return true;
  }
}

/**
 * Whether a click on an anchor should be treated as an internal, animated
 * navigation. Everything else keeps native behaviour untouched.
 */
export function isAnimatedNavigation({ href, target, download, currentPath, currentOrigin, modifiers = {}, button = 0 }) {
  if (button !== 0) return false;
  if (modifiers.metaKey || modifiers.ctrlKey || modifiers.shiftKey || modifiers.altKey) return false;
  if (target && target !== "_self") return false;
  if (download != null && download !== false) return false;
  if (typeof href !== "string" || href === "") return false;
  let url;
  try {
    url = new URL(href, currentOrigin + currentPath);
  } catch {
    return false;
  }
  if (url.origin !== currentOrigin) return false;
  if (!["http:", "https:"].includes(url.protocol)) return false;
  // Same document + hash: normal smooth scrolling.
  if (url.pathname === currentPath && url.hash) return false;
  // Query-only changes (filters/sort) are animated by the grid, not a sweep.
  if (url.pathname === currentPath) return false;
  return true;
}

/**
 * Timeline (ms) for the droplet entrance. The droplet lands on the dot of
 * the "i"; the lettering flows outward along its strokes from there.
 */
export const ENTRANCE = {
  fall: [0, 240],
  impact: [240, 310],
  ripple: [250, 480],
  splash: [255, 450],
  flow: [280, 760],
  settle: [700, 760],
  carousel: [700, 1500],
};

/** Reading progress through an article, 0 → 1. */
export function readingProgress({ scrollY, viewportHeight, articleTop, articleHeight }) {
  if (articleHeight <= 0) return 0;
  const read = scrollY + viewportHeight - articleTop;
  return Math.max(0, Math.min(1, read / articleHeight));
}

/**
 * Scroll-linked hero state. As the reader leaves the hero the carousel
 * drifts upward and fades near the top edge; both follow the scroll
 * position directly so they reverse naturally.
 */
export function heroScrollState({ scrollY, heroHeight, compact = false }) {
  if (heroHeight <= 0) return { shift: 0, fade: 1 };
  const t = Math.max(0, Math.min(1, scrollY / heroHeight));
  const shift = -Math.min(scrollY, heroHeight) * (compact ? 0.18 : 0.28);
  const fadeStart = 0.4;
  const fade = t <= fadeStart ? 1 : 1 - Math.min(1, (t - fadeStart) / (1 - fadeStart));
  return { shift, fade };
}

/**
 * Depth offset for imagery inside a card: a few pixels of counter-movement
 * as the card travels through the viewport, so images sit a little deeper
 * than their frames. `progress` is 0 when the card's centre is at the bottom
 * of the viewport and 1 at the top.
 */
export function depthOffset(progress, amplitude = 6) {
  const p = Math.max(0, Math.min(1, progress));
  return (0.5 - p) * 2 * amplitude;
}

/**
 * Progress (0 → 1) through a pinned scroll section. The section is `height`
 * tall and its sticky stage holds for `height - viewport` pixels of
 * scrolling; `scrollY` is measured from the section's top.
 */
export function storyProgress({ scrollY, height, viewport }) {
  const travel = height - viewport;
  if (travel <= 0) return 0;
  return Math.max(0, Math.min(1, scrollY / travel));
}
