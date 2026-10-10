"use client";

import { useEffect, useRef, useState } from "react";
import { EDGES, PAGES, next } from "@/lib/smartwatch";
import { LcdLines, NavMap, mapScale } from "./SmartwatchParts";

const MAP_BOX = { x: 8, y: 8, w: 624, h: 250 };
const HOLD_MS = 500;
const BTN_LABEL = { SW1: "SW1", SW2: "SW2", SW3: "SW3", B1: "B1", SW1L: "Hold SW1" };

/** In-page actions the guide describes that don't move to another page. */
function localAction(page, button) {
  if (page === "flashlight" && button === "SW1") return "toggle-flash";
  if ((page === "haptics" || page === "sound") && button === "SW2") return "toggle-setting";
  if (page === "stopwatch" && button === "SW1") return "stopwatch-run";
  if (page === "stopwatch" && button === "B1") return "stopwatch-reset";
  return null;
}

const ACTION_TEXT = {
  "toggle-flash": "Flashlight on / off",
  "toggle-setting": "Toggle on / off",
  "stopwatch-run": "Start / stop",
  "stopwatch-reset": "Reset",
};

function fmtStopwatch(ms) {
  const t = Math.floor(ms / 100);
  const m = String(Math.floor(t / 600)).padStart(2, "0");
  const s = String(Math.floor((t % 600) / 10)).padStart(2, "0");
  return `${m}:${s}.${t % 10}`;
}

/**
 * The smartwatch's interface in the browser: the same four buttons, the same
 * page-to-page transitions as the user guide's navigation map, and the page
 * shown on a 16×2 screen with the watch's own CGRAM icons.
 */
export function WatchSim() {
  const [page, setPage] = useState("home");
  const [last, setLast] = useState(null);
  const [flash, setFlash] = useState(false);
  const [settings, setSettings] = useState({ haptics: true, sound: true });
  const [sw, setSw] = useState({ running: false, base: 0, since: 0 });
  const [now, setNow] = useState(0);
  const holdTimer = useRef(null);
  const held = useRef(false);
  // Read the page through a ref so quick successive presses never see a stale value.
  const pageRef = useRef("home");

  useEffect(() => {
    if (!sw.running) return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [sw.running]);

  const press = (button) => {
    const page = pageRef.current;
    const to = next(page, button);
    if (to) {
      pageRef.current = to;
      setLast({ button, from: page, to });
      setPage(to);
      return;
    }
    const act = localAction(page, button);
    if (act === "toggle-flash") setFlash((f) => !f);
    if (act === "toggle-setting") setSettings((st) => ({ ...st, [page]: !st[page] }));
    if (act === "stopwatch-run") {
      const t = Date.now();
      setNow(t);
      setSw((s) => (s.running ? { running: false, base: s.base + (t - s.since), since: 0 } : { running: true, base: s.base, since: t }));
    }
    if (act === "stopwatch-reset") setSw({ running: false, base: 0, since: 0 });
    setLast({ button, from: page, to: null, act });
  };

  // SW1 doubles as a long press: hold it for half a second.
  const sw1Down = () => {
    held.current = false;
    holdTimer.current = setTimeout(() => {
      held.current = true;
      press(next(pageRef.current, "SW1L") ? "SW1L" : "SW1");
    }, HOLD_MS);
  };
  const sw1Up = () => {
    clearTimeout(holdTimer.current);
    if (!held.current) press("SW1");
    held.current = true;
  };

  const elapsed = sw.base + (sw.running ? now - sw.since : 0);
  const lines = (() => {
    const [a, b] = PAGES[page].lcd;
    if (page === "flashlight") return [a, flash ? "LIGHT: ON" : "LIGHT: OFF"];
    if (page === "haptics" || page === "sound") return [a, settings[page] ? "ON" : "OFF"];
    if (page === "stopwatch") return [a, `${fmtStopwatch(elapsed)}${sw.running ? "  RUN" : ""}`];
    return [a, b];
  })();

  const exits = EDGES.filter(([from]) => from === page);
  const actions = ["SW1", "SW2", "SW3", "B1"].map((b) => ({ b, act: localAction(page, b) })).filter((x) => x.act && !next(page, x.b));
  const { px } = mapScale(MAP_BOX);

  return (
    <figure className="cs-figure ws" data-reveal>
      <div className="ws-device">
        <svg viewBox="0 0 132 38" className="ws-lcd" role="img" aria-label={`Screen: ${lines.join(" / ").replace(/\{(\w+)\}/g, "[$1]")}`}>
          <rect className="pv-bezel" x="1" y="1" width="130" height="36" rx="4" />
          <rect className="pv-glass" x="5" y="5" width="122" height="28" rx="2" />
          <LcdLines lines={lines} x={8} y={8} cellW={7.25} cellH={9.5} gap={3} />
        </svg>
        <div className="ws-buttons" role="group" aria-label="Watch buttons">
          <button type="button" onPointerDown={sw1Down} onPointerUp={sw1Up} onPointerLeave={() => clearTimeout(holdTimer.current)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), press("SW1"))} data-on={last?.button === "SW1" ? "" : undefined}>
            SW1
          </button>
          {["SW2", "SW3", "B1"].map((b) => (
            <button key={b} type="button" onClick={() => press(b)} data-on={last?.button === b ? "" : undefined}>
              {b}
            </button>
          ))}
          <button type="button" className="ws-hold" onClick={() => press(next(pageRef.current, "SW1L") ? "SW1L" : "SW1")} data-on={last?.button === "SW1L" ? "" : undefined}>
            Hold SW1
          </button>
        </div>
        <div className="ws-help">
          <p className="al-mono">On {PAGES[page].label}</p>
          <ul>
            {exits.map(([, to, b]) => (
              <li key={b}>
                <b>{BTN_LABEL[b]}</b> → {PAGES[to].label}
              </li>
            ))}
            {actions.map(({ b, act }) => (
              <li key={b}>
                <b>{b}</b> {ACTION_TEXT[act]}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="ws-map-wrap">
        <svg viewBox="0 0 640 266" className="ws-map" role="img" aria-label={`Navigation map, currently on ${PAGES[page].label}`}>
          <NavMap
            box={MAP_BOX}
            font={13}
            padX={7}
            nodeClass={(id) => (id === page ? "ws-here" : exits.some(([, to]) => to === id) ? "ws-exit" : "")}
            linkClass={(a, b) => (last?.to && [a, b].sort().join() === [last.from, last.to].sort().join() ? "ws-travelled" : "")}
          />
          {exits.map(([, to, b]) => {
            const p = px(page);
            const q = px(to);
            const mx = p.x + (q.x - p.x) * 0.55;
            const my = p.y + (q.y - p.y) * 0.55;
            const label = BTN_LABEL[b];
            return (
              <g key={b} className="ws-chip">
                <rect x={mx - label.length * 4.2 - 5} y={my - 9} width={label.length * 8.4 + 10} height="18" rx="9" />
                <text x={mx} y={my + 4.5} textAnchor="middle">
                  {label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="cs-figcaption">
        <span>
          Try it: the buttons follow the user guide&rsquo;s navigation map exactly. Screen text is rebuilt from the guide&rsquo;s page descriptions and its readings are illustrative; the icons are the watch&rsquo;s real 5×8 CGRAM characters.
        </span>
        <span className="al-mono">Recreation</span>
      </figcaption>
    </figure>
  );
}
