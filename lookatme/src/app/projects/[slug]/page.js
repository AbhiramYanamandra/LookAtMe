import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CaseStudyBody, Figure, Gallery, kindLabel } from "@/components/project/CaseStudyContent";
import { QuickFacts } from "@/components/project/QuickFacts";
import { ProjectCard } from "@/components/project/ProjectCard";
import { BackToLibrary } from "@/components/project/LibraryState";
import { ReadingProgress } from "@/components/project/ReadingProgress";
import { FieldBadge, projectBadge } from "@/components/project/CardBody";
import { getPublishedProject, getPublishedProjects, toSummary } from "@/lib/projects";
import { relatedProjects } from "@/lib/project-queries";
import { profile } from "@/content/profile";

/**
 * Published slugs are prerendered. Unknown slugs (and drafts) still reach
 * the page and return 404 via notFound(); leaving dynamicParams at its
 * default also lets the dev server pick up newly published content.
 */
export function generateStaticParams() {
  return getPublishedProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = getPublishedProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      type: "article",
      title: `${project.title} — ${profile.name}`,
      description: project.summary,
      images: project.cover ? [{ url: project.cover.src, alt: project.cover.alt }] : undefined,
    },
  };
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const project = getPublishedProject(slug);
  if (!project) notFound();

  const related = relatedProjects(project, getPublishedProjects().map(toSummary));
  const { cover } = project;

  return (
    <>
      <SiteHeader />
      <main className="pl-page pl-page--narrow">
        <ReadingProgress articleId="case-study" />
        <article id="case-study">
          <header className="cs-header">
            <div>
              <BackToLibrary />
              <span className="al-mono">[ Case study ]</span>
              <h1>{project.title}</h1>
              <p className="cs-summary">{project.summary}</p>
            </div>
            <div>
              <div style={{ marginBottom: 14 }}>
                <FieldBadge>{projectBadge(project)}</FieldBadge>
              </div>
              <QuickFacts project={project} />
            </div>
          </header>

          {cover && (
            <figure className="cs-cover" data-reveal>
              <div className="cs-figure-frame">
                <Image
                  src={cover.src}
                  alt={cover.alt}
                  width={cover.width}
                  height={cover.height}
                  sizes="(max-width: 1120px) 100vw, 1056px"
                  data-fit={cover.fit}
                  style={{ objectPosition: cover.position }}
                  priority
                />
              </div>
              <figcaption className="cs-figcaption">
                <span>{cover.caption ?? cover.alt}</span>
                {cover.kind && <span className="al-mono">{kindLabel(cover.kind)}</span>}
              </figcaption>
            </figure>
          )}

          <div className="cs-layout">
            <div>
              <CaseStudyBody source={project.body} />
              {project.gallery.length > 0 && (
                <section aria-label="Supporting images" className="cs-body">
                  <h2>Supporting images</h2>
                  <Gallery>
                    {project.gallery.map((image) => (
                      <Figure
                        key={image.src}
                        src={image.src}
                        alt={image.alt}
                        caption={image.caption}
                        kind={image.kind}
                        width={image.width}
                        height={image.height}
                      />
                    ))}
                  </Gallery>
                </section>
              )}
            </div>
            <aside className="cs-aside">
              {project.links.length > 0 && (
                <div className="cs-aside-block">
                  <span className="al-mono">Links</span>
                  <div className="cs-links">
                    {project.links.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target={link.url.startsWith("/") ? undefined : "_blank"}
                        rel={link.url.startsWith("/") ? undefined : "noopener noreferrer"}
                      >
                        {link.label}
                        <ArrowUpRight aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <div className="cs-aside-block">
                <span className="al-mono">Explore</span>
                <div className="cs-links">
                  <Link href="/projects">
                    All projects
                    <ArrowUpRight aria-hidden="true" />
                  </Link>
                  <Link href="/#work">
                    Selected work
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

        {related.length > 0 && (
          <section className="cs-related" aria-labelledby="related-heading">
            <div className="al-work-heading" data-reveal>
              <div>
                <span className="al-mono">[ More work ]</span>
                <h2 id="related-heading">Related projects.</h2>
              </div>
            </div>
            <div className="pl-grid">
              {related.map((item) => (
                <div key={item.slug} className="pl-cell" data-reveal>
                  <ProjectCard project={item} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <div className="pl-page pl-page--narrow">
        <SiteFooter />
      </div>
    </>
  );
}
