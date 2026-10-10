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
    identity: "Abhiram Yanamandra / Portfolio",
    photo: {
      src: "/images/hero2.jpeg",
      alt: "Abhiram mid-laugh at night, holding a box of loaded fries and pointing at himself",
      width: 3648,
      height: 2736,
    },
    // Each role is typed in turn; its project tile comes forward while it shows.
    roles: [
      { label: "hardware engineer", slug: "macropad" },
      { label: "software engineer", slug: "wya" },
      { label: "ML engineer", slug: "photonic-correction" },
    ],
    staticRoles: "Hardware, software and ML engineer",
    // First-load boot sequence, typed on black before the page lights up.
    intro: {
      lines: [
        { kind: "command", text: "booting abhiram.sh" },
        { kind: "check", text: "hardware" },
        { kind: "check", text: "software" },
        { kind: "check", text: "ml" },
        { kind: "command", text: "hello." },
      ],
    },
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
  story: {
    label: "[ Selected work ]",
    heading: "Three things I’ve built.",
    hint: "Scroll. Then touch things.",
    model: {
      src: "/models/macropad.glb",
      alt: "3D model of the macropad PCB assembly: nine switch sockets, an OLED display and a pin header",
      // Positions are in metres in the model's own space (centred on the board).
      hotspots: [
        { label: "SSD1306 OLED", position: "-0.00918m 0.0007m -0.02756m" },
        { label: "3×3 MX switch matrix", position: "-0.0001m 0.0059m 0.00699m" },
        { label: "5-pin header", position: "0.02142m 0.004m -0.02391m" },
        // On the underside of the board: flip the model over to see it.
        { label: "XIAO RP2040 (underside)", position: "-0.00034m -0.00919m -0.02915m", normal: "0m -1m 0m" },
      ],
    },
    chapters: [
      {
        slug: "macropad",
        kicker: "Hardware",
        headline: "A keyboard I designed, from schematic to board.",
        cta: "Explore the build",
        facts: [
          { value: "3×3", label: "mechanical switch matrix with a diode on every key" },
          { value: "RP2040", label: "XIAO controller driving an SSD1306 OLED over I²C" },
          { value: "Gerbers", label: "taken all the way to a manufacturable package" },
        ],
      },
      {
        slug: "wya",
        kicker: "Software",
        headline: "An RSVP app where “I’m in” actually means something.",
        cta: "Read the case study",
        facts: [
          { value: "No app", label: "needed to RSVP: invite links open in any browser" },
          { value: "72", label: "automated tests proving each guest sees only what they should" },
          { value: "$0", label: "if you show up. No-shows lose a small deposit (built next)" },
        ],
      },
      {
        slug: "photonic-correction",
        kicker: "Research · ML",
        headline: "Fixing noisy photonic maths in the numbers, not the hardware.",
        cta: "Read the thesis",
        facts: [
          { value: "95.5%", label: "mean absolute error reduction against the baseline (low-bit decomposed correction)" },
          { value: "11.24×", label: "ImageNet noise tolerance (AlexNet and ResNet18 average)" },
          { value: "6", label: "correction schemes compared under one noise model" },
        ],
      },
    ],
  },
  skills: {
    label: "[ Hardware, software and ML ]",
    heading: "Things I build with.",
  },
  terminal: {
    label: "[ Poke around ]",
    heading: "Ask the terminal.",
    body: "Hardware, software and what I get up to off the keyboard. Type a command, or tap one below.",
    greeting: [
      "Welcome. You found the interactive bit.",
      "Try projects, skills or interests, or type help for everything.",
    ],
  },
  footer: {
    invitation: "Let’s build something.",
  },
};
