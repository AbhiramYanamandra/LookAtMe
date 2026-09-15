import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { profile } from "@/content/profile";
import { getField } from "@/content/fields";
import { getPublishedProjects, toSummary } from "@/lib/projects";
import { populatedFields } from "@/lib/project-queries";

export const metadata = {
  title: "About",
  description: `Meet ${profile.name}. ${profile.intro.lead}`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const fields = populatedFields(getPublishedProjects().map(toSummary));

  return (
    <>
      <SiteHeader />
      <main className="ab-page">
        <section className="ab-hero" aria-labelledby="about-title">
          <div className="ab-intro">
            <span className="al-mono">[ The person behind the projects ]</span>
            <h1 id="about-title">{profile.intro.heading}</h1>
            <p className="ab-name">I’m {profile.name}.</p>
            <p className="ab-description">{profile.intro.lead}</p>
            <div className="ab-links">
              <Link href="/projects" className="ab-primary">Explore my work <ArrowUpRight aria-hidden="true" /></Link>
              <a href={profile.resume} target="_blank" rel="noopener noreferrer">View résumé <ArrowUpRight aria-hidden="true" /></a>
            </div>
          </div>
          <figure className="ab-portrait">
            <Image src={profile.portrait.src} alt={profile.portrait.alt}
              width={profile.portrait.width} height={profile.portrait.height}
              sizes="(max-width: 700px) 80vw, 430px" quality={85} priority />
            <figcaption className="al-mono">{profile.name} / software &amp; hardware</figcaption>
          </figure>
        </section>

        <section className="ab-fields" aria-labelledby="about-fields-title">
          <div className="ab-section-heading" data-reveal>
            <span className="al-mono">[ What I build ]</span>
            <h2 id="about-fields-title">Different fields.<br />Shared curiosity.</h2>
          </div>
          <div className="ab-field-grid">
            {fields.map((field, index) => {
              const info = getField(field.id);
              return (
                <Link key={field.id} href={`/projects?field=${field.id}`} className="ab-field" data-reveal>
                  <span className="al-mono">0{index + 1} / {field.count} {field.count === 1 ? "project" : "projects"}</span>
                  <h3>{info.label}<ArrowUpRight aria-hidden="true" /></h3>
                  <p>{info.description}</p>
                  <span className="ab-field-action">See the work ↗</span>
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
            <a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
          </div>
        </section>
      </main>
      <div className="ab-page"><SiteFooter /></div>
    </>
  );
}
