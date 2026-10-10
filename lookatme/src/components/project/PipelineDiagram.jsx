import { SCENARIOS, STAGES } from "@/lib/pipeline-trace";

/**
 * The ballot-counting core's five-stage datapath, drawn like the textbook
 * figure: stage columns, the four pipeline registers between them, and the
 * blocks this design actually uses (instruction fetch, control unit, ALU,
 * tag decoder + tally memory, write-back mux). viewBox is 240 × 150.
 */
export const STAGE_BOX = {
  IF: { x: 12, w: 38 },
  ID: { x: 54, w: 38 },
  EX: { x: 96, w: 38 },
  MEM: { x: 138, w: 56 },
  WB: { x: 198, w: 30 },
};
export const STAGE_X = Object.fromEntries(STAGES.map((s) => [s, STAGE_BOX[s].x + STAGE_BOX[s].w / 2]));
export const TRACK_Y = 100;
const REGS = [50, 92, 134, 194];

export function PipelineSkeleton() {
  return (
    <g className="pl-skel">
      {STAGES.map((s) => (
        <g key={s}>
          <rect className="pl-stage" x={STAGE_BOX[s].x} y="20" width={STAGE_BOX[s].w} height="100" rx="3" data-stage={s} />
          <text className="pl-stage-label" x={STAGE_X[s]} y="14" textAnchor="middle">
            {s}
          </text>
        </g>
      ))}
      {REGS.map((x) => (
        <rect key={x} className="pl-reg" x={x} y="22" width="4" height="96" rx="1" />
      ))}
      <rect className="pl-block" x="17" y="40" width="28" height="30" rx="2" />
      <text className="pl-block-label" x="31" y="58" textAnchor="middle">
        IMEM
      </text>
      <rect className="pl-block" x="59" y="40" width="28" height="30" rx="2" />
      <text className="pl-block-label" x="73" y="58" textAnchor="middle">
        CTRL
      </text>
      <polygon className="pl-block" points="102,38 128,48 128,62 102,72 102,59 106,55 102,51" />
      <text className="pl-block-label" x="117" y="58" textAnchor="middle">
        ALU
      </text>
      <rect className="pl-block pl-dec" x="142" y="34" width="22" height="20" rx="2" />
      <text className="pl-block-label" x="153" y="47" textAnchor="middle">
        DEC
      </text>
      <rect className="pl-block pl-tally" x="168" y="34" width="22" height="46" rx="2" />
      <text className="pl-block-label" x="179" y="44" textAnchor="middle">
        TALLY
      </text>
      <circle className="pl-block pl-cmp" cx="153" cy="68" r="7" />
      <text className="pl-block-label" x="153" y="70.5" textAnchor="middle">
        =?
      </text>
      <path className="pl-wire" d="M153 54 V61 M160 68 H168" />
      <rect className="pl-block" x="207" y="44" width="12" height="24" rx="6" />
      <path className="pl-track" d={`M8 ${TRACK_Y} H232`} />
    </g>
  );
}

const TOKENS = ["SEC", "BNE", "WRITE"];
const SLOT = 0.85; // seconds per clock cycle on the card
const HOLD = 2; // extra slots holding the final state before the loop restarts

/**
 * Library-card version: the valid-record trace played on a loop with CSS
 * keyframes generated from the simulation, so it needs no JavaScript.
 */
