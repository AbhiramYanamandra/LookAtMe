/**
 * Interactive models, keyed by the GLB a project cover points at
 * (`cover.model` in the project's frontmatter).
 *
 * Each layer names the GLB nodes it owns (`match`, prefixes of the node names
 * as three.js reads them: spaces become underscores, dots are dropped) and how
 * far it lifts, in millimetres, when the model is taken apart. Listed top to
 * bottom; the order is also the order of the layer list under the model.
 *
 * `views` are the camera angles, [around, down from vertical] in degrees, it
 * starts from and swings to when taken apart.
 */
export const models = {
  "/models/macropad.glb": {
    alt: "The macropad fully assembled in its case. Select it to take it apart into its layers: switches, top shell, display and encoder header, PCB and diodes, XIAO RP2040 and bottom tray.",
    // Apart, the camera faces the edge with the OLED and XIAO, which the plates would otherwise hide.
    views: { assembled: [32, 60], apart: [212, 74] },
    layers: [
      {
        id: "switches",
        match: ["MX_PCB"],
        label: "MX switches ×9",
        detail: "Mechanical switches on a 3×3 matrix, soldered straight to the board.",
        lift: 66,
      },
      {
        id: "top",
        match: ["Enclosure_top"],
        label: "Top shell",
        detail: "2 mm walls and a plate 5 mm above the board, the MX standard, holding every switch. Windows for the display and encoder header.",
        lift: 44,
      },
      {
        id: "oled",
        match: ["OLED"],
        label: "SSD1306 OLED",
        detail: "128×32 display on I²C, wired GND, VCC, SCL and SDA.",
        lift: 20,
      },
      {
        id: "encoder",
        match: ["PinHeader"],
        label: "Encoder header",
        detail: "Five pins for the rotary encoder: GND, 5V, the two quadrature signals and the push switch.",
        lift: 20,
      },
      {
        id: "pcb",
        match: ["Macropad-mk2_PCB"],
        label: "PCB",
        detail: "Two-layer board designed in KiCad and taken through to Gerbers, drill files and a BOM.",
        lift: 0,
      },
      {
        id: "diodes",
        match: ["Diode"],
        label: "Diodes ×9",
        detail: "One per key, so any combination of pressed keys reads correctly without ghosting.",
        lift: 0,
      },
      {
        id: "xiao",
        match: ["XIAO"],
        label: "XIAO RP2040",
        detail: "The controller, on the underside of the board. Runs CircuitPython with KMK and talks to the computer over USB-C.",
        lift: -20,
      },
      {
        id: "bottom",
        match: ["Enclosure_bottom"],
        label: "Bottom tray",
        detail: "M2 standoffs under the four mounting holes, and a slot in the wall for the XIAO's USB-C port.",
        lift: -42,
      },
    ],
  },
};
