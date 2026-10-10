import Link from "next/link";
import { fieldLabel } from "@/content/fields";
import { formatProjectDate } from "@/lib/format";
import { libraryHref } from "@/lib/project-queries";
import { statusLabel } from "./ProjectCard";
import { techIcon } from "@/lib/tech-icons";
import { SkillIcon } from "@/components/home/SkillIcon";

/** Quick facts: only the facts that are actually known are rendered. */
export function QuickFacts({ project }) {
  const facts = [
    project.role && { label: "Role", value: project.role },
    project.team && { label: "Context", value: project.team },
    project.date && { label: "Date", value: formatProjectDate(project.date) },
    project.status && { label: "Status", value: statusLabel(project.status) },
    project.fields.length > 0 && {
      label: "Fields",
      value: (
        <span className="cs-chips">
          {project.fields.map((id) => (
            <Link key={id} href={libraryHref({ field: id })}>
              {fieldLabel(id)}
            </Link>
          ))}
        </span>
      ),
    },
    project.technologies.length > 0 && {
      label: "Technologies",
      value: (
        <span className="cs-chips">
          {project.technologies.map((tech) => (
            <span key={tech}>
              <SkillIcon name={techIcon(tech) ?? "code"} size={14} />
              {tech}
            </span>
          ))}
        </span>
      ),
    },
  ].filter(Boolean);

  if (facts.length === 0) return null;

  return (
    <dl className="cs-facts" aria-label="Quick facts">
      {facts.map((fact) => (
        <div key={fact.label}>
          <dt>{fact.label}</dt>
          <dd>{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
