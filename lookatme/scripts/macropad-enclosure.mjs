/**
 * The macropad enclosure, modelled in code around the KiCad board.
 *
 *   node scripts/macropad-enclosure.mjs [name]
 *
 * Run directly, it writes printable `<name>-top.stl` and `<name>-bottom.stl`.
 * convert-step.mjs imports `build()` through `--enclosure` to put the case
 * around the board in the web model.
 *
 * Follows the Fusion 360 design (Macropad-mk2.f3d): 2 mm walls, the top plate
 * 5 mm above the board like a standard MX plate, a pocket per switch and one
 * for the OLED. It splits at the underside of the PCB into a top shell and a
 * bottom tray, so the board drops onto the tray's standoffs. That file's PCB was consumed by a Combine cut, so this
 * rebuilds the case from the board itself. Coordinates are STEP millimetres:
 * x as in KiCad, y = -KiCad y, z up from the bottom of the PCB.
 */
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import Module from "manifold-3d";

// Board outline (Edge.Cuts) and stack-up, read from Macropad-mk2.kicad_pcb / .step.
const BOARD = { x0: 68.6, x1: 131.27, y0: -144.56, y1: -63.68, radius: 3.17 };
const PCB_TOP = 1.51;
const CLEARANCE = 0.5;
const WALL = 2;
const FLOOR = 2;
const CAVITY_BOTTOM = -5.5; // the XIAO and the OLED's pins hang to -4.9 under the board
const PLATE = 1.5;
const PLATE_TOP = PCB_TOP + 5; // MX plate height above the PCB

const SWITCHES = [80.8, 99.85, 118.9].flatMap((x) => [91.85, 110.9, 129.95].map((y) => [x, -y]));
const MOUNTING_HOLES = [
  [71.905, -66.855],
  [128.095, -66.875],
  [71.756, -141.361],
  [127.946, -141.381],
];
// Windows in the plate: the OLED module and the five-pin header beside it.
const WINDOWS = [
  { x0: 71.1, x1: 110.4, y0: -82.9, y1: -69.8 },
  { x0: 114.5, x1: 128.2, y0: -81.8, y1: -78.2 },
];
// USB-C on the XIAO, mounted upside down under the board at the top edge.
const USB = { x: 99.59, z: -2.6, width: 11, height: 5 };

export async function build() {
  const wasm = await Module();
  wasm.setup();
  const { CrossSection, Manifold } = wasm;
  wasm.setCircularSegments(64);

  const roundedRect = ({ x0, x1, y0, y1 }, grow, radius) =>
    CrossSection.square([x1 - x0 + 2 * grow - 2 * radius, y1 - y0 + 2 * grow - 2 * radius], true)
      .offset(radius, "Round")
      .translate([(x0 + x1) / 2, (y0 + y1) / 2]);
  const prism = (section, z0, z1) => section.extrude(z1 - z0).translate([0, 0, z0]);

  const bottom = CAVITY_BOTTOM - FLOOR;
  const outer = prism(roundedRect(BOARD, CLEARANCE + WALL, BOARD.radius + CLEARANCE + WALL), bottom, PLATE_TOP);
  const cavity = prism(roundedRect(BOARD, CLEARANCE, BOARD.radius + CLEARANCE), CAVITY_BOTTOM, PLATE_TOP - PLATE);

  const cuts = [
    cavity,
    ...SWITCHES.map(([x, y]) => Manifold.cube([14, 14, 10], true).translate([x, y, PLATE_TOP])),
    ...WINDOWS.map((w) => prism(roundedRect(w, 0, 0.6), PLATE_TOP - 5, PLATE_TOP + 5)),
    ...MOUNTING_HOLES.map(([x, y]) => Manifold.cylinder(20, 1.1).translate([x, y, bottom - 10])),
    CrossSection.square([USB.width - 2, USB.height - 2], true)
      .offset(1, "Round")
      .extrude(10, 0, 0, [1, 1], true)
      .rotate([90, 0, 0])
      .translate([USB.x, BOARD.y1 + CLEARANCE + WALL / 2, USB.z]),
  ];
  const standoffs = MOUNTING_HOLES.map(([x, y]) => Manifold.cylinder(-CAVITY_BOTTOM, 2.5).translate([x, y, CAVITY_BOTTOM]));

  const shell = Manifold.union([outer, ...standoffs]).subtract(Manifold.union(cuts));
  const split = Manifold.cube([200, 200, 100]).translate([0, -200, 0]);
  return [
    toMesh(shell.intersect(split).getMesh(), "Enclosure top"),
    toMesh(shell.subtract(split).getMesh(), "Enclosure bottom"),
  ];
}

// Smooth normals across shallow angles (the rounded corners), hard edges elsewhere.
function toMesh({ vertProperties, triVerts, numProp }, name) {
  const triangles = triVerts.length / 3;
  const corner = (t, k) => triVerts[t * 3 + k];
  const point = (v) => [vertProperties[v * numProp], vertProperties[v * numProp + 1], vertProperties[v * numProp + 2]];
  const faceNormal = [];
  const around = new Map();
  for (let t = 0; t < triangles; t += 1) {
    const [a, b, c] = [0, 1, 2].map((k) => point(corner(t, k)));
    const u = b.map((v, k) => v - a[k]);
    const w = c.map((v, k) => v - a[k]);
    const n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
    const length = Math.hypot(...n) || 1;
    faceNormal[t] = n.map((v) => v / length);
    for (let k = 0; k < 3; k += 1) {
      const v = corner(t, k);
      if (!around.has(v)) around.set(v, []);
      around.get(v).push(t);
    }
  }
  const crease = Math.cos((35 * Math.PI) / 180);
  const position = new Float32Array(triangles * 9);
  const normal = new Float32Array(triangles * 9);
  for (let t = 0; t < triangles; t += 1) {
    for (let k = 0; k < 3; k += 1) {
      const v = corner(t, k);
      const sum = [0, 0, 0];
      for (const other of around.get(v)) {
        const n = faceNormal[other];
        if (n[0] * faceNormal[t][0] + n[1] * faceNormal[t][1] + n[2] * faceNormal[t][2] >= crease) for (let j = 0; j < 3; j += 1) sum[j] += n[j];
      }
      const length = Math.hypot(...sum) || 1;
      position.set(point(v), t * 9 + k * 3);
      normal.set(sum.map((s) => s / length), t * 9 + k * 3);
    }
  }
  return { name, attributes: { position: { array: position }, normal: { array: normal } }, index: { array: Uint32Array.from({ length: triangles * 3 }, (_, i) => i) } };
}

function writeStl(mesh, file) {
  const p = mesh.attributes.position.array;
  const triangles = p.length / 9;
  const out = Buffer.alloc(84 + triangles * 50);
  out.write("macropad enclosure", 0);
  out.writeUInt32LE(triangles, 80);
  for (let t = 0; t < triangles; t += 1) {
    const base = 84 + t * 50 + 12; // normal left zero; slicers recompute it
    for (let i = 0; i < 9; i += 1) out.writeFloatLE(p[t * 9 + i], base + i * 4);
  }
  fs.writeFileSync(file, out);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const prefix = process.argv[2] ?? "macropad-enclosure";
  for (const mesh of await build()) {
    const file = `${prefix}-${mesh.name.split(" ")[1]}.stl`;
    writeStl(mesh, file);
    console.log(`wrote ${file} (${mesh.attributes.position.array.length / 9} triangles)`);
  }
}
