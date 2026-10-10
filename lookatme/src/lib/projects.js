/**
 * Project content loader.
 *
 * One `.mdx` file per project lives in `src/content/projects/`. Each file has
 * YAML frontmatter (metadata) followed by the case-study body. Files whose
 * name starts with `_` are templates and are ignored.
 *
 * This module touches the file system and must only be imported from
 * server code (pages, `generateStaticParams`, the sitemap, scripts, tests).
 * Never import it from a client component.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { imageSize } from "image-size";
import { FIELD_IDS } from "../content/fields.js";

export const CONTENT_DIR = path.join(process.cwd(), "src", "content", "projects");
export const PUBLIC_DIR = path.join(process.cwd(), "public");

export const CARD_VISUALS = ["image", "screenshot", "board", "stages", "figure", "clap", "dataflow", "detect", "erd", "navmap", "sorter", "cipher", "ttt", "guess", "pagetable"];
export const IMAGE_FITS = ["cover", "contain"];
export const STATUSES = ["complete", "in-progress", "paused", "archived"];

export class ContentValidationError extends Error {
  constructor(problems) {
    super(
      `Project content is invalid:\n${problems.map((problem) => `  - ${problem}`).join("\n")}`,
    );
    this.name = "ContentValidationError";
    this.problems = problems;
  }
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^(\d{4})(?:-(0[1-9]|1[0-2])(?:-(0[1-9]|[12]\d|3[01]))?)?$/;

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isValidUrl(value) {
  if (typeof value !== "string") return false;
  if (value.startsWith("/")) return true;
  try {
    const url = new URL(value);
    return ["http:", "https:", "mailto:"].includes(url.protocol);
  } catch {
    return false;
  }
}

/** Resolve a `/images/...` path to the public directory and read its size. */
function readImage(src, publicDir, problems, where) {
  if (typeof src !== "string" || !src.startsWith("/")) {
    problems.push(`${where}: image src must be a site-relative path starting with "/" (got ${JSON.stringify(src)})`);
    return null;
  }
  const filePath = path.join(publicDir, src);
  if (!filePath.startsWith(publicDir) || !fs.existsSync(filePath)) {
    problems.push(`${where}: image "${src}" does not exist under public/`);
    return null;
  }
  try {
    const { width, height } = imageSize(fs.readFileSync(filePath));
    return { width, height };
  } catch (error) {
    problems.push(`${where}: could not read image dimensions for "${src}" (${error.message})`);
    return null;
  }
}

function normaliseImage(raw, publicDir, problems, where) {
  if (!isPlainObject(raw)) {
    problems.push(`${where}: expected an object with src and alt`);
    return null;
  }
  const size = readImage(raw.src, publicDir, problems, where);
  if (typeof raw.alt !== "string" || raw.alt.trim() === "") {
    problems.push(`${where}: alt text is required`);
  }
  const fit = raw.fit ?? "cover";
  if (!IMAGE_FITS.includes(fit)) {
    problems.push(`${where}: fit must be one of ${IMAGE_FITS.join(", ")}`);
  }
  if (raw.position !== undefined && typeof raw.position !== "string") {
    problems.push(`${where}: position must be a CSS object-position string`);
  }
  return {
    src: raw.src,
    alt: typeof raw.alt === "string" ? raw.alt.trim() : "",
    fit,
    position: raw.position ?? "50% 50%",
    kind: typeof raw.kind === "string" ? raw.kind : null,
    caption: typeof raw.caption === "string" ? raw.caption : null,
    width: size?.width ?? null,
    height: size?.height ?? null,
  };
}

function normaliseStringList(value, problems, where) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    problems.push(`${where}: expected a list of strings`);
    return [];
  }
  return value.map((item) => item.trim()).filter(Boolean);
}

