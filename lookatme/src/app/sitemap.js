import { getPublishedProjects } from "@/lib/projects";
import { siteUrl } from "@/lib/site";

/** Published pages only; drafts never appear here. */
export default function sitemap() {
  return [
    { url: `${siteUrl}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/projects`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.7 },
    ...getPublishedProjects().map((project) => ({
      url: `${siteUrl}/projects/${project.slug}`,
      changeFrequency: "yearly",
      priority: 0.6,
    })),
  ];
}
