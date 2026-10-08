"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { staggerDelay } from "@/lib/motion";
import { getNavigationType, setNavigationType } from "@/lib/navigation-state";

/**
 * One-time entrances for elements marked `data-reveal` (optionally with a
 * kind: "mask-up", "lines", "tilt", "sequence", "draw"; default fade-up).
 *
 * CSS hides these elements only while `html.js` is set and motion is
 * allowed (see motion.css), with a CSS safety timer that shows them anyway
 * if this script never runs. Each element reveals exactly once when it
 * enters the viewport and then stays visible — scrolling back up never
 * hides content again. Elements entering together are staggered 40ms apart
 * (capped at 80ms). After a click navigation, elements already in view are
 * shown at once (the page fade is their entrance); after Back/Forward
 * everything is shown immediately. Focus inside a hidden element reveals
 * it, so keyboard users never land on invisible content.
 */
export function RevealObserver() {
  const pathname = usePathname();
  const search = useSearchParams().toString();

  useEffect(() => {
    const navigation = getNavigationType();
    setNavigationType("initial");
    const pending = Array.from(document.querySelectorAll("[data-reveal]:not(.is-revealed)"));
    if (pending.length === 0) return undefined;

    const show = (el, delay = 0, instant = false) => {
      el.style.setProperty("--reveal-delay", `${delay}ms`);
      if (instant) el.classList.add("is-instant");
      el.classList.add("is-revealed");
    };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches || navigation === "history" || !("IntersectionObserver" in window)) {
      pending.forEach((el) => show(el, 0, true));
      return undefined;
    }

    let observed = pending;
    if (navigation === "click") {
      observed = pending.filter((el) => {
        const rect = el.getBoundingClientRect();
        const inView = rect.bottom > 0 && rect.top < window.innerHeight;
        // A page's authored entrance (`data-reveal-entrance`) still plays.
        if (inView && !el.hasAttribute("data-reveal-entrance")) {
          show(el, 0, true);
          return false;
        }
        return true;
      });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => (a.target.compareDocumentPosition(b.target) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
          .forEach((entry, index) => {
            const el = entry.target;
            const explicit = el.dataset.revealDelay;
            // Content that was jumped past (anchor link, End key) and now
            // arrives from above simply appears rather than rising upward.
            const fromAbove = entry.boundingClientRect.top < 0;
            show(el, fromAbove ? 0 : explicit !== undefined ? Number(explicit) : staggerDelay(index), fromAbove);
            observer.unobserve(el);
          });
      },
      // Start as soon as the top edge is inside the viewport so content is
      // readable as it arrives; a small negative margin keeps it from
      // firing for a sliver that is not really on screen yet.
      { rootMargin: "0px 0px -4% 0px", threshold: 0.01 },
    );
    observed.forEach((el) => observer.observe(el));

    const onFocus = (event) => {
      const el = event.target.closest?.("[data-reveal]:not(.is-revealed)");
      if (el) {
        show(el, 0, true);
        observer.unobserve(el);
      }
    };
    const onReducedChange = () => {
      if (reduced.matches) observed.forEach((el) => show(el));
    };
    document.addEventListener("focusin", onFocus);
    reduced.addEventListener("change", onReducedChange);

    return () => {
      observer.disconnect();
      document.removeEventListener("focusin", onFocus);
      reduced.removeEventListener("change", onReducedChange);
    };
  }, [pathname, search]);

  return null;
}
