/**
 * Personal profile information shared across the site.
 * Edit this file to change names, links, and the introduction copy.
 */
export const profile = {
  name: "Abhiram Yanamandra",
  firstName: "Abhiram",
  logo: "ay.",
  email: "ysabhiram@gmail.com",
  github: "https://github.com/AbhiramYanamandra",
  linkedin: "https://www.linkedin.com/in/abhiram-y-a803b7246/",
  resume: "/resume.pdf",
  portrait: {
    src: "/images/me.jpeg",
    alt: "Abhiram Yanamandra",
    width: 5120,
    height: 3412,
  },
  siteTitle: "Abhiram Yanamandra — software & hardware engineer",
  siteDescription:
    "Portfolio of Abhiram Yanamandra. Web applications, hardware, and digital systems — from circuits to interfaces.",
  hero: {
    sideLeft: "software.",
    sideRight: "& hardware.",
    tagline: "Ideas in motion. Engineering in practice.",
    identity: "Abhiram Yanamandra / Portfolio",
  },
  // The completion month is unresolved (Aug vs Dec 2026), so the period is
  // deliberately stated to the year only. WAM and individual course marks are
  // left off: they invite a reader to average a transcript instead of reading
  // the work.
  education: {
    institution: "UNSW Sydney",
    degree: "Bachelor of Engineering (Honours)",
    major: "Computer Engineering",
    period: "Mar 2022 — 2026",
    location: "Sydney",
    highlight: {
      label: "Honours thesis",
      value: "89 HD",
      detail: "High-precision photonic computing",
      href: "/projects/photonic-correction",
    },
    // Every course marked 80 or above, taken verbatim from the UNSW academic
    // statement. Highest first. The honours thesis (COMP4951/4952/4953, 89)
    // is the highlight above and is not repeated here.
    courseworkLabel: "Marked 80 and above",
    coursework: [
      { code: "COMP6080", title: "Web Front-End Programming", mark: 91, grade: "HD" },
      { code: "COMP1531", title: "Software Engineering Fundamentals", mark: 89, grade: "HD" },
      { code: "ELEC2133", title: "Analogue Electronics", mark: 85, grade: "HD" },
      { code: "DESN2000", title: "Engineering Design 2", mark: 84, grade: "DN" },
      { code: "DESN1000", title: "Engineering Design", mark: 81, grade: "DN" },
      { code: "COMP3121", title: "Algorithm Design and Analysis", mark: 80, grade: "DN" },
    ],
  },
  intro: {
    caption: "The person behind the projects.",
    label: "[ Hi, I’m Abhiram. ]",
    heading: "From circuits to interfaces.",
    // Rendered with the name in bold; keep the sentence structure.
    lead: "I build web applications, hardware, and digital systems. Curious about how things work, and what I can make with them.",
  },
  work: {
    label: "[ Selected engineering work ]",
    heading: "A few things I’ve built.",
    aside: ["Different fields.", "Shared curiosity."],
    discovery: "Find work in your field",
  },
  footer: {
    invitation: "Let’s build something.",
  },
};
