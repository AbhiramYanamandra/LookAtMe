import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { profile } from "@/content/profile";
import { HeroEntrance } from "./HeroEntrance";
import { HeroLight } from "./HeroLight";
import { HeroRoles } from "./HeroRoles";
import { ThesisGlyph } from "./ThesisGlyph";
import { WordmarkTrace } from "./WordmarkTrace";

/** Tile visual: the project's own cover, or a small glyph when it has none. */
function TileVisual({ project }) {
  if (!project.cover) return <ThesisGlyph />;
  const { cover } = project;
  return (
    <div className="al-tile-frame" data-fit={cover.fit}>
      <Image src={cover.src} alt="" width={cover.width} height={cover.height} sizes="240px" />
    </div>
  );
}

/**
 * Hero: a photo of me, the handwritten name beneath it, a typed role line,
 * and three project tiles that drift around the photo and take turns coming
 * forward as each role is typed.
 *
 * `projects` is the whole published collection; the hero picks the three
 * named in `profile.hero.roles`.
 */
export function Hero({ projects }) {
  const { photo, roles, staticRoles, identity } = profile.hero;
  const tiles = roles
    .map((role) => projects.find((project) => project.slug === role.slug))
    .filter(Boolean)
    .map((project) => ({
      href: `#work-${project.slug}`,
      title: project.title,
      summary: project.summary,
      node: <TileVisual project={project} />,
    }));
  const activeRoles = roles.filter((role) => projects.some((project) => project.slug === role.slug));

  // The ?still=1 review aid is available in development and when a build sets
  // CAROUSEL_REVIEW=1. It never ships in an ordinary production build.
  const reviewEnabled = process.env.NODE_ENV !== "production" || process.env.CAROUSEL_REVIEW === "1";

  return (
    <section className="al-hero" id="home" aria-label={`${profile.firstName} — ${staticRoles.toLowerCase()} portfolio`}>
      <span className="al-hero-lamp" aria-hidden="true" />
      <div className="al-hero-photo">
        <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes="(max-width: 700px) 100vw, 720px" priority />
      </div>
      <h1 className="al-wordmark">{profile.firstName}</h1>
      <HeroLight />
      <WordmarkTrace reviewEnabled={reviewEnabled} />
      <HeroEntrance reviewEnabled={reviewEnabled} />
      <HeroRoles roles={activeRoles} tiles={tiles} staticLabel={staticRoles} />
      <div className="al-hero-bottom">
        <div className="al-bottom-left">
          <span className="al-mono">{identity}</span>
          <a href="#work">
            Discover the work
            <ArrowDown aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
