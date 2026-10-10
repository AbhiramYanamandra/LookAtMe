import { profile } from "@/content/profile";
import { ALL_SKILLS } from "@/content/skills";
import { INTERESTS } from "@/content/interests";
import { Terminal } from "./Terminal";

/** Server wrapper: hands the terminal its data from the single sources of truth. */
export function TerminalSection({ projects, roles }) {
  const { terminal } = profile;
  const ctx = {
    projects: projects.map(({ slug, title, summary, badge }) => ({ slug, title, summary, badge })),
    roles: roles.map(({ organisation, role, start, end }) => ({ organisation, role, start, end: end ?? null })),
    profile: {
      name: profile.name,
      email: profile.email,
      github: profile.github,
      linkedin: profile.linkedin,
      resume: profile.resume,
      intro: profile.intro,
      education: profile.education,
    },
    skills: ALL_SKILLS.map(({ label, kind }) => ({ label, kind })),
    interests: INTERESTS,
  };
  return (
    <section className="al-terminal-section" aria-labelledby="terminal-heading" data-reveal="heading">
      <div className="al-terminal-copy">
        <span className="al-mono">{terminal.label}</span>
        <h2 id="terminal-heading">{terminal.heading}</h2>
        <p>{terminal.body}</p>
      </div>
      <Terminal ctx={ctx} greeting={terminal.greeting} />
    </section>
  );
}
