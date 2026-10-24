"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { profile } from "@/content/profile";

/**
 * Compact navigation: ay. logo, Work, About, Resume, Let's talk.
 *
 * `overlay` places it over the hero (homepage). Elsewhere it sits in normal
 * flow. About is a standalone route; the homepage also keeps its introduction.
 *
 * On phones the links fold into a Menu button that opens a full-screen menu.
 * There the bar stays pinned to the top, slides away while you scroll down
 * and comes back as soon as you scroll up.
 */
export function SiteHeader({ overlay = false }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const button = useRef(null);
  const menu = useRef(null);

  const links = [
    { href: "/projects", label: "Work", current: pathname.startsWith("/projects") },
    { href: "/background", label: "Background", current: pathname === "/background" || pathname.startsWith("/experience") },
  ];

  // Hide on the way down, show on the way up. Only the phone CSS acts on it.
  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      setScrolled(y > 8);
      if (Math.abs(y - last) < 6) return;
      setHidden(y > last && y > 80);
      last = y;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // A new page closes the menu.
  useEffect(() => setOpen(false), [pathname]);

  // While open: the page doesn't scroll, focus starts on the first link and
  // stays inside the menu, and Escape closes it.
  useEffect(() => {
    if (!open) return undefined;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    const items = () => [...menu.current.querySelectorAll("a, button")];
    menu.current.querySelector(".al-menu-links a")?.focus();
    const onKey = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
      if (event.key !== "Tab") return;
      const list = items();
      const first = list[0];
      const last = list[list.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    button.current?.focus();
  };

  return (
    <>
      <header
        className={`al-header${overlay ? "" : " al-header--static"}`}
        data-hidden={hidden && !open ? "" : undefined}
        data-scrolled={scrolled ? "" : undefined}
      >
        <Link href="/" className="al-logo" aria-label={`${profile.name} — home`}>
          {profile.logo}
        </Link>
        <nav className="al-nav" aria-label="Main navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={link.href === "/background" ? "al-nav-about" : undefined} aria-current={link.current ? "page" : undefined}>
              {link.label}
            </Link>
          ))}
          <a href={profile.resume} target="_blank" rel="noopener noreferrer">
            Resume
          </a>
          <a href={`mailto:${profile.email}`} className="al-nav-contact">
            Let’s talk
            <ArrowUpRight aria-hidden="true" />
          </a>
        </nav>
        <button ref={button} type="button" className="al-menu-button" aria-expanded={open} aria-controls="site-menu" onClick={() => setOpen(true)}>
          Menu
          <Menu aria-hidden="true" />
        </button>
      </header>

      {/* Outside the header: the header moves when it hides, and a fixed
          element inside a moved one would move with it. */}
      <div ref={menu} id="site-menu" className="al-menu" role="dialog" aria-modal="true" aria-label="Menu" data-open={open ? "" : undefined} inert={!open}>
        <div className="al-menu-top">
          <Link href="/" className="al-logo" aria-label={`${profile.name} — home`} onClick={() => setOpen(false)}>
            {profile.logo}
          </Link>
          <button type="button" className="al-menu-button" onClick={close}>
            Close
            <X aria-hidden="true" />
          </button>
        </div>
        <nav className="al-menu-links" aria-label="Main navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href} aria-current={link.current ? "page" : undefined} onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          <a href={profile.resume} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
            Resume
            <ArrowUpRight aria-hidden="true" />
          </a>
          <a href={`mailto:${profile.email}`} onClick={() => setOpen(false)}>
            Let’s talk
            <ArrowUpRight aria-hidden="true" />
          </a>
        </nav>
        <p className="al-menu-social">
          <a href={profile.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <span aria-hidden="true">·</span>
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        </p>
      </div>
    </>
  );
}
