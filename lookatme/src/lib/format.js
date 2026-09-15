const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** Human-readable project date for YYYY, YYYY-MM, or YYYY-MM-DD; null when undated. */
export function formatProjectDate(date) {
  if (!date) return null;
  const [year, month, day] = date.split("-");
  if (!month) return year;
  const monthName = MONTHS[Number(month) - 1];
  return day ? `${Number(day)} ${monthName} ${year}` : `${monthName} ${year}`;
}
