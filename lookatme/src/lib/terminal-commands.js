/**
 * A pretend shell for the landing page. Nothing here executes anything: a
 * command line is looked up in a table and returns plain, structured output
 * that the component renders as text. No HTML is ever produced.
 *
 * Output lines are `{ t: "text" | "dim" | "head" | "link" | "gap" | "art" | "card", ... }`;
 * `art` is a monospace drawing (`text`), `card` is art beside key/value rows.
 * A result may also carry an `action` the component performs:
 * `{ type: "clear" | "navigate" | "clap", href? }`.
 */
export const PROMPT = "visitor@abhiram:~$";

const gap = { t: "gap" };
const text = (value) => ({ t: "text", text: value });
const dim = (value) => ({ t: "dim", text: value });
const head = (value) => ({ t: "head", text: value });
const link = (value, href) => ({ t: "link", text: value, href });

const art = (lines) => ({ t: "art", text: lines.join("\n") });

const FILES = ["about.txt", "interests.txt", "skills.txt", "contact.txt", "resume.pdf", "projects/"];

// A macropad, because of course.
const LOGO = [" .---.---.---. ", " |   |   |   | ", " :---+---+---: ", " |   |   |   | ", " :---+---+---: ", " |   |   | # | ", " '---'---'---' "];

const COMMANDS = {
  help: "list the commands",
  about: "who I am",
  projects: "things I've built",
  open: "open NAME  (try: open presto)",
  skills: "what I work with",
  interests: "what I do off the keyboard",
  neofetch: "a quick system summary, sort of",
  experience: "where I've worked",
  contact: "say hello",
  resume: "get my resume",
  ls: "list files",
  cat: "read a file  (try: cat about.txt)",
  whoami: "who are you?",
  clap: "make some noise",
  clear: "clear the screen",
};
export const INTEREST_COMMANDS = ["gym", "workout", "cycling", "bike", "swimming", "swim", "cooking", "cook", "cricket", "reading", "read", "books", "music"];
export const COMMAND_NAMES = [...Object.keys(COMMANDS), "thesis", "macropad", "presto", "sudo", ...INTEREST_COMMANDS];

/** Edit distance, for "did you mean". */
function distance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const current = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length];
}

function projectLines(project) {
  const lines = [head(project.title), text(project.summary)];
  if (project.badge) lines.push(dim(project.badge));
  lines.push(link(`→ /projects/${project.slug}`, `/projects/${project.slug}`));
  return lines;
}

function findProject(projects, query) {
  const needle = query.toLowerCase();
  return (
    projects.find((project) => project.slug === needle) ??
    projects.find((project) => project.title.toLowerCase().includes(needle)) ??
    null
  );
}

/** Aliases for the three lead projects. */
const ALIASES = { thesis: "photonic-correction", macropad: "macropad", presto: "presto" };

function skillLines(skills) {
  const groups = { software: [], hardware: [], ml: [] };
  skills.forEach((skill) => groups[skill.kind]?.push(skill.label));
  return [
    head("Skills"),
    text(`software   ${groups.software.join(", ")}`),
    text(`hardware   ${groups.hardware.join(", ")}`),
    text(`ml         ${groups.ml.join(", ")}`),
  ];
}

/**
 * Run one command line. `ctx` = { projects, roles, profile, skills }.
 */
