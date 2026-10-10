import Link from "next/link";
import { formatRoleDuration } from "@/lib/format";

/** Months since year 0, so a span is a plain subtraction. */
function monthIndex(value) {
  const [year, month] = value.split("-").map(Number);
  return year * 12 + (month - 1);
}

/**
 * The record drawn to scale: each role is a dimension line laid against a
 * yearly axis, with its measured length written on it. Every mark comes from
 * the role's own `start` and `end`, so the drawing is as checkable as the
 * list beneath it — overlaps and gaps are shown, not described.
 *
 * It repeats the list in another form, so it is hidden from assistive tech
 * and its links leave the tab order; the list carries the same links.
 */
export function ExperienceSpan({ roles }) {
  const now = new Date();
  const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const spans = roles.map((role) => ({
    role,
    from: monthIndex(role.start),
    // End of the final month, so a one-month role still has length.
    to: monthIndex(role.ongoing ? current : role.end) + 1,
  }));

  const firstYear = Math.floor(Math.min(...spans.map((s) => s.from)) / 12);
  const lastYear = Math.ceil(Math.max(...spans.map((s) => s.to)) / 12);
  const axisStart = firstYear * 12;
  const axisLength = (lastYear - firstYear) * 12;
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i);
  const at = (month) => ((month - axisStart) / axisLength) * 100;

  // Lines draw in the order the work happened, whatever order they're listed in.
  const chronological = [...spans].sort((a, b) => a.from - b.from).map((s) => s.role.slug);

  return (
    <figure className="xp-span" data-reveal="span" aria-hidden="true">
      <div className="xp-span-plot" style={{ "--lanes": spans.length }}>
        {years.map((year) => (
          <span key={year} className="xp-span-year" style={{ "--x": `${at(year * 12)}%` }}>
            <span className="al-mono">{year}</span>
          </span>
        ))}
        <ol className="xp-span-lanes">
          {spans.map(({ role, from, to }) => {
            const left = at(from);
            const width = at(to) - left;
            const style = {
              "--from": `${left}%`,
              "--width": `${width}%`,
              "--i": chronological.indexOf(role.slug),
            };
            // Labels hang off whichever end of the line has room.
            const anchor = left + width / 2 > 55 ? "end" : "start";
            const body = (
              <>
                <span className="xp-bar-label">{role.organisation}</span>
                <span className="xp-bar-line" />
                <span className="al-mono xp-bar-reading">{formatRoleDuration(role)}</span>
              </>
            );
            return (
              <li key={role.slug} className={`xp-lane xp-lane--${role.kind}`}>
                {role.hasStory ? (
                  <Link href={`/experience/${role.slug}`} className="xp-bar" data-anchor={anchor} data-circuit="bar" style={style} tabIndex={-1}>
                    {body}
                  </Link>
                ) : (
                  <span className="xp-bar" data-anchor={anchor} data-circuit="bar" style={style}>{body}</span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </figure>
  );
}
