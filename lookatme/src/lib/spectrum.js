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

/** The axis is cut into this many equal bins for the histogram and the brush. */
export const BINS = 20;
export const BIN_PCT = 100 / BINS; // 5

/** Which bin a 0–1 position falls in (1 itself lands in the last bin). */
export function binOf(value) {
  return Math.min(BINS - 1, Math.max(0, Math.floor(value * BINS)));
}

/** Project counts per bin, left to right. */
export function binCounts(values, bins = BINS) {
  const counts = new Array(bins).fill(0);
  for (const value of values) counts[Math.min(bins - 1, Math.max(0, Math.floor(value * bins)))] += 1;
  return counts;
}

const snap = (pct) => Math.round(pct / BIN_PCT) * BIN_PCT;

/**
 * A range is `{ from, to }` in whole percent, snapped to bin edges, with
 * from < to. Parse `?range=10-45`; anything malformed, empty, or covering the
 * whole axis means "no range" (null).
 */
export function parseRange(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{1,3})-(\d{1,3})$/.exec(value.trim());
  if (!match) return null;
  let [from, to] = [Number(match[1]), Number(match[2])].map((n) => snap(Math.min(100, Math.max(0, n))));
  if (from > to) [from, to] = [to, from];
  if (from === to || (from === 0 && to === 100)) return null;
  return { from, to };
}

/** The URL form of a range, or null for "everything". */
export function formatRange(range) {
  if (!range || (range.from <= 0 && range.to >= 100)) return null;
  return `${range.from}-${range.to}`;
}

/** Whether a 0–1 position falls inside a range, judged by bin like the histogram. */
export function inRange(value, range) {
  if (!range) return true;
  const bin = binOf(value);
  return bin >= range.from / BIN_PCT && bin < range.to / BIN_PCT;
}

/** Labels for the bands behind the axis, left to right, in bin-aligned percent. */
export const SPECTRUM_BANDS = [
  { id: "silicon", label: "Silicon & boards", from: 0, to: 35, fields: ["hardware", "fpga", "embedded"] },
  { id: "bridge", label: "Models & research", from: 35, to: 65, fields: ["research", "ml"] },
  { id: "software", label: "Software & web", from: 65, to: 100, fields: ["automation", "backend", "cloud", "frontend"] },
];

/** The band a range exactly matches, if any. */
export function bandFor(range) {
  if (!range) return null;
  return SPECTRUM_BANDS.find((band) => band.from === range.from && band.to === range.to) ?? null;
}

/** Human-readable range: the band's name, or "35–60%". */
export function describeRange(range) {
  if (!range) return null;
  return bandFor(range)?.label ?? `${range.from}–${range.to}%`;
}

export const KNOWN_FIELDS = FIELDS.map((field) => field.id);
