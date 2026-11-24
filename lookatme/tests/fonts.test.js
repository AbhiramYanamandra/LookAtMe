import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// Every font goes through the tokens in globals.css (--font-sans, --font-mono, --font-script).
// Token definitions are custom properties, so they never match `font-family:` or `font:` below.
const TOKEN = String.raw`var\(--font-(?:sans|mono|script)\)`;
const FAMILY_OK = new RegExp(String.raw`^(?:${TOKEN}|inherit)$`);
const SHORTHAND_OK = new RegExp(String.raw`^(?:inherit|.*\s${TOKEN})$`);
const CSS_RULES = [
  [/(?<![-\w])font-family\s*:\s*([^;}]+)/g, FAMILY_OK],
  [/(?<![-\w])font\s*:\s*([^;}]+)/g, SHORTHAND_OK],
];
// Inline style objects (fontFamily: "...") and SVG attributes (fontFamily="...").
const JSX_RULE = [/\bfontFamily\s*[:=]\s*\{?\s*(["'`])(.*?)\1/g, FAMILY_OK];

const SRC = path.join(import.meta.dirname, "..", "src");

export function fontViolations(file, text) {
  const isCss = file.endsWith(".css");
  const rules = isCss ? CSS_RULES : [JSX_RULE];
  const found = [];
  text.split("\n").forEach((line, i) => {
    for (const [pattern, ok] of rules) {
      for (const match of line.matchAll(pattern)) {
        const value = (isCss ? match[1] : match[2]).replace(/\s*!important$/, "").trim();
        if (!ok.test(value)) found.push(`${file}:${i + 1}: ${value}`);
      }
    }
  });
  return found;
}

test("every font in src uses a font token", () => {
  const files = fs.readdirSync(SRC, { recursive: true }).filter((f) => /\.(css|jsx?)$/.test(f));
  assert.ok(files.some((f) => f.endsWith(".css")), "found the stylesheets");
  const violations = files.flatMap((f) => fontViolations(path.join("src", f), fs.readFileSync(path.join(SRC, f), "utf8")));
  assert.deepEqual(violations, [], `fonts outside the tokens:\n${violations.join("\n")}`);
});

test("a stray font is reported with file and line", () => {
  assert.deepEqual(fontViolations("a.css", ".x {\n  font-family: \"Times New Roman\", serif;\n}"), [
    'a.css:2: "Times New Roman", serif',
  ]);
  assert.deepEqual(fontViolations("a.css", ".x { font: 12px Georgia; }"), ["a.css:1: 12px Georgia"]);
  assert.deepEqual(fontViolations("a.jsx", '<p style={{ fontFamily: "Comic Sans MS" }} />'), ["a.jsx:1: Comic Sans MS"]);
  assert.deepEqual(fontViolations("a.jsx", '<text fontFamily="serif">'), ["a.jsx:1: serif"]);
});

test("tokens, inherit and token definitions pass", () => {
  const css = [
    ":root { --font-sans: var(--font-geist-sans), \"Geist\", Arial, sans-serif; }",
    ".a { font-family: var(--font-mono); }",
    ".b { font-family: inherit !important; }",
    ".c { font: inherit; }",
    ".d { font: 500 14px var(--font-sans); }",
    ".e { font: 16px / 1.8 var(--font-mono); }",
  ].join("\n");
  assert.deepEqual(fontViolations("a.css", css), []);
  assert.deepEqual(fontViolations("a.jsx", '<p style={{ fontFamily: "var(--font-script)" }} />'), []);
});
