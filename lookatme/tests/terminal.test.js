import test from "node:test";
import assert from "node:assert/strict";
import { complete, runCommand } from "../src/lib/terminal-commands.js";

const ctx = {
  projects: [
    { slug: "presto", title: "Presto", summary: "Slides in the browser.", badge: "Web application" },
    { slug: "macropad", title: "3×3 Macropad", summary: "Nine keys.", badge: null },
    { slug: "photonic-correction", title: "High-precision photonic computing", summary: "Thesis.", badge: "Honours thesis" },
  ],
  roles: [{ organisation: "Org", role: "Engineer", start: "2023-09", end: null }],
  profile: {
    name: "Abhiram",
    email: "a@b.c",
    github: "https://github.com/x",
    linkedin: "https://linkedin.com/x",
    resume: "/resume.pdf",
    intro: { lead: "I build things." },
    education: { degree: "BE", major: "CE", institution: "UNSW" },
  },
  interests: [
    { id: "cycling", label: "cycling", aliases: ["bike", "ride"], line: "Legs on.", art: ["__o"] },
    { id: "cooking", label: "cooking", aliases: ["cook"], line: "Taste first.", art: ["~"] },
    { id: "music", label: "music", aliases: ["listen"], line: "Soundtrack.", art: ["o"] },
    { id: "reading", label: "reading", aliases: ["read"], line: "Pages.", art: ["|"] },
  ],
  skills: [
    { label: "React", kind: "software" },
    { label: "VHDL", kind: "hardware" },
    { label: "PyTorch", kind: "ml" },
  ],
};
const text = (result) => result.lines.map((line) => line.text ?? "").join("\n");

test("empty input does nothing", () => {
  assert.deepEqual(runCommand("   ", ctx), { lines: [] });
});

test("open navigates to a known project and rejects an unknown one", () => {
  assert.deepEqual(runCommand("open presto", ctx).action, { type: "navigate", href: "/projects/presto" });
  const missing = runCommand("open nope", ctx);
  assert.equal(missing.action, undefined);
  assert.match(text(missing), /no project called "nope"/);
});

test("project aliases describe without navigating", () => {
  const result = runCommand("thesis", ctx);
  assert.match(text(result), /High-precision photonic computing/);
  assert.equal(result.action, undefined);
});

test("skills are grouped by kind, so the mix is visible", () => {
  const out = text(runCommand("skills", ctx));
  assert.match(out, /software\s+React/);
  assert.match(out, /hardware\s+VHDL/);
  assert.match(out, /ml\s+PyTorch/);
});

test("clear and clap return actions", () => {
  assert.deepEqual(runCommand("clear", ctx).action, { type: "clear" });
  assert.deepEqual(runCommand("clap", ctx).action, { type: "clap" });
});

test("unknown commands suggest the nearest one", () => {
  assert.match(text(runCommand("projcts", ctx)), /did you mean "projects"/);
  assert.match(text(runCommand("zzzzzzzz", ctx)), /Type help/);
});

test("output never contains markup", () => {
  for (const line of ["help", "about", "projects", "contact", "cat nothing.txt", "sudo hire me"]) {
    assert.doesNotMatch(text(runCommand(line, ctx)), /<[a-z/]/i);
  }
});

test("tab completes commands and open's project names", () => {
  assert.equal(complete("proj", ctx), "projects ");
  assert.equal(complete("open pre", ctx), "open presto");
  assert.equal(complete("open p", ctx), "open p");
});

test("interests list and each interest answers, including by alias", () => {
  const list = text(runCommand("interests", ctx));
  assert.match(list, /cycling/);
  assert.match(list, /cooking/);
  const bike = runCommand("bike", ctx);
  assert.equal(bike.lines[0].t, "art");
  assert.match(text(bike), /Legs on\./);
  assert.match(text(runCommand("cycling", ctx)), /Legs on\./);
});

test("neofetch returns a card with art and rows, and cat interests.txt works", () => {
  const [card] = runCommand("neofetch", ctx).lines;
  assert.equal(card.t, "card");
  assert.ok(card.art.includes("#"));
  assert.ok(card.rows.some(([key]) => key === "moves"));
  assert.match(text(runCommand("cat interests.txt", ctx)), /Off the keyboard/);
});

test("interest commands complete and are suggested for typos", () => {
  assert.equal(complete("cyc", ctx), "cycling ");
  assert.match(text(runCommand("cyclng", ctx)), /did you mean "cycling"/);
});
