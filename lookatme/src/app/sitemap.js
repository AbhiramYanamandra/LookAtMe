import { getPublishedProjects } from "@/lib/projects";
import { getPublishedExperience } from "@/lib/experience";
import { siteUrl } from "@/lib/site";

/** Published pages only; drafts never appear here. */
export default function sitemap() {
  return [
    { url: `${siteUrl}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/projects`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/background`, changeFrequency: "monthly", priority: 0.7 },
    ...getPublishedProjects().map((project) => ({
      url: `${siteUrl}/projects/${project.slug}`,
      changeFrequency: "yearly",
      priority: 0.6,
    })),
    ...getPublishedExperience()
      .filter((role) => role.hasStory)
      .map((role) => ({
        url: `${siteUrl}/experience/${role.slug}`,
        changeFrequency: "yearly",
        priority: 0.6,
      })),
  ];
}
