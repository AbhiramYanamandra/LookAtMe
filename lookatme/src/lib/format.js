const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** `Jan 2025` from `2025-01`. */
function formatMonth(value) {
  if (!value) return null;
  const [year, month] = value.split("-");
  return month ? `${SHORT_MONTHS[Number(month) - 1]} ${year}` : year;
}

/**
 * The span shown on the experience timeline: `Jan 2025 — Feb 2026`, or
 * `Sep 2023 — Present` for an ongoing role. Years collapse when a role
 * starts and ends inside the same one.
 */
export function formatRoleSpan({ start, end, ongoing }) {
  const from = formatMonth(start);
  if (ongoing) return `${from} — Present`;
  const to = formatMonth(end);
  if (!to) return from;
  const sameYear = start.slice(0, 4) === end.slice(0, 4);
  return `${sameYear ? from.replace(` ${start.slice(0, 4)}`, "") : from} — ${to}`;
}

/** Human-readable project date for YYYY, YYYY-MM, or YYYY-MM-DD; null when undated. */
export function formatProjectDate(date) {
  if (!date) return null;
  const [year, month, day] = date.split("-");
  if (!month) return year;
  const monthName = MONTHS[Number(month) - 1];
  return day ? `${Number(day)} ${monthName} ${year}` : `${monthName} ${year}`;
}

/** Inclusive month count for a role: Jan 2025 — Feb 2026 is 14 months. */
export function roleMonths({ start, end, ongoing }, now = new Date()) {
  const [sy, sm] = start.split("-").map(Number);
  const [ey, em] = ongoing ? [now.getFullYear(), now.getMonth() + 1] : end.split("-").map(Number);
  return (ey - sy) * 12 + (em - sm) + 1;
}

/** `1 yr 2 mo`, `8 mo`, `2 yr` — the length of a role as a measurement. */
export function formatRoleDuration(role) {
  const months = roleMonths(role);
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return [years ? `${years} yr` : null, rest ? `${rest} mo` : null].filter(Boolean).join(" ");
}
