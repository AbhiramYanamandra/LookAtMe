"use client";

import { useEffect, useRef } from "react";
import { WORDMARK, toPixels, wordmarkFrame } from "@/lib/wordmark";

/**
 * Current through the signature.
 *
 * A pulse of light travels the authored pen path (src/lib/wordmark.js) in the
 * order the hand actually wrote the name — the same skeleton the droplet
 * entrance paints along. On a page that argues "from circuits to interfaces",
 * the mark is handwriting and a conductor at once.
 *
 * It is a heartbeat, not an animation: a pulse every PERIOD, plus one when a
 * pointer arrives (rate-limited). Between pulses nothing runs at all — the
 * rAF loop exists only for the ~1.1s a pulse is travelling.
 *
 * The lettering itself is untouched real <h1> text. This only adds light on
 * top of it, so a failed canvas, reduced motion, or an offscreen hero all
 * leave the settled wordmark exactly as it is.
 */

const PERIOD = 7000; // ms between resting pulses
const DURATION = 1150; // ms for one traverse, A → m
const POINTER_COOLDOWN = 3200;
// Below the tablet breakpoint the wordmark is ~78px and the carousel object
// covers its middle, so the pulse is spent entirely behind an opaque artefact.
// Not worth a phone's battery for something nobody can see.
const MIN_WIDTH = 900;
// A short tail reads as a spark traveling a conductor; a long one reads as a
// gradient sweep, which is the thing this must not look like.
const TAIL = 0.1;
// The bloom is forgiving, but the white-hot core has to stay crisp against
// solid blue lettering, so this sits well above a pure-glow resolution.
const RENDER_SCALE = 0.85;

/** Writing-order samples at even spacing, with cumulative arc length. */
function buildSamples() {
  const spacing = 0.012; // em
  const samples = [];
  let s = 0;
  let prev = null;
  for (const stroke of WORDMARK.strokes) {
    for (let i = 0; i < stroke.length; i += 1) {
      const p = stroke[i];
      // First point of a stroke is a pen lift: no segment drawn into it, and
      // the gap costs no arc length (this script face joins its letters).
      if (prev === null || i === 0) {
        samples.push({ p, s, lift: true });
        prev = p;
        continue;
      }
      const len = Math.hypot(p[0] - prev[0], p[1] - prev[1]);
      if (len === 0) {
        prev = p;
        continue;
      }
      const n = Math.max(1, Math.ceil(len / spacing));
      for (let k = 1; k <= n; k += 1) {
        const t = k / n;
        samples.push({
          p: [prev[0] + (p[0] - prev[0]) * t, prev[1] + (p[1] - prev[1]) * t],
          s: s + len * t,
          lift: false,
        });
      }
      s += len;
      prev = p;
    }
  }
  return { samples, total: s };
}

const mix = (a, b, t) => a + (b - a) * t;

