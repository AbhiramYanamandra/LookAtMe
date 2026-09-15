import Image from "next/image";

/** Supporting-card visual: the cropped PCB render on a dark green backdrop. */
export function BoardVisual({ project }) {
  const { cover } = project;
  return (
    <div className="al-hardware-visual">
      <div className="al-mini-board" data-depth="">
        <Image src={cover.src} alt={cover.alt} width={298} height={Math.round((298 * cover.height) / cover.width)} sizes="298px" />
      </div>
    </div>
  );
}

/** Supporting-card visual: simplified five-stage pipeline illustration. */
export function StagesVisual() {
  return (
    <div
      className="al-diagram-visual"
      data-depth=""
      role="img"
      aria-label="Simplified five-stage pipeline illustration: fetch, decode, execute, memory, writeback"
    >
      <span>FETCH</span>
      <span>DECODE</span>
      <span>EXEC</span>
      <span>MEM</span>
      <span>WRITE</span>
    </div>
  );
}

/** Default supporting-card visual for projects without a bespoke treatment. */
export function ImageVisual({ project }) {
  const { cover } = project;
  return (
    <div className="al-image-visual">
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

export function SupportVisual({ project }) {
  switch (project.card.visual) {
    case "board":
      return project.cover ? <BoardVisual project={project} /> : <ImageVisual project={project} />;
    case "stages":
      return <StagesVisual />;
    default:
      return <ImageVisual project={project} />;
  }
}
