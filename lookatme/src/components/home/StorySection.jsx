import { profile } from "@/content/profile";
import { ModelViewer } from "@/components/project/ModelViewer";
import { PrestoWalkthrough } from "@/components/project/PrestoWalkthrough";
import { ThesisFigure } from "@/components/project/ThesisFigure";
import { ProjectStory } from "./ProjectStory";

/** Server wrapper: joins each chapter's copy to its project and interactive visual. */
export function StorySection({ projects }) {
  const { story } = profile;

  const visuals = {
    macropad: <ModelViewer {...story.model} poster="/images/macropad.png" />,
    presto: (project) => {
      const live = project.links?.find((link) => link.label === "Live demo");
      return <PrestoWalkthrough url={live?.url ?? "/projects/presto"} />;
    },
    "photonic-correction": <ThesisFigure />,
  };

  // Cheap stand-ins shown until a heavy visual is needed (and with no JS).
  const posters = {
    macropad: (
      <div className="al-model al-model-poster">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/macropad.png" alt={story.model.alt} />
      </div>
    ),
  };

  const chapters = story.chapters
    .map((chapter) => {
      const project = projects.find((candidate) => candidate.slug === chapter.slug);
      if (!project) return null;
      const visual = typeof visuals[chapter.slug] === "function" ? visuals[chapter.slug](project) : visuals[chapter.slug];
      return { ...chapter, title: project.title, href: `/projects/${project.slug}`, visual, poster: posters[chapter.slug] };
    })
    .filter(Boolean);

  return <ProjectStory label={story.label} heading={story.heading} hint={story.hint} chapters={chapters} />;
}
