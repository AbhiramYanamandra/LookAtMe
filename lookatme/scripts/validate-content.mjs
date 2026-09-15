/**
 * Validates every project content file and prints a summary.
 * Run with `npm run validate`. Exits non-zero on any problem.
 */
import { loadAllProjects, ContentValidationError } from "../src/lib/projects.js";
import { featuredProjects, heroProjects, populatedFields } from "../src/lib/project-queries.js";

try {
  const projects = loadAllProjects();
  const published = projects.filter((project) => !project.draft);
  const drafts = projects.filter((project) => project.draft);
  console.log(`✓ ${projects.length} project files valid (${published.length} published, ${drafts.length} draft)`);
  console.log(`  featured: ${featuredProjects(published).map((p) => p.slug).join(", ") || "none"}`);
  console.log(`  carousel: ${heroProjects(published).map((p) => p.slug).join(", ") || "none"}`);
  console.log(`  fields:   ${populatedFields(published).map((f) => `${f.label} (${f.count})`).join(", ") || "none"}`);
  if (drafts.length > 0) console.log(`  drafts:   ${drafts.map((p) => p.slug).join(", ")}`);
} catch (error) {
  if (error instanceof ContentValidationError) {
    console.error(`✗ ${error.message}`);
    process.exit(1);
  }
  throw error;
}
