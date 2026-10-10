import { BCLK_HZ, PACKET, PCM_BITS, SAMPLE_HZ } from "@/lib/clap";

const X0 = 84;
const X1 = 630;
const BITS = 64;
const CW = (X1 - X0) / BITS;
const bx = (i) => X0 + i * CW;

/**
 * One I²S frame as the team's i2s_master.vhd clocks it: 64 BCLK cycles, LRCLK
 * low for the left half and high for the right. One BCLK after each LRCLK edge
 * the FSM shifts in 18 bits MSB first; the left sample is sign-extended to 32
 * bits and written to the FIFO, and the right half is clocked through only to
 * stay aligned.
 */
export function I2sFrame() {
  let bclk = `M${X0} 34`;
  for (let i = 0; i < BITS; i++) bclk += `V20H${bx(i) + CW / 2}V34H${bx(i + 1)}`;
  const lr = `M${X0} 64H${bx(32)}V50H${X1}`;
  const cell = (i, cls, label) => (
    <g key={i}>
      <rect className={cls} x={bx(i) + 0.5} y="80" width={CW - 1} height="16" rx="1.5" />
      {label && (
        <text className="i2-bit" x={bx(i) + CW / 2} y="91.5" textAnchor="middle">
          {label}
        </text>
      )}
    </g>
  );
  const dout = [];
  for (let i = 0; i < BITS; i++) {
    const half = i < 32 ? "L" : "R";
    const k = i % 32;
    if (k >= 1 && k <= PCM_BITS) dout.push(cell(i, half === "L" ? "i2-data" : "i2-skip", half === "L" && (k === 1 || k === PCM_BITS) ? (k === 1 ? "17" : "0") : null));
    else dout.push(cell(i, "i2-idle"));
  }
  const brace = (a, b, y, text, cls) => (
    <g className={cls}>
      <path d={`M${bx(a)} ${y - 4}V${y}H${bx(b)}V${y - 4}`} />
      <text x={(bx(a) + bx(b)) / 2} y={y + 12} textAnchor="middle">
        {text}
      </text>
    </g>
  );
  const chain = [
    ["sign-extend", "18 → 32 bit"],
    ["FIFO", "sample buffer"],
    ["AXI-Stream", `TLAST / ${PACKET.toLocaleString()}`],
    ["DMA", "S2MM → DDR"],
    ["PYNQ", "NumPy check"],
  ];
  return (
    <figure className="cs-figure hx" data-reveal>
      <div className="hx-scroll">
        <svg viewBox="0 0 640 196" className="hx-svg i2" role="img" aria-label={`I2S frame: 64 bit clocks at ${BCLK_HZ / 1e6} MHz, left channel's 18 data bits captured one clock after the word-select edge, right channel clocked through and ignored.`}>
          <text className="i2-row" x="0" y="31">
            BCLK
          </text>
          <text className="i2-row" x="0" y="61">
            LRCLK
          </text>
          <text className="i2-row" x="0" y="92">
            DOUT
          </text>
          <path className="i2-wave" d={bclk} />
          <path className="i2-wave" d={lr} />
          <text className="i2-half" x={bx(16)} y="60" textAnchor="middle">
            left
          </text>
          <text className="i2-half" x={bx(48)} y="47" textAnchor="middle">
            right
          </text>
          {dout}
          {brace(1, 1 + PCM_BITS, 108, "18 bits captured, MSB first", "i2-brace i2-brace-on")}
          {brace(33, 33 + PCM_BITS, 108, "clocked through, ignored", "i2-brace")}
          <text className="i2-note" x={bx(0) + CW / 2} y="76" textAnchor="middle">
            ↓1
          </text>
          {chain.map(([name, sub], i) => {
            const x = 84 + i * 110;
            return (
              <g key={name} transform={`translate(${x} 140)`}>
                <rect className="i2-stage" width="96" height="36" rx="6" />
                <text className="i2-stage-name" x="48" y="16" textAnchor="middle">
                  {name}
                </text>
                <text className="i2-stage-sub" x="48" y="29" textAnchor="middle">
                  {sub}
                </text>
                {i < chain.length - 1 && <path className="i2-arrow" d="M98 18h10" />}
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="cs-figcaption">
        <span>
          BCLK is the 100 MHz fabric clock divided by 50 ({BCLK_HZ / 1e6} MHz); a 64-clock frame gives {SAMPLE_HZ.toLocaleString()} samples a second. Data is valid one BCLK after each LRCLK edge (↓1). Capturing the right half too is what fixed the frame alignment.
        </span>
        <span className="al-mono">From the VHDL</span>
      </figcaption>
    </figure>
  );
}
