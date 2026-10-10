import { INTERVAL, LATENCY, STAGES, VERSIONS } from "@/lib/hog-data";

const PACE = Math.max(...STAGES.map((s) => s.cycles));

/**
 * When each stage of each image runs. Without dataflow, an image's six stages
 * run back to back before the next image starts. With dataflow, a stage starts
 * an image as soon as that image leaves the previous stage and the stage has
 * finished the image before, so throughput is set by the slowest stage.
 */
function schedule(images, overlapped) {
  const rows = [];
  const stageFree = STAGES.map(() => 0);
  let t = 0;
  for (let k = 0; k < images; k++) {
    let ready = overlapped ? 0 : t;
    const segs = STAGES.map((st, s) => {
      const start = Math.max(ready, overlapped ? stageFree[s] : 0);
      const end = start + st.cycles;
      stageFree[s] = end;
      ready = end;
      return { ...st, start, end };
    });
    t = ready;
    rows.push(segs);
  }
  return rows;
}

const W = 640;
const LEFT = 92;
const SPAN = 4000;
const RIGHT = 52;
const x = (c) => LEFT + (Math.min(c, SPAN) / SPAN) * (W - LEFT - RIGHT);

function GanttRows({ rows, y0, label, done }) {
  return (
    <g>
      <text className="hx-group" x="0" y={y0 - 8}>
        {label}
      </text>
      {rows.map((segs, k) => {
        const y = y0 + k * 22;
        const finished = segs[segs.length - 1].end;
        return (
          <g key={k}>
            <text className="hx-row" x="0" y={y + 12}>
              image {k + 1}
            </text>
            {segs.map((sg) =>
              sg.start < SPAN ? (
                <rect key={sg.id} className={sg.cycles === PACE ? "hx-seg hx-pace" : "hx-seg"} x={x(sg.start) + 1} y={y} width={Math.max(1, x(sg.end) - x(sg.start) - 2)} height="16" rx="3">
                  <title>{`Image ${k + 1}, ${sg.name}: cycles ${sg.start}–${sg.end}`}</title>
                </rect>
              ) : null
            )}
            {finished <= SPAN && (
              <text className="hx-done" x={x(finished) + 4} y={y + 12}>
                ✓ {finished.toLocaleString()}
              </text>
            )}
          </g>
        );
      })}
      <text className="hx-tally" x={W - 12} y={y0 - 8} textAnchor="end">
        {done} images done by cycle 4,000
      </text>
    </g>
  );
}

export function HogDataflow() {
  const seq = schedule(3, false);
  const flow = schedule(4, true);
  const doneBy = (rows) => rows.filter((r) => r[r.length - 1].end <= SPAN).length;
  const seqY = 34;
  const flowY = seqY + seq.length * 22 + 44;
  const axisY = flowY + flow.length * 22 + 10;
  return (
    <figure className="cs-figure hx" data-reveal>
      <div className="hx-scroll">
        <svg viewBox={`0 0 ${W} ${axisY + 28}`} className="hx-svg" role="img" aria-labelledby="hx-desc">
          <desc id="hx-desc">
            Timeline of the six accelerator stages. Run back to back, an image finishes every {seq[0][5].end} cycles. Overlapped as a dataflow pipeline, after the first image a new one finishes every {flow[1][5].end - flow[0][5].end} cycles, set by the slowest stage, normalise.
          </desc>
          <GanttRows rows={seq} y0={seqY} label="Without dataflow: one image at a time" done={doneBy(seq)} />
          <GanttRows rows={flow} y0={flowY} label="With dataflow: stages overlap across images" done={doneBy(flow)} />
          {/* direct labels on the first overlapped image */}
          {flow[0].map((sg) => {
            const w = x(sg.end) - x(sg.start);
            const fits = (t) => t.length * 5.3 + 8 <= w;
            const text = fits(sg.label) ? sg.label : fits(sg.label.split(" ")[0]) ? sg.label.split(" ")[0] : null;
            return text ? (
              <text key={sg.id} className="hx-seglabel" x={(x(sg.start) + x(sg.end)) / 2} y={flowY + 11.5} textAnchor="middle">
                {text}
              </text>
            ) : null;
          })}
          <line className="hx-axis" x1={LEFT} x2={x(SPAN)} y1={axisY} y2={axisY} />
          {[0, 1000, 2000, 3000, 4000].map((c) => (
            <g key={c}>
              <line className="hx-tick" x1={x(c)} x2={x(c)} y1={axisY} y2={axisY + 4} />
              <text className="hx-ticklabel" x={x(c)} y={axisY + 15} textAnchor="middle">
                {c.toLocaleString()}
              </text>
            </g>
          ))}
          <text className="hx-ticklabel" x={x(SPAN)} y={axisY + 26} textAnchor="end">
            clock cycles (200 MHz)
          </text>
        </svg>
      </div>
      <figcaption className="cs-figcaption">
        <span>
          Modelled from the C-Synth cost of each stage. Amber is normalise ({PACE} cycles), the slowest stage, which sets the interval. The report measures a {INTERVAL}-cycle interval and a {LATENCY.toLocaleString()}-cycle trip for one image once hand-off overhead is included.
        </span>
        <span className="al-mono">Model</span>
      </figcaption>
    </figure>
  );
}

