import { LineReveal } from "@/components/site/LineReveal";
import { CountUp } from "./CountUp";
import { Spectrum } from "./Spectrum";
import { spectrumOf } from "@/lib/spectrum";

/**
 * The Work page opener: the headline, three real numbers, and the spectrum
 * filter — where the work sits from hardware to software, and a brush to
 * narrow the library to any part of it.
 */
export function LibraryHero({ projects, fields, field, sort, view, range }) {
  const technologies = new Set(projects.flatMap((project) => project.technologies)).size;
  const items = projects.map((project) => ({
    slug: project.slug,
    title: project.title,
    fields: project.fields,
    spectrum: spectrumOf(project),
  }));

  return (
    <header className="pl-hero">
      <div className="pl-hero-copy" data-reveal="copy" data-reveal-entrance>
        <span className="al-mono">[ The work ]</span>
        <LineReveal as="h1" text="From silicon to browser." />
        <p>
          Everything I’ve built sits somewhere between circuit boards and FPGAs, through models and research, to web
          and tooling. Drag across the spectrum to narrow the work below.
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
        <Spectrum items={items} field={field} sort={sort} view={view} range={range} />
      </div>
    </header>
  );
}
