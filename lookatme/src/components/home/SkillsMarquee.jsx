import { SKILL_ROWS } from "@/content/skills";
import { SkillIcon } from "./SkillIcon";

/**
 * Four rows of skill chips sliding in alternating directions. Each row is
 * rendered twice so the loop is seamless; the copy is hidden from assistive
 * tech. Motion is CSS-only and stops for reduced motion (rows then wrap).
 */
export function SkillsMarquee({ heading, label }) {
  return (
    <section className="al-skills" aria-labelledby="skills-heading" data-reveal="heading">
      <div className="al-skills-head">
        <span className="al-mono">{label}</span>
        <h2 id="skills-heading">{heading}</h2>
      </div>
      <div className="al-skills-rows">
        {SKILL_ROWS.map((row, index) => (
          <div key={index} className="al-skills-row" data-direction={index % 2 === 0 ? "left" : "right"} style={{ "--row-speed": `${52 + index * 8}s` }}>
            {[0, 1].map((copy) => (
              <ul key={copy} className="al-skills-track" aria-hidden={copy === 1 ? "true" : undefined}>
                {row.map((skill) => (
                  <li key={skill.label} className="al-chip" data-kind={skill.kind}>
                    <SkillIcon name={skill.icon} />
                    {skill.label}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
