import { HOG_IMAGES, INTERVAL, STAGES } from "@/lib/hog-data";
import { FeatureStrip, HogGlyphs } from "./HogGlyphs";

/**
 * Library card for the HOG accelerator: the final six-stage dataflow region in
 * steady state. Real CIFAR-10 benchmark images move one stage per 622-cycle
 * interval, several in flight at once. Each shows its own intermediate for the
 * stage it's in (pixels → normalised → gradient magnitude → cell histograms →
 * block-normalised → feature vector), and leaves as its HOG descriptor.
 *
 * Stage widths and busy bars come from the C-Synth cycle counts: each bar
 * fills for cycles / 622 of the interval and then idles, so the slowest stage
 * visibly sets the pace. CSS keyframes are generated here; no JavaScript runs.
 */
const STEP = 1.1; // seconds per 622-cycle interval
const SLIDE = 0.24; // fraction of an interval spent moving between stages
const TILE = 24;
const POSITIONS = 8; // 6 stages, the output box, and one hidden recycle slot
const FRAME_Y = 20;
const FRAME_H = 50;
const OUT = { x: 156, y: 98, scale: 1.9 };

function layout() {
  const gap = 2;
  const usable = 232 - gap * (STAGES.length - 1);
  const base = 28;
  const extra = usable - base * STAGES.length;
  const total = STAGES.reduce((s, st) => s + st.cycles, 0);
  let x = 4;
  return STAGES.map((st) => {
    const w = base + (extra * st.cycles) / total;
    const frame = { ...st, x, w };
    x += w + gap;
    return frame;
  });
}

const pct = (step) => ((step / POSITIONS) * 100).toFixed(2);

/** Keyframes that hold a value per position and ease between them on each step. */
function frames(valueAt) {
  const out = [];
  for (let i = 0; i < POSITIONS; i++) {
    out.push(`${pct(i)}%{${valueAt((i + POSITIONS - 1) % POSITIONS, i)}}`);
    out.push(`${pct(i + SLIDE)}%{${valueAt(i, i)}}`);
  }
  out.push(`100%{${valueAt(POSITIONS - 1, POSITIONS)}}`);
  return out.join("");
}

// What a token shows at each position: 0-5 are the stages, 6 is the output,
// 7 is the hidden slot where it fades and recycles to the entry.
const LAYERS = {
  raw: [0, 7],
  norm: [1],
  mag: [2],
  glyph: [3, 4, 6],
  win: [4],
  feat: [5],
};

