/**
 * Converts a KiCad/CAD STEP file to a compact GLB for the web.
 *
 *   node scripts/convert-step.mjs <input.step> <output.glb> [--part <model.step>,<x>,<y>,<angle>,<front|back> [--name <label>]]...
 *
 * `--part` adds a component the KiCad export left out, placed from its PCB
 * footprint (x, y in KiCad board millimetres, y down; angle in degrees; side).
 *
 * `--palette <Component>=<library.step>` copies the true per-face colours from a
 * component's library model. KiCad's STEP export drops them, but the models
 * keep them, and instances share the library model's mesh order.
 *
 * Offline tool: only the GLB it writes is shipped. STEP is tessellated with
 * occt-import-js (OpenCascade compiled to WASM), per-face colours are kept,
 * units go from millimetres to metres, the model is centred on the origin,
 * then vertices are welded and quantised to shrink the file.
 */
import fs from "node:fs";
import { createRequire } from "node:module";
import { Document, NodeIO } from "@gltf-transform/core";
import { KHRMeshQuantization } from "@gltf-transform/extensions";
import { dedup, prune, quantize, simplifyPrimitive, weld } from "@gltf-transform/functions";
import { MeshoptSimplifier } from "meshoptimizer";

const require = createRequire(import.meta.url);
const occtimportjs = require("occt-import-js");

const args = process.argv.slice(2);
const [input, output] = args;
if (!input || !output) {
  console.error("usage: node scripts/convert-step.mjs <input.step> <output.glb> [--part model.step,x,y,angle,front|back --name label]");
  process.exit(1);
}
const extras = [];
const paletteSources = {};
for (let i = 2; i < args.length; i += 1) {
  if (args[i] === "--palette") {
    const [component, file] = args[i + 1].split("=");
    paletteSources[component] = file;
    i += 1;
  } else if (args[i] === "--part") {
    const [file, x, y, angle, side] = args[i + 1].split(",");
    extras.push({ file, x: Number(x), y: Number(y), angle: Number(angle), back: side === "back", name: "added part" });
    i += 1;
  } else if (args[i] === "--name") {
    extras[extras.length - 1].name = args[i + 1];
    i += 1;
  }
}

const occt = await occtimportjs();
// Fine tessellation: the defaults turn round holes and board corners into
// diamonds and chamfers.
const TESSELLATION = { linearUnit: "millimeter", linearDeflectionType: "absolute_value", linearDeflection: 0.02, angularDeflection: 0.2 };
const result = occt.ReadStepFile(new Uint8Array(fs.readFileSync(input)), TESSELLATION);
if (!result.success) throw new Error("STEP could not be read");

// Merge parts the KiCad export dropped. KiCad board space is y-down; the STEP
// is y-up, so y flips. A part on the back is turned over about the X axis
// first, then rotated by the footprint angle, then moved to the footprint.
for (const extra of extras) {
  const part = occt.ReadStepFile(new Uint8Array(fs.readFileSync(extra.file)), TESSELLATION);
  if (!part.success) throw new Error(`could not read ${extra.file}`);
  const theta = (extra.angle * Math.PI) / 180;
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const place = (x, y, z) => {
    if (extra.back) {
      y = -y;
      z = -z;
    }
    return [x * cos - y * sin + extra.x, x * sin + y * cos - extra.y, z];
  };
  const spin = (x, y, z) => {
    if (extra.back) {
      y = -y;
      z = -z;
    }
    return [x * cos - y * sin, x * sin + y * cos, z];
  };
  const first = result.meshes.length;
  for (const mesh of part.meshes) {
    const p = mesh.attributes.position.array;
    const n = mesh.attributes.normal?.array;
    for (let i = 0; i < p.length; i += 3) {
      [p[i], p[i + 1], p[i + 2]] = place(p[i], p[i + 1], p[i + 2]);
      if (n) [n[i], n[i + 1], n[i + 2]] = spin(n[i], n[i + 1], n[i + 2]);
    }
    result.meshes.push(mesh);
  }
  result.root.children.push({ name: extra.name, meshes: part.meshes.map((_, k) => first + k), children: [] });
  console.log(`added ${extra.name}: ${part.meshes.length} meshes`);
}

// Bounds in millimetres, to centre the model.
const min = [Infinity, Infinity, Infinity];
const max = [-Infinity, -Infinity, -Infinity];
for (const mesh of result.meshes) {
  const p = mesh.attributes.position.array;
  for (let i = 0; i < p.length; i += 3) {
    for (let k = 0; k < 3; k += 1) {
      min[k] = Math.min(min[k], p[i + k]);
      max[k] = Math.max(max[k], p[i + k]);
    }
  }
}
const centre = min.map((value, k) => (value + max[k]) / 2);
console.log("size (mm):", max.map((value, k) => (value - min[k]).toFixed(1)).join(" x "));
console.log("centre (mm, STEP axes):", centre.map((value) => value.toFixed(2)).join(", "));

