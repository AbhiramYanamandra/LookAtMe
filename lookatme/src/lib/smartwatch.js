/**
 * The DESN2000 smartwatch's interface, as documented in its user guide.
 *
 * ICONS are the custom 5×8 CGRAM characters, sampled pixel by pixel from the
 * guide's symbol table. PAGES and EDGES are the guide's navigation map: every
 * page, and every button press that moves between pages ("SW1L" is a long
 * press). Map positions are the page boxes' centres on that diagram.
 *
 * Screen text is reconstructed from the guide's description of each page,
 * using its abbreviations (HAP, SND, SLR, TIM…). Numbers are illustrative.
 * In an LCD line, {name} draws that icon in one character cell.
 */
export const ICONS = {
  heart: ["00000", "01010", "11111", "11111", "11111", "01110", "00100", "00000"],
  floors: ["00001", "00011", "00111", "00111", "01111", "01111", "11111", "11111"],
  battery: ["01110", "11111", "10001", "11111", "10001", "11111", "10001", "11111"],
  o2: ["01000", "10100", "10100", "10100", "01011", "00001", "00010", "00011"],
  steps: ["11000", "11000", "11000", "11100", "11110", "11111", "11111", "00000"],
  dnd: ["00000", "00000", "01110", "11111", "10001", "11111", "01110", "00000"],
  flashlight: ["10101", "01110", "11111", "11111", "01110", "01110", "01110", "01110"],
};

export const BUTTONS = ["SW1", "SW2", "SW3", "B1"];

export const PAGES = {
  quick: { label: "Quick access", short: "Quick", x: 163, y: 470, lcd: ["QUICK ACCESS", "{dnd}DND {flashlight}FL B1:PWR"] },
  power: { label: "Power saving", short: "Power", x: 318, y: 682, lcd: ["     14:05", "  {battery}86% {steps}4210"] },
  home: { label: "Home", short: "Home", x: 488, y: 542, lcd: ["14:05 12/07 SAT", "{steps}4210     {battery}86%"] },
  settings: { label: "Settings", short: "Settings", x: 742, y: 345, lcd: ["SETTINGS", "HAP SND SLR TIM"] },
  flashlight: { label: "Flashlight", short: "Flash", x: 778, y: 493, lcd: ["{flashlight} FLASHLIGHT", "SW1: ON / OFF"] },
  activity: { label: "Activity summary", short: "Activity", x: 778, y: 650, lcd: ["ACTIVITY", "{steps}4210 {heart}72 {floors}12"] },
  haptics: { label: "Edit haptics", short: "Haptics", x: 1027, y: 210, lcd: ["HAP: HAPTICS", "ON"] },
  sound: { label: "Edit sound", short: "Sound", x: 1310, y: 230, lcd: ["SND: SOUND", "ON"] },
  solar: { label: "Solar charging", short: "Solar", x: 1590, y: 228, lcd: ["SLR: CHARGING", "LDR 612 {battery}86%"] },
  time: { label: "Edit time", short: "Time", x: 1085, y: 380, lcd: ["TIM: 14:05:32", "     ^^"] },
  date: { label: "Edit date", short: "Date", x: 1380, y: 364, lcd: ["DATE: 12/07", "      ^^"] },
  day: { label: "Edit day", short: "Day", x: 1680, y: 364, lcd: ["DAY: SAT", ""] },
  steps: { label: "Steps", short: "Steps", x: 1093, y: 513, lcd: ["{steps} STEPS", "4210"] },
  o2: { label: "O₂", short: "O2", x: 1392, y: 512, lcd: ["{o2} SpO2", "98%"] },
  heart: { label: "Heart rate", short: "Heart", x: 1093, y: 626, lcd: ["{heart} HEART RATE", "72 BPM"] },
  floors: { label: "Floors climbed", short: "Floors", x: 1392, y: 626, lcd: ["{floors} FLOORS", "12"] },
  clock: { label: "Clock", short: "Clock", x: 1090, y: 786, lcd: ["CLOCK", "ALM  STW  TMR"] },
  alarm: { label: "Alarm", short: "Alarm", x: 1392, y: 737, lcd: ["ALARM 07:30 AM", "ON"] },
  stopwatch: { label: "Stopwatch", short: "Stopwatch", x: 1392, y: 850, lcd: ["STOPWATCH", "00:00.0"] },
  timer: { label: "Timer", short: "Timer", x: 1665, y: 850, lcd: ["TIMER", "05:00"] },
};

/** [from, to, button] for every arrow on the navigation map. */
export const EDGES = [
  ["home", "settings", "SW1"],
  ["settings", "home", "SW2"],
  ["home", "flashlight", "SW2"],
  ["flashlight", "home", "SW3"],
  ["home", "activity", "SW3"],
  ["activity", "home", "B1"],
  ["home", "quick", "SW1L"],
  ["quick", "home", "SW3"],
  ["quick", "power", "B1"],
  ["power", "home", "B1"],
  ["settings", "haptics", "SW3"],
  ["haptics", "settings", "SW1"],
  ["haptics", "sound", "B1"],
  ["sound", "haptics", "SW1"],
  ["sound", "solar", "B1"],
  ["solar", "sound", "SW1"],
  ["settings", "time", "B1"],
  ["time", "settings", "SW1"],
  ["time", "date", "B1"],
  ["date", "time", "SW1"],
  ["date", "day", "B1"],
  ["day", "date", "SW1"],
  ["activity", "steps", "SW1"],
  ["steps", "activity", "SW2"],
  ["steps", "o2", "SW1"],
  ["o2", "steps", "SW2"],
  ["activity", "heart", "SW2"],
  ["heart", "activity", "SW3"],
  ["heart", "floors", "SW2"],
  ["floors", "heart", "SW3"],
  ["activity", "clock", "SW3"],
  ["clock", "activity", "B1"],
  ["clock", "alarm", "SW1"],
  ["alarm", "clock", "SW2"],
  ["clock", "stopwatch", "SW2"],
  ["stopwatch", "clock", "SW3"],
  ["stopwatch", "timer", "SW2"],
  ["timer", "stopwatch", "SW3"],
];

export const MAP_BOUNDS = { x0: 70, y0: 180, x1: 1750, y1: 880 };

export function next(page, button) {
  const edge = EDGES.find(([from, , b]) => from === page && b === button);
  return edge ? edge[1] : null;
}

/** Unordered page pairs, for drawing each connection once. */
export function links() {
  const seen = new Set();
  return EDGES.filter(([a, b]) => {
    const key = [a, b].sort().join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Split an LCD line into 16 cells of plain characters or icon names. */
export function lcdCells(line) {
  const cells = [];
  for (let i = 0; i < line.length && cells.length < 16; i++) {
    if (line[i] === "{") {
      const end = line.indexOf("}", i);
      cells.push({ icon: line.slice(i + 1, end) });
      i = end;
    } else {
      cells.push({ ch: line[i] });
    }
  }
  while (cells.length < 16) cells.push({ ch: " " });
  return cells;
}

/** The loop the library card plays: a tour through activity, clock and settings. */
export const CARD_ROUTE = [
  "home",
  ["SW3", "activity"],
  ["SW2", "heart"],
  ["SW2", "floors"],
  ["SW3", "heart"],
  ["SW3", "activity"],
  ["SW3", "clock"],
  ["SW2", "stopwatch"],
  ["SW2", "timer"],
  ["SW3", "stopwatch"],
  ["SW3", "clock"],
  ["B1", "activity"],
  ["B1", "home"],
  ["SW1", "settings"],
  ["B1", "time"],
  ["SW1", "settings"],
  ["SW2", "home"],
];
