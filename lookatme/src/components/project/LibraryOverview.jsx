import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { libraryHref } from "@/lib/project-queries";
import { projectHref } from "./CardBody";

/**
 * "At a glance" overview for the library: one card per populated field with
 * its description, count, and the projects in it. Projects without a field
 * are listed in a final "Smaller builds" group so nothing is hidden.
 */
export function LibraryOverview({ projects, fields }) {
  const unfielded = projects.filter((project) => project.fields.length === 0);
  const groups = fields.map((field) => ({
    id: field.id,
    label: field.label,
    description: field.description,
    href: libraryHref({ field: field.id }),
    items: projects.filter((project) => project.fields.includes(field.id)),
  }));
  if (unfielded.length > 0) {
    groups.push({
      id: "other",
      label: "Smaller builds",
      description: "Short exercises and experiments, kept for the record.",
      href: null,
      items: unfielded,
    });
  }

  return (
    <section className="pl-overview" aria-labelledby="overview-heading">
      <div className="pl-overview-head">
        <span className="al-mono">[ Overview ]</span>
        <h2 id="overview-heading">
          {projects.length} projects across {fields.length} {fields.length === 1 ? "field" : "fields"}.
        </h2>
      </div>
      <div className="pl-overview-grid">
        {groups.map((group) => (
          <div key={group.id} className="pl-overview-card" data-reveal>
            <div className="pl-overview-title">
              {group.href ? (
                <Link href={group.href}>
                  {group.label}
                  <ArrowUpRight aria-hidden="true" />
                </Link>
              ) : (
                <span>{group.label}</span>
              )}
              <span className="pl-count">{group.items.length}</span>
            </div>
            <p>{group.description}</p>
            <ul>
              {group.items.map((project) => (
                <li key={project.slug}>
                  <Link href={projectHref(project)}>{project.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
