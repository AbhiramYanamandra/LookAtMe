"use client";

import { useEffect, useRef, useState } from "react";
import { ROLE_TIMING, roleFrame } from "@/lib/role-typer";
import { subscribeSpread, getSpread } from "@/lib/hero-entrance-state";
import { whenPhase } from "@/lib/intro-state";

/**
 * The role line and the three project tiles that move with it.
 *
 * "hardware engineer", "software engineer", "ML engineer" are typed, held,
 * backspaced and looped (see src/lib/role-typer.js); while a role is on
 * screen its project tile steps forward. Under reduced motion nothing types
 * or moves: the line is the static sentence and the tiles sit at rest.
 *
 * `tiles` are server-rendered visuals handed in as nodes, so this client
 * component only owns the clock.
 */
export function HeroRoles({ roles, tiles, staticLabel }) {
  const phrases = roles.map((role) => role.label);
  const [frame, setFrame] = useState({ index: 0, text: phrases[0], phase: "hold" });
  const [animate, setAnimate] = useState(false);
  const tilesRef = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setAnimate(!reduced.matches);
    sync();
    reduced.addEventListener("change", sync);
    return () => reduced.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!animate) return undefined;
    let start = 0;
    let raf = 0;
    const tick = (now) => {
      const next = roleFrame(now - start, phrases, ROLE_TIMING);
      setFrame((previous) => (previous.text === next.text && previous.index === next.index ? previous : next));
      raf = requestAnimationFrame(tick);
    };
    // During the first-load intro the line stays empty until its beat.
    const intro = document.documentElement.classList.contains("al-intro");
    if (intro) setFrame({ index: 0, text: "", phase: "typing" });
    const stop = whenPhase("role", () => {
      start = performance.now();
      raf = requestAnimationFrame(tick);
    });
    return () => {
      stop();
      cancelAnimationFrame(raf);
    };
    // phrases is derived from props and stable for the page's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate]);

  // Tiles arrive with the name: the entrance's spread value hides them first.
  useEffect(() => {
    const el = tilesRef.current;
    if (!el) return undefined;
    const draw = () => el.style.setProperty("--al-tiles-visibility", String(1 - getSpread()));
    draw();
    return subscribeSpread(draw);
  }, []);

  return (
    <>
      <p className="al-role" aria-label={staticLabel}>
        <span aria-hidden="true">
          <span className="al-role-prefix">I’m a </span>
          <span className="al-role-text">{animate ? frame.text : staticLabel}</span>
          {animate && <span className="al-role-caret" />}
        </span>
      </p>
      <div ref={tilesRef} className="al-tiles" data-animate={animate ? "" : undefined}>
        {tiles.map((tile, index) => (
          <a
            key={tile.href}
            href={tile.href}
            className="al-tile"
            data-slot={index}
            data-active={animate && frame.index === index ? "" : undefined}
            aria-label={`${tile.title}: ${tile.summary}`}
          >
            {tile.node}
            <span className="al-tile-caption" aria-hidden="true">
              {String(index + 1).padStart(2, "0")} / {tile.title} ↗
            </span>
          </a>
        ))}
      </div>
    </>
  );
}
