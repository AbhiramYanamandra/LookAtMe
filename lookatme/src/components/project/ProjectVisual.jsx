/**
 * Small animated illustrations for projects that have no screenshot, one per
 * kind of work. Pure SVG + CSS (animations live in src/styles/work.css), so
 * they cost no JavaScript. They are decorative (aria-hidden) and paused until
 * their card is near the viewport. Each shows only what the project's
 * write-up supports; the three that illustrate an idea rather than a result
 * are marked "concept".
 */
const VB = "0 0 240 150";

/** Deterministic noisy waveform, `width` px at 3px steps. */
function wavePath(width, seed = 3) {
  let d = "";
  for (let x = 0; x <= width; x += 3) {
    const y = 46 + Math.sin(x * 0.19) * 5 + Math.sin(x * 0.61 + seed) * 3 + Math.cos(x * 1.7 + seed * 2) * 2;
    d += `${x === 0 ? "M" : "L"}${x} ${y.toFixed(1)} `;
  }
  return d;
}

function Signal() {
  const stages = ["I²S", "FIFO", "DMA", "ARM"];
  return (
    <svg viewBox={VB} className="pv pv-signal">
      <g className="pv-wave">
        <path d={wavePath(240)} />
        <path d={wavePath(240)} transform="translate(240 0)" />
      </g>
      <g className="pv-spike">
        {[-12, -6, 0, 6, 12].map((dx, i) => (
          <rect key={dx} x={118 + dx} y={46 - (30 - Math.abs(dx) * 1.6)} width="3" height={(30 - Math.abs(dx) * 1.6) * 2} rx="1.5" style={{ "--i": i }} />
        ))}
      </g>
      <circle className="pv-led" cx="222" cy="22" r="5" />
      {stages.map((label, i) => (
        <g key={label} transform={`translate(${14 + i * 56} 104)`}>
          <rect width="44" height="22" rx="5" />
          <text x="22" y="15" textAnchor="middle">
            {label}
          </text>
        </g>
      ))}
      {[0, 1, 2].map((i) => (
        <path key={i} className="pv-arrow" d={`M${60 + i * 56} 115 h8`} />
      ))}
      <circle className="pv-packet" cx="14" cy="115" r="3.5" />
    </svg>
  );
}

function Silicon() {
  const stages = 6;
  return (
    <svg viewBox={VB} className="pv pv-silicon">
      {Array.from({ length: stages }, (_, i) => (
        <g key={i} transform={`translate(18 ${14 + i * 18})`} style={{ "--i": i }}>
          <rect className="pv-track" width="132" height="9" rx="4.5" />
          <rect className="pv-fill" width="132" height="9" rx="4.5" />
          <text x="-4" y="8" textAnchor="end">
            {i + 1}
          </text>
        </g>
      ))}
      <text className="pv-big" x="206" y="52" textAnchor="middle">
        308k
      </text>
      <text className="pv-small" x="206" y="66" textAnchor="middle">
        images / s
      </text>
      <text className="pv-small" x="206" y="96" textAnchor="middle">
        10,000 in
      </text>
      <text className="pv-mid" x="206" y="110" textAnchor="middle">
        32.4 ms
      </text>
    </svg>
  );
}

function Detect() {
  const boxes = [
    { x: 30, y: 28, w: 52, h: 40 },
    { x: 118, y: 60, w: 44, h: 52 },
    { x: 168, y: 20, w: 40, h: 34 },
  ];
  return (
    <svg viewBox={VB} className="pv pv-detect">
      <g className="pv-leaves">
        <ellipse cx="56" cy="50" rx="24" ry="14" transform="rotate(-24 56 50)" />
        <ellipse cx="138" cy="86" rx="20" ry="12" transform="rotate(30 138 86)" />
        <ellipse cx="188" cy="38" rx="18" ry="10" transform="rotate(-12 188 38)" />
        <ellipse cx="90" cy="116" rx="26" ry="11" transform="rotate(8 90 116)" />
      </g>
      {boxes.map((box, i) => (
        <g key={i} className="pv-box" style={{ "--i": i }}>
          <rect x={box.x} y={box.y} width={box.w} height={box.h} rx="2" />
          <rect className="pv-tag" x={box.x} y={box.y - 11} width="26" height="10" rx="2" />
          <text x={box.x + 3} y={box.y - 3}>
            pest
          </text>
        </g>
      ))}
      <rect className="pv-scan" x="0" y="0" width="26" height="150" />
    </svg>
  );
}

function Schema() {
  const tables = [
    { name: "owner", x: 10, y: 18 },
    { name: "pet", x: 92, y: 52 },
    { name: "listing", x: 164, y: 14 },
    { name: "enquiry", x: 92, y: 112, short: true },
  ];
  return (
    <svg viewBox={VB} className="pv pv-schema">
      <path className="pv-link" d="M64 40 C 80 40, 80 74, 92 74" style={{ "--i": 0 }} />
      <path className="pv-link" d="M146 70 C 156 70, 156 34, 164 34" style={{ "--i": 1 }} />
      <path className="pv-link" d="M120 96 L 120 112" style={{ "--i": 2 }} />
      {tables.map((table, i) => (
        <g key={table.name} transform={`translate(${table.x} ${table.y})`} className="pv-table" style={{ "--i": i }}>
          <rect width="64" height={table.short ? 28 : 44} rx="4" />
          <rect className="pv-head" width="64" height="12" rx="4" />
          <text x="6" y="9">
            {table.name}
          </text>
          {[0, 1, 2].slice(0, table.short ? 1 : 3).map((row) => (
            <rect key={row} className="pv-row" x="6" y={18 + row * 8} width={36 - row * 6} height="3" rx="1.5" />
          ))}
        </g>
      ))}
    </svg>
  );
}

function Lcd() {
  const screens = [
    ["12:04  TUE 09", "ACTIVITY"],
    ["STOPWATCH", "00:12.4"],
    ["COUNTDOWN", "05:00"],
    ["ALARM", "07:30  ON"],
    ["CHARGING", "LIGHT SENSED"],
  ];
  return (
    <svg viewBox={VB} className="pv pv-lcd">
      <rect className="pv-bezel" x="20" y="22" width="200" height="72" rx="8" />
      <rect className="pv-glass" x="30" y="32" width="180" height="52" rx="3" />
      {screens.map(([a, b], i) => (
        <g key={a} className="pv-screen" style={{ "--i": i }}>
          <text x="40" y="54">
            {a}
          </text>
          <text x="40" y="74">
            {b}
          </text>
        </g>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} className="pv-key" cx={62 + i * 38} cy="118" r="9" style={{ "--i": i }} />
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

const VISUALS = { signal: Signal, silicon: Silicon, detect: Detect, schema: Schema, lcd: Lcd, sorter: Sorter, cipher: Cipher, ttt: Ttt, guess: Guess };

export const GENERATED_VISUALS = Object.keys(VISUALS);

export function ProjectVisual({ kind }) {
  const Visual = VISUALS[kind];
  return Visual ? <Visual /> : null;
}
