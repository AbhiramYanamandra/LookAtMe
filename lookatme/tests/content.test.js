import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ContentValidationError, loadAllProjects } from "../src/lib/projects.js";
import { featuredProjects } from "../src/lib/project-queries.js";
import { profile } from "../src/content/profile.js";
import { spectrumOf } from "../src/lib/spectrum.js";

test("the real content collection loads and validates", () => {
  const projects = loadAllProjects();
  const published = projects.filter((p) => !p.draft);
  assert.ok(published.length >= 5, "expected at least the lead projects");
  assert.equal(new Set(projects.map((p) => p.slug)).size, projects.length, "slugs are unique");
  for (const project of published) {
    assert.ok(project.title && project.summary, `${project.slug} has title and summary`);
    if (project.cover) assert.ok(project.cover.width > 0 && project.cover.height > 0, `${project.slug} cover has dimensions`);
  }
  assert.deepEqual(featuredProjects(published).map((p) => p.slug), ["wya", "macropad", "photonic-correction"]);
  // Every published project sits somewhere on the Work page's spectrum.
  for (const project of published) {
    const position = spectrumOf(project);
    assert.ok(position >= 0 && position <= 1, `${project.slug} spectrum ${position}`);
  }
  // Every role typed in the hero points at a real published project.
  for (const role of profile.hero.roles) {
    assert.ok(published.some((p) => p.slug === role.slug), `hero role "${role.label}" -> ${role.slug} exists`);
  }
});

function fixture(files, images = ["ok.png"]) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "lookatme-content-"));
  const contentDir = path.join(dir, "content");
  const publicDir = path.join(dir, "public", "images");
  fs.mkdirSync(contentDir, { recursive: true });
  fs.mkdirSync(publicDir, { recursive: true });
  // 1×1 PNG so image-size can read real dimensions.
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "base64",
  );
  for (const image of images) fs.writeFileSync(path.join(publicDir, image), png);
  for (const [name, body] of Object.entries(files)) fs.writeFileSync(path.join(contentDir, name), body);
  return { contentDir, publicDir: path.join(dir, "public") };
}

const valid = `---
title: Valid
summary: A valid project.
fields: [frontend]
order: 1
cover:
  src: /images/ok.png
  alt: ok
draft: false
---
Body.
`;

test("valid content loads with derived image dimensions and defaults", () => {
  const projects = loadAllProjects(fixture({ "valid.mdx": valid, "_TEMPLATE.mdx": "ignored" }));
  assert.equal(projects.length, 1);
  assert.equal(projects[0].slug, "valid");
  assert.deepEqual([projects[0].cover.width, projects[0].cover.height], [1, 1]);
  assert.equal(projects[0].cover.fit, "cover");
  assert.equal(projects[0].card.visual, "image");
  assert.equal(projects[0].body.trim(), "Body.");
});

test("drafts are loaded but flagged, so callers can exclude them", () => {
  const projects = loadAllProjects(fixture({ "valid.mdx": valid, "draft.mdx": valid.replace("draft: false", "draft: true") }));
  assert.deepEqual(projects.map((p) => [p.slug, p.draft]), [["draft", true], ["valid", false]]);
});

test("validation catches the documented mistakes", () => {
  const broken = fixture({
    "a.mdx": `---\ntitle: A\nsummary: s\nslug: dup\nfields: [nope]\norder: 1\ndate: 2024-13\n---\n`,
    "b.mdx": `---\ntitle: B\nsummary: s\nslug: dup\norder: 2\ncover:\n  src: /images/missing.png\n  alt: x\nlinks:\n  - label: bad\n    url: not a url\nfeatured: 1\n---\n`,
    "c.mdx": `---\nsummary: no title\norder: 3\nfeatured: 1\n---\n`,
  });
  assert.throws(
    () => loadAllProjects(broken),
    (error) => {
      assert.ok(error instanceof ContentValidationError);
      const text = error.problems.join("\n");
      for (const expected of [
        "duplicate slug",
        'unknown field "nope"',
        'date "2024-13"',
        "does not exist under public/",
        "valid http(s)/mailto URL",
        "title is required",
        "featured rank 1 is also used",
      ]) {
        assert.match(text, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `reports: ${expected}`);
      }
      return true;
    },
  );
});
