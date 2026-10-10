"use client";

import { useState } from "react";
import { HOG_IMAGES, STAGES } from "@/lib/hog-data";
import { HogGlyphs } from "./HogGlyphs";

const S = 256; // canvas size: 8 units per pixel
const PX = S / 32;
const CELL = S / 4;
const stage = (id) => STAGES.find((s) => s.id === id);

const STEPS = [
  {
    title: "Pixels",
    stage: "load",
    text: "A 32×32 greyscale CIFAR-10 image: 1,024 bytes, burst-read from DDR into on-chip memory with 16-wide copies.",
  },
  {
    title: "Normalise",
    stage: "norm",
    text: "Gamma correction (x^2.5, computed as x·x·√x), then contrast normalisation to zero mean and unit variance. The running sum and sum of squares are split across two lanes so two pixels go in every cycle. At 621 cycles, this is the stage that sets the pace.",
  },
  {
    title: "Gradients",
    stage: "grad",
    text: "Central differences ([-1 0 1]) give dx and dy for each pixel, and the magnitude is √(dx² + dy²). Bright pixels are strong edges. In the final version this stage handles two pixels per cycle.",
  },
  {
    title: "Orientation",
    stage: "grad",
    text: "Each gradient's direction falls into one of 8 bins of 22.5° across 0–180°. The kernel never computes an angle: it compares dy against dx·tan 22.5° and dx·tan 67.5°. That removed the CORDIC arctangent unit, about 17,700 LUTs.",
  },
  {
    title: "Cell histograms",
    stage: "cells",
    text: "Each 8×8 cell adds up its 64 gradient magnitudes into 8 orientation bins, giving one star per cell. Updates go to fixed, predicated addresses instead of hist[bin] += w, which avoided a hazard network that cost about 68,000 LUTs. Four histogram units run in parallel. Tap a cell to see its histogram.",
  },
  {
    title: "Block normalise",
    stage: "block",
    text: "A 2×2-cell block slides one cell at a time, giving 9 positions. Each block's 32 values are divided by their L2 norm, so lighting changes cancel out. Per-cell energies are computed once and reused across overlapping blocks. Tap to move the block.",
  },
  {
    title: "288 features",
    stage: "store",
    text: "9 blocks × 4 cells × 8 bins = 288 values, written back to DDR. This is what a classifier sees instead of the 1,024 pixels. Each one matches the course's reference implementation to within 1e-6.",
  },
];

const DEG = ["0°", "22.5°", "45°", "67.5°", "90°", "112.5°", "135°", "157.5°"];

function strongestCell(cells) {
  let best = [0, 0];
  let max = -1;
  cells.forEach((row, i) => row.forEach((bins, j) => {
    const sum = bins.reduce((a, b) => a + b, 0);
    if (sum > max) {
      max = sum;
      best = [i, j];
    }
  }));
  return best;
}

function OrientationField({ img }) {
  const lines = [];
  for (let k = 0; k < 1024; k++) {
    const m = Number(img.mag[k]) / 9;
    if (m < 0.12) continue;
    const b = Number(img.bins[k]);
    const a = ((b + 0.5) * 22.5 + 90) * (Math.PI / 180);
    const cx = (k % 32) * PX + PX / 2;
    const cy = Math.floor(k / 32) * PX + PX / 2;
    const r = PX * 0.48;
    lines.push(<line key={k} x1={cx - Math.cos(a) * r} y1={cy - Math.sin(a) * r} x2={cx + Math.cos(a) * r} y2={cy + Math.sin(a) * r} style={{ opacity: 0.25 + 0.75 * m }} />);
  }
  return <g className="ha-field">{lines}</g>;
}

function Bars({ values, labels, max = 1 }) {
  return (
    <div className="ha-bars" role="img" aria-label={values.map((v, i) => `${labels ? labels[i] : i + 1}: ${v.toFixed(2)}`).join(", ")}>
      {values.map((v, i) => (
        <span key={i} title={`${labels ? labels[i] : `value ${i + 1}`}: ${v.toFixed(3)}`}>
          <i style={{ height: `${Math.max(2, (v / max) * 100)}%` }} />
        </span>
      ))}
    </div>
  );
}

/**
 * One real benchmark image taken through every stage of the accelerator. All
 * data comes from scripts/hog/build-hog-data.py, checked against the course's
 * reference output.
 */