const VW = 640;
const VL = 40;
const colX = (i) => VL + 12 + i * ((VW - VL - 24) / VERSIONS.length);
const colW = (VW - VL - 24) / VERSIONS.length - 18;

function Panel({ y0, h, title, value, max, format, refLine, inside }) {
  const yv = (v) => y0 + h - (v / max) * h;
  return (
    <g>
      <text className="hx-group" x="0" y={y0 - 10}>
        {title}
      </text>
      {refLine && (
        <g>
          <line className="hv-ref" x1={VL} x2={VW - 8} y1={yv(refLine.value)} y2={yv(refLine.value)} />
          <text className="hv-reflabel" x={VW - 8} y={yv(refLine.value) - 4} textAnchor="end">
            {refLine.label}
          </text>
        </g>
      )}
      <line className="hx-axis" x1={VL} x2={VW - 8} y1={y0 + h} y2={y0 + h} />
      {VERSIONS.map((ver, i) => {
        const v = value(ver);
        const top = yv(v);
        return (
          <g key={ver.v}>
            <path
              className={ver.reverted ? "hv-bar hv-reverted" : "hv-bar"}
              d={`M${colX(i)} ${y0 + h}V${top + 4}q0 -4 4 -4h${colW - 8}q4 0 4 4V${y0 + h}Z`}
            >
              <title>{`${ver.v} · ${ver.what}: ${format(v)}`}</title>
            </path>
            <text className={inside ? "hv-value hv-inside" : "hv-value"} x={colX(i) + colW / 2} y={inside ? top + 14 : top - 6} textAnchor="middle">
              {format(v)}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export function HogVersions() {
  const cyclesH = 120;
  const lutH = 80;
  const y1 = 30;
  const y2 = y1 + cyclesH + 64;
  const labelsY = y2 + lutH + 18;
  return (
    <figure className="cs-figure hx" data-reveal>
      <div className="hx-scroll">
        <svg viewBox={`0 0 ${VW} ${labelsY + 34}`} className="hx-svg" role="img" aria-label="Cycles per image and LUT use for each kernel version, v5 to v10. Table follows.">
          <Panel y0={y1} h={cyclesH} title="Cycles per image (lower is faster)" value={(v) => v.cycles} max={4900} format={(n) => n.toLocaleString()} />
          {VERSIONS.map((ver, i) =>
            ver.speedup ? (
              <text key={ver.v} className="hv-speed" x={colX(i) + colW / 2} y={y1 + cyclesH - 8} textAnchor="middle">
                {ver.speedup}×
              </text>
            ) : null
          )}
          <Panel y0={y2} h={lutH} title="LUT use" value={(v) => v.lut} max={100} format={(n) => `${n}%`} refLine={{ value: 75, label: "75% routing headroom" }} inside />
          {VERSIONS.map((ver, i) => (
            <g key={ver.v}>
              <text className="hv-ver" x={colX(i) + colW / 2} y={labelsY} textAnchor="middle">
                {ver.v}
              </text>
              <text className={ver.reverted ? "hv-what hv-what-rev" : "hv-what"} x={colX(i) + colW / 2} y={labelsY + 13} textAnchor="middle">
                {ver.reverted ? "reverted" : ver.what.split(" ").slice(0, 2).join(" ")}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <table className="sr-only">
        <caption>Kernel versions</caption>
        <thead>
          <tr>
            <th scope="col">Version</th>
            <th scope="col">Change</th>
            <th scope="col">Cycles per image</th>
            <th scope="col">Kernel speedup</th>
            <th scope="col">LUT</th>
          </tr>
        </thead>
        <tbody>
          {VERSIONS.map((ver) => (
            <tr key={ver.v}>
              <td>{ver.v}</td>
              <td>{ver.what}{ver.reverted ? " (reverted)" : ""}</td>
              <td>{ver.cycles}</td>
              <td>{ver.speedup ? `${ver.speedup}×` : "not deployed"}</td>
              <td>{ver.lut}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <figcaption className="cs-figcaption">
        <span>
          C-Synth cycles per image for each version; speedups are board-measured where that version was deployed. The 3-wide square root (v6) was faster on paper but took LUT use to 92%, so it was reverted the same day.
        </span>
        <span className="al-mono">Measured</span>
      </figcaption>
    </figure>
  );
}
