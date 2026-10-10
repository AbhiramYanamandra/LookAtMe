const BIN_DEG = 180 / 8;

/**
 * A 4×4 grid of HOG "stars", one per 8×8 cell. Each of the 8 orientation bins
 * is a line through the cell centre, drawn along the edge (perpendicular to
 * the gradient), with length and opacity set by that bin's weight. Gradients
 * use image coordinates (y down), which match SVG's.
 */
export function HogGlyphs({ cells, x = 0, y = 0, size = 32, className = "hg", highlight }) {
  const step = size / 4;
  const r = step * 0.46;
  return (
    <g className={className} transform={`translate(${x} ${y})`}>
      {cells.map((row, i) =>
        row.map((bins, j) => {
          const cx = j * step + step / 2;
          const cy = i * step + step / 2;
          const on = highlight && highlight(i, j);
          return (
            <g key={`${i}-${j}`} className={on ? "hg-cell hg-on" : "hg-cell"}>
              {bins.map((w, b) => {
                if (w < 0.04) return null;
                const edge = ((b + 0.5) * BIN_DEG + 90) * (Math.PI / 180);
                const dx = Math.cos(edge) * r * w;
                const dy = Math.sin(edge) * r * w;
                return (
                  <line
                    key={b}
                    x1={(cx - dx).toFixed(2)}
                    y1={(cy - dy).toFixed(2)}
                    x2={(cx + dx).toFixed(2)}
                    y2={(cy + dy).toFixed(2)}
                    style={{ opacity: (0.35 + 0.65 * w).toFixed(2) }}
                  />
                );
              })}
            </g>
          );
        })
      )}
    </g>
  );
}

/** The 288-value feature vector as a bar strip; values are in [0, 1]. */
export function FeatureStrip({ features, x = 0, y = 0, w = 32, h = 8, className = "hg-strip" }) {
  const bw = w / features.length;
  const max = Math.max(...features);
  return (
    <g className={className} transform={`translate(${x} ${y})`}>
      {features.map((v, k) => {
        const bh = Math.max(0.3, (v / max) * h);
        return <rect key={k} x={(k * bw).toFixed(3)} y={(h - bh).toFixed(2)} width={(bw * 0.9).toFixed(3)} height={bh.toFixed(2)} />;
      })}
    </g>
  );
}
