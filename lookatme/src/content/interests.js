/**
 * Off-keyboard interests for the terminal. Each is a command (and its
 * aliases); `art` is a small ASCII drawing printed above the line.
 * Keep the lines true to what is known: no invented personal bests.
 */
export const INTERESTS = [
  {
    id: "gym",
    label: "working out",
    aliases: ["workout", "lift"],
    line: "The one debugger that works on me. Show up, lift, repeat.",
    art: [" _          _ ", "| |________| |", "|_|        |_|"],
  },
  {
    id: "cycling",
    label: "cycling",
    aliases: ["bike", "ride"],
    line: "Legs on, notifications off. There are no stack traces on a bike.",
    art: ["    __o  ", "  _ \\<_ ", " (_)/(_) "],
  },
  {
    id: "swimming",
    label: "swimming",
    aliases: ["swim"],
    line: "Laps. No signal underwater, which is half the appeal.",
    art: ["  ~   ~   o/  ~", " ~  ~   ~ /|   ~", "  ~   ~   / \\ ~"],
  },
  {
    id: "cooking",
    label: "cooking",
    aliases: ["cook", "kitchen"],
    line: "Mise en place is just setup code for dinner. Taste before you ship.",
    art: ["   ) ) )     ", "  .------.___ ", " (  ~~~~  ___)", "  '------'    "],
  },
  {
    id: "cricket",
    label: "cricket",
    aliases: ["bat"],
    line: "Playing it, watching it, arguing about it. Mention an umpiring call and clear your afternoon.",
    art: ["  ||        ", "  ||     o  ", "  ||        ", " [__]       "],
  },
  {
    id: "reading",
    label: "reading",
    aliases: ["read", "books"],
    line: "Always partway through something. The cheapest way to borrow a better brain.",
    art: [".------.------.", "|~~~~~~|~~~~~~|", "|~~~~~~|~~~~~~|", "'------'------'"],
  },
  {
    id: "music",
    label: "music",
    aliases: ["listen", "playlist"],
    line: "On while I build, on while I ride, on while I cook. Everything gets a soundtrack.",
    art: ["   .-\"\"\"\"-.   ", "  /  .--.  \\  ", " (|_/    \\_|) "],
  },
];
