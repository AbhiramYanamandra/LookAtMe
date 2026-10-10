"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * The background page drawn as one circuit board.
 *
 * A single copper trace leaves the portrait caption, runs the left gutter,
 * and branches to everything on the record: a pad on every role, a feed into
 * every line on the time axis, a tap on every course mark, a drop onto every
 * field tile, and a terminal at the closing invitation. Scrolling conducts
 * current down it; each branch powers when the current passes its junction,
 * and drains when the visitor scrolls back up.
 *
 * Everything is routed from the live layout — elements opt in with
 * `data-circuit` — so the board re-routes on resize and a new role wires
 * itself. Routes use 45° chamfers only, like a real board.
 *
 * Cost discipline (the wordmark pulse's rule): one rAF loop runs only while
 * the current is moving and stops when it settles. Nothing runs at rest.
 * Reduced motion gets the board fully powered and still. Without JavaScript
 * there is no board at all, and the page is exactly what it was.
 */

const C = 9; // chamfer run, px
const MOBILE = 700;

/** Offset of `el` inside `root`, ignoring transforms (reveals move things). */
function offsetIn(el, root) {
  let x = 0;
  let y = 0;
  let node = el;
  while (node && node !== root) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

const pathOf = (points) => points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");

/** A branch leaving the spine at 45° and running right to `x2` at height `y`. */
function tapPoints(spineX, y, x2) {
  const run = Math.min(C, Math.max(0, x2 - spineX));
  return [[spineX, y - run], [spineX + run, y], [Math.max(spineX + run, x2), y]];
}

function route(root) {
  const mobile = window.innerWidth <= MOBILE;
  const pad = parseFloat(getComputedStyle(root).paddingLeft) || 34;
  const spineX = Math.round(pad / 2);
  const rootRect = root.getBoundingClientRect();

  const start = root.querySelector('[data-circuit="start"]');
  const hero = start?.closest("section");
  const end = root.querySelector('[data-circuit="end"]');
  if (!start || !hero || !end) return null;

  // The caption sits inside a rotated print, so it's measured as drawn.
  const cap = start.getBoundingClientRect();
  const sx = Math.round(cap.left - rootRect.left + 6);
  const sy = Math.round(cap.bottom - rootRect.top + 8);
  const runY = hero.offsetTop + hero.offsetHeight - 26;
  const endBox = offsetIn(end, root);
  const endY = Math.round(endBox.y + endBox.h / 2);

  const main = [
    [sx, sy],
    [sx, runY - C],
    [sx - C, runY],
    [spineX + C, runY],
    [spineX, runY + C],
    [spineX, endY],
  ];
  const lens = [0];
  for (let i = 1; i < main.length; i++) {
    lens.push(lens[i - 1] + Math.hypot(main[i][0] - main[i - 1][0], main[i][1] - main[i - 1][1]));
  }
  const spineStart = lens[4];
  const total = lens[5];
  const lengthAtSpineY = (y) => spineStart + Math.max(0, y - (runY + C));

  const branches = [];
  const pads = [];
  let u = 0;
  let r = 0;
  let j = 0;

  root.querySelectorAll("[data-circuit]").forEach((el) => {
    const kind = el.dataset.circuit;
    if (kind === "role") {
      const anchor = el.querySelector(".xp-when .al-mono") ?? el;
      const box = offsetIn(anchor, root);
      const y = Math.round(box.y + box.h / 2);
      u += 1;
      const service = el.dataset.circuitKind === "service";
      pads.push({
        x: spineX, y, at: lengthAtSpineY(y), service, el,
        silk: mobile ? null : `U${u} ${el.dataset.circuitLabel ?? ""}`.trim(),
      });
      branches.push({ d: pathOf([[spineX, y], [box.x - 6, y]]), at: lengthAtSpineY(y), el, end: null });
    } else if (kind === "bar") {
      const line = el.querySelector(".xp-bar-line") ?? el;
      const box = offsetIn(line, root);
      const y = Math.round(box.y + box.h / 2);
      // No drawn feed: a horizontal run on the bar's own line would read as
      // part of the bar and misstate the dates. The bar just powers in place.
      branches.push({ d: null, at: lengthAtSpineY(y), el, end: null });
    } else if (kind === "course") {
      const box = offsetIn(el, root);
      const y = Math.round(box.y + box.h / 2);
      const x2 = box.x - 8;
      const pts = tapPoints(spineX, y, x2);
      r += 1;
      branches.push({
        d: pathOf(pts), at: lengthAtSpineY(pts[0][1]), el,
        end: { x: x2, y, r: 2.4 },
        silk: !mobile && x2 - spineX > 60 ? { text: `R${r}`, x: (spineX + C + x2) / 2, y: y - 5 } : null,
      });
    }
  });

  // Field tiles: one bus per row of the grid, a drop onto each tile's top edge.
  const tiles = Array.from(root.querySelectorAll('[data-circuit="tile"]'));
  if (tiles.length) {
    if (mobile) {
      const box = offsetIn(tiles[0], root);
      const y = box.y - 12;
      pads.push({ x: spineX, y, at: lengthAtSpineY(y), service: false, el: tiles[0].parentElement, silk: null });
    } else {
      const rows = new Map();
      tiles.forEach((el) => {
        const box = offsetIn(el, root);
        if (!rows.has(box.y)) rows.set(box.y, []);
        rows.get(box.y).push({ el, box });
      });
      [...rows.entries()].sort((a, b) => a[0] - b[0]).forEach(([top, row], rowIndex) => {
        const busY = top - (rowIndex === 0 ? 16 : 13);
        const lastX = Math.max(...row.map(({ box }) => box.x + box.w / 2));
        const busPts = tapPoints(spineX, busY, lastX);
        const at = lengthAtSpineY(busPts[0][1]);
        // The bus powers first, then its drops in order along it.
        branches.push({ d: pathOf(busPts), at, el: null, end: null, bus: true });
        row.sort((a, b) => a.box.x - b.box.x).forEach(({ el, box }, i) => {
          j += 1;
          const x = Math.round(box.x + box.w / 2);
          branches.push({
            d: pathOf([[x, busY], [x, top - 1]]), at, el, delay: 90 + i * 70,
            end: { x, y: busY, r: 2.4, via: true },
            silk: { text: `J${j}`, x: x + 6, y: busY + (rowIndex === 0 ? 11 : 10) },
          });
        });
      });
    }
  }

  return {
    width: root.offsetWidth,
    height: root.offsetHeight,
    main: pathOf(main),
    points: main,
    lens,
    total,
    topRun: lens[4],
    branches,
    pads,
    terminal: { x: spineX, y: endY, el: end, at: total },
    mobile,
  };
}

/** Point at arc length `len` along the main trace. */
function pointAt(board, len) {
  const { points, lens } = board;
  for (let i = 1; i < points.length; i++) {
    if (len <= lens[i] || i === points.length - 1) {
      const t = Math.max(0, Math.min(1, (len - lens[i - 1]) / (lens[i] - lens[i - 1] || 1)));
      return [points[i - 1][0] + (points[i][0] - points[i - 1][0]) * t, points[i - 1][1] + (points[i][1] - points[i - 1][1]) * t];
    }
  }
  return points[0];
}

export function CircuitTrace() {
  const svgRef = useRef(null);
  const litRef = useRef(null);
  const glowRef = useRef(null);
  const headRef = useRef(null);
  const [board, setBoard] = useState(null);
  const state = useRef({ lit: 0, on: false, raf: 0, still: false });

  // Route from the live layout, and re-route whenever it changes.
  useLayoutEffect(() => {
    const root = svgRef.current?.parentElement;
    if (!root) return undefined;
    let frame = 0;
    const build = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setBoard(route(root)));
    };
    build();
    document.fonts?.ready.then(build);
    const observer = new ResizeObserver(build);
    observer.observe(root);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  // Conduct.
  useEffect(() => {
    if (!board) return undefined;
    const root = svgRef.current.parentElement;
    const s = state.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const branchEls = Array.from(svgRef.current.querySelectorAll("[data-branch]"));
    const padEls = Array.from(svgRef.current.querySelectorAll("[data-pad]"));
    const termEl = svgRef.current.querySelector("[data-terminal]");

    const targetLength = () => {
      const rootTop = root.getBoundingClientRect().top;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom) return board.total;
      const y = window.innerHeight * 0.62 - rootTop;
      const spineTop = board.points[4][1];
      const along = y <= spineTop ? board.topRun : board.topRun + (y - spineTop);
      return Math.max(board.topRun, Math.min(board.total, along));
    };

    const setPowered = (el, on) => {
      if (!el) return;
      if (on) el.setAttribute("data-powered", "");
      else el.removeAttribute("data-powered");
    };

    const paint = (lit) => {
      const off = String(board.total - lit);
      litRef.current?.setAttribute("stroke-dashoffset", off);
      glowRef.current?.setAttribute("stroke-dashoffset", off);
      board.branches.forEach((b, i) => {
        const on = lit >= b.at;
        const g = branchEls[i];
        if (g && g.hasAttribute("data-on") !== on) {
          g.toggleAttribute("data-on", on);
          setPowered(b.el, on);
        }
      });
      board.pads.forEach((p, i) => {
        const on = lit >= p.at;
        const g = padEls[i];
        if (g && g.hasAttribute("data-on") !== on) {
          g.toggleAttribute("data-on", on);
          setPowered(p.el, on);
        }
      });
      const done = lit >= board.total - 0.5;
      if (termEl && termEl.hasAttribute("data-on") !== done) {
        termEl.toggleAttribute("data-on", done);
        setPowered(board.terminal.el, done);
      }
      const [hx, hy] = pointAt(board, lit);
      headRef.current?.setAttribute("transform", `translate(${hx.toFixed(1)} ${hy.toFixed(1)})`);
    };

    if (reduced.matches) {
      s.lit = board.total;
      s.on = true;
      svgRef.current.setAttribute("data-still", "");
      paint(board.total);
      return undefined;
    }
    svgRef.current.removeAttribute("data-still");

    const tick = () => {
      const target = targetLength();
      const diff = target - s.lit;
      // Current flows fast downhill and drains a touch slower, so a quick
      // flick still reads as the current travelling rather than snapping.
      s.lit += diff * (diff > 0 ? 0.14 : 0.1);
      const moving = Math.abs(diff) > 0.6;
      if (!moving) s.lit = target;
      paint(s.lit);
      headRef.current?.toggleAttribute("data-moving", moving);
      s.raf = moving ? requestAnimationFrame(tick) : 0;
    };
    const wake = () => {
      if (s.on && !s.raf) s.raf = requestAnimationFrame(tick);
    };

    paint(s.lit);
    let powerTimer = 0;
    if (s.on) wake();
    else {
      // Power on once the hero's entrance has landed; it is the page's
      // arrival and nothing may compete with it.
      const heroInView = root.querySelector('[data-circuit="start"]').getBoundingClientRect().top < window.innerHeight;
      powerTimer = window.setTimeout(() => {
        s.on = true;
        wake();
      }, heroInView ? 1250 : 0);
    }

    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", wake);
    reduced.addEventListener("change", wake);

    // Touching a component sends a surge down its own branch.
    const surge = (event) => {
      if (event.pointerType !== "mouse") return;
      const host = event.target.closest?.("[data-circuit]");
      if (!host) return;
      board.branches.forEach((b, i) => {
        if (b.el !== host || !branchEls[i]?.hasAttribute("data-on")) return;
        const g = branchEls[i];
        g.removeAttribute("data-surge");
        void g.getBoundingClientRect();
        g.setAttribute("data-surge", "");
      });
    };
    root.addEventListener("pointerover", surge);

    return () => {
      window.clearTimeout(powerTimer);
      cancelAnimationFrame(s.raf);
      s.raf = 0;
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", wake);
      reduced.removeEventListener("change", wake);
      root.removeEventListener("pointerover", surge);
    };
  }, [board]);

  return (
    <svg
      ref={svgRef}
      className="ct"
      aria-hidden="true"
      focusable="false"
      width={board?.width ?? 0}
      height={board?.height ?? 0}
      viewBox={board ? `0 0 ${board.width} ${board.height}` : undefined}
    >
      {board && (
        <>
          <g className="ct-base">
            <path d={board.main} />
            {board.branches.map((b, i) => (b.d ? <path key={i} d={b.d} /> : null))}
          </g>
          <path ref={glowRef} className="ct-lit-glow" d={board.main} strokeDasharray={board.total} strokeDashoffset={board.total} />
          <circle className="ct-origin" cx={board.points[0][0]} cy={board.points[0][1]} r={3.2} />
          <path ref={litRef} className="ct-lit" d={board.main} strokeDasharray={board.total} strokeDashoffset={board.total} />
          {board.branches.map((b, i) => (
            <g key={i} className={`ct-branch${b.bus ? " ct-branch--bus" : ""}`} data-branch style={b.delay ? { "--ct-delay": `${b.delay}ms` } : undefined}>
              {b.d && (
                <>
                  <path d={b.d} pathLength="1" />
                  <path className="ct-surge" d={b.d} pathLength="1" />
                </>
              )}
              {b.end && (
                <>
                  {b.end.via && <circle className="ct-via" cx={b.end.x} cy={b.end.y} r={b.end.r + 2.4} />}
                  <circle className="ct-end" cx={b.end.x} cy={b.end.y} r={b.end.r} />
                </>
              )}
              {b.silk && <text className="ct-silk" x={b.silk.x} y={b.silk.y}>{b.silk.text}</text>}
            </g>
          ))}
          {board.pads.map((p, i) => (
            <g key={i} className={`ct-pad${p.service ? " ct-pad--service" : ""}`} data-pad>
              {!p.service && <circle className="ct-via" cx={p.x} cy={p.y} r={7.5} />}
              <circle className="ct-end" cx={p.x} cy={p.y} r={p.service ? 3 : 4.2} />
              {p.silk && (
                <text className="ct-silk ct-silk--v" transform={`translate(${p.x - 9} ${p.y - 14}) rotate(-90)`}>{p.silk}</text>
              )}
            </g>
          ))}
          <g className="ct-terminal" data-terminal>
            <circle className="ct-via" cx={board.terminal.x} cy={board.terminal.y} r={10} />
            <circle className="ct-ring" cx={board.terminal.x} cy={board.terminal.y} r={5.5} />
            {!board.mobile && (
              <text className="ct-silk ct-silk--v" transform={`translate(${board.terminal.x - 9} ${board.terminal.y - 18}) rotate(-90)`}>P1 OUT</text>
            )}
          </g>
          <g ref={headRef} className="ct-head">
            <circle r="15" className="ct-head-atmos" />
            <circle r="6" className="ct-head-blue" />
            <circle r="2.2" className="ct-head-core" />
          </g>
        </>
      )}
    </svg>
  );
}
