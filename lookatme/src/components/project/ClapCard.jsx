import { FULL_SCALE, PACKET_MS, SAMPLE_HZ, THRESHOLD, makeSignal } from "@/lib/clap";

/**
 * Library card for the clap sensor. The microphone signal scrolls past a "now"
 * line; faint ticks mark the 4,096-sample DMA packets, and the band is the
 * detection threshold (|sample| > 10,000 of 32,768). When a clap crosses the
 * line it trips the threshold, which toggles the LED and the speaker's mute.
 * A loud non-clap swell stays inside the band. Signal is synthetic.
 */
const W = 240;
const WINDOWS = 10; // packets per screen width
const PPW = 24; // points (and px) per packet
const PERIOD = 9; // seconds per screen of scroll (slowed for reading)
const CY = 64;
const H = 40;
const NOW = 196;
const EVENTS = [
  [2, "clap", 30000],
  [5, "music", 9000],
  [7, "clap", 27000],
];

export function ClapCard() {
  const sig = makeSignal({ windows: WINDOWS, pointsPerWindow: PPW, events: EVENTS, seed: 11, noise: 1100 });
  const y = (v) => (CY - (v / FULL_SCALE) * H).toFixed(1);
  let d = "";
  for (let i = 0; i < sig.length; i++) d += `${i ? "L" : "M"}${i} ${y(sig[i])}`;
  const band = (THRESHOLD / FULL_SCALE) * H;

  // When each clap's peak reaches the "now" line, as a fraction of the period.
  const claps = EVENTS.filter((e) => e[1] === "clap").map(([w]) => {
    let best = w * PPW;
    for (let i = w * PPW; i < (w + 1) * PPW; i++) if (Math.abs(sig[i]) > Math.abs(sig[best])) best = i;
    return (((best - NOW) % W) + W) % W / W;
  });
  const [t1, t2] = claps.sort((a, b) => a - b);
  const p = (f) => (f * 100).toFixed(2);
  const flash = (t) => `${p(Math.max(0, t - 0.002))}%{opacity:0}${p(t)}%{opacity:1}${p(Math.min(1, t + 0.07))}%{opacity:0}`;
  const css =
    `@keyframes cc-scroll{from{transform:translateX(0)}to{transform:translateX(-${W}px)}}` +
    `@keyframes cc-on{0%,${p(t1)}%{opacity:0}${p(t1 + 0.001)}%,${p(t2)}%{opacity:1}${p(t2 + 0.001)}%,100%{opacity:0}}` +
    `@keyframes cc-off{0%,${p(t1)}%{opacity:1}${p(t1 + 0.001)}%,${p(t2)}%{opacity:0}${p(t2 + 0.001)}%,100%{opacity:1}}` +
    `@keyframes cc-hit{0%{opacity:0}${flash(t1)}${flash(t2)}100%{opacity:0}}` +
    `.pv-clap .cc-scroll{animation:cc-scroll ${PERIOD}s linear infinite}` +
    `.pv-clap .cc-on{animation:cc-on ${PERIOD}s steps(1) infinite}` +
    `.pv-clap .cc-off{animation:cc-off ${PERIOD}s steps(1) infinite}` +
    `.pv-clap .cc-hit{animation:cc-hit ${PERIOD}s linear infinite}`;

  const stages = ["MIC", "I²S", "FIFO", "DMA", "PYNQ"];
  return (
    <svg viewBox={`0 0 ${W} 150`} className="pv pv-clap">
      <style>{css}</style>
      <text className="cc-meta" x="6" y="12">
        SPH0645 · {(SAMPLE_HZ / 1000).toFixed(2)} kHz · 18-bit
      </text>

      <rect className="cc-band" x="0" y={CY - band} width={W} height={band * 2} />
      <line className="cc-thresh" x1="0" x2={W} y1={CY - band} y2={CY - band} />
      <line className="cc-thresh" x1="0" x2={W} y1={CY + band} y2={CY + band} />
      <text className="cc-tlabel" x="4" y={CY - band - 3}>
        |x| &gt; 10,000
      </text>
      <clipPath id="cc-clip">
        <rect x="0" y="0" width={W} height="150" />
      </clipPath>
      <g clipPath="url(#cc-clip)">
        <g className="cc-scroll">
          {[0, W].map((dx) => (
            <g key={dx} transform={`translate(${dx} 0)`}>
              {Array.from({ length: WINDOWS }, (_, k) => (
                <line key={k} className="cc-tick" x1={k * PPW} x2={k * PPW} y1={CY - H - 2} y2={CY + H + 2} />
              ))}
              <path className="cc-wave" d={d} />
            </g>
          ))}
        </g>
      </g>
      <rect className="cc-fade" x={NOW + 1} y={CY - H - 4} width={W - NOW} height={H * 2 + 8} />
      <line className="cc-now" x1={NOW} x2={NOW} y1={CY - H - 6} y2={CY + H + 6} />
      <text className="cc-hit cc-hitlabel" x={NOW - 4} y={CY - H - 9} textAnchor="end">
        CLAP
      </text>

      {/* outputs: the PMOD LED and the speaker's mute state toggle together */}
      <g transform="translate(206 4)">
        <circle className="cc-led" cx="6" cy="6" r="4.2" />
        <circle className="cc-led-on cc-on" cx="6" cy="6" r="4.2" />
        <path className="cc-spk" d="M17 4h3l4-3v10l-4-3h-3z" />
        <path className="cc-wavesym cc-off" d="M26.5 3.5q2 2.5 0 5M28.5 1.8q3.4 4.2 0 8.4" />
        <path className="cc-mute cc-on" d="M26 3l5 6M31 3l-5 6" />
      </g>

      <text className="cc-meta" x="6" y="114">
        {Math.round(PACKET_MS)} ms packets → any sample over the line?
      </text>
      {stages.map((s, i) => (
        <g key={s} transform={`translate(${6 + i * 47} 122)`}>
          <rect className="cc-stage" width="38" height="16" rx="4" />
          <text className="cc-stage-label" x="19" y="10.8" textAnchor="middle">
            {s}
          </text>
          {i < stages.length - 1 && <path className="cc-arrow" d="M40 8h5" />}
        </g>
      ))}
    </svg>
  );
}
