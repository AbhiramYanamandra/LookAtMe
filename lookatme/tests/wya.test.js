import test from "node:test";
import assert from "node:assert/strict";
import { CAPABILITIES, VIEWERS, stripeCut } from "../src/lib/wya.js";

test("stripeCut matches the plan's worked example (3 no-shows at $5)", () => {
  const cut = stripeCut(5, 3);
  assert.equal(cut.collected, 15);
  assert.ok(Math.abs(cut.total - 3.62) < 0.02, `total ${cut.total}`);
  assert.equal(Math.round(cut.share * 100), 24);
  assert.ok(Math.abs(cut.host + cut.total - 15) < 1e-9);
});

test("stripeCut takes nothing when nobody flakes", () => {
  assert.equal(stripeCut(10, 0).total, 0);
});

test("every capability has an answer for every viewer", () => {
  for (const row of CAPABILITIES) {
    for (const viewer of VIEWERS) assert.ok(viewer.id in row.values, `${row.label} / ${viewer.id}`);
  }
});

test("only the host sees notes, edits or removes guests", () => {
  for (const label of ["Guests’ notes", "Edit or delete the event", "Remove a guest"]) {
    const row = CAPABILITIES.find((r) => r.label === label);
    assert.deepEqual(Object.entries(row.values).filter(([, v]) => v === true).map(([k]) => k), ["host"]);
  }
});
