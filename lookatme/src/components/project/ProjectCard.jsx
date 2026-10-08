import Image from "next/image";
import { CardBody } from "./CardBody";
import { BoardVisual } from "./CardVisuals";
import { SpecAnnotations, coverSpec } from "./SpecAnnotations";
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
          <SpecAnnotations label={coverSpec(cover)} />
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
          <SpecAnnotations label={coverSpec(cover)} />
        </div>
      ) : (
        <div className="pl-card-visual pl-card-visual--placeholder">
          <b aria-hidden="true">{project.title.charAt(0)}</b>
          {/* Not aria-hidden: this is the library's only absence signal, and
              hiding it made the honesty commitment sighted-only. */}
          <span>No image yet</span>
        </div>
      )}
      {/* No hardcoded action: most published projects have a stub body, so a
          blanket "Read the case study" promises a write-up that isn't there.
          The content model decides — `card.action`, else `Explore <title>`. */}
      <CardBody project={project}>
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
