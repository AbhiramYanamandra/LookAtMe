import {
  siAmd,
  siChakraui,
  siCplusplus,
  siCypress,
  siDocker,
  siFreecad,
  siHuggingface,
  siKicad,
  siNextdotjs,
  siNodedotjs,
  siNumpy,
  siOpencv,
  siPandas,
  siPostgresql,
  siPython,
  siPytorch,
  siRaspberrypi,
  siReact,
  siReactrouter,
  siRoboflow,
  siStmicroelectronics,
  siTailwindcss,
  siTypescript,
  siUltralytics,
  siVercel,
  siVite,
} from "simple-icons";
import {
  AudioWaveform,
  Bug,
  Cable,
  CircuitBoard,
  Cloud,
  Cpu,
  FlaskConical,
  Images,
  BrainCircuit,
  ChartColumn,
  Code,
  Database,
  Keyboard,
  MemoryStick,
  Monitor,
  MousePointer2,
  Package,
  Network,
  PanelTop,
  Table,
  ScanSearch,
  Timer,
  Waves,
  Workflow,
} from "lucide-react";

/**
 * Brand logos come from simple-icons (inline SVG, no network); things with no
 * logo get a plain glyph. Rendered on the server, so none of this ships as
 * client JavaScript.
 */
const BRANDS = {
  amd: siAmd,
  chakra: siChakraui,
  cpp: siCplusplus,
  cypress: siCypress,
  docker: siDocker,
  freecad: siFreecad,
  huggingface: siHuggingface,
  kicad: siKicad,
  nextjs: siNextdotjs,
  nodejs: siNodedotjs,
  numpy: siNumpy,
  opencv: siOpencv,
  pandas: siPandas,
  postgres: siPostgresql,
  python: siPython,
  pytorch: siPytorch,
  raspberry: siRaspberrypi,
  react: siReact,
  reactrouter: siReactrouter,
  roboflow: siRoboflow,
  stm: siStmicroelectronics,
  tailwind: siTailwindcss,
  typescript: siTypescript,
  ultralytics: siUltralytics,
  vercel: siVercel,
  vite: siVite,
};

const GLYPHS = {
  audio: AudioWaveform,
  brain: BrainCircuit,
  database: Database,
  cable: Cable,
  chart: ChartColumn,
  code: Code,
  mouse: MousePointer2,
  package: Package,
  sheet: Table,
  circuit: CircuitBoard,
  cloud: Cloud,
  cpu: Cpu,
  bug: Bug,
  memory: MemoryStick,
  images: Images,
  keyboard: Keyboard,
  monitor: Monitor,
  network: Network,
  panel: PanelTop,
  scan: ScanSearch,
  test: FlaskConical,
  timer: Timer,
  waves: Waves,
  workflow: Workflow,
};

const CREAM = "#f4ece0";

/** Dark brand colours vanish on the black page; lift them toward cream. */
function legible(hex) {
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  if (luminance < 0.06) return CREAM;
  if (luminance > 0.2) return `#${hex}`;
  // Mix toward cream by how dark it is.
  const mix = (value, target) => Math.round((value * 255 + (target - value * 255) * 0.6));
  const t = [0xf4, 0xec, 0xe0];
  return `rgb(${mix(r, t[0])} ${mix(g, t[1])} ${mix(b, t[2])})`;
}

export function SkillIcon({ name, size = 20 }) {
  const brand = BRANDS[name];
  if (brand) {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} role="img" aria-hidden="true" fill={legible(brand.hex)}>
        <path d={brand.path} />
      </svg>
    );
  }
  const Glyph = GLYPHS[name] ?? Cpu;
  return <Glyph aria-hidden="true" width={size} height={size} strokeWidth={1.7} color="#d6b04c" />;
}
