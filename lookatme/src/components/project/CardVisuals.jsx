import Image from "next/image";
import { SpecAnnotations, coverSpec } from "./SpecAnnotations";

/**
 * Project-library visual for hardware projects: the cropped PCB render on a
 * dark green backdrop. `annotated` adds the drafting annotations.
 */
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
