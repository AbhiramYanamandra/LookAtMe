"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const STORAGE_KEY = "lookatme:library-state";
const SCROLL_KEY = "lookatme:library-scroll";
const RESTORE_KEY = "lookatme:library-restore";

/**
 * Remembers the visitor's current library filters (per tab) so that a case
 * study's "Back to library" link can restore them.
 */
export function RememberLibraryState() {
  const params = useSearchParams();
  const query = params.toString();

  useEffect(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, query);
    } catch {
      // Storage may be unavailable (private mode); the plain link still works.
    }
  }, [query]);

  // Remember the browsing position, and restore it when arriving via a
  // case study's "Back to the library" link (browser Back restores natively).
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(RESTORE_KEY) === "1") {
        window.sessionStorage.removeItem(RESTORE_KEY);
        const y = Number(window.sessionStorage.getItem(SCROLL_KEY));
        // The back link navigates with scroll: false, so this is the only scroll.
        window.scrollTo({ top: Number.isFinite(y) ? y : 0, behavior: "instant" });
      }
    } catch {
      // ignore
    }
    let raf = 0;
    const save = () => {
      raf = 0;
      try {
        window.sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
      } catch {
        // ignore
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(save);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
}

/**
 * Link back to the library. Server-rendered as a plain `/projects` link for
 * direct visitors; once mounted it points at the last library state seen in
 * this tab, if any.
 */
export function BackToLibrary({ className = "cs-back", children = "Back to the library" }) {
  const router = useRouter();

  const onClick = (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    let query = "";
    try {
      window.sessionStorage.setItem(RESTORE_KEY, "1");
      query = window.sessionStorage.getItem(STORAGE_KEY) ?? "";
    } catch {
      return;
    }
    if (!query) return;
    event.preventDefault();
    router.push(`/projects?${query}`, { scroll: false });
  };

  return (
    <Link href="/projects" className={className} onClick={onClick} scroll={false}>
      <ArrowLeft aria-hidden="true" />
      {children}
    </Link>
  );
}
