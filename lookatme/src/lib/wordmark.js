/**
 * Geometry of the "Abhiram" wordmark, used by the droplet entrance.
 *
 * `wordmark-path.json` holds a pen path authored on the bundled Pacifico
 * outlines (font units ÷ 1000, y down, x from the text start): one polyline
 * per letter in writing order, snapped to the centre of each stroke, plus
 * the position and radius of the dot on the "i". The lettering itself stays
 * the real <h1> text; only the reveal follows this path.
 */
import data from "./wordmark-path.js";

export const WORDMARK = data;

/** Radius of the reveal brush along the strokes, and after the final swell (em). */
export const BRUSH_RADIUS = 0.11;
export const BRUSH_SWELL_RADIUS = 0.155;

/**
 * Map em coordinates to CSS pixels inside the wordmark's own box (before its
 * rotation). The text is centred horizontally; vertically the font's content
 * area (typo ascent + descent) is centred inside the 1.5em line box, which
 * is what browsers do with Pacifico's USE_TYPO_METRICS flag set.
 */
export function wordmarkFrame({ width, height, fontSize }) {
  const textWidth = data.advance * fontSize;
  const contentArea = (data.ascent + data.descent) * fontSize;
  return {
    fontSize,
    x0: (width - textWidth) / 2,
    baseline: (height - contentArea) / 2 + data.ascent * fontSize,
  };
}

export function toPixels(frame, [xEm, yEm]) {
  return [frame.x0 + xEm * frame.fontSize, frame.baseline + yEm * frame.fontSize];
}

/**
 * Brush stamps in writing order, each tagged with its "flow distance" from
 * the i-dot: the distance (em) travelled along the pen path from the point on
 * the i-stem beneath the dot, so the reveal can spread both ways from the
 * impact. Stamps are spaced at ~0.4 × brush radius so their union is smooth.
 */
export function brushStamps() {
  const spacing = BRUSH_RADIUS * 0.4;
  const path = [];
  let jump = false;
  for (const stroke of data.strokes) {
    for (let i = 0; i < stroke.length; i += 1) path.push({ p: stroke[i], jump: jump && i === 0 });
    jump = true;
  }
  // Cumulative distance along the whole path (letter joins count as continuous
  // — the letters are joined in this script face — pen lifts count as zero).
  const samples = [];
  let s = 0;
  for (let i = 0; i < path.length; i += 1) {
    const { p, jump: lift } = path[i];
    if (i === 0) {
      samples.push({ p, s });
      continue;
    }
    const q = path[i - 1].p;
    const len = lift ? 0 : Math.hypot(p[0] - q[0], p[1] - q[1]);
    if (len === 0) {
      samples.push({ p, s });
      continue;
    }
    const n = Math.max(1, Math.ceil(len / spacing));
    for (let k = 1; k <= n; k += 1) {
      const t = k / n;
      samples.push({ p: [q[0] + (p[0] - q[0]) * t, q[1] + (p[1] - q[1]) * t], s: s + len * t });
    }
    s += len;
  }
  // The origin is the sample closest to the dot (top of the i-stem).
  const [dx, dy] = data.dot;
  let origin = samples[0];
  let best = Infinity;
  for (const sample of samples) {
    const d = Math.hypot(sample.p[0] - dx, sample.p[1] - dy);
    if (d < best) {
      best = d;
      origin = sample;
    }
  }
  const stamps = samples.map((sample) => ({ p: sample.p, flow: Math.abs(sample.s - origin.s) }));
  const maxFlow = Math.max(...stamps.map((stamp) => stamp.flow));
  // Balance the two branches: the shorter right branch must not finish in
  // the first few frames while the A is still missing. Leave the final 12%
  // for each brush tip to grow continuously to its full radius.
  const leftLength = origin.s;
  const rightLength = s - origin.s;
  stamps.forEach((stamp, i) => {
    const length = samples[i].s <= origin.s ? leftLength : rightLength;
    stamp.arrival = length > 0 ? (stamp.flow / length) * .88 : 0;
  });
  return { stamps, maxFlow };
}
