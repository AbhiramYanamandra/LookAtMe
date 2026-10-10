/**
 * Skills shown in the sliding marquee. Every entry comes from a technology
 * listed on a project or role, so the marquee never claims more than the work
 * shows. `kind` is software, hardware or ml; `icon` names a logo or glyph in
 * src/components/home/SkillIcon.jsx. Each row deliberately mixes software and
 * hardware.
 */
const s = (label, icon) => ({ label, icon, kind: "software" });
const h = (label, icon) => ({ label, icon, kind: "hardware" });
const m = (label, icon) => ({ label, icon, kind: "ml" });

export const SKILL_ROWS = [
  [s("React", "react"), h("VHDL", "circuit"), s("TypeScript", "typescript"), h("KiCad", "kicad"), s("Python", "python"), h("Vitis HLS", "amd"), s("Next.js", "nextjs"), h("FPGA", "cpu"), m("PyTorch", "pytorch"), h("I²C", "cable"), s("Node.js", "nodejs"), s("Tailwind", "tailwind")],
  [h("C++", "cpp"), s("Vite", "vite"), h("Vivado", "amd"), s("React Router", "reactrouter"), h("STM32", "stm"), s("Playwright", "test"), h("FreeRTOS", "timer"), m("OpenCV", "opencv"), h("CAN bus", "network"), s("Chakra UI", "chakra"), h("PYNQ", "cpu"), s("Cypress", "cypress")],
  [m("NumPy", "numpy"), h("KMK firmware", "keyboard"), s("PostgreSQL", "postgres"), h("CircuitPython", "python"), s("Docker", "docker"), h("AXI", "workflow"), m("Pandas", "pandas"), h("TouchGFX", "panel"), s("Vercel", "vercel"), h("FreeCAD", "freecad"), s("AWS S3", "cloud"), h("RP2040", "raspberry")],
  [h("I²S", "audio"), m("RT-DETR", "scan"), h("Kria KV260", "cpu"), m("Hugging Face", "huggingface"), h("SSD1306", "monitor"), s("Python scripting", "python"), m("YOLO", "ultralytics"), h("Basys-3", "circuit"), m("Roboflow", "roboflow"), h("AXI4-Stream", "waves"), m("ImageNet", "images"), h("Artix-7", "amd")],
];

export const ALL_SKILLS = SKILL_ROWS.flat();
