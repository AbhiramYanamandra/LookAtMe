import Image from "next/image";

/**
 * The visual inside a floating carousel object. Markup and class names
 * mirror the approved reference exactly; the treatment is chosen per project
 * in its frontmatter (`hero.treatment`).
 */
export const OBJECT_CLASS = {
  board: "al-board-object",
  screen: "al-screen-object",
  paper: "al-paper-object",
  print: "al-type-object",
  terminal: "al-terminal-object",
  frame: "al-frame-object",
};

function pad(index) {
  return String(index).padStart(3, "0");
}

export function HeroObjectVisual({ project, index }) {
  const { hero, cover, title } = project;
  const number = pad(index);

  switch (hero.treatment) {
    case "board":
      return (
        <div className="al-board">
          <Image src={cover.src} alt={cover.alt} width={500} height={Math.round((500 * cover.height) / cover.width)} sizes="500px" />
        </div>
      );
    case "screen":
      return (
        <div className="al-screen">
          <div className="al-screen-head">
            <span>
              <b />
              <b />
              <b />
            </span>
            <span>{hero.eyebrow ?? `${title.toUpperCase()} / WEB APPLICATION`}</span>
          </div>
          <Image src={cover.src} alt={cover.alt} width={cover.width} height={cover.height} sizes="285px" />
          <div className="al-screen-foot">
            <span>{hero.tagline ?? title.toUpperCase()}</span>
            <span>↗</span>
          </div>
        </div>
      );
    case "paper":
      return (
        <div className="al-paper">
          <div className="al-paper-top">
            <span>{hero.eyebrow ?? title.toUpperCase()}</span>
            <span>{number}</span>
          </div>
          <h3>{hero.headline ?? title}</h3>
          <Image src={cover.src} alt={cover.alt} width={cover.width} height={cover.height} sizes="216px" />
          <div className="al-paper-foot">
            <span>{hero.tagline ?? title.toUpperCase()}</span>
            <span>{hero.footnote ?? "↗"}</span>
          </div>
        </div>
      );
    case "print":
      return (
        <div className="al-type">
          <Image src={cover.src} alt={cover.alt} width={cover.width} height={cover.height} sizes="187px" />
          <div className="al-type-foot">
            <span>{title}</span>
            <span>{hero.tagline ?? "↗"}</span>
          </div>
        </div>
      );
    case "terminal":
      return (
        <div className="al-terminal">
          <div className="al-terminal-head">
            <span>{hero.eyebrow ?? title.toUpperCase()}</span>
            <span>{number}</span>
          </div>
          <div className="al-terminal-title">{hero.headline ?? title}</div>
          {hero.lines.length > 0 && <div className="al-terminal-tree">{hero.lines.join("\n")}</div>}
          <div className="al-terminal-tag">{hero.footnote ?? title.toUpperCase()}</div>
        </div>
      );
    default:
      return (
        <div className="al-frame">
          <Image
            src={cover.src}
            alt={cover.alt}
            width={cover.width}
            height={cover.height}
            sizes="230px"
            style={{ objectFit: cover.fit, objectPosition: cover.position }}
          />
          <div className="al-frame-foot">
            <span>{hero.tagline ?? title.toUpperCase()}</span>
            <span>{number}</span>
          </div>
        </div>
      );
  }
}
