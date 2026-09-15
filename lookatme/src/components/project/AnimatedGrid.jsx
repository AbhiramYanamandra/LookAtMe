"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { EASE_OUT, MOTION } from "@/lib/motion";
import { ProjectCard } from "./ProjectCard";

/**
 * Library grid with animated filtering and sorting.
 *
 * The server decides which projects are shown (URL → `projects`); this
 * component animates the difference. It renders from its own `displayed`
 * list so that departing cards stay in the DOM while they fade out in place
 * (absolutely positioned, inert), retained cards travel to their new slots
 * (FLIP, 240ms), arriving cards fade in, and the grid's height eases from
 * the old layout to the new one so the page never jumps.
 *
 * Positions are measured with getBoundingClientRect *before* running
 * animations are cancelled, so a change made mid-animation retargets from
 * where cards actually are. Reduced motion skips all of it.
 */
export function AnimatedGrid({ projects, children }) {
  const gridRef = useRef(null);
  const [displayed, setDisplayed] = useState(() => projects.map((project) => ({ project, leaving: false })));
  const pendingChange = useRef(null);
  const running = useRef([]);
  const leaveTimer = useRef(0);
  const firstRender = useRef(true);
  const reveal = firstRender.current;

  // 1. New results: measure the current visual positions, then re-render.
  useLayoutEffect(() => {
    firstRender.current = false;
    const grid = gridRef.current;
    if (!grid) return;
    const current = new Set(displayed.filter((item) => !item.leaving).map((item) => item.project.slug));
    const next = new Set(projects.map((project) => project.slug));
    const same = current.size === next.size && [...next].every((slug) => current.has(slug)) &&
      displayed.filter((item) => !item.leaving).every((item, index) => projects[index]?.slug === item.project.slug);
    if (same) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gridRect = grid.getBoundingClientRect();
    const before = new Map();
    grid.querySelectorAll(":scope > [data-slug]").forEach((el) => {
      const rect = el.getBoundingClientRect();
      before.set(el.dataset.slug, { left: rect.left - gridRect.left, top: rect.top - gridRect.top, width: rect.width, height: rect.height, opacity: Number(getComputedStyle(el).opacity) });
    });
    running.current.forEach((animation) => animation.cancel());
    running.current = [];
    window.clearTimeout(leaveTimer.current);

    const leaving = reduced
      ? []
      : displayed
          .filter((item) => !next.has(item.project.slug) && before.has(item.project.slug))
          .map((item) => ({ project: item.project, leaving: true, rect: before.get(item.project.slug) }));

    pendingChange.current = { before, gridHeight: gridRect.height, reduced };
    setDisplayed([...projects.map((project) => ({ project, leaving: false })), ...leaving]);
  }, [projects]); // eslint-disable-line react-hooks/exhaustive-deps

  // 2. After the DOM reflects the new list: FLIP from measured positions.
  useLayoutEffect(() => {
    const change = pendingChange.current;
    const grid = gridRef.current;
    if (!change || !grid) return;
    pendingChange.current = null;
    if (change.reduced) return;

    const { before, gridHeight } = change;
    const cells = grid.querySelectorAll(":scope > [data-slug]");
    const gridRect = grid.getBoundingClientRect();
    const live = [];
    const leaving = [];
    cells.forEach((el) => (el.classList.contains("is-leaving") ? leaving : live).push(el));

    live.forEach((el) => {
      const was = before.get(el.dataset.slug);
      if (was) {
        const dx = was.left - (el.offsetLeft);
        const dy = was.top - (el.offsetTop);
        const frames = [{ transform: `translate(${dx}px, ${dy}px)`, opacity: was.opacity }, { transform: "translate(0, 0)", opacity: 1 }];
        running.current.push(el.animate(frames, { duration: MOTION.grid, easing: EASE_OUT }));
      } else {
        running.current.push(
          el.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "translateY(0)" }], {
            duration: MOTION.gridEnter,
            easing: EASE_OUT,
            delay: MOTION.gridLeave * 0.6,
            fill: "backwards",
          }),
        );
      }
    });
    leaving.forEach((el) => {
      const was = before.get(el.dataset.slug);
      running.current.push(el.animate([{ opacity: was?.opacity ?? 1 }, { opacity: 0 }], { duration: MOTION.gridLeave, easing: EASE_OUT, fill: "forwards" }));
    });

    // Ease the grid's height from the previous layout to the new one.
    const newHeight = gridRect.height;
    if (Math.abs(newHeight - gridHeight) > 1) {
      running.current.push(grid.animate([{ height: `${gridHeight}px` }, { height: `${newHeight}px` }], { duration: MOTION.grid, easing: EASE_OUT }));
    }

    if (leaving.length > 0) {
      leaveTimer.current = window.setTimeout(() => {
        setDisplayed((items) => items.filter((item) => !item.leaving));
      }, MOTION.gridLeave + 20);
    }
  }, [displayed]);

  useEffect(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
      const cancel = () => {
        running.current.forEach((animation) => animation.cancel());
        window.clearTimeout(leaveTimer.current);
      };
      const onChange = () => {
        if (!reduced.matches) return;
        cancel();
        setDisplayed((items) => items.filter((item) => !item.leaving));
      };
      reduced.addEventListener("change", onChange);
      return () => {
        cancel();
        reduced.removeEventListener("change", onChange);
      };
    },
    [],
  );

  const liveCount = displayed.filter((item) => !item.leaving).length;

  return (
    <div ref={gridRef} className="pl-grid">
      {displayed.map(({ project, leaving, rect }) => (
        <div
          key={project.slug}
          data-slug={project.slug}
          className={`pl-cell${leaving ? " is-leaving" : ""}`}
          data-reveal={reveal && !leaving ? "" : undefined}
          aria-hidden={leaving ? "true" : undefined}
          inert={leaving || undefined}
          style={leaving && rect ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height } : undefined}
        >
          <ProjectCard project={project} />
        </div>
      ))}
      {liveCount === 0 && children}
    </div>
  );
}
