"use client";

import { useMemo, useState } from "react";
import { DETECTOR_EVENTS, FULL_SCALE, PACKET, PACKET_MS, THRESHOLD, makeSignal, windowPeaks } from "@/lib/clap";

const WINDOWS = 24;
const PPW = 60;
const COOLDOWN = Math.ceil(500 / PACKET_MS); // time.sleep(0.5) after a clap, in packets
const W = 640;
const X0 = 8;
const PW = (W - X0 * 2) / WINDOWS;
const CY = 102;
const H = 76;

/**
 * The notebook's detector on a synthetic room recording: each 4,096-sample
 * packet is flagged if any |sample| exceeds the threshold; a flag toggles the
 * LED and the speaker mute, then the loop sleeps 0.5 s.
 */
export function ClapDetector() {
  const [t, setT] = useState(THRESHOLD);
  const signal = useMemo(() => makeSignal({ windows: WINDOWS, pointsPerWindow: PPW, events: DETECTOR_EVENTS }), []);
  const peaks = useMemo(() => windowPeaks(signal, PPW), [signal]);
  const claps = new Set(DETECTOR_EVENTS.filter((e) => e[1] === "clap").map((e) => e[0]));

  const path = useMemo(() => {
    let d = "";
    for (let i = 0; i < signal.length; i++) d += `${i ? "L" : "M"}${(X0 + (i / PPW) * PW).toFixed(1)} ${(CY - (signal[i] / FULL_SCALE) * H).toFixed(1)}`;
    return d;
  }, [signal]);

  // Walk the packets the way the loop does, tracking LED state and cooldown.
  const verdicts = [];
  let led = 0;
  let cool = 0;
  const ledAt = [];
  for (let w = 0; w < WINDOWS; w++) {
    let v;
    if (cool > 0) {
      v = claps.has(w) ? "coolmiss" : "cool";
      cool -= 1;
    } else if (peaks[w] > t) {
      v = claps.has(w) ? "hit" : "false";
      led = 1 - led;
      cool = COOLDOWN;
    } else {
      v = claps.has(w) ? "miss" : "quiet";
    }
    verdicts.push(v);
    ledAt.push(led);
  }
  const count = (k) => verdicts.filter((v) => v === k || (k === "miss" && v === "coolmiss")).length;
  const band = (t / FULL_SCALE) * H;
  const ledY = CY + H + 22;

  return (
    <figure className="cs-figure cd" data-reveal>
      <div className="cd-controls">
        <label htmlFor="cd-t">
          Threshold <b>{t.toLocaleString()}</b>
          <span> / 32,768</span>
        </label>
        <input id="cd-t" type="range" min="2000" max="24000" step="250" value={t} onChange={(e) => setT(Number(e.target.value))} />
        <button type="button" onClick={() => setT(THRESHOLD)} disabled={t === THRESHOLD}>
          Reset to 10,000
        </button>
      </div>
      <div className="hx-scroll">
        <svg viewBox={`0 0 ${W} ${ledY + 42}`} className="hx-svg cd-svg" role="img" aria-label={`Threshold ${t}: ${count("hit")} of 4 claps detected, ${count("false")} false triggers, ${count("miss")} missed.`}>
          {verdicts.map((v, w) => (
            <rect key={w} className={`cd-win cd-${v}`} x={X0 + w * PW + 1} y={CY - H - 6} width={PW - 2} height={H * 2 + 12} rx="3">
              <title>{`Packet ${w + 1}: peak ${Math.round(peaks[w]).toLocaleString()} — ${v}`}</title>
            </rect>
          ))}
          <path className="cd-wave" d={path} />
          <line className="cd-thresh" x1={X0} x2={W - X0} y1={CY - band} y2={CY - band} />
          <line className="cd-thresh" x1={X0} x2={W - X0} y1={CY + band} y2={CY + band} />
          {verdicts.map((v, w) =>
            v === "hit" || v === "false" || v === "miss" || v === "coolmiss" ? (
              <text key={w} className={`cd-tag cd-tag-${v === "coolmiss" ? "miss" : v}`} x={X0 + (w + 0.5) * PW} y={CY - H - 12} textAnchor="middle">
                {v === "hit" ? "clap" : v === "false" ? "false" : "missed"}
              </text>
            ) : null
          )}
          <text className="cd-rowlabel" x={X0} y={ledY - 6}>
            LED &amp; speaker mute
          </text>
          {ledAt.map((on, w) => (
            <rect key={w} className={on ? "cd-led cd-led-on" : "cd-led"} x={X0 + w * PW + 1} y={ledY} width={PW - 2} height="10" rx="2" />
          ))}
          <text className="cd-axis" x={X0} y={ledY + 30}>
            each block = one {PACKET.toLocaleString()}-sample DMA packet ({Math.round(PACKET_MS)} ms)
          </text>
        </svg>
      </div>
      <p className="cd-summary">
        <b>{count("hit")}</b> of 4 claps · <b>{count("false")}</b> false trigger{count("false") === 1 ? "" : "s"} · <b>{count("miss")}</b> missed
        {count("false") > 0 && " — talking and music start flipping the lights"}
        {count("false") === 0 && count("miss") > 0 && (count("miss") === 1 ? " — the quietest clap no longer clears the line" : " — the quieter claps no longer clear the line")}
        {count("false") === 0 && count("miss") === 0 && " — every clap clears the line, nothing else does"}
      </p>
      <figcaption className="cs-figcaption">
        <span>
          Synthetic room audio (the project kept no recording); the test, packet size, threshold and 0.5 s cooldown are the notebook&rsquo;s. Grey blocks are skipped while the loop sleeps. Packets are drawn back to back; the real loop had gaps between them.
        </span>
        <span className="al-mono">Simulation</span>
      </figcaption>
    </figure>
  );
}
