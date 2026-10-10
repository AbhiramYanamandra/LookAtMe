/**
 * The first-load intro as pure data and functions: a tiny boot sequence typed
 * on black, then the lamp comes on, the name is written, the role line types
 * and the tiles arrive. Nothing here touches the DOM, so it can be tested.
 *
 * Boot lines come from content (`profile.hero.intro.lines`): `command` lines
 * type out after a prompt; `check` lines print "label ........ [ok]".
 */
export const PHASES = ["boot", "light", "name", "role", "done"];

/** When (ms from the start) each phase begins. */
export const PHASE_AT = { boot: 0, light: 1950, name: 2500, role: 3500, done: 4600 };

const LINE_AT = [0, 800, 1050, 1300, 1600];
const COMMAND_MS = 34;
const CHECK_MS = 16;
const OK_DELAY_MS = 140;
const DOT_COLUMN = 16;

export const INTRO_LENGTH = PHASE_AT.done;

/** Whether phase `a` is `b` or later. */
export function atLeast(a, b) {
  return PHASES.indexOf(a) >= PHASES.indexOf(b);
}

export function phaseAt(t) {
  let phase = "boot";
  for (const name of PHASES) if (t >= PHASE_AT[name]) phase = name;
  return phase;
}

/** The padded body of a check line: "hardware ........". */
export function checkBody(label) {
  return `${label} ${".".repeat(Math.max(2, DOT_COLUMN - label.length))}`;
}

/**
 * What the boot terminal shows at time `t`: one entry per line that has
 * started, with the characters typed so far and whether its [ok] has landed.
 */
export function bootFrame(t, lines) {
  const shown = [];
  lines.forEach((line, index) => {
    const start = LINE_AT[index] ?? LINE_AT.at(-1) + (index - LINE_AT.length + 1) * 250;
    if (t < start) return;
    const full = line.kind === "check" ? checkBody(line.text) : line.text;
    const speed = line.kind === "check" ? CHECK_MS : COMMAND_MS;
    const count = Math.min(full.length, Math.floor((t - start) / speed) + 1);
    const typedAt = start + full.length * speed;
    shown.push({
      kind: line.kind,
      text: full.slice(0, count),
      ok: line.kind === "check" && t >= typedAt + OK_DELAY_MS,
    });
  });
  return shown;
}
