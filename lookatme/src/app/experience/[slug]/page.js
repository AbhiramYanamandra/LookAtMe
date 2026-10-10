import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CaseStudyBody } from "@/components/project/CaseStudyContent";
import { ReadingProgress } from "@/components/project/ReadingProgress";
import { getPublishedExperience, getPublishedRole } from "@/lib/experience";
import { formatRoleSpan } from "@/lib/format";
import { techIcon } from "@/lib/tech-icons";
import { SkillIcon } from "@/components/home/SkillIcon";
import { profile } from "@/content/profile";

/** Only roles with a write-up get a page; a dated line has nothing to read. */
export function generateStaticParams() {
  return getPublishedExperience()
    .filter((role) => role.hasStory)
    .map((role) => ({ slug: role.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const role = getPublishedRole(slug);
  if (!role || !role.hasStory) return {};
  return {
    title: `${role.role} — ${role.organisation}`,
    description: role.summary,
    alternates: { canonical: `/experience/${role.slug}` },
    openGraph: {
      type: "article",
      title: `${role.organisation} — ${profile.name}`,
      description: role.summary,
    },
  };
}

export default async function ExperiencePage({ params }) {
  const { slug } = await params;
  const role = getPublishedRole(slug);
  if (!role || !role.hasStory) notFound();

  return (
    <>
      <SiteHeader />
      <main className="pl-page pl-page--narrow">
        <ReadingProgress articleId="experience-story" />
        <article id="experience-story">
          <header className="cs-header">
            <div>
              <Link href="/background#experience-heading" className="cs-back">
                <ArrowLeft aria-hidden="true" />
                Back to experience
              </Link>
              <span className="al-mono">[ Experience ]</span>
              <h1>{role.organisation}</h1>
              <p className="cs-summary">{role.summary}</p>
            </div>
            <dl className="cs-facts">
              <div>
                <dt>Role</dt>
                <dd>{role.role}</dd>
              </div>
              <div>
                <dt>When</dt>
                <dd>{formatRoleSpan(role)}</dd>
              </div>
              {role.location && (
                <div>
                  <dt>Location</dt>
                  <dd>{role.location}</dd>
                </div>
              )}
              {role.technologies.length > 0 && (
                <div className="cs-facts-wide">
                  <dt>Worked with</dt>
                  <dd>
                    <span className="cs-chips">
                      {role.technologies.map((tech) => (
                        <span key={tech}>
                          <SkillIcon name={techIcon(tech) ?? "code"} size={14} />
                          {tech}
                        </span>
                      ))}
                    </span>
                  </dd>
                </div>
              )}
            </dl>
          </header>

          <div className="cs-layout">
            <div>
              <CaseStudyBody source={role.body} />
            </div>
            <aside className="cs-aside">
              <div className="cs-aside-block">
                <span className="al-mono">Explore</span>
                <div className="cs-links">
                  <Link href="/background#experience-heading">
                    All experience
                    <ArrowUpRight aria-hidden="true" />
                  </Link>
                  <Link href="/projects">
                    All projects
                    <ArrowUpRight aria-hidden="true" />
                  </Link>
                  <a href={`mailto:${profile.email}`}>
                    Let’s talk
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </article>
      </main>
      <div className="pl-page pl-page--narrow">
        <SiteFooter />
      </div>
    </>
  );
}
