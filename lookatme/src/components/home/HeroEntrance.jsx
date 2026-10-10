"use client";

import { useEffect, useRef, useState } from "react";
import { EASE_OUT, ENTRANCE, ENTRANCE_STORAGE_KEY, MOTION, easeInOutCubic, smoothStep, dropletKeyframes, shouldPlayEntrance } from "@/lib/motion";
import { setSpread } from "@/lib/hero-entrance-state";
import { getPhase, subscribePhase } from "@/lib/intro-state";
import { atLeast } from "@/lib/intro";
import { BRUSH_SWELL_RADIUS, WORDMARK, brushStamps, toPixels, wordmarkFrame } from "@/lib/wordmark";

/**
 * Droplet → "Abhiram" entrance.
 *
 * A small droplet falls onto the dot of the "i"; from there the lettering
 * flows outward along the authored pen path (see src/lib/wordmark.js) as a
 * clip-path of overlapping, growing brush stamps on the real <h1>. The two
 * branches finish together, then the carousel fades in at normal speed.
 * Runs once per browser-tab session on the
 * homepage. The bootstrap script hides the wordmark before paint when the
 * entrance is due; reduced motion, a return visit, or any failure leaves the
 * settled name visible.
 *
 * Review aid (development only): `?entrance=1` replays it, and
 * `?entrance=<ms>` freezes the timeline at that moment.
 */

// Survives React's development double-mount so the sequence is not lost.
const session = { started: false };
const SVG_NS = "http://www.w3.org/2000/svg";
const CLIP_ID = "al-wordmark-clip";

