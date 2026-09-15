"use client";

import { useEffect } from "react";
import { depthOffset, heroScrollState } from "@/lib/motion";

/**
 * Scroll-linked movement on the homepage (reversible, no entrances here):
 *  - leaving the hero, the carousel drifts upward and fades near the edge;
 *  - imagery inside the selected-work cards sits a little deeper than its
 *    frame, counter-moving by a few pixels as the card crosses the viewport.
 * Everything is written as CSS custom properties from one rAF-throttled
 * scroll listener; reduced motion leaves all of it at rest.
 */
export function ScrollStory() {
  useEffect(() => {
    const hero = document.querySelector(".al-hero");
    const orbit = hero?.querySelector(".al-orbit");
    const depthTargets = Array.from(document.querySelectorAll("[data-depth]"));
    if (!hero || !orbit) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;

    const rest = () => {
      orbit.style.removeProperty("--hero-shift");
      orbit.style.removeProperty("--hero-fade");
      depthTargets.forEach((el) => el.style.removeProperty("--depth"));
    };

    const update = () => {
      raf = 0;
      if (reduced.matches) {
        rest();
        return;
      }
      const compact = window.innerWidth <= 700;
      const { shift, fade } = heroScrollState({ scrollY: window.scrollY, heroHeight: hero.offsetHeight, compact });
      orbit.style.setProperty("--hero-shift", `${shift.toFixed(1)}px`);
      orbit.style.setProperty("--hero-fade", fade.toFixed(3));

      const viewport = window.innerHeight;
      const amplitude = compact ? 3 : 6;
      depthTargets.forEach((el) => {
        const card = el.closest(".al-project-card") ?? el;
        const rect = card.getBoundingClientRect();
        const centre = rect.top + rect.height / 2;
        const progress = 1 - centre / viewport;
        el.style.setProperty("--depth", `${depthOffset(progress, amplitude).toFixed(2)}px`);
      });
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reduced.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reduced.removeEventListener("change", schedule);
      rest();
    };
  }, []);

  return null;
}
