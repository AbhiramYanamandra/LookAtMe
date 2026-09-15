import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { fieldLabel } from "@/content/fields";

export function projectHref(project) {
  return `/projects/${project.slug}`;
}

/** The short category badge shown on cards: `badge`, else the first field. */
export function projectBadge(project) {
  if (project.badge) return project.badge;
  if (project.fields.length > 0) return fieldLabel(project.fields[0]);
  return "Project";
}

export function FieldBadge({ children }) {
  return <span className="al-card-field">{children}</span>;
}

/**
 * Shared card copy block: badge, title, summary, and the case-study action.
 * Used by the homepage featured cards and the library grid.
 */
export function CardBody({ project, action, titleTag: TitleTag = "h3", titleLines, children }) {
  const href = projectHref(project);
  return (
    <div className="al-card-body">
      <FieldBadge>{projectBadge(project)}</FieldBadge>
      <TitleTag>
        <Link href={href} className="al-card-title">
          {titleLines
            ? titleLines.map((line, index) => (
                <span key={line}>
                  {index > 0 && <br />}
                  {line}
                </span>
              ))
            : project.title}
        </Link>
      </TitleTag>
      <p>{project.summary}</p>
      {children}
      <Link href={href} className="al-card-link">
        {action ?? project.card?.action ?? `Explore ${project.title}`}
        <ArrowUpRight aria-hidden="true" />
      </Link>
    </div>
  );
}
