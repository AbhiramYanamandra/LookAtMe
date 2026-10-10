import test from "node:test";
import assert from "node:assert/strict";
import { RESIDUAL, applyError, dctMatrix, gaussian, meanAbsoluteError, mulberry32, strengthFor, unitError } from "../src/lib/noisy-multiply.js";

const W = 32;
const H = 24;
const gradient = Float32Array.from({ length: W * H }, (_, i) => 0.2 + 0.6 * (((i % W) + Math.floor(i / W)) / (W + H)));

test("the DCT matrix is orthonormal", () => {
  const D = dctMatrix();
  for (let a = 0; a < 8; a += 1) {
    for (let b = 0; b < 8; b += 1) {
      const dot = D[a].reduce((sum, value, i) => sum + value * D[b][i], 0);
      assert.ok(Math.abs(dot - (a === b ? 1 : 0)) < 1e-12);
    }
  }
});

test("the noise generator is deterministic and roughly standard normal", () => {
  const draw = (seed) => {
    const random = mulberry32(seed);
    return Array.from({ length: 4000 }, () => gaussian(random));
  };
  assert.deepEqual(draw(7), draw(7));
  const sample = draw(3);
  const mean = sample.reduce((a, b) => a + b, 0) / sample.length;
  const variance = sample.reduce((a, b) => a + (b - mean) ** 2, 0) / sample.length;
  assert.ok(Math.abs(mean) < 0.08);
  assert.ok(Math.abs(variance - 1) < 0.1);
});

test("zero noise strength returns the picture unchanged", () => {
  const error = unitError(gradient, W, H, 5);
  assert.equal(meanAbsoluteError(applyError(gradient, error, 0), gradient), 0);
});

test("the error is signal-dependent: a black picture has none", () => {
  const black = new Float32Array(W * H);
  const error = unitError(black, W, H, 5);
  assert.ok(error.every((value) => value === 0));
});

test("error grows with the noise slider and is deterministic", () => {
  const error = unitError(gradient, W, H, 9);
  assert.deepEqual(error, unitError(gradient, W, H, 9));
  const low = meanAbsoluteError(applyError(gradient, error, strengthFor(5)), gradient);
  const high = meanAbsoluteError(applyError(gradient, error, strengthFor(25)), gradient);
  assert.ok(high > low * 3);
});

test("the corrected output keeps about 4.5% of the baseline error (the 95.5% reduction)", () => {
  const error = unitError(gradient, W, H, 11);
  const strength = strengthFor(22);
  const baseline = meanAbsoluteError(applyError(gradient, error, strength), gradient);
  const corrected = meanAbsoluteError(applyError(gradient, error, strength * RESIDUAL), gradient);
  const ratio = corrected / baseline;
  assert.ok(ratio > 0.04 && ratio < 0.055, `ratio ${ratio}`);
});

test("output stays inside 0..1", () => {
  const error = unitError(gradient, W, H, 2);
  const out = applyError(gradient, error, 5);
  assert.ok(out.every((value) => value >= 0 && value <= 1));
});
