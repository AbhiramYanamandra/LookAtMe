/**
 * Drafting annotations for a selected-work card.
 *
 * On pointer hover or keyboard focus the card becomes a plate on a drawing:
 * four corner crop marks strike out from their corners, a dimension line
 * draws from the centre, and the measurement label arrives last.
 *
 * The label states something true about the artefact — its real pixel
 * dimensions and what kind of image it is, both already in the content model.
 * Nothing here is invented: an annotation that lies is worse than no
 * annotation, and this site's whole argument is that its claims are checkable.
 *
 * Decorative to assistive tech: everything it says is already in the card's
 * badge, title, and summary.
 */
export function SpecAnnotations({ label, compact = false }) {
  return (
    <span className={`al-spec${compact ? " al-spec--compact" : ""}`} aria-hidden="true">
      <i className="al-spec-tl" />
      <i className="al-spec-tr" />
      <i className="al-spec-bl" />
      <i className="al-spec-br" />
      {!compact && <span className="al-spec-dim" />}
      {label && <span className="al-spec-label">{label}</span>}
    </span>
  );
}

const KIND_LABEL = {
  screenshot: "Screenshot",
  photo: "Photo",
  render: "Render",
  diagram: "Diagram",
  illustration: "Illustration",
};

/** `1024×1024 · Render` — real numbers from the cover, or null when there is none. */
export function coverSpec(cover) {
  if (!cover) return null;
  const kind = KIND_LABEL[cover.kind];
  const size = `${cover.width}×${cover.height}`;
  return kind ? `${size} · ${kind}` : size;
}
