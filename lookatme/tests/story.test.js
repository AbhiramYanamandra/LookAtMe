import test from "node:test";
import assert from "node:assert/strict";
import { STEP_COUNT, chapterScroll, chapterState } from "../src/lib/story.js";
import { storyProgress } from "../src/lib/motion.js";

test("exactly one chapter is active at any progress, earlier ones are after, later before", () => {
  for (const p of [0, 0.2, 0.5, 0.74, 1]) {
    const states = chapterState(p, 3).map((chapter) => chapter.state);
    assert.equal(states.filter((state) => state === "active").length, 1, `p=${p}`);
    const active = states.indexOf("active");
    states.forEach((state, index) => {
      if (index < active) assert.equal(state, "after");
      if (index > active) assert.equal(state, "before");
    });
  }
});

test("the last chapter stays active at full progress", () => {
  const last = chapterState(1, 3)[2];
  assert.equal(last.state, "active");
  assert.equal(last.step, STEP_COUNT);
});

test("steps only increase as a chapter's local progress grows", () => {
  let previous = -1;
  for (let p = 0; p < 1 / 3; p += 0.005) {
    const { step } = chapterState(p, 3)[0];
    assert.ok(step >= previous);
    previous = step;
  }
  assert.equal(chapterState(0, 3)[0].step, 1);
  assert.equal(chapterState(0.33, 3)[0].step, STEP_COUNT);
});

test("chapters before the active one are fully revealed, later ones fully hidden", () => {
  const [first, , third] = chapterState(0.5, 3);
  assert.equal(first.step, STEP_COUNT);
  assert.equal(third.step, 0);
});

test("progress and chapter scroll targets are consistent", () => {
  const base = { height: 3000, viewport: 1000 };
  assert.equal(storyProgress({ ...base, scrollY: 1000 }), 0.5);
  assert.equal(storyProgress({ ...base, scrollY: -50 }), 0);
  assert.equal(storyProgress({ ...base, height: 800, scrollY: 100 }), 0);
  const travel = 2000;
  for (let i = 0; i < 3; i += 1) {
    const p = storyProgress({ ...base, scrollY: chapterScroll(i, 3, travel) });
    assert.equal(chapterState(p, 3)[i].state, "active");
  }
});
