"use client";

import Image from "next/image";
import { useState } from "react";
import { DETECTIONS, detectionSrc } from "@/lib/pest-detections";

const MODES = [
  { id: "pred", label: "Model" },
  { id: "gt", label: "Label" },
  { id: "both", label: "Overlay" },
];

const pct = ([x0, y0, x1, y1]) => ({
  left: `${x0 * 100}%`,
  top: `${y0 * 100}%`,
  width: `${(x1 - x0) * 100}%`,
  height: `${(y1 - y0) * 100}%`,
});

/**
 * Six AgroPest-12 test photos with RT-DETR's real predictions, switchable
 * against the dataset's own labels so the IoU numbers can be checked by eye.
 */
export function DetectionGrid() {
  const [mode, setMode] = useState("pred");
  return (
    <figure className="cs-figure dg" data-reveal>
      <div className="dg-bar">
        <span className="al-mono">RT-DETR · test set</span>
        <div className="dg-toggle" role="group" aria-label="Boxes to show">
          {MODES.map((m) => (
            <button key={m.id} type="button" aria-pressed={mode === m.id} onClick={() => setMode(m.id)}>
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <ul className="dg-grid" data-mode={mode}>
        {DETECTIONS.map((d) => {
          const wrong = d.pred.some((p) => p.label !== d.truth);
          return (
            <li key={d.id} className={wrong ? "dg-wrong" : undefined}>
              <div className="dg-photo">
                <Image src={detectionSrc(d.id)} alt={`Test photo: ${d.truth.toLowerCase()}`} width={560} height={560} sizes="(max-width: 640px) 50vw, 230px" />
                {d.gt.map((box, i) => (
                  <span key={`gt${i}`} className="dg-box dg-gt" style={pct(box)} />
                ))}
                {d.pred.map((p, i) => (
                  <span key={`p${i}`} className="dg-box dg-pred" style={pct(p.box)}>
                    <b>{p.label}</b>
                  </span>
                ))}
              </div>
              <p className="dg-cap">
                {wrong ? (
                  <>
                    <span>Predicted {d.pred[0].label.toLowerCase()}</span>
                    <span>is a {d.truth.toLowerCase().replace(/s$/, "")}</span>
                  </>
                ) : (
                  <>
                    <span>{d.truth}</span>
                    <span>IoU {d.pred.map((p) => p.iou.toFixed(2)).join(" · ")}</span>
                  </>
                )}
              </p>
            </li>
          );
        })}
      </ul>
      <figcaption className="cs-figcaption">
        <span>
          Test-set photos with the 15-epoch model&rsquo;s predicted boxes, from the testing notebook. Switch to the dataset label to compare; IoU is prediction against label.
        </span>
        <span className="al-mono">Model output</span>
      </figcaption>
    </figure>
  );
}
