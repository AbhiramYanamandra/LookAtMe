import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { profile } from "@/content/profile";
import { getField } from "@/content/fields";
import { getPublishedProjects, toSummary } from "@/lib/projects";
import { getPublishedExperience, toRoleSummary } from "@/lib/experience";
import { ExperienceTimeline } from "@/components/experience/ExperienceTimeline";
import { Education } from "@/components/experience/Education";
import { populatedFields } from "@/lib/project-queries";
import { LineReveal } from "@/components/site/LineReveal";

export const metadata = {
  title: "Background",
  description: `${profile.name} — experience, education, and the engineering fields the work sits in.`,
  alternates: { canonical: "/background" },
};

export default function BackgroundPage() {
  const fields = populatedFields(getPublishedProjects().map(toSummary));
  const roles = getPublishedExperience().map(toRoleSummary);

  return (
    <>
      <SiteHeader />
      <main className="ab-page">
        <section className="ab-hero" aria-labelledby="about-title">
          {/* The page's one authored entrance: it plays even after a click
              navigation, which otherwise shows in-view content at once. */}
          <div className="ab-intro" data-reveal="copy" data-reveal-entrance data-reveal-delay="140">
            <span className="al-mono">[ The person behind the projects ]</span>
            <LineReveal as="h1" id="about-title" text={profile.intro.heading} />
            <p className="ab-name">I’m {profile.name}.</p>
            <p className="ab-description">{profile.intro.lead}</p>
            <div className="ab-links">
              <Link href="/projects" className="ab-primary">Explore my work <ArrowUpRight aria-hidden="true" /></Link>
              <a href={profile.resume} target="_blank" rel="noopener noreferrer">View résumé <ArrowUpRight aria-hidden="true" /></a>
            </div>
          </div>
          <figure className="ab-portrait">
            {/* The mask sits inside the tilted figure so the reveal never
                fights the approved -3deg rotation. */}
            <span className="ab-portrait-frame" data-reveal="mask" data-reveal-entrance data-reveal-delay="0">
              <Image src={profile.portrait.src} alt={profile.portrait.alt}
                width={profile.portrait.width} height={profile.portrait.height}
                sizes="(max-width: 700px) 80vw, 430px" quality={85} priority />
            </span>
            <figcaption className="al-mono">{profile.name} / software &amp; hardware</figcaption>
          </figure>
        </section>

        <ExperienceTimeline roles={roles} />

        <Education />

        <section className="ab-fields" aria-labelledby="about-fields-title">
          <div className="ab-section-heading" data-reveal="heading">
            <span className="al-mono">[ What I build ]</span>
            <h2 id="about-fields-title">Different fields.<br />Shared curiosity.</h2>
          </div>
          <div className="ab-field-grid">
            {fields.map((field) => {
              const info = getField(field.id);
              return (
                <Link key={field.id} href={`/projects?field=${field.id}`} className="ab-field" data-reveal>
                  {/* The count is the useful number; the 01/02 index was
                      ordinal decoration that the craft floor rules out. */}
                  <span className="al-mono">
                    {field.count} {field.count === 1 ? "project" : "projects"}
                  </span>
                  <h3>{info.label}<ArrowUpRight aria-hidden="true" /></h3>
                  <p>{info.description}</p>
                  {/* No "See the work ↗" label: the whole tile is the link,
                      and nine copies of it was nine text-glyph arrows. */}
                </Link>
              );
            })}
          </div>
        </section>

        <section className="ab-connect" data-reveal aria-labelledby="about-connect-title">
          <div>
            <span className="al-mono">[ Get in touch ]</span>
            <h2 id="about-connect-title">{profile.footer.invitation}</h2>
          </div>
          <div className="ab-links">
            <a href={`mailto:${profile.email}`} className="ab-primary">Say hello <ArrowUpRight aria-hidden="true" /></a>
            <a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub <ArrowUpRight aria-hidden="true" /></a>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn <ArrowUpRight aria-hidden="true" /></a>
          </div>
        </section>
      </main>
      <div className="ab-page"><SiteFooter /></div>
    </>
  );
}
