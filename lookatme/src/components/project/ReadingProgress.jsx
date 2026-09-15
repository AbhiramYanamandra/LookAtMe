"use client";

import { useEffect, useRef } from "react";
import { readingProgress } from "@/lib/motion";

/**
 * A 2px blue line showing progress through the case-study article only
 * (navigation, related projects, and footer are excluded). Hidden on short
 * pages where the whole article fits within about 1.5 viewports.
 */
export function ReadingProgress({ articleId }) {
  const barRef = useRef(null);

  useEffect(() => {
    const bar = barRef.current;
    const article = document.getElementById(articleId);
    if (!bar || !article) return undefined;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = article.getBoundingClientRect();
      const articleTop = rect.top + window.scrollY;
      const long = rect.height > window.innerHeight * 1.5;
      bar.classList.toggle("is-visible", long && window.scrollY > 40);
      const progress = readingProgress({
        scrollY: window.scrollY,
        viewportHeight: window.innerHeight,
        articleTop,
        articleHeight: rect.height,
      });
      bar.style.transform = `scaleX(${progress})`;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [articleId]);

  return <div ref={barRef} className="cs-progress" aria-hidden="true" />;
}
