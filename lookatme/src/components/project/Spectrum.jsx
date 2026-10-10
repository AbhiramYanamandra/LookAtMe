"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BINS, BIN_PCT, SPECTRUM_BANDS, bandFor, binCounts, binOf, describeRange, formatRange, inRange } from "@/lib/spectrum";
import { libraryHref } from "@/lib/project-queries";

/**
 * The hardware-to-software spectrum as a filter. A histogram shows how many
 * projects sit at each point on the axis; a brush over it picks a range, and
 * the library below narrows to it. Bars only grow as projects are added, so
 * the control stays the same size however large the collection gets.
 *
 * Dragging updates the readout live; releasing writes `?range=` to the URL,
 * which re-renders the grid on the server like the field chips do.
 */
const FULL = { from: 0, to: 100 };
const BAND_STEP = 20;

const clampRange = ({ from, to }) => {
  const f = Math.max(0, Math.min(100 - BIN_PCT, from));
  const t = Math.min(100, Math.max(f + BIN_PCT, to));
  return { from: f, to: t };
};

export function Spectrum({ items, field = "all", sort, view, range: initial }) {
  const router = useRouter();
  const track = useRef(null);
  const drag = useRef(null);
  const [range, setRange] = useState(initial ?? FULL);

  // Follow the URL when it changes elsewhere (Reset filters, back button).
  const initialKey = formatRange(initial) ?? "all";
  useEffect(() => {
    setRange(initial ?? FULL);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialKey]);

  const counts = useMemo(() => binCounts(items.map((item) => item.spectrum)), [items]);
  const names = useMemo(() => {
    const byBin = Array.from({ length: BINS }, () => []);
    items.forEach((item) => byBin[binOf(item.spectrum)].push(item.title));
    return byBin;
  }, [items]);
  const max = Math.max(1, ...counts);
  const inField = items.filter((item) => field === "all" || item.fields.includes(field));
  const showing = inField.filter((item) => inRange(item.spectrum, range)).length;
  const isAll = range.from === 0 && range.to === 100;

  const commit = (next) => {
    const r = next.from === 0 && next.to === 100 ? null : next;
    router.replace(libraryHref({ field, sort, view, range: r }), { scroll: false });
  };
  const set = (next, save = true) => {
    const r = clampRange(next);
    setRange(r);
    if (save) commit(r);
  };

  const pctAt = (clientX) => {
    const box = track.current.getBoundingClientRect();
    return ((clientX - box.left) / box.width) * 100;
  };
  const snap = (pct) => Math.round(pct / BIN_PCT) * BIN_PCT;

  const onDown = (mode) => (event) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic or already-released pointers can't be captured; dragging still works.
    }
    drag.current = { mode, start: pctAt(event.clientX), base: range };
  };
  const onMove = (event) => {
    const d = drag.current;
    if (!d) return;
    const delta = snap(pctAt(event.clientX) - d.start);
    if (d.mode === "from") set({ from: Math.min(d.base.from + delta, d.base.to - BIN_PCT), to: d.base.to }, false);
    else if (d.mode === "to") set({ from: d.base.from, to: Math.max(d.base.to + delta, d.base.from + BIN_PCT) }, false);
    else {
      const width = d.base.to - d.base.from;
      const from = Math.max(0, Math.min(100 - width, d.base.from + delta));
      set({ from, to: from + width }, false);
    }
  };
  const onUp = () => {
    if (!drag.current) return;
    drag.current = null;
    commit(range);
  };

  const onKey = (edge) => (event) => {
    const step = event.shiftKey ? BAND_STEP : BIN_PCT;
    const dir = event.key === "ArrowLeft" || event.key === "ArrowDown" ? -1 : event.key === "ArrowRight" || event.key === "ArrowUp" ? 1 : 0;
    if (!dir) return;
    event.preventDefault();
    if (edge === "from") set({ from: Math.min(range.from + dir * step, range.to - BIN_PCT), to: range.to }, false);
    else set({ from: range.from, to: Math.max(range.to + dir * step, range.from + BIN_PCT) }, false);
  };

  const handle = (edge) => (
    <button
      type="button"
      className={`pl-brush-handle pl-brush-${edge}`}
      role="slider"
      aria-label={edge === "from" ? "Range start (hardware side)" : "Range end (software side)"}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={range[edge]}
      aria-valuetext={`${range[edge]}% toward software`}
      onPointerDown={onDown(edge)}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onKeyDown={onKey(edge)}
      onKeyUp={(event) => event.key.startsWith("Arrow") && commit(range)}
    />
  );

  return (
    <div className="pl-spectrum">
      <div className="pl-spectrum-ends al-mono" aria-hidden="true">
        <span>Hardware</span>
        <span>Software</span>
      </div>
      <div className="pl-hist-wrap">
        <div className="pl-hist" ref={track}>
          {counts.map((count, i) => {
            const on = i * BIN_PCT >= range.from && (i + 1) * BIN_PCT <= range.to;
            return (
              <button
                key={i}
                type="button"
                tabIndex={-1}
                className="pl-bar"
                data-on={on ? "" : undefined}
                data-empty={count === 0 ? "" : undefined}
                style={{ "--h": count / max, "--t": (i + 0.5) / BINS }}
                title={count ? names[i].join(", ") : undefined}
                aria-hidden="true"
                onClick={() => count && set({ from: i * BIN_PCT, to: (i + 1) * BIN_PCT })}
              >
                <i />
              </button>
            );
          })}
          <div
            className="pl-brush"
            data-all={isAll ? "" : undefined}
            style={{ left: `${range.from}%`, width: `${range.to - range.from}%` }}
            onPointerDown={onDown("move")}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          >
            {handle("from")}
            {handle("to")}
          </div>
        </div>
      </div>
      <div className="pl-spectrum-foot">
        <div className="pl-bands" role="group" aria-label="Jump to a part of the spectrum">
          {SPECTRUM_BANDS.map((band) => {
            const n = inField.filter((item) => inRange(item.spectrum, band)).length;
            return (
              <button key={band.id} type="button" aria-pressed={bandFor(range)?.id === band.id} onClick={() => set(bandFor(range)?.id === band.id ? FULL : band)}>
                {band.label} <span className="pl-count">{n}</span>
              </button>
            );
          })}
        </div>
        <p className="pl-spectrum-readout" aria-live="polite">
          Showing <strong>{showing}</strong> of {inField.length}
          {!isAll && <> · {describeRange(range)}</>}
          {!isAll && (
            <button type="button" onClick={() => set(FULL)}>
              Clear
            </button>
          )}
        </p>
      </div>
    </div>
  );
}
