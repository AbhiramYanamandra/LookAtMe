import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { profile } from "@/content/profile";
import { ModelViewer } from "@/components/project/ModelViewer";
import { WyaAccess } from "@/components/project/WyaAccess";
import { ThesisFigure } from "@/components/project/ThesisFigure";
import { HudTile } from "@/components/project/HudSim";
import { ProjectStory } from "./ProjectStory";
import { ChapterStill } from "./ChapterStill";
import { StoryCardRow } from "./StoryCardRow";

/** Server wrapper: joins each chapter's copy to its project and interactive visual. */
export function StorySection({ projects }) {
  const { story } = profile;

  const visuals = {
    macropad: <ModelViewer {...story.model} poster="/images/macropad-case.jpg" />,
    wya: (project) => {
      const site = project.links?.find((link) => link.label === "Website");
      return <WyaAccess url={site?.url ?? "/projects/wya"} />;
    },
    "photonic-correction": <ThesisFigure />,
    "redback-hud": <HudTile />,
  };

  // Cheap stand-ins shown until a heavy visual is needed (and with no JS).
  const posters = {
    macropad: (
      <div className="al-model al-model-poster">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/macropad-case.jpg" alt={story.model.alt} />
      </div>
    ),
  };

  // Phones show a still per project instead of its live demo: in the pinned
  // story, and in the cards it falls back to. The demos stay in each case study.
  const stills = {
    macropad: { src: "/images/macropad-case.jpg", width: 1200, height: 900 },
    wya: { src: "/images/wya.png" },
    "redback-hud": { src: "/images/redback/hud-final.png", width: 557, height: 334 },
  };

  const chapters = story.chapters
    .map((chapter) => {
      const project = projects.find((candidate) => candidate.slug === chapter.slug);
      if (!project) return null;
      const visual = typeof visuals[chapter.slug] === "function" ? visuals[chapter.slug](project) : visuals[chapter.slug];
      // The pinned phone story draws the still itself from this data.
      const image = stills[chapter.slug];
      const still = image ? { src: image.src, width: image.width ?? project.cover?.width, height: image.height ?? project.cover?.height } : null;
      return { ...chapter, title: project.title, href: `/projects/${project.slug}`, visual, poster: posters[chapter.slug], still };
    })
    .filter(Boolean);

  // Keyed: React's dev check counts an element handed to a client component
  // as a list child.
  const cards = (
    <div key="cards" className="al-story-cards">
      <StoryCardRow titles={chapters.map((chapter) => chapter.title)}>
        {chapters.map((chapter, index) => {
          return (
            <li key={chapter.slug} aria-roledescription="slide" aria-label={`${index + 1} of ${chapters.length}`}>
              <Link href={chapter.href} className="al-story-card">
                <div className="al-story-card-image">
                  <ChapterStill still={chapter.still} />
                </div>
                <div className="al-story-card-body">
                  <span className="al-mono">
                    {String(index + 1).padStart(2, "0")} / {chapter.kicker}
                  </span>
                  <h3>{chapter.title}</h3>
                  <p>{chapter.headline}</p>
                  <span className="al-story-card-cta">
                    {chapter.cta}
                    <ArrowUpRight aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </StoryCardRow>
      <Link href="/projects" className="al-story-all">
        See all {projects.length} projects
        <ArrowRight aria-hidden="true" />
      </Link>
    </div>
  );

  return <ProjectStory label={story.label} heading={story.heading} hint={story.hint} cardsHint={story.cardsHint} chapters={chapters} cards={cards} />;
}
