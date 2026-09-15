import test from "node:test";
import assert from "node:assert/strict";
import {
  featuredProjects,
  filterByField,
  heroProjects,
  libraryHref,
  populatedFields,
  relatedProjects,
  resolveField,
  resolveSort,
  sortProjects,
} from "../src/lib/project-queries.js";

const make = (overrides) => ({
  slug: "x",
  title: "X",
  order: 1,
  date: null,
  fields: [],
  featured: null,
  hero: null,
  ...overrides,
});

const projects = [
  make({ slug: "b", title: "Beta", order: 2, date: "2024-05", fields: ["frontend"], featured: 2 }),
  make({ slug: "a", title: "Alpha", order: 1, date: "2025-01-10", fields: ["hardware"], featured: 1, hero: { order: 2 } }),
  make({ slug: "c", title: "Gamma", order: 3, date: null, fields: ["hardware", "embedded"], hero: { order: 1 } }),
  make({ slug: "d", title: "Delta", order: 4, date: "2024", fields: [] }),
];

test("unknown query values fall back to safe defaults", () => {
  assert.equal(resolveSort("bogus"), "recommended");
  assert.equal(resolveSort(undefined), "recommended");
  assert.equal(resolveSort("newest"), "newest");
  assert.equal(resolveField("bogus"), "all");
  assert.equal(resolveField(["hardware"]), "all");
  assert.equal(resolveField("hardware"), "hardware");
});

test("recommended sort follows library order", () => {
  assert.deepEqual(sortProjects(projects).map((p) => p.slug), ["a", "b", "c", "d"]);
});

test("newest and oldest sort by explicit date; undated projects come last", () => {
  assert.deepEqual(sortProjects(projects, "newest").map((p) => p.slug), ["a", "b", "d", "c"]);
  assert.deepEqual(sortProjects(projects, "oldest").map((p) => p.slug), ["d", "b", "a", "c"]);
});

test("title sort is alphabetical and does not mutate the input", () => {
  const input = [...projects];
  assert.deepEqual(sortProjects(input, "title").map((p) => p.title), ["Alpha", "Beta", "Delta", "Gamma"]);
  assert.deepEqual(input, projects);
});

test("field filter matches any assigned field", () => {
  assert.deepEqual(filterByField(projects, "hardware").map((p) => p.slug), ["a", "c"]);
  assert.deepEqual(filterByField(projects, "embedded").map((p) => p.slug), ["c"]);
  assert.equal(filterByField(projects, "all").length, 4);
  assert.equal(filterByField(projects, "nope").length, 4);
});

test("only populated fields are offered, with counts", () => {
  const fields = populatedFields(projects);
  assert.deepEqual(
    fields.map((f) => [f.id, f.count]),
    [
      ["hardware", 2],
      ["frontend", 1],
      ["embedded", 1],
    ],
  );
});

test("featured and hero selections use their own ranks, independent of library order", () => {
  assert.deepEqual(featuredProjects(projects).map((p) => p.slug), ["a", "b"]);
  assert.deepEqual(heroProjects(projects).map((p) => p.slug), ["c", "a"]);
});

test("related projects prefer shared fields and never include the project itself", () => {
  const related = relatedProjects(projects[1], projects, 2);
  assert.deepEqual(related.map((p) => p.slug), ["c", "b"]);
});

test("library URLs omit defaults and encode state", () => {
  assert.equal(libraryHref(), "/projects");
  assert.equal(libraryHref({ field: "all", sort: "recommended" }), "/projects");
  assert.equal(libraryHref({ field: "hardware" }), "/projects?field=hardware");
  assert.equal(libraryHref({ field: "hardware", sort: "newest" }), "/projects?field=hardware&sort=newest");
  assert.equal(libraryHref({ field: "bogus", sort: "bogus" }), "/projects");
});