export function HogAnatomy() {
  const [pick, setPick] = useState(0);
  const [step, setStep] = useState(0);
  const img = HOG_IMAGES[pick];
  const [cell, setCell] = useState(() => strongestCell(HOG_IMAGES[0].cells));
  const [block, setBlock] = useState([0, 0]);
  const info = STEPS[step];
  const st = stage(info.stage);

  const choose = (k) => {
    setPick(k);
    setCell(strongestCell(HOG_IMAGES[k].cells));
  };
  const onCanvas = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const j = Math.min(3, Math.floor(((e.clientX - r.left) / r.width) * 4));
    const i = Math.min(3, Math.floor(((e.clientY - r.top) / r.height) * 4));
    if (step === 4) setCell([i, j]);
    if (step === 5) setBlock([Math.min(2, i), Math.min(2, j)]);
  };
  const blockIndex = block[0] * 3 + block[1];
  const blockFeats = img.features.slice(blockIndex * 32, blockIndex * 32 + 32);
  const featMax = Math.max(...img.features);

  return (
    <figure className="cs-figure ha" data-reveal>
      <div className="ha-picker" role="group" aria-label="Benchmark image">
        {HOG_IMAGES.map((im, k) => (
          <button key={im.idx} type="button" aria-pressed={pick === k} onClick={() => choose(k)} aria-label={`CIFAR-10 image ${im.idx}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/images/hog/${im.idx}-raw.png`} alt="" width="32" height="32" />
          </button>
        ))}
      </div>
      <ol className="ha-steps" aria-label="Stage">
        {STEPS.map((s, k) => (
          <li key={s.title}>
            <button type="button" aria-current={k === step ? "step" : undefined} onClick={() => setStep(k)}>
              <b>{k + 1}</b> {s.title}
            </button>
          </li>
        ))}
      </ol>

      <div className="ha-body">
        <div className="ha-canvas-wrap">
          <svg viewBox={`0 0 ${S} ${S}`} className="ha-canvas" onClick={onCanvas} data-clickable={step === 4 || step === 5 ? "" : undefined} role="img" aria-label={`${info.title} for CIFAR-10 image ${img.idx}`}>
            <rect width={S} height={S} className="ha-bg" />
            {step === 0 && <image href={`/images/hog/${img.idx}-raw.png`} width={S} height={S} />}
            {step === 1 && <image href={`/images/hog/${img.idx}-norm.png`} width={S} height={S} />}
            {step === 2 && <image href={`/images/hog/${img.idx}-mag.png`} width={S} height={S} />}
            {step === 3 && <OrientationField img={img} />}
            {step >= 4 && step <= 5 && <HogGlyphs cells={img.cells} size={S} className="hg ha-glyphs" />}
            {step === 6 &&
              [0, 1, 2].map((bi) =>
                [0, 1, 2].map((bj) => {
                  const k = bi * 3 + bj;
                  const vals = img.features.slice(k * 32, k * 32 + 32);
                  const x0 = bj * (S / 3) + 6;
                  const y0 = bi * (S / 3) + 6;
                  const w = S / 3 - 12;
                  const h = S / 3 - 12;
                  return (
                    <g key={k} className="ha-block-bars">
                      <rect x={x0} y={y0} width={w} height={h} className="ha-tile" />
                      {vals.map((v, n) => {
                        const bh = (v / featMax) * (h - 8);
                        return <rect key={n} x={x0 + 3 + n * ((w - 6) / 32)} y={y0 + h - 4 - bh} width={((w - 6) / 32) * 0.8} height={Math.max(0.5, bh)} />;
                      })}
                    </g>
                  );
                })
              )}
            {step >= 3 && step <= 5 && (
              <path className="ha-grid" d={[1, 2, 3].map((n) => `M${n * CELL} 0V${S}M0 ${n * CELL}H${S}`).join("")} />
            )}
            {step === 4 && <rect className="ha-sel" x={cell[1] * CELL + 1} y={cell[0] * CELL + 1} width={CELL - 2} height={CELL - 2} />}
            {step === 5 && <rect className="ha-sel" x={block[1] * CELL + 1} y={block[0] * CELL + 1} width={CELL * 2 - 2} height={CELL * 2 - 2} />}
          </svg>
        </div>

        <div className="ha-side">
          <p className="ha-stage al-mono">
            {st.name} · {st.cycles} cycles
          </p>
          <h3>{info.title}</h3>
          <p className="ha-text">{info.text}</p>
          {step === 4 && (
            <div className="ha-detail">
              <p className="al-mono">
                cell ({cell[0]}, {cell[1]}) · 8 bins
              </p>
              <Bars values={img.cells[cell[0]][cell[1]]} labels={DEG} />
            </div>
          )}
          {step === 5 && (
            <div className="ha-detail">
              <p className="al-mono">
                block {blockIndex + 1} of 9 · 32 normalised values
              </p>
              <Bars values={blockFeats} max={featMax} />
            </div>
          )}
        </div>
      </div>

      <div className="pt-controls">
        <button type="button" onClick={() => setStep((n) => Math.max(0, n - 1))} disabled={step === 0} aria-label="Previous stage">
          ←
        </button>
        <button type="button" onClick={() => setStep((n) => Math.min(STEPS.length - 1, n + 1))} disabled={step === STEPS.length - 1} aria-label="Next stage">
          →
        </button>
      </div>
      <figcaption className="cs-figcaption">
        <span>
          Images from the 10,000-image CIFAR-10 benchmark set, computed with the course reference algorithm. Orientation uses its arctangent; the kernel&rsquo;s threshold compares can put a gradient right on a bin boundary into the neighbouring bin.
        </span>
        <span className="al-mono">Real data</span>
      </figcaption>
    </figure>
  );
}
