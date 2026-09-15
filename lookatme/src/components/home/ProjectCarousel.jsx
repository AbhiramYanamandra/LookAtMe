"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getSpread, subscribeSpread } from "@/lib/hero-entrance-state";

/**
 * Diagonal moving project carousel — a port of the approved
 * design/approved-landing-page/reference-motion.js into React.
 *
 * Objects stream from the upper-left to the lower-right over the wordmark,
 * recycle beyond the clipped stage, and can be dragged horizontally or
 * stepped with the controls. Motion parameters are the approved defaults.
 */
export const INITIAL_PHASE = 0.27;
export const SPEED = 0.8;
export const SIZE = 1;
const TURNS = [-17, 12, -11, 19, -9];
const MAX_DELTA_MS = 50;
const PHASE_PER_MS = 0.000014;
const DRAG_THRESHOLD_PX = 6;
const DRAG_PHASE_PER_STAGE_WIDTH = 0.55;

function positiveModulo(value, modulus) {
  return ((value % modulus) + modulus) % modulus;
}

/** Position of object `index` of `count` at the given phase, in stage fractions. */
export function placeObject(index, count, phase, shift = 0) {
  const cycle = positiveModulo(index / count + phase, 1);
  const p = -0.5 + cycle * 2 + shift;
  return {
    p,
    xFraction: 0.16 + 0.69 * p,
    sway: Math.sin(p * Math.PI),
    yFraction: -0.1 + 1.13 * p,
    angle: TURNS[index % TURNS.length] + Math.sin(p * 2.5) * 5,
  };
}

export function stageScale(stageWidth) {
  return Math.min(1.12, Math.max(0.53, stageWidth / 1024)) * SIZE;
}

/** Server-renderable arrangement: percentages of the stage, CSS-var scale. */
function initialStyle(index, count, phase) {
  const { xFraction, sway, yFraction, angle } = placeObject(index, count, phase);
  return {
    left: `calc(${(xFraction * 100).toFixed(3)}% + ${sway.toFixed(4)} * var(--al-sway))`,
    top: `${(yFraction * 100).toFixed(3)}%`,
    transform: `translate(-50%, -50%) rotate(${angle.toFixed(2)}deg) scale(var(--al-object-scale))`,
    zIndex: 3 + index,
  };
}

function readReviewState() {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  if (!params.has("still") && !params.has("phase")) return null;
  const phase = Number.parseFloat(params.get("phase") ?? "");
  return {
    still: params.get("still") === "1",
    phase: Number.isFinite(phase) ? phase : INITIAL_PHASE,
  };
}