function normaliseProject(file, raw, body, publicDir) {
  const problems = [];
  const fileSlug = path.basename(file, ".mdx");
  const slug = typeof raw.slug === "string" ? raw.slug : fileSlug;
  const where = `${file}`;

  if (!SLUG_PATTERN.test(slug)) {
    problems.push(`${where}: slug "${slug}" must be lowercase letters, numbers, and hyphens`);
  }
  if (typeof raw.title !== "string" || raw.title.trim() === "") {
    problems.push(`${where}: title is required`);
  }
  if (typeof raw.summary !== "string" || raw.summary.trim() === "") {
    problems.push(`${where}: summary is required`);
  }
  if (!Number.isInteger(raw.order)) {
    problems.push(`${where}: order (library rank, integer) is required`);
  }

  const fields = normaliseStringList(raw.fields, problems, `${where}: fields`);
  for (const field of fields) {
    if (!FIELD_IDS.includes(field)) {
      problems.push(`${where}: unknown field "${field}" (known: ${FIELD_IDS.join(", ")})`);
    }
  }

  const technologies = normaliseStringList(raw.technologies, problems, `${where}: technologies`);

  let date = null;
  if (raw.date !== undefined && raw.date !== null) {
    const asString = raw.date instanceof Date ? raw.date.toISOString().slice(0, 10) : String(raw.date);
    if (!DATE_PATTERN.test(asString)) {
      problems.push(`${where}: date "${asString}" must be YYYY, YYYY-MM, or YYYY-MM-DD`);
    } else {
      date = asString;
    }
  }

  if (raw.status !== undefined && !STATUSES.includes(raw.status)) {
    problems.push(`${where}: status must be one of ${STATUSES.join(", ")}`);
  }

  const cover = raw.cover === undefined ? null : normaliseImage(raw.cover, publicDir, problems, `${where}: cover`);

  const gallery = [];
  if (raw.gallery !== undefined) {
    if (!Array.isArray(raw.gallery)) {
      problems.push(`${where}: gallery must be a list`);
    } else {
      raw.gallery.forEach((item, index) => {
        const image = normaliseImage(item, publicDir, problems, `${where}: gallery[${index}]`);
        if (image) gallery.push(image);
      });
    }
  }

  const links = [];
  if (raw.links !== undefined) {
    if (!Array.isArray(raw.links)) {
      problems.push(`${where}: links must be a list`);
    } else {
      raw.links.forEach((link, index) => {
        if (!isPlainObject(link) || typeof link.label !== "string" || !isValidUrl(link.url)) {
          problems.push(`${where}: links[${index}] needs a label and a valid http(s)/mailto URL`);
          return;
        }
        links.push({ label: link.label, url: link.url });
      });
    }
  }

  if (raw.featured !== undefined && !Number.isInteger(raw.featured)) {
    problems.push(`${where}: featured must be an integer rank`);
  }

  let card = { visual: "image", action: null, titleLines: null };
  if (raw.card !== undefined) {
    if (!isPlainObject(raw.card)) {
      problems.push(`${where}: card must be an object`);
    } else {
      const visual = raw.card.visual ?? "image";
      if (!CARD_VISUALS.includes(visual)) {
        problems.push(`${where}: card.visual must be one of ${CARD_VISUALS.join(", ")}`);
      }
      const titleLines = normaliseStringList(raw.card.titleLines, problems, `${where}: card.titleLines`);
      card = {
        visual,
        action: typeof raw.card.action === "string" ? raw.card.action : null,
        titleLines: titleLines.length > 0 ? titleLines : null,
      };
    }
  }

  let spectrum = null;
  if (raw.spectrum !== undefined) {
    if (typeof raw.spectrum !== "number" || raw.spectrum < 0 || raw.spectrum > 1) {
      problems.push(`${where}: spectrum must be a number from 0 (hardware) to 1 (software)`);
    } else {
      spectrum = raw.spectrum;
    }
  }
  const metric = typeof raw.metric === "string" && raw.metric.trim() ? raw.metric.trim() : null;

  const draft = raw.draft === true;
  if (raw.draft !== undefined && typeof raw.draft !== "boolean") {
    problems.push(`${where}: draft must be true or false`);
  }

  const project = {
    slug,
    file,
    title: typeof raw.title === "string" ? raw.title.trim() : "",
    summary: typeof raw.summary === "string" ? raw.summary.trim() : "",
    badge: typeof raw.badge === "string" && raw.badge.trim() ? raw.badge.trim() : null,
    fields,
    technologies,
    date,
    status: raw.status ?? null,
    role: typeof raw.role === "string" && raw.role.trim() ? raw.role.trim() : null,
    team: typeof raw.team === "string" && raw.team.trim() ? raw.team.trim() : null,
    cover,
    gallery,
    links,
    featured: Number.isInteger(raw.featured) ? raw.featured : null,
    order: Number.isInteger(raw.order) ? raw.order : Number.MAX_SAFE_INTEGER,
    card,
    spectrum,
    metric,
    draft,
    body,
  };

  return { project, problems };
}

/**
 * Read and validate every project file. Throws `ContentValidationError` when
 * any file is invalid so mistakes surface at build time rather than as a
 * broken page.
 */
export function loadAllProjects({ contentDir = CONTENT_DIR, publicDir = PUBLIC_DIR } = {}) {
  const files = fs
    .readdirSync(contentDir)
    .filter((file) => file.endsWith(".mdx") && !file.startsWith("_"))
    .sort();

  const problems = [];
  const projects = [];
  const seen = new Map();

  for (const file of files) {
    const source = fs.readFileSync(path.join(contentDir, file), "utf8");
    let parsed;
    try {
      parsed = matter(source);
    } catch (error) {
      problems.push(`${file}: could not parse frontmatter (${error.message})`);
      continue;
    }
    const { project, problems: fileProblems } = normaliseProject(file, parsed.data ?? {}, parsed.content, publicDir);
    problems.push(...fileProblems);
    if (seen.has(project.slug)) {
      problems.push(`${file}: duplicate slug "${project.slug}" (also used by ${seen.get(project.slug)})`);
    }
    seen.set(project.slug, file);
    projects.push(project);
  }

  const published = projects.filter((project) => !project.draft);
  const featuredRanks = new Map();
  for (const project of published) {
    if (project.featured !== null) {
      if (featuredRanks.has(project.featured)) {
        problems.push(`${project.file}: featured rank ${project.featured} is also used by ${featuredRanks.get(project.featured)}`);
      }
      featuredRanks.set(project.featured, project.file);
    }
  }

  if (problems.length > 0) {
    throw new ContentValidationError(problems);
  }
  return projects;
}

let cache = null;

/**
 * All published (non-draft) projects. Cached per process in production;
 * re-read on every request in development so content edits show up on
 * refresh without restarting the dev server.
 */
export function getPublishedProjects() {
  if (!cache || process.env.NODE_ENV !== "production") cache = loadAllProjects();
  return cache.filter((project) => !project.draft);
}

export function getPublishedProject(slug) {
  return getPublishedProjects().find((project) => project.slug === slug) ?? null;
}

/**
 * Metadata-only view for browsing UIs. The case-study body and file name are
 * stripped so client components never receive more than they need.
 */
export function toSummary(project) {
  const { body, file, ...summary } = project;
  return summary;
}
