/**
 * The Presto walkthrough as data: one scripted timeline (cursor moves, clicks,
 * typing, scene changes) and a pure function that says what the screen shows
 * at any moment. Positions are percentages of the app window (x across, y
 * down), so the cursor lands on the same buttons the renderer places there.
 */
export const TARGETS = {
  loginLanding: [43.5, 58],
  email: [50, 38],
  password: [50, 56],
  loginSubmit: [50, 74],
  newPresentation: [80, 22],
  modalName: [50, 47],
  modalCreate: [58, 62],
  card: [19, 56],
  title: [59, 57],
  addSlide: [41, 17],
  body: [59, 67],
};

export const DURATION = 22000;
/** A frame near the end with everything done, for reduced motion. */
export const STATIC_AT = 20200;

const BEATS = [
  { at: 0, scene: "landing" },
  { at: 0, move: [82, 88], dur: 0 },
  { at: 500, move: TARGETS.loginLanding, dur: 900 },
  { at: 1600, click: "loginLanding" },
  { at: 2000, scene: "login" },
  { at: 2000, move: TARGETS.email, dur: 700 },
  { at: 2800, click: "email" },
  { at: 3000, type: "email", text: "demo@presto.app", per: 65 },
  { at: 4100, move: TARGETS.password, dur: 500 },
  { at: 4700, click: "password" },
  { at: 4900, type: "password", text: "••••••••", per: 80 },
  { at: 5700, move: TARGETS.loginSubmit, dur: 600 },
  { at: 6400, click: "loginSubmit" },
  { at: 7000, scene: "dashboard" },
  { at: 7300, move: TARGETS.newPresentation, dur: 900 },
  { at: 8400, click: "newPresentation" },
  { at: 8500, modal: true },
  { at: 8600, move: TARGETS.modalName, dur: 500 },
  { at: 9200, click: "modalName" },
  { at: 9400, type: "name", text: "Hello from Abhiram", per: 60 },
  { at: 10700, move: TARGETS.modalCreate, dur: 500 },
  { at: 11300, click: "modalCreate" },
  { at: 11400, modal: false },
  { at: 11500, cards: 1 },
  { at: 11800, move: TARGETS.card, dur: 700 },
  { at: 12600, click: "card" },
  { at: 13000, scene: "editor" },
  { at: 13200, move: TARGETS.title, dur: 600 },
  { at: 13900, click: "title" },
  { at: 14000, type: "title", text: "Hello, Presto", per: 90 },
  { at: 15600, move: TARGETS.addSlide, dur: 700 },
  { at: 16500, click: "addSlide" },
  { at: 16600, slides: 2 },
  { at: 17000, move: TARGETS.body, dur: 600 },
  { at: 17700, click: "body" },
  { at: 17900, type: "body", text: "Built with React + TypeScript", per: 55 },
];

const CLICK_MS = 180;
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/** What the window shows `time` ms into the loop. */
export function frameAt(time) {
  const t = ((time % DURATION) + DURATION) % DURATION;
  let scene = "landing";
  let modal = false;
  let cards = 0;
  let slides = 1;
  let focus = null;
  let down = null;
  const typed = { email: "", password: "", name: "", title: "", body: "" };
  let from = [82, 88];
  let cursor = [82, 88];

  for (const beat of BEATS) {
    if (beat.at > t) break;
    if (beat.scene) scene = beat.scene;
    if (beat.modal !== undefined) modal = beat.modal;
    if (beat.cards !== undefined) cards = beat.cards;
    if (beat.slides !== undefined) slides = beat.slides;
    if (beat.click) {
      focus = beat.click;
      if (t < beat.at + CLICK_MS) down = beat.click;
    }
    if (beat.type) typed[beat.type] = beat.text.slice(0, Math.min(beat.text.length, Math.floor((t - beat.at) / beat.per) + 1));
    if (beat.move) {
      const progress = beat.dur === 0 ? 1 : Math.min(1, (t - beat.at) / beat.dur);
      cursor = [from[0] + (beat.move[0] - from[0]) * ease(progress), from[1] + (beat.move[1] - from[1]) * ease(progress)];
      // Moves run one after another, so the next one starts from this target.
      if (progress >= 1) from = beat.move;
    }
  }
  const fade = Math.min(1, t / 350, (DURATION - t) / 350);
  return { scene, modal, cards, slides, focus, down, typed, cursor: { x: cursor[0], y: cursor[1] }, fade: Math.max(0, fade) };
}