export function runCommand(input, ctx) {
  const raw = input.trim();
  if (!raw) return { lines: [] };
  const [name, ...rest] = raw.split(/\s+/);
  const command = name.toLowerCase();
  const arg = rest.join(" ");
  const { projects, roles, profile, skills } = ctx;
  const interests = ctx.interests ?? [];

  if (command === "help") {
    return {
      lines: [
        head("Commands"),
        ...Object.entries(COMMANDS).map(([key, description]) => text(`${key.padEnd(11)}${description}`)),
        gap,
        dim("Tab completes. Up/down recalls history."),
      ],
    };
  }
  if (command === "about") {
    return {
      lines: [
        head(profile.name),
        text(profile.intro.lead),
        text(`${profile.education.degree}, ${profile.education.major} at ${profile.education.institution}.`),
        dim("Hardware, software and ML, and I like all three. Type interests for the rest."),
      ],
    };
  }
  if (command === "projects") {
    return {
      lines: [
        head("Projects"),
        ...projects.map((project) => text(`${project.slug.padEnd(22)}${project.title}`)),
        gap,
        dim("open NAME to read one."),
      ],
    };
  }
  if (command === "open" || ALIASES[command]) {
    const query = ALIASES[command] ?? arg;
    if (!query) return { lines: [text("open what? Try: open presto")] };
    const project = findProject(projects, query);
    if (!project) {
      return { lines: [text(`no project called "${query}".`), dim("Type projects to see the list.")] };
    }
    return {
      lines: [...projectLines(project), ...(command === "open" ? [dim("opening…")] : [])],
      action: command === "open" ? { type: "navigate", href: `/projects/${project.slug}` } : undefined,
    };
  }
  if (command === "neofetch") {
    const mix = skills.filter((skill, i) => i % 5 === 0).slice(0, 4).map((skill) => skill.label).join(" · ");
    return {
      lines: [
        {
          t: "card",
          art: LOGO.join("\n"),
          title: "visitor@abhiram",
          rows: [
            ["role", "hardware, software and ML engineer"],
            ["study", `${profile.education.major}, ${profile.education.institution}`],
            ["tools", mix],
            ["moves", interests.slice(0, 3).map((item) => item.label).join(" · ")],
            ["fuel", interests.slice(3).map((item) => item.label).join(" · ")],
          ],
        },
        dim("Type interests, projects or help."),
      ],
    };
  }
  if (command === "interests") {
    return {
      lines: [
        head("Off the keyboard"),
        ...interests.map((item) => text(`${item.id.padEnd(10)}${item.label}`)),
        gap,
        dim("Type one to see more. Try: cycling"),
      ],
    };
  }
  const interest = interests.find((item) => item.id === command || item.aliases.includes(command));
  if (interest) return { lines: [art(interest.art), head(interest.label), text(interest.line)] };
  if (command === "skills") return { lines: skillLines(skills) };
  if (command === "experience") {
    return {
      lines: [
        head("Experience"),
        ...roles.flatMap((role) => [text(`${role.organisation}, ${role.role}`), dim(`${role.start} → ${role.end ?? "present"}`)]),
      ],
    };
  }
  if (command === "contact") {
    return {
      lines: [
        head("Say hello"),
        link(profile.email, `mailto:${profile.email}`),
        link("github", profile.github),
        link("linkedin", profile.linkedin),
      ],
    };
  }
  if (command === "resume") return { lines: [link("resume.pdf ↗", profile.resume)] };
  if (command === "ls") return { lines: [text(FILES.join("   "))] };
  if (command === "cat") {
    const file = arg.replace(/^\.\//, "");
    if (file === "about.txt") return runCommand("about", ctx);
    if (file === "interests.txt") return runCommand("interests", ctx);
    if (file === "skills.txt") return runCommand("skills", ctx);
    if (file === "contact.txt") return runCommand("contact", ctx);
    if (file === "resume.pdf") return runCommand("resume", ctx);
    if (!file) return { lines: [text("cat what? Try: cat about.txt")] };
    return { lines: [text(`cat: ${file}: no such file`), dim("ls shows what's here.")] };
  }
  if (command === "whoami") return { lines: [text("a visitor. Welcome.")] };
  if (command === "clear") return { lines: [], action: { type: "clear" } };
  if (command === "clap") {
    return { lines: [text("      \\ | /"), text("    -- 👏 --"), text("      / | \\"), dim("signal detected. LED on.")], action: { type: "clap" } };
  }
  if (command === "sudo") {
    return {
      lines: arg.toLowerCase().includes("hire")
        ? [text("[sudo] password for visitor: ********"), text("access granted."), link("→ say hello", `mailto:${profile.email}`)]
        : [text("visitor is not in the sudoers file. This incident will be reported to nobody.")],
    };
  }
  if (command === "cd" || command === "rm" || command === "vim") {
    return { lines: [text(`${command}: this is a website, not a real shell. Nice try though.`)] };
  }

  const close = COMMAND_NAMES.map((candidate) => ({ candidate, d: distance(command, candidate) })).sort((a, b) => a.d - b.d)[0];
  return {
    lines: [text(`command not found: ${name}`), ...(close && close.d <= 2 ? [dim(`did you mean "${close.candidate}"?`)] : [dim("Type help.")])],
  };
}

/** Tab completion: complete a command, or the argument of `open`. */
export function complete(input, ctx) {
  const [first, ...rest] = input.split(/\s+/);
  if (rest.length === 0) {
    const matches = COMMAND_NAMES.filter((name) => name.startsWith(first.toLowerCase()));
    return matches.length === 1 ? `${matches[0]} ` : input;
  }
  if (first.toLowerCase() === "open" && rest.length === 1) {
    const matches = ctx.projects.filter((project) => project.slug.startsWith(rest[0].toLowerCase()));
    return matches.length === 1 ? `open ${matches[0].slug}` : input;
  }
  return input;
}
