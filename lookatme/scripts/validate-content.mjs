/**
 * Validates every project content file and prints a summary.
 * Run with `npm run validate`. Exits non-zero on any problem.
 */
import { loadAllProjects, ContentValidationError } from "../src/lib/projects.js";
import { loadAllExperience, ExperienceValidationError } from "../src/lib/experience.js";
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

  const roles = loadAllExperience();
  const liveRoles = roles.filter((role) => !role.draft);
  const withStory = liveRoles.filter((role) => role.hasStory);
  console.log(`✓ ${roles.length} experience files valid (${liveRoles.length} published, ${withStory.length} with a write-up)`);
  console.log(`  roles:    ${liveRoles.map((r) => r.slug).join(", ") || "none"}`);
} catch (error) {
  if (error instanceof ContentValidationError || error instanceof ExperienceValidationError) {
    console.error(`✗ ${error.message}`);
    process.exit(1);
  }
  throw error;
}
