"use client";

import { useEffect, useState } from "react";
import { SCENARIOS, STAGES } from "@/lib/pipeline-trace";
import { PipelineSkeleton, STAGE_BOX, STAGE_X, TRACK_Y } from "./PipelineDiagram";

const TOKENS = ["SEC", "BNE", "WRITE"];
const hex = (n) => `0x${n.toString(16).toUpperCase()}`;

function stageOf(cycle, tok) {
  return STAGES.find((s) => cycle.stages[s] === tok) ?? null;
}

/**
 * Step through the simulated core one clock at a time, for a valid record, a
 * tampered one, and the tampered one with the fix. Every value on screen is a
 * signal from the simulation trace in src/lib/pipeline-trace.js.
 */
export function PipelineTrace() {
  const [sid, setSid] = useState("valid");
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const scenario = SCENARIOS.find((s) => s.id === sid);
  const last = scenario.cycles.length - 1;
  const cycle = scenario.cycles[i];
  const after = cycle.tally + (cycle.write ? 1 : 0);

  useEffect(() => {
    if (!playing) return;
    if (i >= last) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setI((n) => n + 1), 1100);
    return () => clearTimeout(t);
  }, [playing, i, last]);

  const pick = (id) => {
    setSid(id);
    setI(0);
    setPlaying(false);
  };

  const mismatch = cycle.cmp && cycle.latched !== cycle.decoded;
  return (
    <figure className="cs-figure pt" data-reveal>
      <div className="pt-bar">
        <div className="dg-toggle" role="group" aria-label="Record">
          {SCENARIOS.map((s) => (
            <button key={s.id} type="button" aria-pressed={sid === s.id} onClick={() => pick(s.id)}>
              {s.label}
            </button>
          ))}
        </div>
        <span className="al-mono">tag in {hex(scenario.cycles[0].tagIn)}</span>
      </div>
      <p className="pt-summary">{scenario.summary}</p>

      <div className="pt-stage-wrap">
        <svg viewBox="0 0 240 122" className="pt-svg" role="img" aria-label={`Cycle ${i + 1}: ${STAGES.map((s) => `${s} ${cycle.stages[s] ?? "empty"}`).join(", ")}`}>
          <PipelineSkeleton />
          {STAGES.map((s) => (
            <rect key={s} className="pt-occupied" data-on={cycle.stages[s] ? "" : undefined} x={STAGE_BOX[s].x} y="20" width={STAGE_BOX[s].w} height="100" rx="3" />
          ))}
          <rect className="pt-flash" data-on={cycle.write ? "" : undefined} x="168" y="34" width="22" height="46" rx="2" />
          <text className="pl-count" x="179" y="66" textAnchor="middle">
            {cycle.tally}
          </text>
          <circle className="pt-cmp" data-state={cycle.cmp ? (mismatch ? "bad" : "ok") : undefined} cx="153" cy="68" r="7" />
          {TOKENS.map((tok) => {
            const st = stageOf(cycle, tok);
            const done = !st && scenario.cycles.slice(0, i).some((c) => stageOf(c, tok));
            const x = st ? STAGE_X[st] : done ? STAGE_X.WB + 24 : STAGE_X.IF - 28;
            return (
              <g key={tok} className={`pl-tok pl-tok-${tok} pt-tok`} style={{ transform: `translateX(${x}px)`, opacity: st ? 1 : 0 }}>
                <rect x="-15" y={TRACK_Y - 6.5} width="30" height="13" rx="6.5" />
                <text x="0" y={TRACK_Y + 2.6} textAnchor="middle">
                  {tok}
                </text>
              </g>
            );
          })}
          {cycle.flush && (
            <g className="pt-flush">
              <rect x="50" y="20" width="4" height="100" rx="1" />
              <text x="52" y="116" textAnchor="middle">
                flush
              </text>
            </g>
          )}
        </svg>
      </div>

      <div className="pt-controls">
        <button type="button" onClick={() => setI((n) => Math.max(0, n - 1))} disabled={i === 0} aria-label="Previous cycle">
          ←
        </button>
        <button type="button" className="pt-play" onClick={() => (i >= last ? (setI(0), setPlaying(true)) : setPlaying((p) => !p))}>
          {playing ? "Pause" : i >= last ? "Replay" : "Play"}
        </button>
        <button type="button" onClick={() => setI((n) => Math.min(last, n + 1))} disabled={i === last} aria-label="Next cycle">
          →
        </button>
        <ol className="pt-dots" aria-label="Cycle">
          {scenario.cycles.map((_, n) => (
            <li key={n}>
              <button type="button" aria-current={n === i ? "step" : undefined} onClick={() => setI(n)}>
                {n + 1}
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="pt-readout">
        <p className="pt-note" aria-live="polite">
          <b>Cycle {i + 1}.</b> {scenario.notes[i]}
        </p>
        <dl>
          <div>
            <dt>tag in MEM</dt>
            <dd>{cycle.cmp ? hex(cycle.latched) : "—"}</dd>
          </div>
          <div>
            <dt>decoded tag</dt>
            <dd>{hex(cycle.decoded)}</dd>
          </div>
          <div>
            <dt>sig_flush</dt>
            <dd data-hot={cycle.flush ? "" : undefined}>{cycle.flush ? "1" : "0"}</dd>
          </div>
          <div>
            <dt>tally</dt>
            <dd data-hot={cycle.write ? "" : undefined}>{cycle.write ? `${cycle.tally} → ${after}` : cycle.tally}</dd>
          </div>
        </dl>
      </div>
      <figcaption className="cs-figcaption">
        <span>Re-simulated from the submitted VHDL: every stage, tag and flush value is a signal sampled from the core each clock. The fix is a one-line change tested the same way.</span>
        <span className="al-mono">Simulation</span>
      </figcaption>
    </figure>
  );
}
