/**
 * Wordmark pen-path tooling (not part of the site build).
 *
 * Snaps the hand-authored `skeleton.json` (font units, y up) onto the centre
 * of each stroke of the real Pacifico outlines, reports brush coverage, and
 * writes `../../src/lib/wordmark-path.js`. Run from this folder with fontkit
 * installed:  npm i --no-save fontkit && node scripts/wordmark/snap.cjs
 */
const fontkit = require("fontkit");
const fs = require("fs");
const path = require("path");
const font = fontkit.openSync(path.join(__dirname, "../../src/fonts/pacifico.woff2"));
const run = font.layout("Abhiram");
const LS = -55;
// Flatten glyph contours into polygons (font units, y up)
function flatten(path, dx) {
  const polys = []; let cur = null; let last = [0, 0];
  for (const c of path.commands) {
    if (c.command === "moveTo") { cur = [[c.args[0] + dx, c.args[1]]]; polys.push(cur); last = [c.args[0] + dx, c.args[1]]; }
    else if (c.command === "lineTo") { last = [c.args[0] + dx, c.args[1]]; cur.push(last); }
    else if (c.command === "quadraticCurveTo") { const [cx, cy, x, y] = c.args; for (let t = 0.1; t <= 1.001; t += 0.1) { const u = 1 - t; cur.push([u*u*last[0] + 2*u*t*(cx+dx) + t*t*(x+dx), u*u*last[1] + 2*u*t*cy + t*t*y]); } last = [x + dx, y]; }
    else if (c.command === "bezierCurveTo") { const [c1x, c1y, c2x, c2y, x, y] = c.args; for (let t = 0.1; t <= 1.001; t += 0.1) { const u = 1 - t; cur.push([u*u*u*last[0] + 3*u*u*t*(c1x+dx) + 3*u*t*t*(c2x+dx) + t*t*t*(x+dx), u*u*u*last[1] + 3*u*u*t*c1y + 3*u*t*t*c2y + t*t*t*y]); } last = [x + dx, y]; }
    else if (c.command === "closePath") { cur = null; }
  }
  return polys;
}
let x = 0; const polys = [];
for (let i = 0; i < run.glyphs.length; i++) { polys.push(...flatten(run.glyphs[i].path, x)); x += run.positions[i].xAdvance + LS; }
// Raster grid
const CELL = 8, X0 = -50, X1 = 3400, Y0 = -100, Y1 = 1000;
const W = Math.ceil((X1 - X0) / CELL), H = Math.ceil((Y1 - Y0) / CELL);
const inside = new Uint8Array(W * H);
function pip(px, py) { let c = 0; for (const poly of polys) { for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) c++; } } return c & 1; }
for (let gy = 0; gy < H; gy++) for (let gx = 0; gx < W; gx++) inside[gy * W + gx] = pip(X0 + (gx + 0.5) * CELL, Y0 + (gy + 0.5) * CELL);
// Distance to outside (chamfer)
const dist = new Float32Array(W * H).fill(1e9);
for (let i = 0; i < W * H; i++) if (!inside[i]) dist[i] = 0;
const pass = (fwd) => { for (let k = 0; k < W * H; k++) { const i = fwd ? k : W * H - 1 - k; const gx = i % W, gy = (i / W) | 0; const n = fwd ? [[-1,0,1],[0,-1,1],[-1,-1,1.414],[1,-1,1.414]] : [[1,0,1],[0,1,1],[1,1,1.414],[-1,1,1.414]]; for (const [ox, oy, w] of n) { const nx = gx + ox, ny = gy + oy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const d = dist[ny * W + nx] + w; if (d < dist[i]) dist[i] = d; } } };
pass(true); pass(false);
const at = (ux, uy) => { const gx = Math.round((ux - X0) / CELL - 0.5), gy = Math.round((uy - Y0) / CELL - 0.5); if (gx < 0 || gy < 0 || gx >= W || gy >= H) return 0; return dist[gy * W + gx] * CELL; };
// Snap a point to the local medial maximum within radius R
function snap([ux, uy], R = 90) { let best = [ux, uy], bd = -1; for (let dy = -R; dy <= R; dy += CELL) for (let dx = -R; dx <= R; dx += CELL) { if (dx * dx + dy * dy > R * R) continue; const d = at(ux + dx, uy + dy) - Math.hypot(dx, dy) * 0.25; if (d > bd) { bd = d; best = [ux + dx, uy + dy]; } } return best; }
const skel = JSON.parse(fs.readFileSync(path.join(__dirname, "skeleton.json"), "utf8"));
const out = {};
for (const k of ["A", "b", "h", "i", "r", "a", "m"]) {
  // densify then snap then smooth
  const pts = skel[k]; const dense = [];
  for (let i = 0; i < pts.length - 1; i++) { const [ax, ay] = pts[i], [bx, by] = pts[i + 1]; const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / 30)); for (let s = 0; s < n; s++) dense.push([ax + (bx - ax) * s / n, ay + (by - ay) * s / n]); }
  dense.push(pts[pts.length - 1]);
  const snapped = dense.map((p) => snap(p));
  const smooth = snapped.map((p, i) => { const a = snapped[Math.max(0, i - 2)], b = snapped[Math.max(0, i - 1)], c = snapped[Math.min(snapped.length - 1, i + 1)], d = snapped[Math.min(snapped.length - 1, i + 2)]; return [Math.round((a[0] + b[0] + p[0] + c[0] + d[0]) / 5), Math.round((a[1] + b[1] + p[1] + c[1] + d[1]) / 5)]; });
  // thin out: keep every ~45 units
  const thin = [smooth[0]]; for (const p of smooth) { const q = thin[thin.length - 1]; if (Math.hypot(p[0] - q[0], p[1] - q[1]) >= 45) thin.push(p); } if (thin[thin.length-1] !== smooth[smooth.length-1]) thin.push(smooth[smooth.length - 1]);
  out[k] = thin;
}
out.dot = skel.dot;
// Report stroke half-thickness stats along the path
let ds = []; for (const k of ["A","b","h","i","r","a","m"]) for (const p of out[k]) ds.push(at(p[0], p[1]));
ds.sort((a,b)=>a-b); console.error("medial distance min/median/max:", ds[0], ds[ds.length>>1], ds[ds.length-1], "points:", ds.length);
const em = {
  advance: 3.279,
  ascent: 1.303,
  descent: 0.453,
  lineHeight: 1.5,
  dot: [+(out.dot[0] / 1000).toFixed(3), +(-out.dot[1] / 1000).toFixed(3), +(out.dot[2] / 1000).toFixed(3)],
  strokes: ["A", "b", "h", "i", "r", "a", "m"].map((k) => out[k].map(([x, y]) => [+(x / 1000).toFixed(3), +(-y / 1000).toFixed(3)])),
};
fs.writeFileSync(
  path.join(__dirname, "../../src/lib/wordmark-path.js"),
  "/**\n * Pen path for the \"Abhiram\" wordmark, authored on the bundled Pacifico\n * outlines (see src/lib/wordmark.js). Units: em (font units / 1000), y down.\n * Regenerate with scripts/wordmark/snap.js if the wordmark text or font changes.\n */\nconst wordmarkPath = " + JSON.stringify(em) + ";\n\nexport default wordmarkPath;\n",
);
let frag = "";
for (const k of ["A","b","h","i","r","a","m"]) { const pts = out[k].map((p) => p[0] + "," + -p[1]).join(" "); frag += `<polyline points="${pts}" fill="none" stroke="#e0303055" stroke-width="180" stroke-linecap="round" stroke-linejoin="round"/><polyline points="${pts}" fill="none" stroke="#900" stroke-width="5"/>`; }
frag += `<circle cx="${out.dot[0]}" cy="${-out.dot[1]}" r="${out.dot[2]}" fill="#e03030a0"/>`;
fs.writeFileSync(path.join(__dirname, "overlay.svgfrag"), frag); // paste into an SVG over the outlines to inspect

