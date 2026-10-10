/**
 * Measured numbers for the COMP4601 HOG accelerator, from the final report's
 * C-Synth stage table, version table and board runs. Per-image HOG data for the
 * visuals lives in hog-data-images.js (generated, checked against the course
 * reference output).
 */
export { HOG_IMAGES } from "./hog-data-images";

/** The final (v10) six-stage dataflow region, in pipeline order. */
export const STAGES = [
  { id: "load", name: "load_image", label: "Load", cycles: 64, lut: "~0%", shows: "raw" },
  { id: "norm", name: "normalize_image", label: "Normalise", cycles: 621, lut: "12%", shows: "norm" },
  { id: "grad", name: "compute_gradients", label: "Gradients", cycles: 583, lut: "6%", shows: "mag" },
  { id: "cells", name: "compute_cells", label: "Cells", cycles: 301, lut: "32%", shows: "glyphs" },
  { id: "block", name: "block_normalize", label: "Block norm", cycles: 388, lut: "11%", shows: "glyphs" },
  { id: "store", name: "store_feat", label: "Store", cycles: 18, lut: "~0%", shows: "features" },
];

/** Steady-state interval: one image leaves the region every 622 cycles. */
export const INTERVAL = 622;
/** One image's trip through the whole region, first read to last write. */
export const LATENCY = 2128;
export const CLOCK_MHZ = 200;

/** Cycles per image (C-Synth) and board-measured kernel speedup per version. */
export const VERSIONS = [
  { v: "v5", what: "Batched, 16-wide bursts", cycles: 4175, speedup: 20.16, lut: 51 },
  { v: "v6", what: "3-wide sqrt", cycles: 3063, speedup: null, lut: 92, reverted: true },
  { v: "v7", what: "Per-cell energies", cycles: 3058, speedup: null, lut: 60 },
  { v: "v8", what: "2-wide normalise", cycles: 2547, speedup: null, lut: 65 },
  { v: "v9", what: "Six-stage dataflow", cycles: 1034, speedup: 81.47, lut: 64 },
  { v: "v10", what: "2-wide gradients", cycles: 622, speedup: 135.5, lut: 66 },
];
