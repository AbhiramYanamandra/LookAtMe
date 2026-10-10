"use client";

import { useEffect, useRef, useState } from "react";
import { INTRO_LENGTH, PHASES, atLeast, bootFrame, checkBody, phaseAt } from "@/lib/intro";
import { setPhase } from "@/lib/intro-state";

/**
 * First-load intro: a tiny boot sequence typed on black, then the lamp comes
 * on (see motion.css), the name is written, the role line types and the tiles
 * arrive. This component owns the clock: it draws the terminal, advances the
 * shared phase (src/lib/intro-state.js) that the name entrance, role typer and
 * pulse wait on, and mirrors it onto <html> classes for CSS.
 *
 * The layout bootstrap adds `al-intro` before first paint when the intro is
 * due (home page, first visit this tab, no reduced motion), so nothing flashes.
 * Any click, key, wheel or touch skips to the finished page. Review aid
 * (development only): `?intro=1` replays it.
 */
const SKIP_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart"];

export function HeroIntro({ lines, reviewEnabled = false }) {
  const [frame, setFrame] = useState([]);
  const [gone, setGone] = useState(false);
  const signature = useRef("");

  useEffect(() => {
    const root = document.documentElement;
    if (reviewEnabled && new URLSearchParams(window.location.search).has("intro")) {
      root.classList.add("al-intro", "al-entrance-pending");
    }
    if (!root.classList.contains("al-intro")) {
      setPhase("done");
      setGone(true);
      return undefined;
    }

    let raf = 0;
    let finished = false;
    let current = "boot";
    setPhase("boot");

    const classFor = (phase) => `al-intro-${phase}`;
    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      SKIP_EVENTS.forEach((name) => window.removeEventListener(name, finish));
      root.classList.remove("al-intro", "al-entrance-pending", ...PHASES.map(classFor));
      setPhase("done");
      setGone(true);
    };
    SKIP_EVENTS.forEach((name) => window.addEventListener(name, finish, { passive: true }));

    const origin = performance.now();
    const tick = (now) => {
      if (finished) return;
      const t = now - origin;
      const next = bootFrame(t, lines);
      const key = next.map((line) => `${line.text}|${line.ok}`).join("/");
      if (key !== signature.current) {
        signature.current = key;
        setFrame(next);
      }
      const phase = phaseAt(t);
      if (phase !== current) {
        // Classes accumulate (light, then name, ...) so each stays on once reached.
        PHASES.forEach((name) => {
          if (atLeast(phase, name) && name !== "boot" && name !== "done") root.classList.add(classFor(name));
        });
        current = phase;
        setPhase(phase);
      }
      if (t >= INTRO_LENGTH) {
        finish();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      SKIP_EVENTS.forEach((name) => window.removeEventListener(name, finish));
    };
  }, [lines, reviewEnabled]);

  if (gone) return null;

  return (
    <div className="al-boot" aria-hidden="true">
      <pre>
        {frame.map((line, index) => (
          <span key={index} className="al-boot-line">
            {line.kind === "command" ? "> " : "  "}
            {line.text}
            {line.kind === "check" && line.ok && <b className="al-boot-ok"> [ok]</b>}
            {"\n"}
          </span>
        ))}
        <i className="al-boot-caret" />
      </pre>
    </div>
  );
}
