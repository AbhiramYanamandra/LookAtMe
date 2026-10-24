"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The redesigned Redback driver display ("Display New" in the team's Figma)
 * redrawn in the browser. It runs on simulated values, not the firmware.
 *
 * On track, a made-up lap drives every reading: throttle rises and falls
 * through straights and corners, the cells sag under load, temperatures creep
 * up over the first laps, and the delta to the best lap drifts and resets at
 * the line. A warning, when on, holds its reading just past the design's
 * limit so the screen raises the same banner the design specifies.
 *
 * <HudSim /> opens the case study: a demo plays through each warning in turn,
 * and the visitor can take over with the mode and warning toggles.
 * <HudTile /> is the compact one for the homepage and showcase tiles.
 * The clock stops while either is off screen.
 */

// Warning order and wording follow the Figma "Display Warning" frame. The
// temperature limits are the design's own notes; the LV cutoff is not in the
// design, so 11.5 V here is illustrative.
const SENSORS = [
  { id: "lv", label: "LV battery low", limit: 11.5, below: true, unit: "V", warning: "LV BATTERY TOO LOW" },
  { id: "accu", label: "Accumulator hot", limit: 55, unit: "°C", warning: "ACCU TEMP TOO HIGH" },
  { id: "motor", label: "Motor hot", limit: 45, unit: "°C", warning: "MOTOR TEMP TOO HIGH" },
  { id: "coolant", label: "Coolant hot", limit: 45, unit: "°C", warning: "COOLANT TEMP TOO HIGH" },
  { id: "inverter", label: "Inverter hot", limit: 55, unit: "°C", warning: "INVERTER TEMP TOO HIGH" },
];
const MODES = [
  { id: "pit", label: "Pit" },
  { id: "track", label: "On track" },
  { id: "shutdown", label: "Shutdown" },
];
const LAP_MS = 30000; // a short demo lap, so the lap counter visibly ticks

// The case study's demo: a clean lap, then each warning stacks on in turn,
// they clear, and the car shuts down. Each step holds for `hold` seconds.
const DEMO = [
  { mode: "track", warn: [], hold: 8 },
  { mode: "track", warn: ["lv"], hold: 3.5 },
  { mode: "track", warn: ["lv", "accu"], hold: 3.5 },
  { mode: "track", warn: ["lv", "accu", "motor"], hold: 3.5 },
  { mode: "track", warn: ["lv", "accu", "motor", "coolant"], hold: 3.5 },
  { mode: "track", warn: ["lv", "accu", "motor", "coolant", "inverter"], hold: 5 },
  { mode: "track", warn: [], hold: 5 },
  { mode: "shutdown", warn: [], hold: 5 },
];

const C = {
  tile: "#2f2f2f",
  line: "#5a5a5a",
  green: "#5ea83b",
  olive: "#bfc152",
  red: "#d6413a",
  blue: "#2b3fe6",
  amber: "#f4c43f",
  dim: "#6b1d1a",
};

