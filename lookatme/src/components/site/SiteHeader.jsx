"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { profile } from "@/content/profile";

/**
 * Compact navigation: ay. logo, Work, About, Resume, Let's talk.
 *
 * `overlay` places it over the hero (homepage). Elsewhere it sits in normal
 * flow. About is a standalone route; the homepage also keeps its introduction.
 */
export function SiteHeader({ overlay = false }) {
  const pathname = usePathname();
  return (
    <header className={`al-header${overlay ? "" : " al-header--static"}`}>
      <Link href="/" className="al-logo" aria-label={`${profile.name} — home`}>
        {profile.logo}
      </Link>
      <nav className="al-nav" aria-label="Main navigation">
        <Link href="/projects" aria-current={pathname.startsWith("/projects") ? "page" : undefined}>Work</Link>
        <Link href="/about" className="al-nav-about" aria-current={pathname === "/about" ? "page" : undefined}>
          About
        </Link>
        <a href={profile.resume} target="_blank" rel="noopener noreferrer">
          Resume
        </a>
        <a href={`mailto:${profile.email}`} className="al-nav-contact">
          Let’s talk
          <ArrowUpRight aria-hidden="true" />
        </a>
      </nav>
    </header>
  );
}
