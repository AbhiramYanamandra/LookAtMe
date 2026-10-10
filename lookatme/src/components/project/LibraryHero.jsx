import { LineReveal } from "@/components/site/LineReveal";
import { CountUp } from "./CountUp";
import { Spectrum } from "./Spectrum";
import { fieldLabel } from "@/content/fields";
import { spectrumOf } from "@/lib/spectrum";
import { projectBadge } from "./CardBody";

/**
 * The Work page opener: the headline, three real numbers, and the spectrum of
 * every project from hardware to software.
 */
export function LibraryHero({ projects, fields }) {
  const technologies = new Set(projects.flatMap((project) => project.technologies)).size;
  const items = projects.map((project) => ({
    slug: project.slug,
    title: project.title,
    badge: projectBadge(project),
    fields: project.fields,
    fieldLabel: project.fields[0] ? fieldLabel(project.fields[0]) : null,
    spectrum: spectrumOf(project),
    visual: project.card.visual,
    cover: project.cover?.src ?? null,
  }));

  return (
    <header className="pl-hero">
      <div className="pl-hero-copy" data-reveal="copy" data-reveal-entrance>
        <span className="al-mono">[ The work ]</span>
        <LineReveal as="h1" text="From silicon to browser." />
        <p>
          Everything I’ve built, laid out on one line: circuit boards and FPGAs on the left, models and research in
          the middle, web and tooling on the right. Hover a dot, click to filter.
        </p>
      </div>
      <dl className="pl-stats" data-reveal>
        <div>
          <dt>projects</dt>
          <dd>
            <CountUp value={projects.length} />
          </dd>
        </div>
        <div>
          <dt>fields</dt>
          <dd>
            <CountUp value={fields.length} />
          </dd>
        </div>
        <div>
          <dt>technologies</dt>
          <dd>
            <CountUp value={technologies} />
          </dd>
        </div>
      </dl>
      <div className="pl-hero-spectrum" data-reveal>
        <Spectrum items={items} />
      </div>
    </header>
  );
}
