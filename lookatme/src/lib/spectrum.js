/**
 * The hardware-to-software spectrum on the Work page: each project sits at a
 * position from 0 (hardware) to 1 (software). Pure helpers, no DOM.
 */
import { FIELDS } from "../content/fields.js";

/** Default position per engineering field, used when a project sets none. */
const FIELD_POSITION = {
  hardware: 0.1,
  fpga: 0.22,
  embedded: 0.28,
  research: 0.42,
  ml: 0.55,
  automation: 0.8,
  backend: 0.82,
  cloud: 0.88,
  frontend: 0.96,
};

/** A project's place on the spectrum: its own `spectrum`, else the mean of its fields', else the middle. */
export function spectrumOf(project) {
  if (Number.isFinite(project.spectrum)) return Math.min(1, Math.max(0, project.spectrum));
  const known = (project.fields ?? []).map((id) => FIELD_POSITION[id]).filter((value) => value !== undefined);
  if (known.length === 0) return 0.5;
  return known.reduce((sum, value) => sum + value, 0) / known.length;
}

/**
 * Lay dots out along the axis without overlap (a "beeswarm"): each dot keeps
 * its x (value * width) and is pushed up or down just enough to clear the dots
 * already placed. Returns `{ x, y }` in the same order as `values`, y measured
 * from the axis (0 = on the axis, alternating above and below).
 */
export function beeswarm(values, { radius = 7, width = 100 } = {}) {
  const placed = [];
  const order = values.map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value || a.index - b.index);
  const out = new Array(values.length);
  for (const { value, index } of order) {
    const x = value * width;
    const diameter = radius * 2;
    let y = 0;
    for (let step = 0; step < 200; step += 1) {
      // 0, +d/2, -d/2, +d, -d, ... outward from the axis.
      const offset = step === 0 ? 0 : Math.ceil(step / 2) * (diameter / 2) * (step % 2 === 1 ? 1 : -1);
      y = offset;
      if (placed.every((dot) => Math.hypot(dot.x - x, dot.y - y) >= diameter - 0.001)) break;
    }
    placed.push({ x, y });
    out[index] = { x, y };
  }
  return out;
}

/** Labels for the bands behind the axis, left to right. */
export const SPECTRUM_BANDS = [
  { id: "silicon", label: "Silicon & boards", from: 0, to: 0.33, fields: ["hardware", "fpga", "embedded"] },
  { id: "bridge", label: "Models & research", from: 0.33, to: 0.66, fields: ["research", "ml"] },
  { id: "software", label: "Software & web", from: 0.66, to: 1, fields: ["automation", "backend", "cloud", "frontend"] },
];

export const KNOWN_FIELDS = FIELDS.map((field) => field.id);
