import test from "node:test";
import assert from "node:assert/strict";
import { INTRO_LENGTH, PHASES, PHASE_AT, atLeast, bootFrame, checkBody, phaseAt } from "../src/lib/intro.js";
import { getPhase, setPhase, whenPhase } from "../src/lib/intro-state.js";

const LINES = [
  { kind: "command", text: "booting abhiram.sh" },
  { kind: "check", text: "hardware" },
  { kind: "check", text: "software" },
  { kind: "check", text: "ml" },
  { kind: "command", text: "hello." },
];

test("phases are ordered and the whole intro stays under five seconds", () => {
  const times = PHASES.map((phase) => PHASE_AT[phase]);
  assert.deepEqual(times, [...times].sort((a, b) => a - b));
  assert.ok(INTRO_LENGTH <= 5000);
  assert.equal(phaseAt(0), "boot");
  assert.equal(phaseAt(PHASE_AT.light), "light");
  assert.equal(phaseAt(PHASE_AT.name + 1), "name");
  assert.equal(phaseAt(INTRO_LENGTH + 500), "done");
  assert.ok(atLeast("role", "name") && !atLeast("light", "name"));
});

test("the boot terminal types in order and never loses characters", () => {
  let previous = [];
  for (let t = 0; t <= PHASE_AT.light; t += 20) {
    const frame = bootFrame(t, LINES);
    assert.ok(frame.length >= previous.length, "lines never disappear");
    previous.forEach((line, i) => assert.ok(frame[i].text.length >= line.text.length, `line ${i} at ${t}`));
    previous = frame;
  }
  assert.equal(bootFrame(0, LINES)[0].text, "b");
  assert.equal(bootFrame(1500, LINES).at(-1).text, "ml .............".slice(0, bootFrame(1500, LINES).at(-1).text.length));
});

test("[ok] lands only after its line is fully typed", () => {
  const line = LINES[1];
  const body = checkBody(line.text);
  const start = 800;
  const typedAt = start + body.length * 16;
  const early = bootFrame(typedAt - 30, LINES)[1];
  assert.equal(early.ok, false);
  const late = bootFrame(typedAt + 200, LINES)[1];
  assert.equal(late.ok, true);
  assert.equal(late.text, body);
});

test("check lines align: every dotted body is the same width", () => {
  const widths = ["hardware", "software", "ml"].map((label) => checkBody(label).length);
  assert.equal(new Set(widths).size, 1);
});

test("the boot terminal is finished before the light comes on", () => {
  const frame = bootFrame(PHASE_AT.light, LINES);
  assert.equal(frame.length, LINES.length);
  assert.equal(frame.at(-1).text, "hello.");
  assert.ok(frame.slice(1, 4).every((line) => line.ok));
});

test("the phase clock notifies once and fires immediately if already past", () => {
  setPhase("boot");
  const seen = [];
  const stop = whenPhase("name", () => seen.push("name"));
  setPhase("light");
  assert.deepEqual(seen, []);
  setPhase("name");
  setPhase("role");
  assert.deepEqual(seen, ["name"]);
  stop();
  let late = 0;
  whenPhase("light", () => (late += 1));
  assert.equal(late, 1);
  setPhase("done");
  assert.equal(getPhase(), "done");
});
