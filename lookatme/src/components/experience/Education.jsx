import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { profile } from "@/content/profile";

/**
 * Education, set in the same two-column language as the experience timeline
 * directly above it — dated span in the left margin, substance on the right —
 * so the page reads as one continuous record rather than two stacked lists.
 *
 * One mark appears, and it is the thesis, because it is the only mark that
 * points at something on this site you can go and read.
 */
export function Education() {
  const { education } = profile;
  if (!education) return null;
  const { highlight } = education;

  return (
    <section className="ab-education" aria-labelledby="education-heading">
      <div className="ab-section-heading" data-reveal="heading">
        <span className="al-mono">[ Education ]</span>
        <h2 id="education-heading">Where it was learned.</h2>
      </div>

      <div className="xp-list">
        <div className="xp-role" data-reveal>
          <div className="xp-when">
            <span className="al-mono">{education.period}</span>
          </div>
          <div className="xp-what">
            <h3>{education.institution}</h3>
            <p className="xp-title">
              {education.degree}
              {education.major ? <> in {education.major}</> : null}
              {education.location ? <span className="xp-where"> · {education.location}</span> : null}
            </p>
            {highlight && (
              <p className="xp-highlight">
                <span className="al-mono">{highlight.label}</span>
                <strong>{highlight.value}</strong>
                {highlight.href ? (
                  <Link href={highlight.href}>
                    {highlight.detail}
                    <ArrowUpRight aria-hidden="true" />
                  </Link>
                ) : (
                  <span>{highlight.detail}</span>
                )}
              </p>
            )}

            {education.coursework?.length > 0 && (
              <div className="xp-courses">
                {/* Bare mono, not bracketed: this labels data, not editorial. */}
                <span className="al-mono xp-courses-label">{education.courseworkLabel}</span>
                <ul>
                  {education.coursework.map((course, index) => (
                    <li key={course.code} style={{ "--n": index }}>
                      <span className="al-mono xp-course-code">{course.code}</span>
                      <span className="xp-course-title">{course.title}</span>
                      <span className="xp-course-mark">
                        {course.mark}
                        {course.grade ? <i>{course.grade}</i> : null}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