const doc = new Document();
doc.createBuffer();
const scene = doc.createScene("macropad");
const materials = new Map();
const built = [];
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const hex = (value) => [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((c) => c / 255);
// Colours read from STEP are already linear (KiCad's own render treats them
// that way); hand-picked hex colours below are sRGB and converted.
const materialFor = ({ rgb, linear = false, metal = 0, rough = 0.5 }) => {
  const key = `${rgb.map((c) => c.toFixed(3)).join(",")}|${linear}|${metal}|${rough}`;
  if (!materials.has(key)) {
    const [r, g, b] = linear ? rgb : rgb.map(toLinear);
    materials.set(key, doc.createMaterial(`m${materials.size}`).setBaseColorFactor([r, g, b, 1]).setRoughnessFactor(rough).setMetallicFactor(metal));
  }
  return materials.get(key);
};

// Which component each mesh belongs to, and its order within that component.
const owner = [];
const ownerIndex = [];
const counters = {};
const markOwner = (node, name) => {
  (node.meshes ?? []).forEach((i) => {
    owner[i] = name;
    ownerIndex[i] = counters[name] = (counters[name] ?? -1) + 1;
  });
  (node.children ?? []).forEach((child) => markOwner(child, name));
};
for (const child of result.root.children ?? []) for (const part of child.children?.length ? child.children : [child]) markOwner(part, part.name);

// True colours from component library models, by mesh order and face order.
const library = {};
for (const [component, file] of Object.entries(paletteSources)) {
  const model = occt.ReadStepFile(new Uint8Array(fs.readFileSync(file)), TESSELLATION);
  library[component] = model.meshes.map((m) => (m.brep_faces ?? []).map((f) => f.color ?? m.color ?? null));
  console.log(`palette ${component}: ${model.meshes.length} meshes from library`);
}

// Finishes for what is still uncoloured, chosen by what the part is.
const metalFinish = { rgb: hex(0xc9ccd2), metal: 0.9, rough: 0.3 };
const goldFinish = { rgb: hex(0xd6b04c), metal: 0.9, rough: 0.3 };
const finish = (name, size, color) => {
  const [sx, sy, sz] = size;
  const thin = Math.min(sx, sy) < 2;
  // KiCad renders the solder mask a muted olive green; match that rather than the STEP's teal.
  if (name === "Macropad-mk2_PCB") return { rgb: hex(0x4f6f46), rough: 0.5 };
  if (color) return { rgb: color, linear: true, rough: 0.45 };
  if (name?.startsWith("OLED")) return thin && sz > 8 ? goldFinish : { rgb: hex(0xd8d8d8), rough: 0.4 }; // pins; white standoffs
  if (name === "XIAO RP2040") {
    if (sx > 15) return { rgb: hex(0x1c1e24), rough: 0.45 }; // black PCB
    if (sx > 8 && sz > 3) return metalFinish; // USB-C shell
    if (sx > 10) return { rgb: hex(0x16161a), rough: 0.4 }; // RP2040 package
    return goldFinish; // pads and small parts
  }
  if (name?.startsWith("PinHeader")) return { rgb: hex(0x1c1c21), rough: 0.5 };
  return { rgb: hex(0x8a8a90), rough: 0.5 };
};
const OLED_BLUE = { rgb: hex(0x2f7fe8), rough: 0.45 };
const OLED_GLASS = { rgb: hex(0x0c0f15), rough: 0.5 };

for (const [index, source] of result.meshes.entries()) {
  // STEP is Z-up in millimetres; glTF is Y-up in metres.
  const src = source.attributes.position.array;
  const nrm = source.attributes.normal?.array;
  const position = new Float32Array(src.length);
  const normal = new Float32Array(src.length);
  for (let i = 0; i < src.length; i += 3) {
    const x = (src[i] - centre[0]) / 1000;
    const y = (src[i + 1] - centre[1]) / 1000;
    const z = (src[i + 2] - centre[2]) / 1000;
    position[i] = x;
    position[i + 1] = z;
    position[i + 2] = -y;
    if (nrm) {
      normal[i] = nrm[i];
      normal[i + 1] = nrm[i + 2];
      normal[i + 2] = -nrm[i + 1];
    }
  }
  const indices = source.index.array;
  const lo = [Infinity, Infinity, Infinity];
  const hi = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < src.length; i += 3) for (let k = 0; k < 3; k += 1) {
    lo[k] = Math.min(lo[k], src[i + k]);
    hi[k] = Math.max(hi[k], src[i + k]);
  }
  const size = hi.map((v, k) => v - lo[k]);
  const name = owner[index];
  const positionAccessor = doc.createAccessor().setType("VEC3").setArray(position);
  const normalAccessor = nrm ? doc.createAccessor().setType("VEC3").setArray(normal) : null;

  // One primitive per colour group so per-face colours survive.
  const groups = new Map();
  const triangles = indices.length / 3;
  const faces = source.brep_faces?.length ? source.brep_faces : [{ first: 0, last: triangles - 1, color: source.color ?? null }];
  const lib = library[name]?.[ownerIndex[index] % library[name].length];
  const isOledModule = name?.startsWith("OLED") && size[0] > 30;
  const addToGroup = (key, material, first, last) => {
    if (!groups.has(key)) groups.set(key, { material, ranges: [] });
    groups.get(key).ranges.push([first, last]);
  };
  faces.forEach((face, faceIndex) => {
    const color = (lib && lib.length === faces.length ? lib[faceIndex] : null) ?? face.color ?? source.color ?? null;
    if (isOledModule) {
      // The module is one solid: blue board at both ends, dark glass between.
      for (let t = face.first; t <= face.last; t += 1) {
        const x = (src[indices[t * 3] * 3] + src[indices[t * 3 + 1] * 3] + src[indices[t * 3 + 2] * 3]) / 3;
        const f = (x - lo[0]) / size[0];
        const blue = f < 0.12 || f > 0.97;
        addToGroup(blue ? "blue" : "glass", blue ? OLED_BLUE : OLED_GLASS, t, t);
      }
      return;
    }
    const key = (color ?? []).join(",") + (color ? "" : name);
    addToGroup(key, finish(name, size, color), face.first, face.last);
  });
  const mesh = doc.createMesh(source.name || `part${index}`);
  for (const { material, ranges } of groups.values()) {
    const list = [];
    for (const [first, last] of ranges) for (let t = first; t <= last; t += 1) list.push(indices[t * 3], indices[t * 3 + 1], indices[t * 3 + 2]);
    const prim = doc
      .createPrimitive()
      .setAttribute("POSITION", positionAccessor)
      .setIndices(doc.createAccessor().setType("SCALAR").setArray(new Uint32Array(list)))
      .setMaterial(materialFor(material));
    if (normalAccessor) prim.setAttribute("NORMAL", normalAccessor);
    mesh.addPrimitive(prim);
  }
  built[index] = mesh;
}

