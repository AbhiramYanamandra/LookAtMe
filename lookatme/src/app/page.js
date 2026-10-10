import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Hero } from "@/components/home/Hero";
import { HeroIntro } from "@/components/home/HeroIntro";
import { TerminalSection } from "@/components/home/TerminalSection";
import { SkillsMarquee } from "@/components/home/SkillsMarquee";
import { getPublishedExperience } from "@/lib/experience";
import { profile } from "@/content/profile";
import { Introduction } from "@/components/home/Introduction";
import { StorySection } from "@/components/home/StorySection";
import { FieldDiscovery } from "@/components/home/FieldDiscovery";
import { ScrollStory } from "@/components/home/ScrollStory";
import { getPublishedProjects, toSummary } from "@/lib/projects";
import { populatedFields } from "@/lib/project-queries";

export default function HomePage() {
  const projects = getPublishedProjects().map(toSummary);
  const roles = getPublishedExperience();

  return (
    <>
      <HeroIntro
        lines={profile.hero.intro.lines}
        reviewEnabled={process.env.NODE_ENV !== "production" || process.env.CAROUSEL_REVIEW === "1"}
      />
      <SiteHeader overlay />
      <ScrollStory />
      <main>
        <Hero projects={projects} />
        <div className="al-below">
          <StorySection projects={projects} />
          <FieldDiscovery fields={populatedFields(projects)} total={projects.length} />
          <TerminalSection projects={projects} roles={roles} />
          <SkillsMarquee label={profile.skills.label} heading={profile.skills.heading} />
          <Introduction />
        </div>
      </main>
      <div className="al-below">
        <SiteFooter />
      </div>
    </>
  );
}
