"use client";

import { useEffect, useRef } from "react";

/**
 * The hero's light source.
 *
 * Instrument Blue is the one colour in the system that behaves like light
 * rather than paint: the wordmark is lit, not filled. This gives that light
 * a position. A soft blue wash follows the pointer across the hero, so the
 * signature brightens where the visitor is actually looking — the droplet
 * writes the name, and this reveals it.
 *
 * Pointer-driven, never a loop. Fine pointers only, and silent for
 * reduced-motion visitors and while the entrance is still playing.
 */
export function HeroLight() {
  const ref = useRef(null);

  useEffect(() => {
    const light = ref.current;
    const hero = light?.parentElement;
    if (!hero) return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let frame = 0;
    let x = 0;
    let y = 0;

    // One write per frame: pointermove can fire far more often than paint.
    const paint = () => {
      frame = 0;
      light.style.setProperty("--hero-lx", `${x}px`);
      light.style.setProperty("--hero-ly", `${y}px`);
    };

    const onMove = (event) => {
      const rect = hero.getBoundingClientRect();
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
      if (!frame) frame = window.requestAnimationFrame(paint);
      // Only on the transition into "lit": re-setting the attribute on every
      // pointermove would invalidate style on a surface that is also dragged.
      if (hero.dataset.lit === undefined) hero.dataset.lit = "";
    };

    const onLeave = () => {
      delete hero.dataset.lit;
    };

    const attach = () => {
      hero.addEventListener("pointermove", onMove);
      hero.addEventListener("pointerleave", onLeave);
    };

    const detach = () => {
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      delete hero.dataset.lit;
    };

    // Re-evaluated live, like the rest of the site's motion: turning on
    // reduced motion with the page open puts the light out immediately.
    const sync = () => {
      detach();
      if (fine.matches && !reduced.matches) attach();
    };

    sync();
    fine.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    return () => {
      detach();
      fine.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
    };
  }, []);

  return <span ref={ref} className="al-hero-light" aria-hidden="true" />;
}
