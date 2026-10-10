"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { chapterScroll, chapterState, STEP_COUNT } from "@/lib/story";
import { storyProgress } from "@/lib/motion";

/**
 * The pinned project story. Three chapters share one sticky stage; as the
 * page scrolls, each chapter's title, interactive visual, facts and link are
 * revealed in turn, then the next chapter takes over. Scrolling back reverses
 * it. Without JS, with reduced motion, or on narrow screens the chapters are
 * simply stacked and fully revealed.
 *
 * `chapters` carry their visual as a ready-made node (the server builds the
 * model viewer, Presto frame and thesis figure); this component owns scroll.
 */
const PIN_QUERY = "(min-width: 801px) and (prefers-reduced-motion: no-preference)";

export function ProjectStory({ label, heading, hint, chapters }) {
  const sectionRef = useRef(null);
  const [pinned, setPinned] = useState(false);
  const [states, setStates] = useState(() => chapterState(0, chapters.length));
  const [seen, setSeen] = useState(() => new Set());
  const [near, setNear] = useState(false);
  const chapterRefs = useRef([]);

  useEffect(() => {
    const query = window.matchMedia(PIN_QUERY);
    const sync = () => setPinned(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!pinned || !section) return undefined;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const p = storyProgress({ scrollY: -rect.top, height: section.offsetHeight, viewport: window.innerHeight });
      section.style.setProperty("--story-p", p.toFixed(3));
      const next = chapterState(p, chapters.length);
      setStates((previous) =>
        previous.every((item, i) => item.state === next[i].state && item.step === next[i].step) ? previous : next,
      );
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    // Links to a chapter ("#work-presto") scroll to where that chapter begins.
    const onClick = (event) => {
      const anchor = event.target.closest?.('a[href^="#work-"]');
      if (!anchor) return;
      const index = chapters.findIndex((chapter) => `#work-${chapter.slug}` === anchor.getAttribute("href"));
      if (index < 0) return;
      event.preventDefault();
      goTo(index);
    };
    document.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("click", onClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinned, chapters.length]);

  // Nothing heavy loads until the story is within a screen of the viewport.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;
    const observer = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), { rootMargin: "120% 0px" });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Stacked layout: each chapter loads its visual as it nears the viewport.
  useEffect(() => {
    if (pinned) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = chapterRefs.current.indexOf(entry.target);
          setSeen((previous) => (previous.has(index) ? previous : new Set(previous).add(index)));
        });
      },
      { rootMargin: "60% 0px" },
    );
    chapterRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [pinned]);

  // Pinned layout: heavy visuals (the 3D model) mount once their chapter nears.
  useEffect(() => {
    if (!pinned || !near) return;
    setSeen((previous) => {
      const next = new Set(previous);
      states.forEach((item, index) => {
        const near = item.state === "active" || states[index - 1]?.state === "active";
        if (near) next.add(index);
      });
      return next.size === previous.size ? previous : next;
    });
  }, [states, pinned, near]);

  function goTo(index) {
    const section = sectionRef.current;
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const travel = section.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + chapterScroll(index, chapters.length, travel), behavior: "smooth" });
  }

  const mode = pinned ? "pinned" : "static";
  const activeIndex = states.findIndex((item) => item.state === "active");

  return (
    <section
      ref={sectionRef}
      id="work"
      className="al-story"
      data-mode={mode}
      style={{ "--n": chapters.length }}
      aria-labelledby="story-heading"
    >
      <div className="al-story-stage">
        <header className="al-story-head" data-reveal="heading">
          <span className="al-mono">{label}</span>
          <h2 id="story-heading">{heading}</h2>
          <span className="al-mono al-story-hint">{hint}</span>
        </header>

        {chapters.map((chapter, index) => {
          const item = states[index];
          const step = pinned ? item.step : STEP_COUNT;
          const shown = (at) => (step >= at ? "" : undefined);
          // A heavy visual (it has a poster) only runs while its chapter is on screen.
          const live = seen.has(index) && (!pinned || !chapter.poster || item.state === "active");
          return (
            <article
              key={chapter.slug}
              ref={(el) => {
                chapterRefs.current[index] = el;
              }}
              id={pinned ? undefined : `work-${chapter.slug}`}
              className="al-chapter"
              data-state={pinned ? item.state : "active"}
              inert={pinned && item.state !== "active"}
              aria-label={chapter.title}
            >
              <div className="al-chapter-copy">
                <p className="al-chapter-kicker al-mono" data-shown={shown(1)}>
                  {String(index + 1).padStart(2, "0")} / {chapter.kicker}
                </p>
                <h3 data-shown={shown(1)}>{chapter.title}</h3>
                <p className="al-chapter-headline" data-shown={shown(1)}>
                  {chapter.headline}
                </p>
                <ul className="al-chapter-facts">
                  {chapter.facts.map((fact, factIndex) => (
                    <li key={fact.value} data-shown={shown(3 + factIndex)}>
                      <b>{fact.value}</b>
                      <span>{fact.label}</span>
                    </li>
                  ))}
                </ul>
                <Link className="al-chapter-link" href={chapter.href} data-shown={shown(6)}>
                  {chapter.cta}
                  <ArrowUpRight aria-hidden="true" />
                </Link>
              </div>
              <div className="al-chapter-visual" data-shown={shown(2)}>
                {live ? chapter.visual : (chapter.poster ?? chapter.visual)}
              </div>
            </article>
          );
        })}

        {pinned && (
          <nav className="al-story-rail" aria-label="Projects">
            {chapters.map((chapter, index) => (
              <button
                key={chapter.slug}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`${index + 1}. ${chapter.title}`}
                aria-current={index === activeIndex ? "step" : undefined}
              >
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </section>
  );
}
