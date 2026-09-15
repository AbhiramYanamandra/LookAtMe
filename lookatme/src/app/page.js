import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Hero } from "@/components/home/Hero";
import { Introduction } from "@/components/home/Introduction";
import { SelectedWork } from "@/components/home/SelectedWork";
import { ScrollStory } from "@/components/home/ScrollStory";
import { getPublishedProjects, toSummary } from "@/lib/projects";
import { featuredProjects, heroProjects, populatedFields } from "@/lib/project-queries";

export default function HomePage() {
  const projects = getPublishedProjects().map(toSummary);

  return (
    <>
      <SiteHeader overlay />
      <ScrollStory />
      <main>
        <Hero projects={heroProjects(projects)} />
        <div className="al-below">
          <Introduction />
          <SelectedWork featured={featuredProjects(projects)} fields={populatedFields(projects)} />
        </div>
      </main>
      <div className="al-below">
        <SiteFooter />
      </div>
    </>
  );
}
