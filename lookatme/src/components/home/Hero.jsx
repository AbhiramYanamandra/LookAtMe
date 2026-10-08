import { ArrowDown } from "lucide-react";
import { profile } from "@/content/profile";
import { HeroObjectVisual, OBJECT_CLASS } from "./HeroObject";
import { ProjectCarousel } from "./ProjectCarousel";
import { HeroEntrance } from "./HeroEntrance";
import { HeroLight } from "./HeroLight";
import { WordmarkTrace } from "./WordmarkTrace";

/**
 * Full-width black hero: giant handwritten wordmark, side labels, tagline,
 * the moving project carousel, and the bottom identity/controls bar.
 *
 * `projects` are the hero-enabled projects from the shared collection, in
 * hero order. The object visuals are rendered here on the server and handed
 * to the client carousel, which only adds motion and interaction.
 */
export function Hero({ projects }) {
  const items = projects.map((project, index) => ({
    slug: project.slug,
    title: project.title,
    href: `/projects/${project.slug}`,
    className: OBJECT_CLASS[project.hero.treatment] ?? OBJECT_CLASS.frame,
    node: <HeroObjectVisual project={project} index={index + 1} />,
  }));

  // The ?still=1&phase=… review aid is available in development and when a
  // build sets CAROUSEL_REVIEW=1. It never ships in an ordinary production build.
  const reviewEnabled = process.env.NODE_ENV !== "production" || process.env.CAROUSEL_REVIEW === "1";

  return (
    <section className="al-hero" id="home" aria-label={`${profile.firstName} — software and hardware engineer portfolio`}>
      <h1 className="al-wordmark">{profile.firstName}</h1>
      <HeroLight />
      <WordmarkTrace reviewEnabled={reviewEnabled} />
      <HeroEntrance reviewEnabled={reviewEnabled} />
      <span className="al-side al-side-left" aria-hidden="true">
        {profile.hero.sideLeft}
      </span>
      <span className="al-side al-side-right" aria-hidden="true">
        {profile.hero.sideRight}
      </span>
      <p className="al-subtitle">{profile.hero.tagline}</p>
      <ProjectCarousel
        items={items}
        reviewEnabled={reviewEnabled}
        bottomLeft={
          <div className="al-bottom-left">
            <span className="al-mono">{profile.hero.identity}</span>
            <a href="#work">
              Discover the work
              <ArrowDown aria-hidden="true" />
            </a>
          </div>
        }
        bottomCenter={
          <span className="al-bottom-center" aria-hidden="true">
            DRAG TO EXPLORE
          </span>
        }
      />
    </section>
  );
}
