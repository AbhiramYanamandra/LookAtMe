/**
 * Validates every project content file and prints a summary.
 * Run with `npm run validate`. Exits non-zero on any problem.
 */
import { loadAllProjects, ContentValidationError } from "../src/lib/projects.js";
import { profile } from "../src/content/profile.js";
import { loadAllExperience, ExperienceValidationError } from "../src/lib/experience.js";
import { spectrumOf } from "../src/lib/spectrum.js";
import { featuredProjects, populatedFields } from "../src/lib/project-queries.js";

try {
  const projects = loadAllProjects();
  const published = projects.filter((project) => !project.draft);
  const drafts = projects.filter((project) => project.draft);
  console.log(`✓ ${projects.length} project files valid (${published.length} published, ${drafts.length} draft)`);
  console.log(`  featured: ${featuredProjects(published).map((p) => p.slug).join(", ") || "none"}`);
  const missingHero = profile.hero.roles.filter((role) => !published.some((p) => p.slug === role.slug));
  if (missingHero.length > 0) throw new ContentValidationError([`hero role projects not found: ${missingHero.map((r) => r.slug).join(", ")}`]);
  console.log(`  hero:     ${profile.hero.roles.map((r) => `${r.label} → ${r.slug}`).join(", ")}`);
  console.log(`  spectrum: ${[...published].sort((a, b) => spectrumOf(a) - spectrumOf(b)).map((p) => `${p.slug} ${spectrumOf(p).toFixed(2)}`).join(", ")}`);
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
