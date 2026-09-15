/**
 * Engineering fields — the browsing taxonomy.
 *
 * `id` is the stable identifier used in project frontmatter and in
 * `/projects?field=<id>` URLs. Never rename an id once projects use it;
 * change `label` instead. Order here is the display order for filters.
 *
 * Fields describe the engineering work performed. Technologies (React,
 * Verilog, AWS, …) are listed separately on each project.
 */
export const FIELDS = [
  {
    id: "hardware",
    label: "Hardware Engineering",
    description: "Circuit boards, digital logic, and processor design.",
  },
  {
    id: "frontend",
    label: "Frontend",
    description: "Interfaces and applications that run in the browser.",
  },
  {
    id: "backend",
    label: "Backend",
    description: "Services, APIs, and data handling behind an application.",
  },
  {
    id: "cloud",
    label: "Cloud",
    description: "Infrastructure, deployment pipelines, and cloud-native systems.",
  },
  {
    id: "embedded",
    label: "Embedded Systems",
    description: "Firmware and software that runs close to the hardware.",
  },
  {
    id: "automation",
    label: "Developer Tools / Automation",
    description: "Scripts and utilities that remove repetitive work.",
  },
];

export const FIELD_IDS = FIELDS.map((field) => field.id);

const byId = new Map(FIELDS.map((field) => [field.id, field]));

export function getField(id) {
  return byId.get(id) ?? null;
}

export function fieldLabel(id) {
  return byId.get(id)?.label ?? id;
}
