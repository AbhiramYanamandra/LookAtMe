import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ENTRANCE, MOTION, depthOffset, heroScrollState, dropletKeyframes, smoothStep, easeOutCubic, isAnimatedNavigation, readingProgress, shouldPlayEntrance, staggerDelay } from "../src/lib/motion.js";
import { BRUSH_RADIUS, BRUSH_SWELL_RADIUS, WORDMARK, brushStamps, toPixels, wordmarkFrame } from "../src/lib/wordmark.js";

const nav = (overrides) =>
  isAnimatedNavigation({ href: "/projects", currentPath: "/", currentOrigin: "https://example.com", ...overrides });

test("stagger increments by 40ms and caps at 80ms", () => {
  assert.deepEqual([0, 1, 2, 3, 9].map(staggerDelay), [0, 40, 80, 80, 80]);
});

test("entrance plays once per tab session and never with reduced motion", () => {
  const store = new Map();
  const storage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) };
  assert.equal(shouldPlayEntrance({ storage, reducedMotion: false }), true);
  storage.setItem("lookatme:hero-entrance", "done");
  assert.equal(shouldPlayEntrance({ storage, reducedMotion: false }), false);
  assert.equal(shouldPlayEntrance({ storage, reducedMotion: false, force: true }), true);
  assert.equal(shouldPlayEntrance({ storage, reducedMotion: true, force: true }), false);
  assert.equal(shouldPlayEntrance({ storage: null, reducedMotion: false }), true);
});

test("entrance leaves time for lettering before the carousel returns", () => {
  const end = Math.max(...Object.values(ENTRANCE).map(([, to]) => to));
  assert.equal(end, MOTION.entrance);
  assert.ok(end <= 1100, `ends at ${end}`);
  assert.ok(ENTRANCE.carousel[0] >= ENTRANCE.flow[0] + 300);
  assert.ok(ENTRANCE.impact[0] >= ENTRANCE.fall[1] - 1, "impact starts when the fall ends");
  assert.ok(ENTRANCE.flow[0] >= ENTRANCE.impact[0], "lettering flows only after the droplet lands");
  assert.ok(ENTRANCE.splash[0] >= ENTRANCE.impact[0], "no splash particle before impact");
  assert.ok(ENTRANCE.settle[1] >= ENTRANCE.flow[1], "settling follows the flow");
  assert.equal(easeOutCubic(0), 0);
  assert.equal(easeOutCubic(1), 1);
  assert.ok(easeOutCubic(0.5) > 0.5, "quick start, gentle slowdown");
});

