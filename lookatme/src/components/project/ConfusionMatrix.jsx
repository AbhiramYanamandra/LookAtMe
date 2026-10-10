import { CLASSES, CONFUSION, FALSE_POSITIVES, NOTABLE } from "@/lib/pest-detections";

const MAX = Math.max(...CONFUSION.flat(), ...FALSE_POSITIVES);
const isNotable = (r, c) => NOTABLE.some(([nr, nc]) => nr === r && nc === c);

function Cell({ value, kind }) {
  const strength = value / MAX;
  return (
    <td className={kind} style={{ "--v": strength.toFixed(3) }} data-zero={value === 0 ? "" : undefined}>
      {value || ""}
    </td>
  );
}

/**
 * The test-set confusion matrix from the 15-epoch run, redrawn from the
 * notebook's counts. Rows are the true class; columns are the prediction, plus
 * FN (missed objects). The bottom row is FP (detections with no label).
 */
export function ConfusionMatrix() {
  return (
    <figure className="cs-figure cm" data-reveal>
      <div className="cm-scroll">
        <table>
          <caption className="sr-only">Confusion matrix: true class by predicted class, with missed detections and false positives.</caption>
          <thead>
            <tr>
              <th scope="col" className="cm-corner">
                <span>true ↓ / predicted →</span>
              </th>
              {CLASSES.map((name) => (
                <th key={name} scope="col">
                  <span>{name}</span>
                </th>
              ))}
              <th scope="col" className="cm-extra">
                <span>Missed</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {CONFUSION.map((row, r) => (
              <tr key={CLASSES[r]}>
                <th scope="row">{CLASSES[r]}</th>
                {row.map((value, c) => (
                  <Cell key={c} value={value} kind={c === CLASSES.length ? "cm-fn" : c === r ? "cm-hit" : isNotable(r, c) ? "cm-miss cm-notable" : "cm-miss"} />
                ))}
              </tr>
            ))}
            <tr className="cm-fp-row">
              <th scope="row">Spurious</th>
              {FALSE_POSITIVES.map((value, c) => (
                <Cell key={c} value={value} kind="cm-fp" />
              ))}
              <td className="cm-blank" />
            </tr>
          </tbody>
        </table>
      </div>
      <figcaption className="cs-figcaption">
        <span>
          Counts over the 546-image test set. Amber is correct, red is a wrong class, grey is a missed object or a detection with no label. Outlined: the confusions discussed above.
        </span>
        <span className="al-mono">Model output</span>
      </figcaption>
    </figure>
  );
}
