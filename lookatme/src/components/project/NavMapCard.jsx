import { BUTTONS, CARD_ROUTE, PAGES } from "@/lib/smartwatch";
import { LcdLines, NavMap, mapScale } from "./SmartwatchParts";

/**
 * Library card for the smartwatch: the user guide's navigation map, toured on
 * a loop. Each step presses the button the map says leads to the next page;
 * the pressed button lights, the travelled link glows, the page highlights and
 * the 16×2 LCD shows that page. CSS keyframes are generated from the route.
 */
const STEP = 1.15;
const MAP_BOX = { x: 4, y: 48, w: 232, h: 98 };
const FONT = 5.2;

const SLOTS = CARD_ROUTE.map((s) => (typeof s === "string" ? { page: s, button: null } : { page: s[1], button: s[0] }));
const N = SLOTS.length;
const pct = (slot) => ((slot / N) * 100).toFixed(3);

/** Opacity keyframes that are 1 during [slot + from, slot + to) for each slot listed. */
function windows(slots, from = 0, to = 1) {
  const f = ["0%{opacity:0}"];
  slots.forEach((s) => {
    f.push(`${pct(s + from)}%{opacity:0}`, `${pct(s + from + 0.001)}%{opacity:1}`, `${pct(s + to - 0.001)}%{opacity:1}`, `${pct(s + to)}%{opacity:0}`);
  });
  f.push("100%{opacity:0}");
  return f.join("");
}

export function NavMapCard() {
  const dur = (N * STEP).toFixed(2);
  const pages = [...new Set(SLOTS.map((s) => s.page))];
  const { px } = mapScale(MAP_BOX);
  const nodeH = FONT * 1.9;
  let css = "";
  const anim = (cls, name, frames) => {
    css += `@keyframes ${name}{${frames}}.pv-nav .${cls}{animation:${name} ${dur}s linear infinite}`;
  };
  pages.forEach((id) => {
    const on = SLOTS.map((s, i) => (s.page === id ? i : -1)).filter((i) => i >= 0);
    anim(`swc-node-${id}`, `swc-node-${id}`, windows(on));
    anim(`swc-lcd-${id}`, `swc-lcd-${id}`, windows(on));
  });
  BUTTONS.forEach((b) => {
    const on = SLOTS.map((s, i) => (s.button === b ? i : -1)).filter((i) => i >= 0);
    anim(`swc-btn-${b}`, `swc-btn-${b}`, windows(on, 0, 0.32));
  });
  const hops = new Map();
  SLOTS.forEach((s, i) => {
    if (!s.button) return;
    const key = [SLOTS[i - 1].page, s.page].sort().join("-");
    hops.set(key, [...(hops.get(key) ?? []), i]);
  });
  hops.forEach((slots, key) => anim(`swc-hop-${key}`, `swc-hop-${key}`, windows(slots, 0, 0.55)));

  return (
    <svg viewBox="0 0 240 150" className="pv pv-nav">
      <style>{css}</style>
      <rect className="pv-bezel" x="4" y="4" width="128" height="38" rx="4" />
      <rect className="pv-glass" x="8" y="8" width="120" height="30" rx="2" />
      {pages.map((id) => (
        <g key={id} className={`swc-lcd swc-lcd-${id}`}>
          <LcdLines lines={PAGES[id].lcd} x={10} y={11} cellW={7.25} cellH={10} gap={3} />
        </g>
      ))}
      {BUTTONS.map((b, i) => (
        <g key={b} transform={`translate(${140 + i * 24} 16)`}>
          <rect className="swc-key" width="22" height="14" rx="4" />
          <text className="swc-key-label" x="11" y="9.6" textAnchor="middle">
            {b}
          </text>
          <g className={`swc-key-on swc-btn-${b}`}>
            <rect width="22" height="14" rx="4" />
            <text x="11" y="9.6" textAnchor="middle">
              {b}
            </text>
          </g>
        </g>
      ))}
      <NavMap box={MAP_BOX} font={FONT} nodeH={nodeH} />
      {[...hops.keys()].map((key) => {
        const [a, b] = key.split("-");
        const p = px(a);
        const q = px(b);
        return <line key={key} className={`swc-hop swc-hop-${key}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} />;
      })}
      {pages.map((id) => {
        const { x, y } = px(id);
        const w = PAGES[id].short.length * FONT * 0.62 + 4.8;
        return (
          <g key={id} className={`swc-node swc-node-${id}`}>
            <rect x={x - w / 2} y={y - nodeH / 2} width={w} height={nodeH} rx={nodeH / 2.6} />
            <text x={x} y={y + FONT * 0.36} textAnchor="middle" style={{ fontSize: FONT }}>
              {PAGES[id].short}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
