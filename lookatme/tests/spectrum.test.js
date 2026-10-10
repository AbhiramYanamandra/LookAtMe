import test from "node:test";
import assert from "node:assert/strict";
import { SPECTRUM_BANDS, beeswarm, spectrumOf } from "../src/lib/spectrum.js";

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

test("the beeswarm never overlaps, keeps x, and keeps input order", () => {
  const values = [0.12, 0.1, 0.11, 0.5, 0.5, 0.5, 0.9, 0.2];
  const radius = 7;
  const points = beeswarm(values, { radius, width: 400 });
  assert.equal(points.length, values.length);
  points.forEach((point, i) => assert.equal(point.x, values[i] * 400));
  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const distance = Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y);
      assert.ok(distance >= radius * 2 - 0.01, `dots ${i} and ${j} overlap (${distance})`);
    }
  }
});

test("the beeswarm is deterministic and a lone dot sits on the axis", () => {
  assert.deepEqual(beeswarm([0.3, 0.3, 0.3]), beeswarm([0.3, 0.3, 0.3]));
  assert.deepEqual(beeswarm([0.4])[0], { x: 40, y: 0 });
});

test("spectrum bands tile the axis from end to end", () => {
  assert.equal(SPECTRUM_BANDS[0].from, 0);
  assert.equal(SPECTRUM_BANDS.at(-1).to, 1);
  SPECTRUM_BANDS.slice(1).forEach((band, i) => assert.equal(band.from, SPECTRUM_BANDS[i].to));
});
