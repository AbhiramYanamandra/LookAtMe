import Image from "next/image";
import { CardBody } from "./CardBody";
import { BoardVisual } from "./CardVisuals";
import { formatProjectDate } from "@/lib/format";

/** Library card: contained cover (or a deliberate fallback) plus the shared body. */
export function ProjectCard({ project }) {
  const { cover } = project;
  const meta = [formatProjectDate(project.date), project.status && statusLabel(project.status)].filter(Boolean);

  return (
    <article className="al-project-card pl-card">
      {cover && project.card.visual === "board" ? (
        <div className="pl-card-visual pl-card-visual--board">
          <BoardVisual project={project} />
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
        </div>
      ) : (
        <div className="pl-card-visual pl-card-visual--placeholder" aria-hidden="true">
          <b>{project.title.charAt(0)}</b>
          <span>No image yet</span>
        </div>
      )}
      <CardBody project={project} action="Read the case study">
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