// Coverage check: fraction of inside cells within radius r of the polyline union.
function coverage(r) {
  const pts = []; for (const k of ["A","b","h","i","r","a","m"]) pts.push(...out[k]); pts.push([out.dot[0], out.dot[1]]);
  let total = 0, covered = 0; const gaps = [];
  for (let gy = 0; gy < H; gy++) for (let gx = 0; gx < W; gx++) { if (!inside[gy * W + gx]) continue; total++;
    const ux = X0 + (gx + 0.5) * CELL, uy = Y0 + (gy + 0.5) * CELL; let ok = false;
    for (const [px, py] of pts) { if ((px - ux) ** 2 + (py - uy) ** 2 <= r * r) { ok = true; break; } }
    if (ok) covered++; else gaps.push([Math.round(ux), Math.round(uy)]);
  }
  return { pct: (100 * covered / total).toFixed(1), gaps };
}
for (const r of [90, 120, 150]) { const c = coverage(r); const gaps = c.gaps;
  // cluster gaps coarsely by 100-unit buckets
  const buckets = new Map(); for (const [x, y] of gaps) { const k = `${Math.floor(x / 100) * 100},${Math.floor(y / 100) * 100}`; buckets.set(k, (buckets.get(k) || 0) + 1); }
  const top = [...buckets.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, n]) => `${k}(${n})`).join(" ");
  console.error(`r=${r}: ${c.pct}% covered; worst gap buckets: ${top}`);
}
