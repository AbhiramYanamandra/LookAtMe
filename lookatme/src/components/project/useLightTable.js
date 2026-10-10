"use client";

import { useEffect } from "react";

/**
 * The library grid as a drafting light table. One lamp position (`--lx`,
 * `--ly`, grid-relative) is written to the grid; every card's drawing masks
 * itself around it using its own offset (`--ox`, `--oy`), so a single
 * pointer move updates one element and the cascade does the rest.
 *
 * Fine pointers drive the lamp directly. Touch screens get a lamp that
 * rides the reading line as the page scrolls — unless reduced motion is
 * set, where it stays off. Nothing runs while nothing moves: one rAF per
 * input, released immediately.
 */
export function useLightTable(gridRef, layoutKey) {
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return undefined;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let lamp = null;

    const measure = () => {
      const box = grid.getBoundingClientRect();
      grid.querySelectorAll(".pl-card-visual").forEach((visual) => {
        const rect = visual.getBoundingClientRect();
        visual.style.setProperty("--ox", `${(rect.left - box.left).toFixed(1)}px`);
        visual.style.setProperty("--oy", `${(rect.top - box.top).toFixed(1)}px`);
      });
    };
    const paint = () => {
      frame = 0;
      if (!lamp) return;
      grid.style.setProperty("--lx", `${lamp.x.toFixed(1)}px`);
      grid.style.setProperty("--ly", `${lamp.y.toFixed(1)}px`);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const onEnter = (event) => {
      if (event.pointerType !== "mouse") return;
      measure();
      grid.classList.add("is-lit");
    };
    const onMove = (event) => {
      if (event.pointerType !== "mouse") return;
      const box = grid.getBoundingClientRect();
      lamp = { x: event.clientX - box.left, y: event.clientY - box.top };
      if (!grid.classList.contains("is-lit")) onEnter(event);
      schedule();
    };
    const onLeave = () => grid.classList.remove("is-lit");

    // Touch: the lamp sits on the reading line and the work passes under it.
    const onScroll = () => {
      if (fine.matches || reduced.matches) return;
      const box = grid.getBoundingClientRect();
      const y = window.innerHeight * 0.42;
      const inside = box.top < y && box.bottom > y;
      grid.classList.toggle("is-lit", inside);
      if (!inside) return;
      measure();
      lamp = { x: window.innerWidth / 2 - box.left, y: y - box.top };
      schedule();
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(grid);
    grid.addEventListener("pointerenter", onEnter);
    grid.addEventListener("pointermove", onMove);
    grid.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    // Cards travel when the filter changes; re-measure once they've landed.
    const settle = window.setTimeout(measure, 320);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      observer.disconnect();
      grid.removeEventListener("pointerenter", onEnter);
      grid.removeEventListener("pointermove", onMove);
      grid.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, [gridRef, layoutKey]);
}