test("one droplet timeline falls before squashing and finishes transparent", () => {
  const frames = dropletKeyframes(120);
  assert.ok(frames[0].transform.includes("translateY(-120px)"));
  assert.equal(frames[0].opacity, 0);
  const impact = frames.findIndex((frame) => frame.offset === ENTRANCE.fall[1] / ENTRANCE.impact[1]);
  assert.ok(impact > 0);
  assert.ok(frames.slice(0, impact).every((frame) => /translateY\(-/.test(frame.transform)), "every pre-impact keyframe remains above the landing point");
  assert.equal(frames.at(-1).opacity, 0);
  assert.ok(frames.every((frame, i) => i === 0 || frame.offset > frames[i - 1].offset));
});

test("brush tips grow continuously and left/right branches finish together", () => {
  const { stamps } = brushStamps();
  assert.ok(stamps.every((stamp) => stamp.arrival >= 0 && stamp.arrival <= .880001));
  for (const group of [stamps.filter((stamp) => stamp.p[0] < WORDMARK.dot[0]), stamps.filter((stamp) => stamp.p[0] > WORDMARK.dot[0])]) {
    assert.ok(Math.max(...group.map((stamp) => stamp.arrival)) > .87);
  }
  assert.equal(smoothStep(-1), 0);
  assert.equal(smoothStep(2), 1);
  assert.ok(smoothStep(.1) > 0 && smoothStep(.1) < .1);
  assert.ok(stamps.every((stamp) => smoothStep((1 - stamp.arrival) / .12) > .999), "full coverage before the clip is removed");
});

test("CSS and JavaScript motion durations stay in sync", () => {
  const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
  for (const key of ["press", "hover", "grid", "reveal", "page", "stagger"]) {
    const actual = Number(css.match(new RegExp(`--motion-${key}: (\\d+)ms`))[1]);
    assert.equal(actual, MOTION[key], key);
  }
});

test("internal route changes animate; everything else keeps native behaviour", () => {
  assert.equal(nav({}), true);
  assert.equal(nav({ href: "/projects/presto" }), true);
  assert.equal(nav({ href: "/about", currentPath: "/projects" }), true);
  assert.equal(nav({ href: "/about", currentPath: "/about" }), false);
  assert.equal(nav({ href: "https://example.com/projects" }), true);
  assert.equal(nav({ href: "https://github.com/x" }), false, "external");
  assert.equal(nav({ href: "mailto:me@example.com" }), false, "email");
  assert.equal(nav({ href: "#work" }), false, "same-page anchor");
  assert.equal(nav({ href: "/#about", currentPath: "/" }), false, "same-page anchor with path");
  assert.equal(nav({ href: "/#about", currentPath: "/projects" }), true, "anchor on another page");
  assert.equal(nav({ href: "/projects?field=hardware", currentPath: "/projects" }), false, "query-only change");
  assert.equal(nav({ target: "_blank" }), false, "new tab");
  assert.equal(nav({ download: "" }), false, "download");
  assert.equal(nav({ modifiers: { metaKey: true } }), false, "modified click");
  assert.equal(nav({ button: 1 }), false, "middle click");
  assert.equal(nav({ href: "/resume.pdf" }), true, "same-origin document is still a route change for the router");
});

test("wordmark frame maps em coordinates into the wordmark box", () => {
  // 1216px wide box, 19cqw font on a 1280px hero → 243.2px, line box 1.5em.
  const frame = wordmarkFrame({ width: 1216, height: 364.8, fontSize: 243.2 });
  assert.ok(Math.abs(frame.x0 - (1216 - WORDMARK.advance * 243.2) / 2) < 1e-9, "text is centred");
  const expectedBaseline = (364.8 - (WORDMARK.ascent + WORDMARK.descent) * 243.2) / 2 + WORDMARK.ascent * 243.2;
  assert.ok(Math.abs(frame.baseline - expectedBaseline) < 1e-9);
  const [x, y] = toPixels(frame, [0, 0]);
  assert.equal(x, frame.x0);
  assert.equal(y, frame.baseline);
  // The dot of the i sits above the baseline, inside the box, right of centre.
  const [dx, dy] = toPixels(frame, WORDMARK.dot.slice(0, 2));
  assert.ok(dx > 1216 * 0.5 && dx < 1216 * 0.75, `dot x ${dx}`);
  assert.ok(dy > 0 && dy < frame.baseline, `dot y ${dy}`);
});

test("brush stamps follow the strokes outward from the dot of the i", () => {
  const { stamps, maxFlow } = brushStamps();
  assert.ok(stamps.length > 300, "dense enough for a smooth union");
  for (const { p } of stamps) {
    assert.ok(p[0] >= 0 && p[0] <= WORDMARK.advance + 0.1, `x ${p[0]}`);
    assert.ok(p[1] <= 0.1 && p[1] >= -1, `y ${p[1]}`);
  }
  const origin = stamps.find((stamp) => stamp.flow === 0);
  assert.ok(Math.abs(origin.p[0] - WORDMARK.dot[0]) < 0.12, `origin x ${origin.p[0]} vs dot ${WORDMARK.dot[0]}`);
  const furthest = stamps.reduce((a, b) => (a.flow > b.flow ? a : b));
  assert.equal(furthest.flow, maxFlow);
  assert.ok(furthest.p[0] < 0.9, "the far end of the flow is the start of the A");
  // Consecutive stamps are spaced within the brush (a continuous flow);
  // pen lifts between letters add no flow distance and stay within a brush.
  for (let i = 1; i < stamps.length; i += 1) {
    const [a, b] = [stamps[i - 1].p, stamps[i].p];
    const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
    const lift = stamps[i].flow === stamps[i - 1].flow;
    assert.ok(d <= BRUSH_RADIUS * 0.45 + 1e-6 || (lift && d <= BRUSH_RADIUS) || d > 0.3, `gap ${d} at ${i}`);
  }
  assert.ok(BRUSH_SWELL_RADIUS > BRUSH_RADIUS);
});

test("reading progress is clamped and measures the article only", () => {
  assert.equal(readingProgress({ scrollY: 0, viewportHeight: 800, articleTop: 1000, articleHeight: 2000 }), 0);
  assert.equal(readingProgress({ scrollY: 1200, viewportHeight: 800, articleTop: 1000, articleHeight: 2000 }), 0.5);
  assert.equal(readingProgress({ scrollY: 9000, viewportHeight: 800, articleTop: 1000, articleHeight: 2000 }), 1);
  assert.equal(readingProgress({ scrollY: 0, viewportHeight: 800, articleTop: 0, articleHeight: 0 }), 0);
});

test("hero scroll state drifts the carousel up and fades it near the edge, reversibly", () => {
  const top = heroScrollState({ scrollY: 0, heroHeight: 790 });
  assert.equal(Math.abs(top.shift), 0);
  assert.equal(top.fade, 1);
  const mid = heroScrollState({ scrollY: 300, heroHeight: 790 });
  assert.ok(mid.shift < 0 && mid.shift > -100, `shift ${mid.shift}`);
  assert.equal(mid.fade, 1, "no fade in the first 40% of the hero");
  const late = heroScrollState({ scrollY: 600, heroHeight: 790 });
  assert.ok(late.fade > 0 && late.fade < 1, `fade ${late.fade}`);
  assert.equal(heroScrollState({ scrollY: 790, heroHeight: 790 }).fade, 0);
  assert.equal(heroScrollState({ scrollY: 2000, heroHeight: 790 }).shift, -790 * 0.28, "movement stops past the hero");
  assert.ok(Math.abs(heroScrollState({ scrollY: 300, heroHeight: 590, compact: true }).shift) < Math.abs(mid.shift), "smaller on mobile");
  assert.deepEqual(heroScrollState({ scrollY: 100, heroHeight: 0 }), { shift: 0, fade: 1 });
  // Same input, same output: purely scroll-linked, so it reverses naturally.
  assert.deepEqual(heroScrollState({ scrollY: 300, heroHeight: 790 }), mid);
});

test("depth offset counter-moves a few pixels through the viewport and is clamped", () => {
  assert.equal(depthOffset(0.5), 0);
  assert.equal(depthOffset(0), 6);
  assert.equal(depthOffset(1), -6);
  assert.equal(depthOffset(-3), 6);
  assert.equal(depthOffset(0, 3), 3);
});
