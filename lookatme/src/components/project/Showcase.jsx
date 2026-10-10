"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/**
 * The lead projects as large, genuinely interactive tiles. Heavy visuals (the
 * 3D model, the walkthrough, the photo demo) mount only once their tile is
 * within a screen of the viewport; until then a light poster stands in.
 */
export function Showcase({ tiles }) {
  return (
    <section className="pl-showcase" aria-labelledby="showcase-heading">
      <div className="pl-showcase-head" data-reveal="heading">
        <span className="al-mono">[ Lead projects ]</span>
        <h2 id="showcase-heading">Start here.</h2>
        <span className="al-mono">Drag it. Watch it. Poke it.</span>
      </div>
      {tiles.map((tile, index) => (
        <Tile key={tile.slug} tile={tile} index={index} />
      ))}
    </section>
  );
}

function Tile({ tile, index }) {
  const ref = useRef(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setNear(true), { rootMargin: "60% 0px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <article ref={ref} id={`lead-${tile.slug}`} className="pl-tile" data-flip={index % 2 === 1 ? "" : undefined} data-reveal="tilt">
      <div className="pl-tile-copy">
        <p className="al-mono pl-tile-kicker">
          {String(index + 1).padStart(2, "0")} / {tile.kicker}
        </p>
        <h3>
          <Link href={tile.href}>{tile.title}</Link>
        </h3>
        <p className="pl-tile-headline">{tile.headline}</p>
        <ul className="pl-tile-facts">
          {tile.facts.map((fact) => (
            <li key={fact.value}>
              <b>{fact.value}</b>
              <span>{fact.label}</span>
            </li>
          ))}
        </ul>
        <Link className="pl-tile-link" href={tile.href}>
          {tile.cta}
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </div>
      <div className="pl-tile-visual">{near ? tile.visual : (tile.poster ?? tile.visual)}</div>
    </article>
  );
}
