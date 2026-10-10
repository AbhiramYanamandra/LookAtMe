/**
 * wya: the access model and the numbers behind the case study.
 *
 * VIEWERS mirrors the people in wya's access-control suite
 * (supabase/tests/rls_check.py, 72 checks against the dev database): a host,
 * a guest who said yes, a guest who opened the invite but hasn't answered, a
 * signed-in stranger and a logged-out visitor. The event itself is the
 * marketing site's sample, not real data. The case study's access matrix
 * uses all five; the showcase uses the four in SHOWCASE_VIEWERS.
 */
export const EVENT = {
  title: "Rooftop Night",
  host: "Hannah",
  when: "SAT · 8 PM",
  venue: "Hannah’s place",
  address: "12 Albion St, Surry Hills",
  theme: { base: "#8B5CFF", ink: "#FFFFFF", shape: "#B394FF" },
};

export const GUESTS = [
  { name: "Gary", status: "yes", note: "Vegetarian, +1", color: "#8B5CFF" },
  { name: "Riley", status: "yes", note: null, color: "#3CC8FF" },
  { name: "Kai", status: "maybe", note: "Might be late", color: "#FF3CAC" },
  { name: "Jo", status: "invited", note: null, color: "#FF6A3D" },
];

export const VIEWERS = [
  {
    id: "host",
    name: "Hannah",
    role: "Host",
    color: "#FFB13C",
  },
  {
    id: "going",
    name: "Gary",
    role: "Going",
    color: "#8B5CFF",
  },
  {
    id: "invited",
    name: "Jo",
    role: "Invited",
    color: "#FF6A3D",
  },
  {
    id: "stranger",
    name: "Sam",
    role: "Not invited",
    color: "#5E5673",
  },
  {
    id: "anon",
    name: "Visitor",
    role: "Logged out",
    color: "#A198B2",
  },
];

/**
 * What each viewer can do, from the access-control suite. `true` passes,
 * `false` is denied or returns nothing, a string is a partial answer.
 */
export const CAPABILITIES = [
  { label: "See the event", values: { host: true, going: true, invited: true, stranger: false, anon: "Preview only" } },
  { label: "See the address", values: { host: true, going: true, invited: true, stranger: false, anon: false } },
  { label: "Guest list", values: { host: "Everyone", going: "Going / maybe", invited: "Going / maybe", stranger: false, anon: false } },
  { label: "Guests’ notes", values: { host: true, going: false, invited: false, stranger: false, anon: false } },
  { label: "Read the chat", values: { host: true, going: true, invited: false, stranger: false, anon: false } },
  { label: "Get the invite code", values: { host: true, going: "If re-sharing is on", invited: "If re-sharing is on", stranger: false, anon: false } },
  { label: "Edit or delete the event", values: { host: true, going: false, invited: false, stranger: false, anon: false } },
  { label: "Remove a guest", values: { host: true, going: false, invited: false, stranger: false, anon: false } },
];

export const RLS_CHECKS = 72;

/** The six event themes (constants/eventThemes.ts). */
export const EVENT_THEMES = [
  { name: "Lime", base: "#D4FF3F", ink: "#0B0B0F", shape: "#A8D91A" },
  { name: "Bubblegum", base: "#FF3CAC", ink: "#0B0B0F", shape: "#FF8BCB" },
  { name: "Violet", base: "#8B5CFF", ink: "#FFFFFF", shape: "#B394FF" },
  { name: "Tangerine", base: "#FF6A3D", ink: "#1C1530", shape: "#FFA07F" },
  { name: "Ocean", base: "#3CC8FF", ink: "#0B0B0F", shape: "#8ADFFF" },
  { name: "Sunset", base: "#FFB13C", ink: "#1C1530", shape: "#FFD27F" },
];

/**
 * Stripe's cut of a host's no-show deposits in one month, using the fees in
 * wya's plan: 2.9% + 30¢ per card charge, 0.25% + 25¢ per payout, and $2 for
 * each Connect Express account paid out that month. One payout per month.
 */
export function stripeCut(deposit, noShows) {
  const collected = deposit * noShows;
  if (noShows === 0) return { collected: 0, card: 0, payout: 0, account: 0, total: 0, share: 0, host: 0 };
  const card = noShows * (deposit * 0.029 + 0.3);
  const payout = (collected - card) * 0.0025 + 0.25;
  const account = 2;
  const total = card + payout + account;
  return { collected, card, payout, account, total, share: total / collected, host: collected - total };
}

/**
 * The showcase visual's four people, in plain words. Each `sees` row is
 * [what, yes/no, optional detail]; every answer is one of the access checks.
 */
export const SHOWCASE_VIEWERS = [
  {
    id: "host",
    name: "Hannah",
    role: "Hosting",
    color: "#FFB13C",
    blurb: "Hannah made the event. She sees everything, including the notes guests leave for her.",
    sees: [
      ["The event", true],
      ["The address", true],
      ["Who’s coming", true, "Everyone, even no-answers"],
      ["Guests’ notes", true],
      ["The group chat", true],
      ["Editing the event", true],
    ],
  },
  {
    id: "going",
    name: "Gary",
    role: "Said yes",
    color: "#8B5CFF",
    blurb: "Gary is coming. He sees who else is, and the chat, but never the notes other guests left the host.",
    sees: [
      ["The event", true],
      ["The address", true],
      ["Who’s coming", true, "Names only"],
      ["Guests’ notes", false],
      ["The group chat", true],
      ["Editing the event", false],
    ],
  },
  {
    id: "invited",
    name: "Jo",
    role: "Hasn’t answered",
    color: "#FF6A3D",
    blurb: "Jo opened the invite but hasn’t replied. The chat stays shut until Jo answers. Tap “I’m in” on the phone.",
    sees: [
      ["The event", true],
      ["The address", true],
      ["Who’s coming", true, "Names only"],
      ["Guests’ notes", false],
      ["The group chat", false, "Opens once Jo answers"],
      ["Editing the event", false],
    ],
  },
  {
    id: "anon",
    name: "A friend",
    role: "Just has the link",
    color: "#5E5E73",
    blurb: "The link got forwarded to someone who isn’t signed in. They get enough to decide, and nothing more.",
    sees: [
      ["The event", true, "Title, date and host"],
      ["The address", false, "Hidden until they join"],
      ["Who’s coming", false],
      ["Guests’ notes", false],
      ["The group chat", false],
      ["Editing the event", false],
    ],
  },
];
