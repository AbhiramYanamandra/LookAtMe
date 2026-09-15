import Image from "next/image";
import Link from "next/link";
import { profile } from "@/content/profile";
import { CardBody } from "@/components/project/CardBody";
import { SupportVisual } from "@/components/project/CardVisuals";
import { libraryHref } from "@/lib/project-queries";

/** Lead-card visual: the actual screenshot inside a thin framed preview. */
function ScreenshotVisual({ project, index }) {
  const { cover } = project;
  return (
    <div className="al-card-visual">
      <span className="al-visual-index">
        {String(index).padStart(2, "0")} / {project.title}
      </span>
      <Image
        src={cover.src}
        alt={cover.alt}
        width={cover.width}
        height={cover.height}
        sizes="(max-width: 800px) 100vw, 640px"
        priority
        data-depth=""
      />
    </div>
  );
}

/**
 * Selected Engineering Work: one lead card (featured rank 1) and the
 * supporting cards (following ranks), followed by the browse-by-field strip.
 */
export function SelectedWork({ featured, fields }) {
  const [lead, ...supporting] = featured;

  return (
    <section className="al-work" id="work" aria-labelledby="work-heading">
      <div className="al-work-heading" data-reveal="heading">
        <div>
          <span className="al-mono">{profile.work.label}</span>
          <h2 id="work-heading">{profile.work.heading}</h2>
        </div>
        <span className="al-mono">
          {profile.work.aside.map((line, index) => (
            <span key={line}>
              {index > 0 && <br />}
              {line}
            </span>
          ))}
        </span>
      </div>

      {lead && (
        <div className="al-featured-grid">
          <article className="al-project-card al-lead-card" data-reveal="tilt">
            {lead.cover ? <ScreenshotVisual project={lead} index={1} /> : null}
            <CardBody project={lead} />
          </article>
          {supporting.map((project) => (
            <article key={project.slug} className="al-project-card al-support-card" data-reveal="tilt">
              <SupportVisual project={project} />
              <CardBody project={project} titleLines={project.card.titleLines} />
            </article>
          ))}
        </div>
      )}

      <div className="al-field-discovery" data-reveal="sequence">
        <span>{profile.work.discovery}</span>
        <nav className="al-field-actions" aria-label="Browse projects by field">
          {fields.map((field, index) => (
            <Link key={field.id} href={libraryHref({ field: field.id })} style={{ "--seq": index }}>
              {field.label} ↗
            </Link>
          ))}
          <Link href="/projects" style={{ "--seq": fields.length }}>
            All projects ↗
          </Link>
        </nav>
      </div>
    </section>
  );
}
