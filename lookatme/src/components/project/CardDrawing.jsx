import Image from "next/image";
import { SpecAnnotations, coverSpec } from "./SpecAnnotations";

/**
 * The drawing underneath a library card's visual, seen only where the
 * light-table lamp falls (see useLightTable). Graph paper, and on it a line
 * drawing of the real cover — produced by an edge-detect filter from the
 * image itself, so nothing is drawn that the artefact doesn't contain — with
 * crop marks and a dimension line stating its true pixel size.
 *
 * A project without an image gets its initial traced in outline on lettering
 * guide lines: the hand's sketch of something that isn't there yet.
 *
 * Decorative: everything it says is in the card's badge, title, and summary.
 */
export function CardDrawing({ cover, initial }) {
  return (
    <span className="pl-drawing" aria-hidden="true">
      {cover ? (
        <>
          <span className="pl-drawing-trace">
            <Image
              src={cover.src}
              alt=""
              width={cover.width}
              height={cover.height}
              sizes="(max-width: 520px) 100vw, (max-width: 900px) 50vw, 400px"
              data-fit={cover.fit ?? "contain"}
              style={{ objectPosition: cover.position }}
            />
          </span>
          <SpecAnnotations label={coverSpec(cover)} />
        </>
      ) : (
        <span className="pl-drawing-glyph">
          <b>{initial}</b>
          <span>No image yet</span>
        </span>
      )}
    </span>
  );
}

/** The edge-detect filter the drawings reference. Rendered once per grid. */
export function TraceFilter() {
  return (
    <svg className="pl-trace-defs" width="0" height="0" aria-hidden="true" focusable="false">
      <filter id="pl-trace" colorInterpolationFilters="sRGB">
        <feColorMatrix type="saturate" values="0" />
        <feConvolveMatrix order="3" kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1" preserveAlpha="true" />
        {/* Edge strength becomes ink: soft amber, alpha from luminance. */}
        <feColorMatrix type="matrix" values="0 0 0 0 0.96  0 0 0 0 0.72  0 0 0 0 0.36  1.6 3.2 0.6 0 0" />
      </filter>
    </svg>
  );
}