export function HeroEntrance({ reviewEnabled = false }) {
  const anchorRef = useRef(null);
  const [fontReady, setFontReady] = useState(false);

  useEffect(() => {
    let active = true;
    // Measuring a fallback font would misalign the brush and the impact.
    document.fonts.ready.then(() => { if (active) setFontReady(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!fontReady) return undefined;
    const root = document.documentElement;
    const hero = anchorRef.current?.closest(".al-hero");
    const wordmark = hero?.querySelector(".al-wordmark");
    if (!hero || !wordmark) return undefined;

    let freezeAt = null;
    let force = false;
    if (reviewEnabled) {
      const params = new URLSearchParams(window.location.search);
      const value = params.get("entrance");
      if (params.has("intro")) force = true;
      if (value !== null) {
        force = true;
        const ms = Number.parseFloat(value);
        if (Number.isFinite(ms) && ms > 1) freezeAt = ms;
      }
    }

    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reduced = reducedQuery.matches;
    const play = shouldPlayEntrance({ storage: window.sessionStorage, reducedMotion: reduced, force }) || (session.started && !reduced);
    const pending = root.classList.contains("al-entrance-pending") || session.started;

    const settle = () => {
      root.classList.remove("al-entrance-pending", "al-entrance-playing", "al-entrance-settled");
      wordmark.style.clipPath = "";
      setSpread(0);
    };

    if (!play || (!pending && !force)) {
      settle();
      return undefined;
    }

    // --- Geometry in the wordmark's own (unrotated) box, then in hero space.
    const fontSize = Number.parseFloat(getComputedStyle(wordmark).fontSize);
    const frame = wordmarkFrame({ width: wordmark.offsetWidth, height: wordmark.offsetHeight, fontSize });
    const heroRect = hero.getBoundingClientRect();
    const wordRect = wordmark.getBoundingClientRect();
    const centre = [wordRect.left - heroRect.left + wordRect.width / 2, wordRect.top - heroRect.top + wordRect.height / 2];
    const angle = (-5 * Math.PI) / 180;
    const toHero = ([x, y]) => {
      const dx = x - wordmark.offsetWidth / 2;
      const dy = y - wordmark.offsetHeight / 2;
      return [centre[0] + dx * Math.cos(angle) - dy * Math.sin(angle), centre[1] + dx * Math.sin(angle) + dy * Math.cos(angle)];
    };
    const [dotX, dotY, dotR] = WORDMARK.dot;
    const dotPx = toPixels(frame, [dotX, dotY]);
    const impact = toHero(dotPx);
    const dotDiameter = dotR * 2 * fontSize;
    const fallDistance = fontSize * 0.55;

    // --- Clip path: one circle per brush stamp, all collapsed to start with.
    const { stamps } = brushStamps();
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.setAttribute("aria-hidden", "true");
    svg.style.position = "absolute";
    const clip = document.createElementNS(SVG_NS, "clipPath");
    clip.setAttribute("id", CLIP_ID);
    clip.setAttribute("clipPathUnits", "userSpaceOnUse");
    const circles = stamps.map((stamp) => {
      const [cx, cy] = toPixels(frame, stamp.p);
      const circle = document.createElementNS(SVG_NS, "circle");
      circle.setAttribute("cx", cx.toFixed(1));
      circle.setAttribute("cy", cy.toFixed(1));
      circle.setAttribute("r", "0");
      clip.appendChild(circle);
      return circle;
    });
    const dotCircle = document.createElementNS(SVG_NS, "circle");
    dotCircle.setAttribute("cx", dotPx[0].toFixed(1));
    dotCircle.setAttribute("cy", dotPx[1].toFixed(1));
    dotCircle.setAttribute("r", "0");
    clip.appendChild(dotCircle);
    svg.appendChild(clip);
    hero.appendChild(svg);

    // --- Decorative elements (all start transparent; see motion.css).
    const droplet = document.createElement("span");
    droplet.className = "al-droplet";
    droplet.style.width = `${dotDiameter}px`;
    droplet.style.height = `${dotDiameter}px`;
    const ripple = document.createElement("span");
    ripple.className = "al-ripple";
    ripple.style.width = `${fontSize * 0.9}px`;
    ripple.style.height = `${fontSize * 0.34}px`;
    const splashes = [-1, 1].map(() => document.createElement("span"));
    splashes.forEach((el) => {
      el.className = "al-splash";
    });
    const nodes = [droplet, ripple, ...splashes];
    nodes.forEach((el) => {
      el.setAttribute("aria-hidden", "true");
      el.style.left = `${impact[0]}px`;
      el.style.top = `${impact[1]}px`;
      hero.appendChild(el);
    });

    // Take over from the CSS safety timer and record the play so an
    // interrupted sequence does not replay later in this tab session.
    setSpread(1, true);
    root.classList.remove("al-entrance-pending");
    root.classList.add("al-entrance-playing");
    wordmark.style.clipPath = `url(#${CLIP_ID})`;
    session.started = true;
    try {
      window.sessionStorage.setItem(ENTRANCE_STORAGE_KEY, "done");
    } catch {
      // Session storage unavailable: the entrance may replay next load.
    }

    const span = ([from, to]) => ({ delay: from, duration: to - from, fill: "both" });
    const splashDx = fontSize * 0.09;
    const animations = [
      droplet.animate(
        dropletKeyframes(fallDistance),
        { duration: ENTRANCE.impact[1], fill: "both" },
      ),
      // Every particle's first keyframe is transparent: with `fill: both`
      // that is also what shows during its delay, so nothing appears early.
      ripple.animate(
        [
          { transform: "translate(-50%, -50%) rotate(-5deg) scale(0.15)", opacity: 0 },
          { transform: "translate(-50%, -50%) rotate(-5deg) scale(0.3)", opacity: 0.9, offset: 0.1 },
          { transform: "translate(-50%, -50%) rotate(-5deg) scale(1)", opacity: 0 },
        ],
        { ...span(ENTRANCE.ripple), easing: EASE_OUT },
      ),
      ...splashes.map((el, index) => {
        const dir = index === 0 ? -1 : 1;
        return el.animate(
          [
            { transform: "translate(-50%, -50%)", opacity: 0 },
            { transform: `translate(-50%, -50%) translate(${dir * splashDx * 0.6}px, ${-fontSize * 0.07}px)`, opacity: 1, offset: 0.3 },
            { transform: `translate(-50%, -50%) translate(${dir * splashDx}px, ${fontSize * 0.02}px)`, opacity: 0 },
          ],
          { ...span(ENTRANCE.splash), easing: EASE_OUT },
        );
      }),
    ];

    const [flowStart, flowEnd] = ENTRANCE.flow;
    const [spreadStart, spreadEnd] = ENTRANCE.carousel;
    // With the first-load intro running, everything is built and held until
    // the intro reaches its "name" beat; otherwise it starts straight away.
    const waitForIntro = root.classList.contains("al-intro") && freezeAt === null;
    let begun = !waitForIntro;
    let start = performance.now();
    let unsubscribe = () => {};
    let raf = 0;
    let done = false;
    let glowTimer = 0;
    const previousRadii = new Array(stamps.length).fill("0");

    const teardown = () => {
      unsubscribe();
      cancelAnimationFrame(raf);
      animations.forEach((animation) => animation.cancel());
      nodes.forEach((el) => el.remove());
      svg.remove();
      window.removeEventListener("resize", cleanup);
      window.removeEventListener("pagehide", cleanup);
      reducedQuery.removeEventListener("change", onReducedChange);
    };
    // Interrupted (unmount, resize, reduced motion turned on): show the name.
    const cleanup = () => {
      if (done) return;
      done = true;
      teardown();
      settle();
    };
    const complete = () => {
      if (done) return;
      done = true;
      teardown();
      session.started = false;
      settle();
      // The approved glow fades in over the finished lettering.
      root.classList.add("al-entrance-settled");
      glowTimer = window.setTimeout(() => root.classList.remove("al-entrance-settled"), 300);
    };
    const onReducedChange = (event) => {
      if (event.matches) cleanup();
    };
    const frameAt = (t) => {
      // Constant-speed travel with a soft brush tip. Each circle grows rather
      // than switching on at full radius; both branches finish together.
      const flowT = Math.max(0, Math.min(1, (t - flowStart) / (flowEnd - flowStart)));
      const radius = BRUSH_SWELL_RADIUS * fontSize;
      const dotGrowth = smoothStep((t - ENTRANCE.impact[0]) / (ENTRANCE.impact[1] - ENTRANCE.impact[0]));
      dotCircle.setAttribute("r", (dotR * fontSize * 1.15 * dotGrowth).toFixed(1));
      for (let i = 0; i < stamps.length; i += 1) {
        // A rounded leading cap grows fast enough to overlap its neighbour.
        // A slow radius ramp leaves detached pinprick dots along the stroke.
        const tip = Math.sqrt(Math.max(0, Math.min(1, (flowT - stamps[i].arrival) / .12)));
        const rText = (radius * tip).toFixed(1);
        if (rText !== previousRadii[i]) {
          circles[i].setAttribute("r", rText);
          previousRadii[i] = rText;
        }
      }
      // Fade the carousel into its existing drift after the lettering forms.
      const spreadT = Math.max(0, Math.min(1, (t - spreadStart) / (spreadEnd - spreadStart)));
      setSpread(1 - easeInOutCubic(spreadT));
    };

    const begin = () => {
      if (begun || done) return;
      begun = true;
      start = performance.now();
      animations.forEach((animation) => {
        animation.currentTime = 0;
        animation.play();
      });
    };

    let first = true;
    const tick = (now) => {
      if (done) return;
      if (!begun) {
        // Held for the intro. Reaching "done" first means it was skipped.
        if (atLeast(getPhase(), "done")) {
          cleanup();
          return;
        }
        raf = requestAnimationFrame(tick);
        return;
      }
      const t = freezeAt ?? now - start;
      // The carousel subscribes in its own effect; force the first redraw so
      // objects never paint at their settled positions before being pushed.
      if (first) {
        first = false;
        setSpread(1, true);
      }
      frameAt(t);
      if (t >= MOTION.entrance && freezeAt === null) {
        complete();
        return;
      }
      if (freezeAt === null) raf = requestAnimationFrame(tick);
    };

    if (freezeAt !== null) {
      animations.forEach((animation) => {
        animation.pause();
        animation.currentTime = freezeAt;
      });
    } else if (waitForIntro) {
      animations.forEach((animation) => animation.pause());
      if (atLeast(getPhase(), "name")) begin();
      // A skip jumps the phase straight to "done" before the name has
      // finished: show the settled name at once. (After a natural finish the
      // entrance has already torn itself down and this is a no-op.)
      unsubscribe = subscribePhase((phase) => {
        if (phase === "done") {
          if (!done) cleanup();
          return;
        }
        if (atLeast(phase, "name")) begin();
      });
    }
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", cleanup);
    window.addEventListener("pagehide", cleanup);
    reducedQuery.addEventListener("change", onReducedChange);

    return () => {
      if (!done) cleanup();
      clearTimeout(glowTimer);
      root.classList.remove("al-entrance-settled");
      // React's development double-mount re-runs this effect synchronously,
      // so it still sees `session.started`; a real unmount clears it.
      window.setTimeout(() => {
        session.started = false;
      }, 0);
    };
  }, [reviewEnabled, fontReady]);

  return <span ref={anchorRef} hidden />;
}