export function PipelineCard() {
  const { cycles } = SCENARIOS[0];
  const slots = cycles.length + HOLD;
  const dur = slots * SLOT;
  const pct = (slot) => ((slot / slots) * 100).toFixed(2);
  const slide = 0.2; // fraction of a cycle spent moving between stages

  const stageOf = (tok, i) => {
    const c = cycles[Math.min(i, cycles.length - 1)];
    const hit = STAGES.find((s) => c.stages[s] === tok);
    if (hit) return hit;
    const firstIn = cycles.findIndex((cy) => Object.values(cy.stages).includes(tok));
    return i < firstIn ? "before" : "after";
  };
  const pos = (where) =>
    where === "before" ? { x: STAGE_X.IF - 26, o: 0 } : where === "after" ? { x: STAGE_X.WB + 22, o: 0 } : { x: STAGE_X[where], o: 1 };

  let css = "";
  TOKENS.forEach((tok) => {
    const frames = [];
    for (let i = 0; i < slots; i++) {
      const prev = pos(stageOf(tok, i - 1 < 0 ? 0 : i - 1));
      const cur = pos(stageOf(tok, i));
      const start = i === 0 ? cur : prev;
      frames.push(`${pct(i)}%{transform:translateX(${start.x}px);opacity:${start.o}}`);
      frames.push(`${pct(i + slide)}%{transform:translateX(${cur.x}px);opacity:${cur.o}}`);
    }
    const end = pos(stageOf(tok, slots - 1));
    frames.push(`100%{transform:translateX(${end.x}px);opacity:0}`);
    css += `@keyframes pl-tok-${tok}{${frames.join("")}}.pv-pipeline .pl-tok-${tok}{animation:pl-tok-${tok} ${dur}s ease-in-out infinite}`;
  });

  // The cycle where WRITE sits in MEM with the comparison active: the tag
  // check result shows, and the vote lands on the clock edge that ends it.
  const checkSlot = cycles.findIndex((c) => c.cmp);
  const writeEdge = checkSlot + 1;
  css += `@keyframes pl-check{0%,${pct(checkSlot)}%{opacity:0}${pct(checkSlot + 0.15)}%,${pct(slots - 0.3)}%{opacity:1}100%{opacity:0}}`;
  css += `@keyframes pl-before{0%,${pct(writeEdge)}%{opacity:1}${pct(writeEdge + 0.01)}%,100%{opacity:0}}`;
  css += `@keyframes pl-after{0%,${pct(writeEdge)}%{opacity:0}${pct(writeEdge + 0.01)}%,100%{opacity:1}}`;
  css += `@keyframes pl-flash{0%,${pct(writeEdge - 0.05)}%{opacity:0}${pct(writeEdge)}%{opacity:1}${pct(writeEdge + 0.6)}%,100%{opacity:0}}`;
  css += `@keyframes pl-slot{0%,${pct(0.999)}%{opacity:1}${pct(1)}%,100%{opacity:0}}`;
  css += `.pv-pipeline .pl-anim-check{animation:pl-check ${dur}s linear infinite}.pv-pipeline .pl-anim-before{animation:pl-before ${dur}s steps(1) infinite}.pv-pipeline .pl-anim-after{animation:pl-after ${dur}s steps(1) infinite}.pv-pipeline .pl-anim-flash{animation:pl-flash ${dur}s ease-out infinite}`;
  css += `.pv-pipeline .pl-anim-slot{animation:pl-slot ${dur}s steps(1) infinite;animation-delay:calc(var(--i) * ${SLOT}s)}.pv-pipeline .pl-reg{animation:pl-clk ${SLOT}s ease-out infinite}`;

  const start = cycles[0].tally;
  return (
    <svg viewBox="0 0 240 150" className="pv pv-pipeline">
      <style>{css}</style>
      <PipelineSkeleton />
      <rect className="pl-tally-flash pl-anim-flash" x="168" y="34" width="22" height="46" rx="2" />
      <text className="pl-count pl-anim-before" x="179" y="66" textAnchor="middle">
        {start}
      </text>
      <text className="pl-count pl-anim-after" x="179" y="66" textAnchor="middle">
        {start + 1}
      </text>
      {TOKENS.map((tok) => (
        <g key={tok} className={`pl-tok pl-tok-${tok}`}>
          <rect x="-15" y={TRACK_Y - 6.5} width="30" height="13" rx="6.5" />
          <text x="0" y={TRACK_Y + 2.6} textAnchor="middle">
            {tok}
          </text>
        </g>
      ))}
      <text className="pl-check pl-anim-check" x="166" y="132" textAnchor="middle">
        tag B = B ✓
      </text>
      {cycles.map((_, i) => (
        <text key={i} className="pl-cycle pl-anim-slot" x="12" y="132" style={{ "--i": i }}>
          cycle {i + 1}
        </text>
      ))}
      <text className="pl-caption" x="12" y="144">
        1 vote · cand 1 · dist 1
      </text>
    </svg>
  );
}
