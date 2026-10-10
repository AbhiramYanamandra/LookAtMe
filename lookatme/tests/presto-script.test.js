import test from "node:test";
import assert from "node:assert/strict";
import { DURATION, STATIC_AT, TARGETS, frameAt } from "../src/lib/presto-script.js";

test("the walkthrough passes through every scene in order", () => {
  const seen = [];
  for (let t = 0; t < DURATION; t += 100) {
    const { scene } = frameAt(t);
    if (seen.at(-1) !== scene) seen.push(scene);
  }
  assert.deepEqual(seen, ["landing", "login", "dashboard", "editor"]);
});

test("the cursor reaches each target before it clicks it", () => {
  const checks = [
    [1600, TARGETS.loginLanding],
    [2800, TARGETS.email],
    [6400, TARGETS.loginSubmit],
    [8400, TARGETS.newPresentation],
    [12600, TARGETS.card],
    [16500, TARGETS.addSlide],
  ];
  for (const [at, [x, y]] of checks) {
    const { cursor } = frameAt(at + 5);
    assert.ok(Math.abs(cursor.x - x) < 0.5 && Math.abs(cursor.y - y) < 0.5, `at ${at}: ${cursor.x},${cursor.y} vs ${x},${y}`);
  }
});

test("typing fills in character by character and never shrinks", () => {
  assert.equal(frameAt(2900).typed.email, "");
  const early = frameAt(3200).typed.email;
  const later = frameAt(3900).typed.email;
  assert.ok(early.length > 0 && later.length > early.length);
  assert.equal(frameAt(5000).typed.email, "demo@presto.app");
  assert.equal(frameAt(STATIC_AT).typed.body, "Built with React + TypeScript");
});

test("modal, card and second slide appear at the right moments", () => {
  assert.equal(frameAt(8000).modal, false);
  assert.equal(frameAt(9000).modal, true);
  assert.equal(frameAt(11450).modal, false);
  assert.equal(frameAt(11000).cards, 0);
  assert.equal(frameAt(11600).cards, 1);
  assert.equal(frameAt(16000).slides, 1);
  assert.equal(frameAt(16700).slides, 2);
});

test("a click is reported as pressed briefly, and the loop resets", () => {
  assert.equal(frameAt(1650).down, "loginLanding");
  assert.equal(frameAt(1900).down, null);
  assert.equal(frameAt(DURATION + 100).scene, "landing");
  assert.equal(frameAt(DURATION + 100).typed.email, "");
  assert.equal(frameAt(0).fade, 0);
  assert.equal(frameAt(5000).fade, 1);
});