export function HogConveyor() {
  const stages = layout();
  const dur = STEP * POSITIONS;
  const place = (p) => {
    if (p < 6) return `transform:translate(${(stages[p].x + stages[p].w / 2 - TILE / 2).toFixed(1)}px,${FRAME_Y + 13}px) scale(1);opacity:1`;
    if (p === 6) return `transform:translate(${OUT.x}px,${OUT.y}px) scale(${OUT.scale});opacity:1`;
    return `transform:translate(-${TILE + 4}px,${FRAME_Y + 13}px) scale(1);opacity:0`;
  };

  // The recycle step fades out in place, then jumps back to the entry unseen.
  let css = `@keyframes hc-move{${[...Array(POSITIONS).keys()]
    .flatMap((i) => {
      const prev = (i + POSITIONS - 1) % POSITIONS;
      if (i === POSITIONS - 1) return [`${pct(i)}%{${place(6)}}`, `${pct(i + SLIDE)}%{${place(6).replace("opacity:1", "opacity:0")}}`, `${pct(i + 0.9)}%{${place(7)}}`];
      if (i === 0) return [`${pct(0)}%{${place(7)}}`, `${pct(SLIDE)}%{${place(0)}}`];
      return [`${pct(i)}%{${place(prev)}}`, `${pct(i + SLIDE)}%{${place(i)}}`];
    })
    .join("")}100%{${place(7)}}}`;
  for (const [name, on] of Object.entries(LAYERS)) {
    css += `@keyframes hc-${name}{${frames((p) => `opacity:${on.includes(p) ? 1 : 0}`)}}`;
    css += `.pv-hog .hc-${name}{animation:hc-${name} ${dur}s ease-in-out infinite;animation-delay:calc(var(--k) * -${STEP}s)}`;
  }
  css += `.pv-hog .hc-tok{animation:hc-move ${dur}s cubic-bezier(.45,.05,.3,1) infinite;animation-delay:calc(var(--k) * -${STEP}s)}`;
  stages.forEach((st, s) => {
    const busy = Math.min(1, st.cycles / INTERVAL);
    css += `@keyframes hc-busy-${s}{0%,${(SLIDE * 100).toFixed(0)}%{transform:scaleX(0)}${(SLIDE * 100 + busy * (100 - SLIDE * 100)).toFixed(1)}%,100%{transform:scaleX(1)}}`;
    css += `.pv-hog .hc-busy-${s}{animation:hc-busy-${s} ${STEP}s linear infinite}`;
  });

  return (
    <svg viewBox="0 0 240 150" className="pv pv-hog">
      <style>{css}</style>
      {stages.map((st, s) => {
        const busyW = st.w * Math.min(1, st.cycles / INTERVAL);
        return (
          <g key={st.id}>
            <text className="hc-label" x={st.x + st.w / 2} y="14" textAnchor="middle">
              {st.label}
            </text>
            <rect className={st.cycles === Math.max(...STAGES.map((x) => x.cycles)) ? "hc-frame hc-pace" : "hc-frame"} x={st.x} y={FRAME_Y} width={st.w} height={FRAME_H} rx="3" />
            <rect className="hc-track" x={st.x} y={FRAME_Y + FRAME_H + 3} width={st.w} height="3" rx="1.5" />
            <rect className={`hc-busy hc-busy-${s}`} x={st.x} y={FRAME_Y + FRAME_H + 3} width={busyW} height="3" rx="1.5" style={{ transformOrigin: `${st.x}px 0` }} />
            <text className="hc-cycles" x={st.x + st.w / 2} y={FRAME_Y + FRAME_H + 13} textAnchor="middle">
              {st.cycles}
            </text>
          </g>
        );
      })}

      <rect className="hc-outbox" x={OUT.x - 6} y={OUT.y - 6} width={240 - OUT.x + 2} height={150 - OUT.y + 2} rx="4" />
      <text className="hc-label" x={OUT.x + TILE * OUT.scale + 5} y={OUT.y + 14}>
        HOG
      </text>
      <text className="hc-label" x={OUT.x + TILE * OUT.scale + 5} y={OUT.y + 22}>
        out
      </text>
      <text className="hc-stat" x="6" y="104">
        1 image / {INTERVAL} cycles
      </text>
      <text className="hc-sub" x="6" y="117">
        10,000 images in 32.4 ms
      </text>
      <text className="hc-sub" x="6" y="128">
        slowest stage sets the pace
      </text>

      {HOG_IMAGES.slice(0, POSITIONS).map((img, k) => {
        const strip = [];
        for (let i = 0; i < img.features.length; i += 6) strip.push(Math.max(...img.features.slice(i, i + 6)));
        return (
          <g key={img.idx} className={k === 0 ? "hc-tok hc-static" : "hc-tok"} style={{ "--k": k }}>
            <image className="hc-l hc-raw" href={`/images/hog/${img.idx}-raw.png`} width={TILE} height={TILE} />
            <image className="hc-l hc-norm" href={`/images/hog/${img.idx}-norm.png`} width={TILE} height={TILE} />
            <image className="hc-l hc-mag" href={`/images/hog/${img.idx}-mag.png`} width={TILE} height={TILE} />
            <g className="hc-l hc-glyph">
              <rect className="hc-bg" width={TILE} height={TILE} />
              <HogGlyphs cells={img.cells} size={TILE} />
            </g>
            <rect className="hc-l hc-win" x="0.5" y="0.5" width={TILE / 2} height={TILE / 2} />
            <g className="hc-l hc-feat">
              <rect className="hc-bg" width={TILE} height={TILE} />
              <FeatureStrip features={strip} x={1.5} y={6} w={TILE - 3} h={12} />
            </g>
            <rect className="hc-edge" width={TILE} height={TILE} />
          </g>
        );
      })}
    </svg>
  );
}
