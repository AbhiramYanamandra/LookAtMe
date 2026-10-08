import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { libraryHref } from "@/lib/project-queries";

/**
 * "At a glance" overview for the library: one tile per populated field with
 * its description and count, linking to that filter. Projects without a field
 * are counted in a final "Smaller builds" tile so nothing is hidden.
 *
 * Deliberately does NOT list project titles — the grid below is the index,
 * and listing every project twice cost a screenful before the first card.
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
            {/* No project list here: the grid below is the index. Listing every
                project twice cost a screenful before the first card, and the
                copy went stale the moment a filter was applied. */}
            <p>{group.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
