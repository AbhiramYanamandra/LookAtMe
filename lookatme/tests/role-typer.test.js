import test from "node:test";
import assert from "node:assert/strict";
import { ROLE_TIMING as T, roleFrame } from "../src/lib/role-typer.js";

const PHRASES = ["hardware engineer", "software engineer", "ML engineer"];

test("a phrase types in one character at a time", () => {
  assert.deepEqual(roleFrame(0, PHRASES), { index: 0, text: "h", phase: "typing" });
  assert.equal(roleFrame(T.typeMs * 3, PHRASES).text, "hard");
});

test("each phrase holds in full for the hold time", () => {
  const typed = PHRASES[0].length * T.typeMs;
  assert.deepEqual(roleFrame(typed, PHRASES), { index: 0, text: PHRASES[0], phase: "hold" });
  assert.equal(roleFrame(typed + T.holdMs - 1, PHRASES).text, PHRASES[0]);
});

test("it backspaces all the way to empty before the next phrase", () => {
  const length = PHRASES[0].length;
  const backStart = length * T.typeMs + T.holdMs;
  assert.equal(roleFrame(backStart, PHRASES).text, PHRASES[0].slice(0, length - 1));
  assert.equal(roleFrame(backStart + (length - 1) * T.backspaceMs, PHRASES).text, "");
  const gap = roleFrame(backStart + length * T.backspaceMs, PHRASES);
  assert.deepEqual(gap, { index: 0, text: "", phase: "gap" });
});

test("phrases run in order and the sequence loops", () => {
  const first = PHRASES[0].length * (T.typeMs + T.backspaceMs) + T.holdMs + T.gapMs;
  assert.equal(roleFrame(first, PHRASES).index, 1);
  const second = first + PHRASES[1].length * (T.typeMs + T.backspaceMs) + T.holdMs + T.gapMs;
  assert.equal(roleFrame(second, PHRASES).index, 2);
  const cycle = second + PHRASES[2].length * (T.typeMs + T.backspaceMs) + T.holdMs + T.gapMs;
  assert.deepEqual(roleFrame(cycle + 10, PHRASES), roleFrame(10, PHRASES));
});
