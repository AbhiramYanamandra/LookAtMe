import Image from "next/image";
import { SpecAnnotations, coverSpec } from "./SpecAnnotations";

/**
 * `annotated` is opt-in so the drafting annotations stay on the homepage's
 * selected-work cards, where they were designed. The project library reuses
 * BoardVisual at a different size and does not get them.
 */

/** Supporting-card visual: the cropped PCB render on a dark green backdrop. */
export function BoardVisual({ project, annotated = false }) {
  const { cover } = project;
  return (
    <div className="al-hardware-visual">
      <div className="al-mini-board" data-depth="">
        <Image src={cover.src} alt={cover.alt} width={298} height={Math.round((298 * cover.height) / cover.width)} sizes="298px" />
      </div>
      {annotated && <SpecAnnotations label={coverSpec(cover)} compact />}
    </div>
  );
}

/** Supporting-card visual: simplified five-stage pipeline illustration. */
export function StagesVisual({ annotated = false }) {
  return (
    <div
      className="al-diagram-visual"
      data-depth=""
      role="img"
      aria-label="Simplified five-stage pipeline illustration: fetch, decode, execute, memory, writeback"
    >
      {/* The stages own their own stack: sibling selectors here draw the
          connectors, so anything else inside the visual must stay outside it. */}
      <div className="al-stage-stack">
        <span>FETCH</span>
        <span>DECODE</span>
        <span>EXEC</span>
        <span>MEM</span>
        <span>WRITE</span>
      </div>
      {annotated && <SpecAnnotations label="5 stages" compact />}
    </div>
  );
}

/** Default supporting-card visual for projects without a bespoke treatment. */
export function ImageVisual({ project, annotated = false }) {
  const { cover } = project;
  return (
    <div className="al-image-visual">
      {annotated && <SpecAnnotations label={coverSpec(cover)} compact />}
      {cover ? (
        <Image
          src={cover.src}
          alt={cover.alt}
          width={cover.width}
          height={cover.height}
          sizes="(max-width: 800px) 50vw, 116px"
          style={{ objectFit: cover.fit, objectPosition: cover.position }}
          data-depth=""
        />
      ) : (
        <span className="al-mono">{project.title}</span>
      )}
    </div>
  );
}

export function SupportVisual({ project, annotated = false }) {
  switch (project.card.visual) {
    case "board":
      return project.cover ? (
        <BoardVisual project={project} annotated={annotated} />
      ) : (
        <ImageVisual project={project} annotated={annotated} />
      );
    case "stages":
      return <StagesVisual annotated={annotated} />;
    default:
      return <ImageVisual project={project} annotated={annotated} />;
  }
}