// Keep the component hierarchy (OLED, switches, header ...) so parts stay named.
const walk = (treeNode, parent) => {
  const node = doc.createNode(treeNode.name || "assembly");
  parent.addChild(node);
  for (const meshIndex of treeNode.meshes ?? []) node.addChild(doc.createNode(`mesh${meshIndex}`).setMesh(built[meshIndex]));
  for (const child of treeNode.children ?? []) walk(child, node);
};
walk(result.root, scene);

await MeshoptSimplifier.ready;

// Triangle budget per primitive by component. Repeated parts (nine switches,
// nine diodes) are dense at this tessellation, so they are decimated to a cap;
// the PCB, with its round holes and corners, is never touched.
const TRIANGLE_CAP = { "Macropad-mk2_PCB": Infinity, "XIAO RP2040": 6000, OLED_128x32: 2500, MX_PCB: 1400, "Diode_DO-35": 700 };
const simplifyHeavy = (document) => {
  for (const node of document.getRoot().listNodes()) {
    const mesh = node.getMesh();
    if (!mesh) continue;
    const cap = TRIANGLE_CAP[node.getParentNode()?.getName()] ?? 2500;
    for (const prim of mesh.listPrimitives()) {
      const count = prim.getIndices().getCount() / 3;
      if (count > cap) simplifyPrimitive(prim, { simplifier: MeshoptSimplifier, ratio: cap / count, error: 0.01 });
    }
  }
};

await doc.transform(dedup(), weld(), simplifyHeavy, prune(), quantize({ quantizePosition: 14, quantizeNormal: 10 }));
doc.createExtension(KHRMeshQuantization).setRequired(true);
await new NodeIO().registerExtensions([KHRMeshQuantization]).write(output, doc);
console.log(`wrote ${output} (${(fs.statSync(output).size / 1024).toFixed(0)} KB, ${result.meshes.length} meshes, ${materials.size} materials)`);
