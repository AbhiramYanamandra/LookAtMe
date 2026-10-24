"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The phone layout of Selected work: the project cards in one row, a full
 * card per screen, that swipes sideways one card at a time. Swiping is never
 * the only way through: each dot jumps to its card, and each card's link
 * takes keyboard focus in order.
 *
 * `children` are the server-built card list items; `titles` name them for
 * the dots.
 */
export function StoryCardRow({ titles, children }) {
  const track = useRef(null);
  const [active, setActive] = useState(0);
  const last = titles.length - 1;

  // The card nearest the start of the row is the current one.
  useEffect(() => {
    const el = track.current;
    let raf = 0;
    const update = () => {
      raf = 0;
      const first = el.children[0];
      if (!first) return;
      const step = first.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || "0");
      setActive(Math.max(0, Math.min(last, Math.round(el.scrollLeft / step))));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [last]);

  const goTo = (index) => {
    const el = track.current;
    const card = el.children[Math.max(0, Math.min(last, index))];
    if (!card) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: card.offsetLeft - el.offsetLeft - parseFloat(getComputedStyle(el).scrollPaddingLeft || "0"), behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className="al-card-row" role="region" aria-roledescription="carousel" aria-label="Selected work">
      <ol ref={track} className="al-card-row-track">
        {children}
      </ol>
      <div className="al-card-row-dots">
        {titles.map((title, index) => (
          <button
            key={title}
            type="button"
            aria-label={`Project ${index + 1} of ${titles.length}: ${title}`}
            aria-current={index === active ? "true" : undefined}
            onClick={() => goTo(index)}
          />
        ))}
      </div>
    </div>
  );
}
