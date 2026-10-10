import { profile } from "@/content/profile";
import { ModelViewer } from "./ModelViewer";
import { WyaAccess } from "./WyaAccess";
import { ThesisFigure } from "./ThesisFigure";
import { Showcase } from "./Showcase";

/** Server wrapper: joins the lead chapters from profile.story to their projects and interactive visuals. */
export function ShowcaseSection({ projects }) {
  const { story } = profile;
  const visuals = {
    macropad: <ModelViewer {...story.model} poster="/images/macropad.png" />,
    wya: <WyaAccess url={projects.find((p) => p.slug === "wya")?.links?.find((l) => l.label === "Website")?.url ?? "/projects/wya"} />,
    "photonic-correction": <ThesisFigure />,
  };
  const posters = {
    macropad: (
      <div className="al-model al-model-poster">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/macropad.png" alt={story.model.alt} />
      </div>
    ),
  };
  const tiles = story.chapters
    .map((chapter) => {
      const project = projects.find((candidate) => candidate.slug === chapter.slug);
      if (!project) return null;
      return {
        ...chapter,
        title: project.title,
        href: `/projects/${project.slug}`,
        visual: visuals[chapter.slug],
        poster: posters[chapter.slug],
      };
    })
    .filter(Boolean);
  return <Showcase tiles={tiles} />;
}

export const SHOWCASE_SLUGS = profile.story.chapters.map((chapter) => chapter.slug);
