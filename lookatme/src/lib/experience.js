/**
 * Experience content loader.
 *
 * One `.mdx` file per role lives in `src/content/experience/`, mirroring the
 * project collection: YAML frontmatter followed by an optional write-up.
 * Files whose name starts with `_` are templates and are ignored.
 *
 * Roles differ from projects in one way that matters: some are engineering
 * work with a write-up behind them, and some are jobs that belong on the
 * record but have nothing to read. `hasStory` is derived from whether a file
 * actually has a body, so a role is never linked to an empty page.
 *
 * Server-only, like `projects.js`. Never import from a client component.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export const EXPERIENCE_DIR = path.join(process.cwd(), "src", "content", "experience");

/** How a role is weighted on the timeline. */
export const ROLE_KINDS = ["engineering", "service"];

export class ExperienceValidationError extends Error {
  constructor(problems) {
    super(`Experience content is invalid:\n${problems.map((p) => `  - ${p}`).join("\n")}`);
    this.name = "ExperienceValidationError";
    this.problems = problems;
  }
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** `YYYY-MM`, or the literal `present` for a role that has not ended. */
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

function normaliseStringList(value, problems, where) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    problems.push(`${where}: must be a list`);
    return [];
  }
  return value.map((item) => String(item).trim()).filter(Boolean);
}

function normaliseRole(file, raw, body) {
  const slug = file.replace(/\.mdx$/, "");
  const where = `experience/${file}`;
  const problems = [];

  if (!SLUG_PATTERN.test(slug)) {
    problems.push(`${where}: file name must be lowercase letters, numbers and hyphens`);
  }
  for (const key of ["organisation", "role", "summary"]) {
    if (typeof raw[key] !== "string" || !raw[key].trim()) {
      problems.push(`${where}: ${key} is required`);
    }
  }
  if (typeof raw.start !== "string" || !MONTH_PATTERN.test(raw.start)) {
    problems.push(`${where}: start must be YYYY-MM (got ${JSON.stringify(raw.start)})`);
  }
  const ongoing = raw.end === "present";
  if (!ongoing && (typeof raw.end !== "string" || !MONTH_PATTERN.test(raw.end))) {
    problems.push(`${where}: end must be YYYY-MM or "present" (got ${JSON.stringify(raw.end)})`);
  }
  if (!ongoing && typeof raw.start === "string" && typeof raw.end === "string" && raw.end < raw.start) {
    problems.push(`${where}: end (${raw.end}) is before start (${raw.start})`);
  }
  const kind = raw.kind ?? "engineering";
  if (!ROLE_KINDS.includes(kind)) {
    problems.push(`${where}: kind must be one of ${ROLE_KINDS.join(", ")}`);
  }
  if (raw.order !== undefined && !Number.isInteger(raw.order)) {
    problems.push(`${where}: order must be a whole number`);
  }
  if (raw.draft !== undefined && typeof raw.draft !== "boolean") {
    problems.push(`${where}: draft must be true or false`);
  }

  const trimmedBody = typeof body === "string" ? body.trim() : "";

  const experience = {
    slug,
    file,
    organisation: typeof raw.organisation === "string" ? raw.organisation.trim() : "",
    role: typeof raw.role === "string" ? raw.role.trim() : "",
    location: typeof raw.location === "string" && raw.location.trim() ? raw.location.trim() : null,
    summary: typeof raw.summary === "string" ? raw.summary.trim() : "",
    start: typeof raw.start === "string" ? raw.start : "",
    end: ongoing ? null : typeof raw.end === "string" ? raw.end : "",
    ongoing,
    kind,
    technologies: normaliseStringList(raw.technologies, problems, `${where}: technologies`),
    // Derived, never declared: a role links to a write-up only when one exists.
    hasStory: trimmedBody.length > 0,
    draft: raw.draft === true,
    body: trimmedBody,
  };

  return { experience, problems };
}

export function loadAllExperience({ contentDir = EXPERIENCE_DIR } = {}) {
  if (!fs.existsSync(contentDir)) return [];
  const files = fs
    .readdirSync(contentDir)
    .filter((file) => file.endsWith(".mdx") && !file.startsWith("_"))
    .sort();

  const roles = [];
  const problems = [];
  const seen = new Set();

  for (const file of files) {
    const source = fs.readFileSync(path.join(contentDir, file), "utf8");
    let parsed;
    try {
      parsed = matter(source);
    } catch (error) {
      problems.push(`experience/${file}: frontmatter could not be parsed (${error.message})`);
      continue;
    }
    const { experience, problems: fileProblems } = normaliseRole(file, parsed.data ?? {}, parsed.content);
    problems.push(...fileProblems);
    if (seen.has(experience.slug)) problems.push(`experience/${file}: duplicate slug "${experience.slug}"`);
    seen.add(experience.slug);
    roles.push(experience);
  }

  if (problems.length > 0) throw new ExperienceValidationError(problems);

  // Newest first; an ongoing role outranks every finished one.
  return roles.sort((a, b) => {
    if (a.ongoing !== b.ongoing) return a.ongoing ? -1 : 1;
    return (b.end ?? "").localeCompare(a.end ?? "") || b.start.localeCompare(a.start) || a.slug.localeCompare(b.slug);
  });
}

export function getPublishedExperience() {
  return loadAllExperience().filter((role) => !role.draft);
}

export function getPublishedRole(slug) {
  return getPublishedExperience().find((role) => role.slug === slug) ?? null;
}

/** Metadata-only view for the timeline; drops the body. */
export function toRoleSummary(role) {
  const { body, file, ...summary } = role;
  return summary;
}