export function WordmarkTrace({ reviewEnabled = false }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const hero = canvas?.closest(".al-hero");
    const wordmark = hero?.querySelector(".al-wordmark");
    if (!canvas || !hero || !wordmark) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const { samples, total } = buildSamples();

    let points = []; // sample index -> [x, y] in hero CSS px
    let fontSize = 0;
    let raf = 0;
    let timer = 0;
    let startedAt = 0;
    let lastPulse = 0;
    let visible = true;
    let measured = false;

    // --- Geometry: the wordmark's own unrotated box, then hero space.
    const measure = () => {
      const w = hero.clientWidth;
      const h = hero.clientHeight;
      if (!w || !h) return false;
      fontSize = Number.parseFloat(getComputedStyle(wordmark).fontSize);
      if (!fontSize) return false;

      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.width = Math.round(w * RENDER_SCALE);
      canvas.height = Math.round(h * RENDER_SCALE);

      const frame = wordmarkFrame({
        width: wordmark.offsetWidth,
        height: wordmark.offsetHeight,
        fontSize,
      });
      const heroRect = hero.getBoundingClientRect();
      const wordRect = wordmark.getBoundingClientRect();
      const cx = wordRect.left - heroRect.left + wordRect.width / 2;
      const cy = wordRect.top - heroRect.top + wordRect.height / 2;
      const angle = (-5 * Math.PI) / 180;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const halfW = wordmark.offsetWidth / 2;
      const halfH = wordmark.offsetHeight / 2;

      points = samples.map((sample) => {
        const [px, py] = toPixels(frame, sample.p);
        const dx = px - halfW;
        const dy = py - halfH;
        return [cx + dx * cos - dy * sin, cy + dx * sin + dy * cos];
      });
      measured = true;
      return true;
    };

    // --- One frame of the comet.
    const draw = (progress) => {
      ctx.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
      ctx.clearRect(0, 0, hero.clientWidth, hero.clientHeight);
      if (progress <= 0 || progress >= 1) return;

      const head = total * progress;
      const tail = total * TAIL;
      const back = head - tail;
      // Fade the whole pulse in and out so it never pops at either end,
      // while the head keeps a constant speed — current, not easing.
      const envelope = Math.min(1, progress / 0.08) * Math.min(1, (1 - progress) / 0.16);

      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // The head bloom goes down FIRST so the white filament draws on top of
      // it. Drawn after, it swallows the core and the spark becomes a cloud.
      let headIndex = -1;
      for (let i = samples.length - 1; i >= 0; i -= 1) {
        if (samples[i].s <= head) {
          headIndex = i;
          break;
        }
      }
      if (headIndex >= 0) {
        const [hx, hy] = points[headIndex];
        const radius = 0.15 * fontSize;
        const glow = ctx.createRadialGradient(hx, hy, 0, hx, hy, radius);
        glow.addColorStop(0, `rgba(226,239,255,${(0.6 * envelope).toFixed(3)})`);
        glow.addColorStop(0.3, `rgba(130,184,255,${(0.28 * envelope).toFixed(3)})`);
        glow.addColorStop(1, "rgba(22,133,255,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(hx, hy, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Three passes: atmosphere, the conducting blue, then a white-hot core.
      // The letters are already solid #1685ff, so only something close to
      // white reads as current inside the stroke rather than more blue on blue.
      const passes = [
        { width: 0.24 * fontSize, alpha: 0.1, exp: 2, from: [0x16, 0x85, 0xff], to: [0x5a, 0xa6, 0xff] },
        { width: 0.085 * fontSize, alpha: 0.42, exp: 2.4, from: [0x4c, 0x9d, 0xff], to: [0xbe, 0xdc, 0xff] },
        { width: 0.036 * fontSize, alpha: 1, exp: 2.6, from: [0xdc, 0xeb, 0xff], to: [0xff, 0xff, 0xff] },
      ];

      for (const pass of passes) {
        ctx.lineWidth = pass.width;
        for (let i = 1; i < samples.length; i += 1) {
          const sample = samples[i];
          if (sample.lift || sample.s < back || sample.s > head) continue;
          const t = (sample.s - back) / tail; // 0 at the tail, 1 at the head
          const shaped = Math.pow(t, pass.exp);
          const a = pass.alpha * shaped * envelope;
          if (a < 0.004) continue;
          const r = Math.round(mix(pass.from[0], pass.to[0], t));
          const g = Math.round(mix(pass.from[1], pass.to[1], t));
          const b = Math.round(mix(pass.from[2], pass.to[2], t));
          ctx.strokeStyle = `rgba(${r},${g},${b},${a.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(points[i - 1][0], points[i - 1][1]);
          ctx.lineTo(points[i][0], points[i][1]);
          ctx.stroke();
        }
      }

      ctx.globalCompositeOperation = "source-over";
    };

    const tick = (now) => {
      const progress = (now - startedAt) / DURATION;
      if (progress >= 1) {
        raf = 0;
        draw(1); // clears
        schedule(PERIOD);
        return;
      }
      draw(progress);
      raf = window.requestAnimationFrame(tick);
    };

    const blocked = () =>
      reduced.matches ||
      !visible ||
      document.hidden ||
      hero.clientWidth < MIN_WIDTH ||
      document.documentElement.classList.contains("al-entrance-pending") ||
      document.documentElement.classList.contains("al-entrance-playing");

    const pulse = () => {
      if (raf || blocked()) {
        schedule(PERIOD);
        return;
      }
      if (!measured && !measure()) {
        schedule(PERIOD);
        return;
      }
      lastPulse = performance.now();
      startedAt = lastPulse;
      raf = window.requestAnimationFrame(tick);
    };

    function schedule(delay) {
      window.clearTimeout(timer);
      timer = window.setTimeout(pulse, delay);
    }

    const stop = () => {
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
      window.clearTimeout(timer);
      timer = 0;
      ctx.setTransform(RENDER_SCALE, 0, 0, RENDER_SCALE, 0, 0);
      ctx.clearRect(0, 0, hero.clientWidth, hero.clientHeight);
    };

    const onPointerEnter = () => {
      if (blocked() || raf) return;
      if (performance.now() - lastPulse < POINTER_COOLDOWN) return;
      pulse();
    };

    // Nothing runs while the hero is off screen or the tab is hidden.
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) schedule(600);
        else stop();
      },
      { threshold: 0 },
    );
    observer.observe(hero);

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (visible) schedule(600);
    };

    let resizeTimer = 0;
    const onResize = () => {
      measured = false;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (!blocked()) measure();
      }, 180);
    };

    const onReducedChange = () => {
      if (reduced.matches) stop();
      else if (visible) schedule(600);
    };

    // Review aid (development only, like ?entrance= and ?still=): freeze the
    // pulse at a given progress so a screenshot can land on an exact frame.
    let freezeAt = null;
    if (reviewEnabled) {
      const value = new URLSearchParams(window.location.search).get("trace");
      if (value !== null) {
        const n = Number.parseFloat(value);
        if (Number.isFinite(n)) freezeAt = Math.min(0.999, Math.max(0.001, n));
      }
    }

    // Measuring against a fallback font would put the current beside the
    // strokes instead of inside them.
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      measure();
      if (freezeAt !== null) {
        draw(freezeAt);
        return;
      }
      if (!reduced.matches) schedule(1600);
    });

    if (freezeAt !== null) {
      return () => {
        cancelled = true;
      };
    }

    hero.addEventListener("pointerenter", onPointerEnter);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onResize);
    reduced.addEventListener("change", onReducedChange);

    return () => {
      cancelled = true;
      stop();
      window.clearTimeout(resizeTimer);
      observer.disconnect();
      hero.removeEventListener("pointerenter", onPointerEnter);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      reduced.removeEventListener("change", onReducedChange);
    };
  }, []);

  return <canvas ref={ref} className="al-wordmark-trace" aria-hidden="true" />;
}
