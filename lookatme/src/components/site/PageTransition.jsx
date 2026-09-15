"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { EASE_OUT, MOTION, ENTRANCE_STORAGE_KEY, isAnimatedNavigation } from "@/lib/motion";
import { getNavigationType, setNavigationType } from "@/lib/navigation-state";

/**
 * Restrained content transition between routes.
 *
 * Navigation starts immediately and nothing covers the page. When the
 * destination has rendered (the pathname changes) its <main> starts from
 * opacity 0 — a Web Animation created before paint — and settles over 260ms.
 * The header stays steady; no transformed parent interferes with scrolling
 * or the case study's fixed reading-progress line.
 * Back/Forward gets a shorter fade so restored scroll positions are not
 * disturbed; reduced motion shows the destination at once. Query-only
 * changes (filters, sort) never pass through here.
 */
export function PageTransition() {
  const pathname = usePathname();
  const animation = useRef(null);
  const previousPath = useRef(pathname);

  // Immediate feedback on the pressed link, and remember how we navigated.
  useEffect(() => {
    const feedback = new Map();
    const onClick = (event) => {
      const anchor = event.target.closest?.("a[href]");
      if (!anchor || event.defaultPrevented) return;
      const animated = isAnimatedNavigation({
        href: anchor.getAttribute("href"),
        target: anchor.getAttribute("target"),
        download: anchor.hasAttribute("download") ? anchor.getAttribute("download") : null,
        currentPath: window.location.pathname,
        currentOrigin: window.location.origin,
        modifiers: event,
        button: event.button,
      });
      if (!animated) return;
      setNavigationType("click");
      anchor.classList.add("is-navigating");
      clearTimeout(feedback.get(anchor));
      feedback.set(anchor, window.setTimeout(() => {
        anchor.classList.remove("is-navigating");
        feedback.delete(anchor);
      }, MOTION.page * 2));
    };
    document.addEventListener("click", onClick, true);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onReducedChange = () => { if (reduced.matches) animation.current?.cancel(); };
    reduced.addEventListener("change", onReducedChange);
    return () => {
      document.removeEventListener("click", onClick, true);
      reduced.removeEventListener("change", onReducedChange);
      for (const [anchor, timer] of feedback) {
        clearTimeout(timer);
        anchor.classList.remove("is-navigating");
      }
    };
  }, []);

  // Runs before the new route paints.
  useLayoutEffect(() => {
    if (previousPath.current === pathname) return undefined;
    previousPath.current = pathname;

    const main = document.querySelector("main");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // A visitor may land on /about first. Prepare their first homepage
    // entrance before paint just as the document bootstrap does on a reload.
    if (pathname === "/" && !reduced) {
      try {
        if (sessionStorage.getItem(ENTRANCE_STORAGE_KEY) !== "done") {
          document.documentElement.classList.add("al-entrance-pending");
        }
      } catch { /* Leave the readable fallback when storage is unavailable. */ }
    }
    // RevealObserver (rendered after this component) consumes and resets it.
    const navigation = getNavigationType();
    animation.current?.cancel();
    if (!main || reduced || typeof main.animate !== "function") return undefined;

    const history = navigation === "history";
    // Created before paint, so the destination's first frame is already the
    // faded start state; no fill, so nothing can linger after it ends.
    animation.current = main.animate(
      [
        { opacity: 0 },
        { opacity: 1 },
      ],
      { duration: history ? 140 : MOTION.page, easing: EASE_OUT },
    );
    return () => animation.current?.cancel();
  }, [pathname]);

  useEffect(() => () => animation.current?.cancel(), []);

  return null;
}
