"use client";

import { useEffect, useRef, useState } from "react";
import { EASE_OUT } from "@/lib/motion";
import Link from "next/link";
import { ALL_FIELDS, libraryHref } from "@/lib/project-queries";

/**
 * Field filter chips. Server-rendered links (they work without JavaScript);
 * with JavaScript the pressed chip fills immediately while the new results
 * load, and scroll position is kept. The selection ink travels from the
 * old chip to the new one, so a filter change reads as the selection
 * moving rather than one chip switching off and another switching on.
 */
export function FilterChips({ fields, total, field, sort, view }) {
  const [pending, setPending] = useState(null);
  const navRef = useRef(null);
  const inkRef = useRef(null);
  useEffect(() => setPending(null), [field, sort]);
  useEffect(() => () => inkRef.current?.cancel(), []);

  const travel = (event) => {
    // A modified click opens a new tab; the selection here doesn't move.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const nav = navRef.current;
    const to = event.currentTarget;
    const start = nav?.querySelector('a[aria-current="true"]');
    if (!nav || !start || start === to || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = nav.getBoundingClientRect();
    const a = start.getBoundingClientRect();
    const b = to.getBoundingClientRect();
    const frame = (r) => ({
      transform: `translate(${r.left - box.left}px, ${r.top - box.top}px)`,
      width: `${r.width}px`,
      height: `${r.height}px`,
    });
    inkRef.current?.cancel();
    let ink = nav.querySelector(".pl-filter-ink");
    if (!ink) {
      ink = document.createElement("span");
      ink.className = "pl-filter-ink";
      ink.setAttribute("aria-hidden", "true");
      nav.appendChild(ink);
    }
    nav.classList.add("is-inking");
    // Out fast, settle soft; a long hop across a wrapped row takes a little longer.
    const distance = Math.hypot(b.left - a.left, b.top - a.top);
    const animation = ink.animate(
      [{ ...frame(a), opacity: 1 }, { ...frame(b), opacity: 1, offset: 0.82 }, { ...frame(b), opacity: 0 }],
      { duration: Math.min(420, 240 + distance * 0.18), easing: EASE_OUT, fill: "forwards" },
    );
    inkRef.current = animation;
    const done = () => {
      nav.classList.remove("is-inking");
      ink.remove();
    };
    // The chip takes the fill back just before the ink fades over it.
    const handoff = window.setTimeout(() => nav.classList.remove("is-inking"), animation.effect.getTiming().duration * 0.8);
    animation.onfinish = done;
    animation.oncancel = () => {
      window.clearTimeout(handoff);
      done();
    };
  };

  const chip = (id, label, count) => {
    const active = pending ? pending === id : field === id;
    return (
      <Link
        key={id}
        href={id === ALL_FIELDS ? libraryHref({ sort, view }) : libraryHref({ field: id, sort, view })}
        scroll={false}
        aria-current={active ? "true" : undefined}
        className={pending === id && field !== id ? "is-pending" : undefined}
        onClick={(event) => {
          travel(event);
          setPending(id);
        }}
      >
        {label} <span className="pl-count">{count}</span>
      </Link>
    );
  };

  return (
    <nav ref={navRef} className="pl-filters" aria-label="Filter by engineering field">
      {chip(ALL_FIELDS, "All", total)}
      {fields.map((item) => chip(item.id, item.label, item.count))}
    </nav>
  );
}
