import Image from "next/image";
import { CardBody } from "./CardBody";
import { BoardVisual } from "./CardVisuals";
import { CardDrawing } from "./CardDrawing";
import { formatProjectDate } from "@/lib/format";
import { ProjectVisual, GENERATED_VISUALS } from "./ProjectVisual";
import { ThesisFigure } from "./ThesisFigure";
import { SkillIcon } from "@/components/home/SkillIcon";
import { techIcon } from "@/lib/tech-icons";

/** Up to four technology icons, with the remainder counted. */
function TechRow({ technologies }) {
  if (technologies.length === 0) return null;
  const shown = technologies.slice(0, 4);
  const rest = technologies.length - shown.length;
  return (
    <ul className="pl-tech" aria-label="Technologies">
      {shown.map((tech) => (
        <li key={tech} title={tech}>
          <SkillIcon name={techIcon(tech) ?? "code"} size={15} />
          <span>{tech}</span>
        </li>
      ))}
      {rest > 0 && <li className="pl-tech-more">+{rest}</li>}
    </ul>
  );
}

/** Library card: contained cover (or a deliberate fallback) plus the shared body. */
export function ProjectCard({ project }) {
  const { cover } = project;
  const meta = [formatProjectDate(project.date), project.status && statusLabel(project.status)].filter(Boolean);

  return (
    <article className="al-project-card pl-card">
      {GENERATED_VISUALS.includes(project.card.visual) ? (
        <div className="pl-card-visual pl-card-visual--gen">
          <ProjectVisual kind={project.card.visual} />
        </div>
      ) : project.card.visual === "figure" ? (
        <div className="pl-card-visual pl-card-visual--figure">
          <ThesisFigure compact />
        </div>
      ) : cover && project.card.visual === "board" ? (
        <div className="pl-card-visual pl-card-visual--board">
          <BoardVisual project={project} />
          <CardDrawing cover={cover} />
        </div>
      ) : cover ? (
        <div className="pl-card-visual">
          <Image
            src={cover.src}
            alt={cover.alt}
            width={cover.width}
            height={cover.height}
            sizes="(max-width: 520px) 100vw, (max-width: 900px) 50vw, 400px"
            data-fit={cover.fit}
            style={{ objectPosition: cover.position }}
          />
          <CardDrawing cover={cover} />
        </div>
      ) : (
        <div className="pl-card-visual pl-card-visual--placeholder">
          <b aria-hidden="true">{project.title.charAt(0)}</b>
          {/* Not aria-hidden: this is the library's only absence signal, and
              hiding it made the honesty commitment sighted-only. */}
          <span>No image yet</span>
          <CardDrawing initial={project.title.charAt(0)} />
        </div>
      )}
      {/* No hardcoded action: most published projects have a stub body, so a
          blanket "Read the case study" promises a write-up that isn't there.
          The content model decides — `card.action`, else `Explore <title>`. */}
      <CardBody project={project}>
        {project.metric && <p className="pl-metric">{project.metric}</p>}
        <TechRow technologies={project.technologies} />
        {meta.length > 0 && (
          <div className="pl-card-meta">
            {meta.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        )}
      </CardBody>
    </article>
  );
}

export function statusLabel(status) {
  return { complete: "Complete", "in-progress": "In progress", paused: "Paused", archived: "Archived" }[status] ?? status;
}