const clock = (ms) => {
  const t = Math.floor(ms / 10);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(Math.floor(t / 6000))}:${pad(Math.floor(t / 100) % 60)}:${pad(t % 100)}`;
};
const only = (ids) => Object.fromEntries(SENSORS.map((s) => [s.id, ids.includes(s.id)]));

// Throttle through one lap of a made-up track, 0 (braking) to 1 (flat out).
const throttleAt = (p) => Math.min(1, Math.max(0, 0.55 + 0.45 * Math.sin(2 * Math.PI * 3 * p) + 0.2 * Math.sin(2 * Math.PI * (7 * p + 0.2))));

function simulate(mode, elapsed, warn) {
  const track = mode === "track";
  const laps = elapsed / LAP_MS;
  const p = laps % 1;
  const load = track ? throttleAt(p) : 0;
  const warm = track ? Math.min(1, laps / 3) : 0; // temperatures settle over the first laps
  const r = {
    lv: 13.4 - 0.15 * load,
    accu: 34 + 6 * warm + 1.5 * load,
    motor: 33 + 7 * warm + 4 * load,
    coolant: 29 + 6 * warm + 2 * load,
    inverter: 36 + 8 * warm + 4 * load,
  };
  for (const s of SENSORS) if (warn[s.id]) r[s.id] = s.below ? s.limit - 0.3 : s.limit + 3 + 2 * load;
  const avg = 3.96 - 0.1 * load - 0.02 * warm;
  r.cells = [avg - 0.05, avg, avg + 0.06];
  // The pack's discharge current limit eases off as the accumulator heats.
  r.dcl = track ? Math.round(180 - Math.max(0, r.accu - 40) * 6) : 0;
  // Delta to the best lap: zero at the line, drifting by a different amount each lap.
  const pace = Math.sin((Math.floor(laps) + 1) * 12.9898);
  r.delta = track ? pace * 0.6 * Math.sin(Math.PI * p) + 0.04 * Math.sin(2 * Math.PI * 5 * p) : 0;
  r.fans = { accu: r.accu > 38, rad: r.coolant > 31 };
  return r;
}

function useHud({ demo = false } = {}) {
  const root = useRef(null);
  const [mode, setMode] = useState("track");
  const [warn, setWarn] = useState(() => only([]));
  const [elapsed, setElapsed] = useState(0);
  const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const watch = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    watch.observe(root.current);
    // The demo plays by itself unless motion is reduced; then it waits for Play.
    if (demo && !matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(true);
    return () => watch.disconnect();
  }, [demo]);

  useEffect(() => {
    if (mode !== "track" || !visible) return undefined;
    const start = performance.now() - elapsed;
    const id = setInterval(() => setElapsed(performance.now() - start), 47);
    return () => clearInterval(id);
    // Only restart the clock when the mode or visibility changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, visible]);

  const choose = (next) => {
    if (next === "pit" || (next === "track" && mode === "shutdown")) setElapsed(0);
    setMode(next);
  };

  // Each demo step applies its state, then hands over to the next after its hold.
  useEffect(() => {
    if (!playing || !visible) return undefined;
    const current = DEMO[step];
    if (current.mode !== mode) choose(current.mode);
    setWarn(only(current.warn));
    const id = setTimeout(() => setStep((step + 1) % DEMO.length), current.hold * 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, visible, step]);

  // Any hand on the controls stops the demo.
  const take = (apply) => {
    setPlaying(false);
    apply();
  };

  const readings = simulate(mode, elapsed, warn);
  const shutdown = mode === "shutdown";
  const warnings = shutdown ? [] : SENSORS.filter((s) => warn[s.id]);
  const summary = shutdown
    ? "Shutdown: it is now safe to turn LV off."
    : warnings.length
      ? `Warnings: ${warnings.map((w) => w.warning.toLowerCase()).join(", ")}.`
      : "No warnings.";
  return { root, mode, choose, warn, setWarn, elapsed, readings, warnings, summary, playing, setPlaying, setStep, take };
}

function HudScreen({ hud }) {
  const { mode, readings, elapsed, warnings, summary, warn } = hud;
  const { fans, cells } = readings;
  const shutdown = mode === "shutdown";
  const track = mode === "track";
  const lapTime = elapsed % LAP_MS;
  const lap = 17 + Math.floor(elapsed / LAP_MS);
  const delta = readings.delta;
  const deltaText = `${delta < 0 ? "−" : "+"}${Math.abs(delta).toFixed(3)}s`;
  const values = {
    lv: readings.lv,
    accu: Math.round(readings.accu),
    motor: Math.round(readings.motor),
    coolant: Math.round(readings.coolant),
  };
  const accuFill = warn.accu ? C.red : values.accu > 30 ? C.olive : C.green;
  const lvFill = warn.lv ? C.red : values.lv < 12 ? C.olive : C.green;
  const hot = (id) => (warn[id] ? C.red : "#fff");

  return (
    <svg viewBox="0 0 800 480" className="hud-screen" fill="#fff" role="img" aria-label={`Driver display, ${MODES.find((m) => m.id === mode).label.toLowerCase()} mode. Lap ${lap}, lap time ${clock(lapTime)}. ${summary}`}>
      <defs>
        <filter id="hud-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="800" height="480" fill="#000" />

      {/* Left column: status dots, HV cells, LV battery */}
      <rect x="12" y="12" width="126" height="26" rx="3" fill={C.tile} />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={30 + i * 26} cy="25" r="7" fill={i === 0 ? "#9a9a9a" : "#000"} />
      ))}
      <rect x="12" y="44" width="126" height="182" fill={C.tile} />
      {["MIN", "AVG", "MAX"].map((k, i) => (
        <text key={k} x="24" y={82 + i * 40} className="hud-small">
          {k}: {cells[i].toFixed(2)}v
        </text>
      ))}
      <text x="75" y="210" textAnchor="middle" className="hud-label hud-bold">HV Cells</text>
      <rect x="12" y="230" width="126" height="100" fill={lvFill} />
      <text x="75" y="290" textAnchor="middle" className="hud-big">{values.lv.toFixed(1)}V</text>
      <text x="75" y="318" textAnchor="middle" className="hud-label hud-bold">LV Batt.</text>

      {/* Centre: state icons, lap timer, delta, bias / RTD / lap */}
      <g transform="translate(215 58)">
        <Rocket color={shutdown ? C.dim : C.amber} glow={!shutdown} />
        <text y="50" textAnchor="middle" className="hud-label hud-bold" fill={shutdown ? C.dim : C.amber}>
          {shutdown ? "Inactive" : "Ready"}
        </text>
      </g>
      <g transform="translate(335 58)">
        <Gauge color={track ? C.amber : "#7a5d1a"} glow={track} />
      </g>
      <g transform="translate(474 58)">
        <Fan color={fans.accu ? C.red : C.dim} />
        <text y="50" textAnchor="middle" className="hud-label hud-bold" fill={fans.accu ? C.red : C.dim}>Accu</text>
      </g>
      <g transform="translate(582 58)">
        <Fan color={fans.rad ? C.red : C.dim} />
        <text y="50" textAnchor="middle" className="hud-label hud-bold" fill={fans.rad ? C.red : C.dim}>Rad</text>
      </g>
      <text x="408" y="212" textAnchor="middle" className="hud-timer">{clock(lapTime)}</text>
      <rect x="158" y="230" width="495" height="44" fill={shutdown ? "#3d5a2a" : delta > 0.05 ? C.red : C.green} />
      <text x="405" y="261" textAnchor="middle" className="hud-mid">{shutdown ? "…" : deltaText}</text>
      <text x="245" y="336" textAnchor="middle" className="hud-mid">62%</text>
      <text x="245" y="358" textAnchor="middle" className="hud-label hud-bold">B. Bias</text>
      <rect x="352" y="312" width="114" height="40" rx="8" fill={track ? C.red : "#4a1a17"} />
      <text x="409" y="341" textAnchor="middle" className="hud-mid" fill={track ? "#fff" : "#a46a66"}>RTD</text>
      <text x="603" y="342" textAnchor="middle" className="hud-big">{lap}</text>
      <text x="603" y="362" textAnchor="middle" className="hud-label hud-bold">Lap</text>

      {/* Right column: accumulator temperature, torque limit, regen */}
      <rect x="662" y="12" width="126" height="128" fill={accuFill} />
      <text x="725" y="74" textAnchor="middle" className="hud-big">{values.accu}°C</text>
      <text x="725" y="104" textAnchor="middle" className="hud-label">ACCU. TEMP</text>
      <rect x="662" y="144" width="126" height="86" fill={C.tile} />
      <text x="725" y="196" textAnchor="middle" className="hud-big">180<tspan className="hud-small">Nm</tspan></text>
      <text x="725" y="220" textAnchor="middle" className="hud-label">TRQ. Limit</text>
      <rect x="662" y="234" width="126" height="96" fill={C.tile} />
      <text x="725" y="290" textAnchor="middle" className="hud-big">{track ? "15" : "0"}%</text>
      <text x="725" y="316" textAnchor="middle" className="hud-label">REGEN STR.</text>

      {/* Bottom row: CAN device health, discharge current limit, temperatures */}
      <rect x="12" y="388" width="776" height="82" fill="none" stroke={C.line} strokeWidth="2" />
      {[154, 278, 402, 526, 652].map((x) => (
        <line key={x} x1={x} y1="388" x2={x} y2="470" stroke={C.line} strokeWidth="2" />
      ))}
      <g transform="translate(83 418)">{shutdown ? <PowerOff /> : <Pulse />}</g>
      {!shutdown && (
        <text x="114" y="412" textAnchor="middle" className="hud-tiny">
          STATUS
          <tspan x="114" dy="16">NOMINAL</tspan>
        </text>
      )}
      <text x="83" y="460" textAnchor="middle" className="hud-label">CanForwarder</text>
      <g transform="translate(216 418)">{shutdown ? <PowerOff /> : <Check />}</g>
      <text x="216" y="460" textAnchor="middle" className="hud-label">Jetson</text>
      <g transform="translate(340 420)"><Wifi /></g>
      <text x="340" y="460" textAnchor="middle" className="hud-label">Router</text>
      <text x="464" y="432" textAnchor="middle" className="hud-mid">{readings.dcl}A</text>
      <text x="464" y="460" textAnchor="middle" className="hud-label">DCL</text>
      <text x="589" y="432" textAnchor="middle" className="hud-mid" fill={hot("motor")}>{values.motor}°C</text>
      <text x="589" y="460" textAnchor="middle" className="hud-label">MTR TEMP</text>
      <text x="720" y="432" textAnchor="middle" className="hud-mid" fill={hot("coolant")}>{values.coolant}°C</text>
      <text x="720" y="460" textAnchor="middle" className="hud-label">CLNT. TEMP</text>

      {/* Overlays: the shutdown notice, or the stack of active warnings */}
      {shutdown ? (
        <g>
          <rect x="0" y="14" width="800" height="58" fill={C.blue} />
          <text x="400" y="52" textAnchor="middle" className="hud-banner">It is now safe to LV Off</text>
        </g>
      ) : (
        warnings.map((w, i) => (
          <g key={w.id} className="hud-warning">
            <rect x="144" y={14 + i * 76} width="512" height="62" rx="3" fill={C.red} stroke="#000" strokeOpacity="0.35" strokeWidth="2" />
            <text x="400" y={54 + i * 76} textAnchor="middle" className="hud-banner">{w.warning}</text>
          </g>
        ))
      )}
    </svg>
  );
}

export function HudSim() {
  const hud = useHud({ demo: true });
  const { mode, choose, warn, setWarn, summary, playing, setPlaying, setStep, take } = hud;
  const toggle = (id) => {
    if (mode === "shutdown") choose("track");
    setWarn((current) => ({ ...current, [id]: !current[id] }));
  };
  return (
    <div className="hud" ref={hud.root}>
      <div className="hud-device">
        <HudScreen hud={hud} />
        <div className="hud-controls">
          <div className="hud-modes" role="group" aria-label="Car state">
            {MODES.map((m) => (
              <button key={m.id} type="button" aria-pressed={mode === m.id} onClick={() => take(() => choose(m.id))}>
                {m.label}
              </button>
            ))}
          </div>
          <div className="hud-warnings" role="group" aria-label="Warnings">
            <span className="al-mono">Warnings</span>
            {SENSORS.map((s) => (
              <button key={s.id} type="button" aria-pressed={warn[s.id]} onClick={() => take(() => toggle(s.id))}>
                <span>{s.label}</span>
                <small>
                  {s.below ? "below" : "above"} {s.limit}
                  {s.unit}
                </small>
              </button>
            ))}
          </div>
          <div className="hud-demo">
            <button
              type="button"
              aria-pressed={playing}
              onClick={() => {
                if (!playing) setStep(0);
                setPlaying(!playing);
              }}
            >
              {playing ? "Pause demo" : "Play demo"}
            </button>
            <p className="hud-status" aria-live="polite">{summary}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// One-tap states for the tiles: each sets the mode and the warnings together.
const TILE_STATES = [
  { id: "track", label: "On track", mode: "track", warn: [] },
  { id: "hot", label: "Overheat", mode: "track", warn: ["accu", "motor"] },
  { id: "shutdown", label: "Shut down", mode: "shutdown", warn: [] },
];

export function HudTile() {
  const hud = useHud();
  const [state, setState] = useState("track");
  const pick = (next) => {
    setState(next.id);
    hud.setWarn(only(next.warn));
    hud.choose(next.mode);
  };
  return (
    <div className="al-model hud-tile" ref={hud.root}>
      <HudScreen hud={hud} />
      <div className="al-model-case" role="group" aria-label="Car state">
        {TILE_STATES.map((item) => (
          <button key={item.id} type="button" aria-pressed={state === item.id} onClick={() => pick(item)}>
            {item.label}
          </button>
        ))}
      </div>
      <p className="hud-status hud-sr" aria-live="polite">{hud.summary}</p>
    </div>
  );
}

function Rocket({ color, glow }) {
  return (
    <g fill="none" stroke={color} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" filter={glow ? "url(#hud-glow)" : undefined}>
      <path d="M14 -22 C 4 -20 -6 -10 -10 2 L -2 10 C 10 6 20 -4 22 -14 Z" />
      <circle cx="7" cy="-7" r="4" />
      <path d="M-10 2 L-18 0 L-10 -10 L-2 -10 M-2 10 L0 18 L10 10 L10 2 M-8 12 L-16 20" />
    </g>
  );
}

function Gauge({ color, glow }) {
  return (
    <g fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" filter={glow ? "url(#hud-glow)" : undefined}>
      <path d="M-20 12 A 22 22 0 1 1 20 12" />
      <path d="M0 0 L9 -10" />
    </g>
  );
}

function Fan({ color }) {
  return (
    <g fill="none" stroke={color} strokeWidth="3.5" strokeLinejoin="round">
      {[0, 90, 180, 270].map((a) => (
        <path key={a} transform={`rotate(${a})`} d="M0 -4 C -2 -14 4 -22 12 -20 C 14 -12 8 -6 0 -4 Z" />
      ))}
      <circle r="4" />
    </g>
  );
}

function Pulse() {
  return <path d="M-38 0 L-30 0 L-24 -14 L-16 14 L-10 -4 L-6 0 L-2 0" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" />;
}

function Check() {
  return <path d="M-16 0 L-5 11 L16 -12" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />;
}

function Wifi() {
  return (
    <g fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round">
      <path d="M-20 -6 A 28 28 0 0 1 20 -6" />
      <path d="M-13 1 A 18 18 0 0 1 13 1" />
      <path d="M-6 8 A 8 8 0 0 1 6 8" />
      <circle cy="13" r="1.5" fill="#fff" />
    </g>
  );
}

function PowerOff() {
  return (
    <g fill="none" stroke={C.red} strokeWidth="3.5" strokeLinecap="round">
      <path d="M-9 -9 A 14 14 0 1 0 9 -9" />
      <path d="M0 -16 L0 -2" />
      <path d="M-16 -16 L16 16" />
    </g>
  );
}
