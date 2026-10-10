/**
 * Small animated illustrations for projects that have no screenshot, one per
 * kind of work. Pure SVG + CSS (animations live in src/styles/work.css), so
 * they cost no JavaScript. They are decorative (aria-hidden) and paused until
 * their card is near the viewport. Each shows only what the project's
 * write-up supports; the three that illustrate an idea rather than a result
 * are marked "concept".
 */
import { DETECTIONS, detectionSrc } from "@/lib/pest-detections";
import { PipelineCard } from "./PipelineDiagram";
import { HogConveyor } from "./HogConveyor";
import { NavMapCard } from "./NavMapCard";
import { ClapCard } from "./ClapCard";
import { ErdCard } from "./ErdCard";

const VB = "0 0 240 150";

/**
 * Real test-set photos with RT-DETR's actual predicted boxes, two sets of
 * three that alternate. The last tile is a genuine miss: a beetle the model
 * called an earwig.
 */
const DETECT_SETS = [
  ["ants", "caterpillar", "weevil"],
  ["snail", "grasshopper", "beetle"],
];
const TILE = 74;

function Detect() {
  const byId = Object.fromEntries(DETECTIONS.map((d) => [d.id, d]));
  return (
    <svg viewBox="0 0 240 96" className="pv pv-detect">
      {DETECT_SETS.map((set, s) => (
        <g key={s} className={`pv-dt-set pv-dt-set${s}`}>
          {set.map((id, i) => {
            const d = byId[id];
            const x = i * (TILE + 9);
            const wrong = d.pred[0].label !== d.truth;
            return (
              <g key={id} transform={`translate(${x} 2)`} style={{ "--i": i + s * 10 }}>
                <image href={detectionSrc(id, true)} width={TILE} height={TILE} preserveAspectRatio="xMidYMid slice" />
                <rect className="pv-dt-frame" width={TILE} height={TILE} />
                {d.pred.map(({ label, box: [x0, y0, x1, y1] }, k) => (
                  <g key={k} className={wrong ? "pv-dt-box pv-dt-wrong" : "pv-dt-box"} style={{ "--k": k }}>
                    <rect pathLength="1" x={x0 * TILE} y={y0 * TILE} width={(x1 - x0) * TILE} height={(y1 - y0) * TILE} />
                    <rect className="pv-dt-tag" x={x0 * TILE} y={Math.max(0, y0 * TILE - 7)} width={label.length * 3.4 + 4} height="7" />
                    <text x={x0 * TILE + 2} y={Math.max(0, y0 * TILE - 7) + 5.3}>
                      {label}
                    </text>
                  </g>
                ))}
                <text className={wrong ? "pv-dt-cap pv-dt-cap-wrong" : "pv-dt-cap"} x={TILE / 2} y={TILE + 10} textAnchor="middle">
                  {wrong ? `actually a ${d.truth.toLowerCase().replace(/s$/, "")}` : d.pred.length > 1 ? `${d.pred.length} found` : `IoU ${d.pred[0].iou.toFixed(2)}`}
                </text>
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
}

function Sorter() {
  const files = [
    ["notes.pdf", 0],
    ["photo.png", 1],
    ["main.py", 2],
    ["data.zip", 3],
  ];
  const folders = ["docs", "images", "code", "archives"];
  return (
    <svg viewBox={VB} className="pv pv-sorter">
      {folders.map((name, i) => (
        <g key={name} transform={`translate(150 ${16 + i * 30})`}>
          <path d="M0 6 h14 l4 4 h36 v18 h-54 z" className="pv-folder" />
          <text x="26" y="24" textAnchor="middle">
            {name}/
          </text>
        </g>
      ))}
      {files.map(([name, i]) => (
        <g key={name} transform={`translate(14 ${18 + i * 30})`}>
          <g className="pv-file" style={{ "--i": i }}>
            <rect width="64" height="20" rx="4" />
            <text x="8" y="14">
              {name}
            </text>
          </g>
        </g>
      ))}
      <text className="pv-tag-text" x="226" y="142" textAnchor="end">
        concept
      </text>
    </svg>
  );
}

const CIPHER = ["A", "D", "F", "G", "V", "X"];
const GRID = ["P", "H", "0", "Q", "G", "6", "4", "M", "E", "A", "I", "1", "Y", "L", "2", "N", "3", "F", "X", "K", "5", "Z", "R", "B", "7", "C", "U", "9", "D", "J", "8", "S", "O", "T", "V", "W"];

function Cipher() {
  return (
    <svg viewBox={VB} className="pv pv-cipher">
      {CIPHER.map((letter, i) => (
        <g key={letter}>
          <text className="pv-axis" x={44 + i * 22} y="22" textAnchor="middle">
            {letter}
          </text>
          <text className="pv-axis" x="20" y={42 + i * 14} textAnchor="middle">
            {letter}
          </text>
        </g>
      ))}
      {GRID.map((char, i) => (
        <text key={i} className="pv-cell" x={44 + (i % 6) * 22} y={42 + Math.floor(i / 6) * 14} textAnchor="middle" style={{ "--i": i }}>
          {char}
        </text>
      ))}
      <text className="pv-out" x="120" y="138" textAnchor="middle">
        AX DG FV GA XD VF
      </text>
      <text className="pv-tag-text" x="226" y="14" textAnchor="end">
        concept
      </text>
    </svg>
  );
}

function Ttt() {
  const marks = [
    ["x", 0, 0],
    ["o", 1, 1],
    ["x", 2, 0],
    ["o", 0, 2],
    ["x", 1, 0],
  ];
  return (
    <svg viewBox={VB} className="pv pv-ttt">
      <path className="pv-grid" d="M80 20 v110 M160 20 v110 M20 56 h200 M20 94 h200" />
      {marks.map(([kind, col, row], i) => {
        const cx = 50 + col * 70 + (col === 1 ? 10 : 0);
        const cy = 38 + row * 38;
        return (
          <g key={i} className="pv-mark" style={{ "--i": i }}>
            {kind === "x" ? <path d={`M${cx - 10} ${cy - 10} l20 20 M${cx + 10} ${cy - 10} l-20 20`} /> : <circle cx={cx} cy={cy} r="11" />}
          </g>
        );
      })}
      <path className="pv-win" d="M36 38 H204" />
    </svg>
  );
}

function Guess() {
  const lines = [
    ["> 50", "higher"],
    ["> 75", "lower"],
    ["> 62", "higher"],
    ["> 68", "correct!"],
  ];
  return (
    <svg viewBox={VB} className="pv pv-guess">
      <text className="pv-prompt" x="20" y="24">
        I'm thinking of a number…
      </text>
      {lines.map(([guess, answer], i) => (
        <g key={guess} className="pv-line" style={{ "--i": i }}>
          <text x="20" y={52 + i * 24}>
            {guess}
          </text>
          <text className={i === lines.length - 1 ? "pv-win-text" : "pv-hint"} x="76" y={52 + i * 24}>
            {answer}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** A 10 · 10 · 12-bit virtual address walked through a two-level page table. */
function PageTable() {
  const segments = [
    { x: 20, w: 60, label: "dir · 10", value: "0x001", step: 1 },
    { x: 80, w: 60, label: "table · 10", value: "0x003", step: 2 },
    { x: 140, w: 80, label: "offset · 12", value: "0xA7C", step: 3 },
  ];
  const columns = [
    { x: 20, label: "pgdir", hit: 1, step: 1 },
    { x: 100, label: "pgtable", hit: 3, step: 2 },
  ];
  return (
    <svg viewBox={VB} className="pv pv-pagetable">
      {segments.map((seg) => (
        <g key={seg.label}>
          <text className="pv-pt-label" x={seg.x + seg.w / 2} y="9" textAnchor="middle">
            {seg.label}
          </text>
          <rect className="pv-pt-cell" x={seg.x} y="13" width={seg.w} height="16" />
          <rect className={`pv-pt-hl pv-pt-s${seg.step}`} x={seg.x} y="13" width={seg.w} height="16" />
          <text x={seg.x + seg.w / 2} y="24" textAnchor="middle">
            {seg.value}
          </text>
        </g>
      ))}
      {columns.map((col) => (
        <g key={col.label}>
          {Array.from({ length: 6 }, (_, row) => (
            <rect key={row} className="pv-pt-cell" x={col.x} y={50 + row * 12} width="40" height="12" />
          ))}
          <rect className={`pv-pt-row pv-pt-s${col.step}`} x={col.x} y={50 + col.hit * 12} width="40" height="12" />
          <text className="pv-pt-label" x={col.x + 20} y="134" textAnchor="middle">
            {col.label}
          </text>
        </g>
      ))}
      <rect className="pv-pt-cell" x="176" y="50" width="44" height="72" />
      <rect className="pv-pt-row pv-pt-s4" x="176" y="95" width="44" height="4" />
      <text className="pv-pt-label" x="198" y="134" textAnchor="middle">
        frame
      </text>
      <path className="pv-pt-link pv-pt-d1" d="M60 68 C80 68, 80 52, 100 52" />
      <path className="pv-pt-link pv-pt-d2" d="M140 92 C158 92, 158 70, 176 70" />
      <path className="pv-pt-link pv-pt-d3" d="M196 29 V95" />
      <text className="pv-pt-tlb pv-pt-s5" x="120" y="146" textAnchor="middle">
        TLB ← EntryLo
      </text>
    </svg>
  );
}

const VISUALS = { clap: ClapCard, dataflow: HogConveyor, detect: Detect, erd: ErdCard, navmap: NavMapCard, sorter: Sorter, cipher: Cipher, ttt: Ttt, guess: Guess, pagetable: PageTable, stages: PipelineCard };

export const GENERATED_VISUALS = Object.keys(VISUALS);

export function ProjectVisual({ kind }) {
  const Visual = VISUALS[kind];
  return Visual ? <Visual /> : null;
}
