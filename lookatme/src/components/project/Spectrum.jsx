"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { beeswarm, SPECTRUM_BANDS } from "@/lib/spectrum";
import { libraryHref } from "@/lib/project-queries";
import { ProjectVisual, GENERATED_VISUALS } from "./ProjectVisual";

/**
 * The hardware-to-software spectrum: every project is a dot on one axis.
 * Hover or focus a dot for a preview, click to filter the library to that
 * project's field. Hovering a card in the grid lights its dot. The layout is a
 * beeswarm (src/lib/spectrum.js), recomputed whenever the width changes.
 */
const RADIUS = 9;

export function Spectrum({ items }) {
  const router = useRouter();
  const box = useRef(null);
  const [width, setWidth] = useState(1000);
  const [dot, setDot] = useState(null);
  const [card, setCard] = useState(null);
  const active = dot ?? card;

  useEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const measure = () => setWidth(Math.max(280, el.clientWidth - RADIUS * 2));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // A card hovered in the grid lights its dot.
  useEffect(() => {
    const over = (event) => {
      const cell = event.target.closest?.(".pl-cell[data-slug]");
      setCard(cell ? cell.dataset.slug : null);
    };
    document.addEventListener("pointerover", over);
    return () => document.removeEventListener("pointerover", over);
  }, []);

  const points = useMemo(() => beeswarm(items.map((item) => item.spectrum), { radius: RADIUS + 1, width }), [items, width]);
  const current = items.find((item) => item.slug === active) ?? null;
  const currentPoint = current ? points[items.indexOf(current)] : null;

  const go = (item) => {
    const field = item.fields[0];
    router.push(`${libraryHref({ field })}#browse`, { scroll: false });
    document.getElementById("browse")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="pl-spectrum" ref={box}>
      <div className="pl-spectrum-ends al-mono" aria-hidden="true">
        <span>Hardware</span>
        <span>Software</span>
      </div>
      <div className="pl-spectrum-field" style={{ height: 220 }}>
        {SPECTRUM_BANDS.map((band) => (
          <div key={band.id} className="pl-band" style={{ left: `${band.from * 100}%`, width: `${(band.to - band.from) * 100}%` }}>
            <span className="al-mono">{band.label}</span>
          </div>
        ))}
        <div className="pl-axis" aria-hidden="true" />
        <ul role="list" aria-label="Projects from hardware to software">
          {items.map((item, index) => (
            <li key={item.slug} style={{ left: RADIUS + points[index].x, top: `calc(72% + ${points[index].y}px)` }}>
              <button
                type="button"
                className="pl-dot"
                data-active={active === item.slug ? "" : undefined}
                data-kind={item.fields[0] ?? "other"}
                aria-label={`${item.title}. Show ${item.fieldLabel ?? "its field"} projects.`}
                onPointerEnter={(event) => event.pointerType === "mouse" && setDot(item.slug)}
                onPointerLeave={() => setDot(null)}
                onFocus={() => setDot(item.slug)}
                onBlur={() => setDot(null)}
                onClick={() => go(item)}
              />
            </li>
          ))}
        </ul>
        {current && currentPoint && (
          <aside
            className="pl-preview pv-live"
            style={{
              left: Math.min(Math.max(RADIUS + currentPoint.x, 130), width - 120),
              top: `calc(72% + ${currentPoint.y}px - ${RADIUS + 12}px)`,
            }}
          >
            <div className="pl-preview-art">
              {GENERATED_VISUALS.includes(current.visual) ? (
                <ProjectVisual kind={current.visual} />
              ) : current.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={current.cover} alt="" />
              ) : null}
            </div>
            <b>{current.title}</b>
            <span>{current.badge}</span>
          </aside>
        )}
      </div>
    </div>
  );
}
