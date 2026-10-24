import Image from "next/image";
import { ThesisGlyph } from "./ThesisGlyph";

/** A project's still for phones (pinned story and cards); the thesis, with no image, uses its glyph. */
export function ChapterStill({ still }) {
  if (!still) return <ThesisGlyph />;
  return <Image src={still.src} alt="" width={still.width} height={still.height} sizes="(max-width: 800px) 100vw, 1px" loading="eager" />;
}
