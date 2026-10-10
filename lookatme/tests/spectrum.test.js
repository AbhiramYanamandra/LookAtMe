import test from "node:test";
import assert from "node:assert/strict";
import { BINS, BIN_PCT, SPECTRUM_BANDS, bandFor, binCounts, describeRange, formatRange, inRange, parseRange, spectrumOf } from "../src/lib/spectrum.js";

test("an explicit spectrum value wins and is clamped", () => {
  assert.equal(spectrumOf({ spectrum: 0.3, fields: ["frontend"] }), 0.3);
  assert.equal(spectrumOf({ spectrum: 4, fields: [] }), 1);
  assert.equal(spectrumOf({ spectrum: -1, fields: [] }), 0);
});

test("without one, the position comes from the fields and defaults to the middle", () => {
  assert.ok(spectrumOf({ fields: ["hardware"] }) < 0.2);
  assert.ok(spectrumOf({ fields: ["frontend"] }) > 0.9);
  const mixed = spectrumOf({ fields: ["fpga", "ml"] });
  assert.ok(mixed > spectrumOf({ fields: ["fpga"] }) && mixed < spectrumOf({ fields: ["ml"] }));
  assert.equal(spectrumOf({ fields: [] }), 0.5);
});

test("binCounts places every value in a bin, including both ends", () => {
  const counts = binCounts([0, 0.02, 0.5, 0.97, 1]);
  assert.equal(counts.length, BINS);
  assert.equal(counts.reduce((a, b) => a + b, 0), 5);
  assert.equal(counts[0], 2);
  assert.equal(counts[10], 1);
  assert.equal(counts[BINS - 1], 2);
});

test("parseRange accepts bin-aligned ranges and rejects everything else", () => {
  assert.deepEqual(parseRange("10-45"), { from: 10, to: 45 });
  assert.deepEqual(parseRange("45-10"), { from: 10, to: 45 }, "swapped ends are put in order");
  assert.deepEqual(parseRange("12-48"), { from: 10, to: 50 }, "snaps to 5% bins");
  assert.deepEqual(parseRange("10-250"), { from: 10, to: 100 }, "clamps past the end");
  assert.equal(parseRange("0-250"), null, "clamped to the whole axis, so no range");
  assert.equal(parseRange("0-100"), null, "the whole axis is no range");
  assert.equal(parseRange("30-30"), null);
  for (const bad of ["abc", "", "10", "-5-20", "10-20-30", undefined, 12]) assert.equal(parseRange(bad), null);
});

test("formatRange round-trips and drops the full axis", () => {
  assert.equal(formatRange({ from: 10, to: 45 }), "10-45");
  assert.deepEqual(parseRange(formatRange({ from: 35, to: 65 })), { from: 35, to: 65 });
  assert.equal(formatRange({ from: 0, to: 100 }), null);
  assert.equal(formatRange(null), null);
});

test("inRange judges by bin, matching the histogram", () => {
  const r = { from: 10, to: 45 };
  assert.equal(inRange(0.1, r), true);
  assert.equal(inRange(0.44, r), true);
  assert.equal(inRange(0.45, r), false, "0.45 is in the bin that starts at 45%");
  assert.equal(inRange(0.09, r), false);
  assert.equal(inRange(1, { from: 95, to: 100 }), true);
  assert.equal(inRange(0.5, null), true);
});

test("bandFor and describeRange name exact bands only", () => {
  assert.equal(bandFor({ from: 0, to: 35 }).id, "silicon");
  assert.equal(bandFor({ from: 0, to: 30 }), null);
  assert.equal(describeRange({ from: 35, to: 65 }), "Models & research");
  assert.equal(describeRange({ from: 20, to: 40 }), "20–40%");
});

test("spectrum bands tile the axis on bin edges", () => {
  assert.equal(SPECTRUM_BANDS[0].from, 0);
  assert.equal(SPECTRUM_BANDS.at(-1).to, 100);
  SPECTRUM_BANDS.slice(1).forEach((band, i) => assert.equal(band.from, SPECTRUM_BANDS[i].to));
  SPECTRUM_BANDS.forEach((band) => assert.equal(band.from % BIN_PCT + band.to % BIN_PCT, 0));
});
