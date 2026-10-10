/**
 * Pure helpers for browsing the project collection: filtering, sorting,
 * counts, and featured selection. No file-system access,
 * so they can run in the browser, in tests, or on the server.
 */
import { FIELDS } from "../content/fields.js";
import { formatRange, inRange, spectrumOf } from "./spectrum.js";

export const SORT_OPTIONS = [
  { id: "recommended", label: "Recommended" },
  { id: "newest", label: "Newest" },
  { id: "oldest", label: "Oldest" },
  { id: "title", label: "Title A–Z" },
];

export const DEFAULT_SORT = "recommended";
export const ALL_FIELDS = "all";

const sortIds = new Set(SORT_OPTIONS.map((option) => option.id));
const DATE_SORTS = new Set(["newest", "oldest"]);

/**
 * The sorts a given collection can actually perform.
 *
 * Date sorts are withheld when no project carries a date: with nothing to
 * order by they return the recommended order unchanged, while the status
 * line reports "sorted by newest" — the interface confirming a change that
 * never happened. An option that cannot do anything is not offered.
 */
export function availableSorts(projects = []) {
  const hasDates = projects.some((project) => project.date);
  return hasDates ? SORT_OPTIONS : SORT_OPTIONS.filter((option) => !DATE_SORTS.has(option.id));
}

/**
 * Normalise a raw `?sort=` value to a supported sort id. Pass `projects` to
 * also reject a sort this collection cannot perform, so a stale
 * `?sort=newest` link falls back instead of lying about the order.
 */
export function resolveSort(value, projects) {
  const ids = projects ? new Set(availableSorts(projects).map((option) => option.id)) : sortIds;
  return typeof value === "string" && ids.has(value) ? value : DEFAULT_SORT;
}

/**
 * Normalise a raw `?field=` value. Unknown ids fall back to "all" so a stale
 * or mistyped link still shows the full library.
 */
export function resolveField(value, projects) {
  if (typeof value !== "string" || value === ALL_FIELDS) return ALL_FIELDS;
  return FIELDS.some((field) => field.id === value) ? value : ALL_FIELDS;
}

function compareTitle(a, b) {
  return a.title.localeCompare(b.title, "en", { sensitivity: "base" });
}

function compareRank(a, b) {
  return a.order - b.order || compareTitle(a, b) || a.slug.localeCompare(b.slug);
}

/**
 * Dated projects sort by date; undated projects always follow dated ones
 * (in recommended order) so that a missing date is never mistaken for a
 * very old or very new project.
 */
function compareDate(direction) {
  return (a, b) => {
    if (a.date && b.date) {
      const diff = direction === "newest" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date);
      return diff || compareRank(a, b);
    }
    if (a.date) return -1;
    if (b.date) return 1;
    return compareRank(a, b);
  };
}

export function sortProjects(projects, sort = DEFAULT_SORT) {
  const list = [...projects];
  switch (resolveSort(sort)) {
    case "newest":
      return list.sort(compareDate("newest"));
    case "oldest":
      return list.sort(compareDate("oldest"));
    case "title":
      return list.sort((a, b) => compareTitle(a, b) || compareRank(a, b));
    default:
      return list.sort(compareRank);
  }
}

export function filterByField(projects, fieldId) {
  const field = resolveField(fieldId);
  if (field === ALL_FIELDS) return [...projects];
  return projects.filter((project) => project.fields.includes(field));
}

/** Projects whose spectrum position falls inside `range` (null keeps everything). */
export function filterByRange(projects, range) {
  if (!range) return [...projects];
  return projects.filter((project) => inRange(spectrumOf(project), range));
}

/** Fields that at least one published project belongs to, with counts. */
export function populatedFields(projects) {
  return FIELDS.map((field) => ({
    ...field,
    count: projects.filter((project) => project.fields.includes(field.id)).length,
  })).filter((field) => field.count > 0);
}

/** Homepage highlights: projects with a `featured` rank, lowest rank first. */
export function featuredProjects(projects) {
  return projects
    .filter((project) => Number.isInteger(project.featured))
    .sort((a, b) => a.featured - b.featured || compareRank(a, b));
}

/** Projects sharing at least one field, for the "more work" strip. */
export function relatedProjects(project, projects, limit = 3) {
  const others = projects.filter((candidate) => candidate.slug !== project.slug);
  const shared = others.filter((candidate) =>
    candidate.fields.some((field) => project.fields.includes(field)),
  );
  const remainder = others.filter((candidate) => !shared.includes(candidate));
  return sortProjects(shared).concat(sortProjects(remainder)).slice(0, limit);
}

/** Build a `/projects` URL for the given browsing state, omitting defaults. */
export function libraryHref({ field, sort, view, range } = {}) {
  const params = new URLSearchParams();
  if (view === "list") params.set("view", "list");
  const resolvedField = resolveField(field);
  const resolvedSort = resolveSort(sort);
  const resolvedRange = formatRange(range);
  if (resolvedField !== ALL_FIELDS) params.set("field", resolvedField);
  if (resolvedSort !== DEFAULT_SORT) params.set("sort", resolvedSort);
  if (resolvedRange) params.set("range", resolvedRange);
  const query = params.toString();
  return query ? `/projects?${query}` : "/projects";
}