export function ProjectCarousel({ items, bottomLeft, bottomCenter, reviewEnabled = false }) {
  const stageRef = useRef(null);
  const objectRefs = useRef([]);
  const state = useRef({
    width: 1024,
    height: 720,
    phase: INITIAL_PHASE,
    last: 0,
    hovered: false,
    focused: false,
    visible: true,
    drag: null,
    moved: false,
    playing: true,
    raf: 0,
  });
  const [playing, setPlayingState] = useState(true);
  const [dragging, setDragging] = useState(false);
  const count = items.length;
  const draw = useCallback(() => {
    const { width, height, phase } = state.current;
    const small = width < 500;
    const scale = stageScale(width);
    const spread = getSpread();
    // The lettering gets a clear moment, then objects fade into their normal
    // drift. No second positional animation accelerates them across the name.
    stageRef.current?.style.setProperty("--al-carousel-visibility", String(1 - spread));
    objectRefs.current.forEach((el, index) => {
      if (!el) return;
      const { xFraction, sway, yFraction, angle } = placeObject(index, count, phase);
      const x = width * xFraction + (small ? 0 : sway * 19);
      const y = height * yFraction;
      el.style.left = "0px";
      el.style.top = "0px";
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${angle}deg) scale(${scale})`;
      el.style.zIndex = String(3 + index);
    });
  }, [count]);

  // Redraw whenever the entrance changes the spread.
  useEffect(() => subscribeSpread(() => draw()), [draw]);

  const setPlaying = useCallback((value) => {
    state.current.playing = value;
    setPlayingState(value);
  }, []);

  // Measure the stage before first paint so the hydrated frame matches the
  // exact JS placement rather than the pre-hydration approximation.
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const rect = stage.getBoundingClientRect();
    state.current.width = rect.width;
    state.current.height = rect.height;

    if (reviewEnabled) {
      const review = readReviewState();
      if (review) {
        state.current.phase = review.phase;
        if (review.still) setPlaying(false);
      }
    }
    draw();

    const resize = new ResizeObserver((entries) => {
      const entry = entries[0];
      state.current.width = entry.contentRect.width;
      state.current.height = entry.contentRect.height;
      draw();
    });
    resize.observe(stage);
    return () => resize.disconnect();
  }, [draw, reviewEnabled, setPlaying]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const current = state.current;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) setPlaying(false);
    const onReducedChange = (event) => {
      if (event.matches) setPlaying(false);
    };
    reduced.addEventListener("change", onReducedChange);

    const intersection = new IntersectionObserver((entries) => {
      current.visible = entries[0].isIntersecting;
    });
    intersection.observe(stage);

    const tick = (time) => {
      const dt = current.last ? Math.min(time - current.last, MAX_DELTA_MS) : 0;
      current.last = time;
      if (
        current.playing &&
        !current.hovered &&
        !current.focused &&
        !current.drag &&
        current.visible &&
        !document.hidden
      ) {
        current.phase += dt * PHASE_PER_MS * SPEED;
        draw();
      }
      current.raf = requestAnimationFrame(tick);
    };
    current.raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(current.raf);
      intersection.disconnect();
      reduced.removeEventListener("change", onReducedChange);
    };
  }, [draw, setPlaying]);

  const step = (direction) => {
    setPlaying(false);
    state.current.phase += direction / count;
    draw();
  };

  const onPointerDown = (event) => {
    if (event.button !== 0) return;
    state.current.drag = { x: event.clientX, phase: state.current.phase };
    state.current.moved = false;
  };

  const onPointerMove = (event) => {
    const { drag, width } = state.current;
    if (!drag) return;
    const dx = event.clientX - drag.x;
    if (Math.abs(dx) > DRAG_THRESHOLD_PX) {
      state.current.moved = true;
      setDragging(true);
      state.current.phase = drag.phase + (dx / width) * DRAG_PHASE_PER_STAGE_WIDTH;
      draw();
    }
  };

  const release = () => {
    state.current.drag = null;
    setDragging(false);
  };

  const onObjectClick = (event) => {
    // A drag that ends on an object must not open it.
    if (state.current.moved) {
      event.preventDefault();
      state.current.moved = false;
    }
  };

  const onObjectFocus = (index) => (event) => {
    state.current.focused = true;
    // Keyboard focus brings a clipped object into view; pointer focus must
    // not move the target away from the click.
    if (event.currentTarget.matches(":focus-visible")) {
      state.current.phase = 0.525 - index / count;
      draw();
    }
  };

  return (
    <>
      <div
        ref={stageRef}
        className={`al-orbit${dragging ? " is-dragging" : ""}`}
        role="group"
        aria-roledescription="carousel"
        aria-label="Moving project carousel. Drag horizontally or use the controls."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={release}
        onPointerCancel={release}
        onPointerLeave={release}
      >
        {items.map((item, index) => (
          <Link
            key={item.slug}
            href={item.href}
            ref={(el) => {
              objectRefs.current[index] = el;
            }}
            className={`al-object ${item.className}`}
            style={initialStyle(index, count, INITIAL_PHASE)}
            aria-label={`Explore ${item.title}`}
            draggable={false}
            onDragStart={(event) => event.preventDefault()}
            onClick={onObjectClick}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") state.current.hovered = true;
            }}
            onPointerLeave={() => {
              state.current.hovered = false;
            }}
            onFocus={onObjectFocus(index)}
            onBlur={() => {
              state.current.focused = false;
            }}
          >
            {item.node}
            <span className="al-object-caption" aria-hidden="true">
              {String(index + 1).padStart(2, "0")} / {item.title} ↗
            </span>
          </Link>
        ))}
      </div>
      <div className="al-hero-bottom">
        {bottomLeft}
        {bottomCenter}
        <div className="al-motion-controls" role="group" aria-label="Carousel controls">
          <button type="button" className="al-control" aria-label="Previous project" onClick={() => step(-1)}>
            <ArrowLeft aria-hidden="true" />
          </button>
          <button
            type="button"
            className="al-control al-pause"
            aria-label={playing ? "Pause carousel" : "Play carousel"}
            onClick={() => setPlaying(!playing)}
          >
            <span className="al-pause-symbol" aria-hidden="true">
              {playing ? "Ⅱ" : "▷"}
            </span>
            <span className="al-pause-label">{playing ? "Pause" : "Play"}</span>
          </button>
          <button type="button" className="al-control" aria-label="Next project" onClick={() => step(1)}>
            <ArrowRight aria-hidden="true" />
          </button>
        </div>
      </div>
    </>
  );
}
