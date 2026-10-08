import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatRoleDuration, formatRoleSpan } from "@/lib/format";
import { ExperienceSpan } from "./ExperienceSpan";

/**
 * Where I've worked: a dated timeline, newest first.
 *
 * Weight follows evidence. A role with a write-up behind it carries its
 * stack and links into the full account; a role without one is a dated line
 * and stops there. Nothing links to an empty page, and nothing is padded to
 * match its neighbour — the same rule the project library follows.
 */
export function ExperienceTimeline({ roles }) {
  if (roles.length === 0) return null;

  return (
    <section className="ab-experience" aria-labelledby="experience-heading">
      <div className="ab-section-heading" data-reveal="heading">
        <span className="al-mono">[ Where I’ve worked ]</span>
        {/* No count in the copy: a hardcoded "Four roles" goes stale the
            moment a fifth is added. Echoes the portrait caption instead. */}
        <h2 id="experience-heading">The jobs behind the projects.</h2>
      </div>

      <ExperienceSpan roles={roles} />

      <ol className="xp-list">
        {roles.map((role) => {
          const span = formatRoleSpan(role);
          return (
            <li key={role.slug} className={`xp-role xp-role--${role.kind}`} data-reveal>
              <div className="xp-when">
                <span className="al-mono">{span}</span>
                <span className="al-mono xp-duration">{formatRoleDuration(role)}</span>
              </div>
              <div className="xp-what">
                <h3>
                  {role.hasStory ? (
                    <Link href={`/experience/${role.slug}`}>
                      {role.organisation}
                      <ArrowUpRight aria-hidden="true" />
                    </Link>
                  ) : (
                    role.organisation
                  )}
                </h3>
                <p className="xp-title">
                  {role.role}
                  {role.location ? <span className="xp-where"> · {role.location}</span> : null}
                </p>
                <p className="xp-summary">{role.summary}</p>
                {role.technologies.length > 0 && (
                  <ul className="xp-stack" aria-label={`Technologies used at ${role.organisation}`}>
                    {role.technologies.map((tech) => (
                      <li key={tech}>{tech}</li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
