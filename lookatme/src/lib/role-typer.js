/**
 * The hero's role line as a pure function of time, so it can be tested
 * without a browser. Each phrase types in, holds, backspaces to nothing,
 * rests briefly, and the next one starts; the cycle then loops.
 */
export const ROLE_TIMING = { typeMs: 70, holdMs: 2200, backspaceMs: 35, gapMs: 450 };

/** Total duration of one phrase's type / hold / backspace / gap sequence. */
function span(length, timing) {
  return length * timing.typeMs + timing.holdMs + length * timing.backspaceMs + timing.gapMs;
}

/** What to show `elapsed` ms after the sequence started. */
export function roleFrame(elapsed, phrases, timing = ROLE_TIMING) {
  const cycle = phrases.reduce((sum, phrase) => sum + span(phrase.length, timing), 0);
  if (cycle <= 0) return { index: 0, text: "", phase: "gap" };
  let t = ((elapsed % cycle) + cycle) % cycle;

  for (let index = 0; index < phrases.length; index += 1) {
    const phrase = phrases[index];
    const total = span(phrase.length, timing);
    if (t >= total) {
      t -= total;
      continue;
    }
    const typeEnd = phrase.length * timing.typeMs;
    if (t < typeEnd) {
      return { index, text: phrase.slice(0, Math.floor(t / timing.typeMs) + 1), phase: "typing" };
    }
    t -= typeEnd;
    if (t < timing.holdMs) return { index, text: phrase, phase: "hold" };
    t -= timing.holdMs;
    const backEnd = phrase.length * timing.backspaceMs;
    if (t < backEnd) {
      return { index, text: phrase.slice(0, phrase.length - Math.floor(t / timing.backspaceMs) - 1), phase: "backspace" };
    }
    return { index, text: "", phase: "gap" };
  }
  return { index: 0, text: "", phase: "gap" };
}
