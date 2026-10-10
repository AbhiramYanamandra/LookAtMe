import { ICONS, MAP_BOUNDS, PAGES, lcdCells, links } from "@/lib/smartwatch";

/** A 5×8 CGRAM icon drawn dot by dot inside one character cell. */
export function LcdIcon({ name, x, y, w, h }) {
  const bm = ICONS[name];
  if (!bm) return null;
  const dw = w / 5;
  const dh = h / 8;
  const dots = [];
  bm.forEach((row, r) =>
    [...row].forEach((bit, c) => {
      if (bit === "1") dots.push(<rect key={`${r}-${c}`} x={x + c * dw + dw * 0.08} y={y + r * dh + dh * 0.08} width={dw * 0.84} height={dh * 0.84} />);
    })
  );
  return <g className="sw-icon">{dots}</g>;
}

/** Two 16-character rows; text in the mono face, icons as dot matrices. */
export function LcdLines({ lines, x, y, cellW, cellH, gap = 2 }) {
  return (
    <g className="sw-lcd-lines">
      {lines.map((line, r) =>
        lcdCells(line).map((cell, c) => {
          const cx = x + c * cellW;
          const cy = y + r * (cellH + gap);
          return cell.icon ? (
            <LcdIcon key={`${r}-${c}`} name={cell.icon} x={cx + cellW * 0.08} y={cy} w={cellW * 0.84} h={cellH} />
          ) : cell.ch !== " " ? (
            <text key={`${r}-${c}`} x={cx + cellW / 2} y={cy + cellH * 0.86} textAnchor="middle" style={{ fontSize: cellH * 1.05 }}>
              {cell.ch}
            </text>
          ) : null;
        })
      )}
    </g>
  );
}

/** Scale the guide's diagram coordinates into a box. */
export function mapScale(box) {
  const { x0, y0, x1, y1 } = MAP_BOUNDS;
  const s = Math.min(box.w / (x1 - x0), box.h / (y1 - y0));
  const ox = box.x + (box.w - (x1 - x0) * s) / 2;
  const oy = box.y + (box.h - (y1 - y0) * s) / 2;
  return { s, px: (id) => ({ x: ox + (PAGES[id].x - x0) * s, y: oy + (PAGES[id].y - y0) * s }) };
}

/**
 * The navigation map: one line per connected pair, one labelled box per page.
 * `nodeClass(id)` and `linkClass(a, b)` let callers highlight state.
 */
export function NavMap({ box, font = 5, padX = 2.4, nodeH, nodeClass = () => "", linkClass = () => "", nodeProps = () => ({}) }) {
  const { px } = mapScale(box);
  const h = nodeH ?? font * 1.9;
  return (
    <g className="sw-map">
      {links().map(([a, b]) => {
        const p = px(a);
        const q = px(b);
        return <line key={`${a}-${b}`} className={`sw-link ${linkClass(a, b)}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} />;
      })}
      {Object.keys(PAGES).map((id) => {
        const { x, y } = px(id);
        const w = PAGES[id].short.length * font * 0.62 + padX * 2;
        return (
          <g key={id} className={`sw-node ${nodeClass(id)}`} {...nodeProps(id)}>
            <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h / 2.6} />
            <text x={x} y={y + font * 0.36} textAnchor="middle" style={{ fontSize: font }}>
              {PAGES[id].short}
            </text>
          </g>
        );
      })}
    </g>
  );
}
