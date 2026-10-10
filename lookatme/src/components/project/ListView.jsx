"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { fieldLabel } from "@/content/fields";
import { formatProjectDate } from "@/lib/format";
import { projectBadge } from "./CardBody";
import { ProjectVisual, GENERATED_VISUALS } from "./ProjectVisual";
import { SkillIcon } from "@/components/home/SkillIcon";
import { techIcon } from "@/lib/tech-icons";

/**
 * The library as an editorial list: big titles, quiet metadata. Hovering a row
 * floats its preview beside the cursor; the preview is decorative, everything
 * it says is in the row.
 */
export function ListView({ projects, children }) {
  const [hover, setHover] = useState(null);
  const floater = useRef(null);

  const move = (event) => {
    const el = floater.current;
    if (!el) return;
    el.style.transform = `translate3d(${event.clientX + 28}px, ${event.clientY - 90}px, 0)`;
  };
  const current = projects.find((project) => project.slug === hover);

  return (
    <div className="pl-list" onPointerMove={move} onPointerLeave={() => setHover(null)}>
      <ol>
        {projects.map((project, index) => (
          <li key={project.slug} data-reveal onPointerEnter={(event) => event.pointerType === "mouse" && setHover(project.slug)}>
            <Link href={`/projects/${project.slug}`}>
              <span className="pl-list-index al-mono">{String(index + 1).padStart(2, "0")}</span>
              <span className="pl-list-title">{project.title}</span>
              <span className="pl-list-meta">
                <span>{projectBadge(project)}</span>
                {project.fields[0] && <span>{fieldLabel(project.fields[0])}</span>}
                {formatProjectDate(project.date) && <span>{formatProjectDate(project.date)}</span>}
              </span>
              <span className="pl-list-tech" aria-hidden="true">
                {project.technologies.slice(0, 5).map((tech) => (
                  <SkillIcon key={tech} name={techIcon(tech) ?? "code"} size={16} />
                ))}
              </span>
            </Link>
          </li>
        ))}
      </ol>
      {projects.length === 0 && children}
      <div ref={floater} className="pl-list-float pv-live" data-on={current ? "" : undefined} aria-hidden="true">
        {current &&
          (GENERATED_VISUALS.includes(current.card.visual) ? (
            <ProjectVisual kind={current.card.visual} />
          ) : current.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={current.cover.src} alt="" />
          ) : (
            <b>{current.title}</b>
          ))}
      </div>
    </div>
  );
}
