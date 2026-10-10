"use client";

import { useEffect, useRef, useState } from "react";
import { RESIDUAL, applyError, meanAbsoluteError, strengthFor, unitError } from "@/lib/noisy-multiply";

/**
 * The honours thesis, shown rather than described: a photo goes through a real
 * noisy matrix multiply (see src/lib/noisy-multiply.js), comes out grainy and
 * blocky, and then again with the thesis's correction. The slider is the
 * noise level; the readouts are measured from the pixels on screen.
 *
 * The noise model is simulated; the correction strength is the thesis's
 * measured 95.5% reduction in mean absolute error. `compact` shows only the
 * noisy/corrected pair at the thesis's comparison setting, for small cards.
 */
const SRC = "/images/thesis-test.jpg";
const W = 256;
const H = 192;
const DEFAULT_SIGMA = 22;
const CHANNELS = 3;

// The source is a night photo; lift the shadows so noise has something to show on.
const lift = (value) => Math.pow(value, 0.62);

function load() {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = SRC;
  });
}

export function ThesisFigure({ compact = false }) {
  const [sigma, setSigma] = useState(DEFAULT_SIGMA);
  const [ready, setReady] = useState(false);
  const [stats, setStats] = useState(null);
  const data = useRef(null);
  const canvases = useRef([]);
  const touched = useRef(false);
  const root = useRef(null);

  // Decode the photo and compute the unit error image per channel, once.
  useEffect(() => {
    let live = true;
    load()
      .then((image) => {
        if (!live) return;
        const scratch = document.createElement("canvas");
        scratch.width = W;
        scratch.height = H;
        const context = scratch.getContext("2d", { willReadFrequently: true });
        context.drawImage(image, 0, 0, W, H);
        const pixels = context.getImageData(0, 0, W, H).data;
        const clean = Array.from({ length: CHANNELS }, () => new Float32Array(W * H));
        for (let i = 0; i < W * H; i += 1) for (let c = 0; c < CHANNELS; c += 1) clean[c][i] = lift(pixels[i * 4 + c] / 255);
        const error = clean.map((channel, c) => unitError(channel, W, H, 101 + c));
        data.current = { clean, error, noisy: clean.map(() => new Float32Array(W * H)), fixed: clean.map(() => new Float32Array(W * H)) };
        setReady(true);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  // Repaint the three panels whenever the slider moves.
  useEffect(() => {
    const d = data.current;
    if (!ready || !d) return undefined;
    const raf = requestAnimationFrame(() => {
      const strength = strengthFor(sigma);
      const paint = (canvas, channels) => {
        if (!canvas) return;
        const context = canvas.getContext("2d");
        const image = context.createImageData(W, H);
        for (let i = 0; i < W * H; i += 1) {
          for (let c = 0; c < CHANNELS; c += 1) image.data[i * 4 + c] = Math.round(channels[c][i] * 255);
          image.data[i * 4 + 3] = 255;
        }
        context.putImageData(image, 0, 0);
      };
      let noisyError = 0;
      let fixedError = 0;
      for (let c = 0; c < CHANNELS; c += 1) {
        applyError(d.clean[c], d.error[c], strength, d.noisy[c]);
        applyError(d.clean[c], d.error[c], strength * RESIDUAL, d.fixed[c]);
        noisyError += meanAbsoluteError(d.noisy[c], d.clean[c]) / CHANNELS;
        fixedError += meanAbsoluteError(d.fixed[c], d.clean[c]) / CHANNELS;
      }
      paint(canvases.current[0], d.clean);
      paint(canvases.current[1], d.noisy);
      paint(canvases.current[2], d.fixed);
      setStats({ noisy: noisyError * 100, fixed: fixedError * 100 });
    });
    return () => cancelAnimationFrame(raf);
  }, [sigma, ready]);

  // Once, when it first scrolls into view, sweep the noise up so it is clearly alive.
  useEffect(() => {
    const el = root.current;
    if (!ready || !el || compact) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    let raf = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now) => {
        if (touched.current) return;
        const t = Math.min(1, (now - start) / 1600);
        setSigma(Math.round(DEFAULT_SIGMA * (1 - Math.pow(1 - t, 3))));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      setSigma(0);
      raf = requestAnimationFrame(tick);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [ready, compact]);

  const panel = (index, title, caption) => (
    <figure className="al-nm-panel">
      <canvas
        ref={(el) => {
          canvases.current[index] = el;
        }}
        width={W}
        height={H}
        role="img"
        aria-label={`${title}: ${caption}`}
      />
      <figcaption>
        <b>{title}</b>
        <span>{caption}</span>
      </figcaption>
    </figure>
  );

  return (
    <div ref={root} className="al-nm" data-compact={compact ? "" : undefined} data-ready={ready ? "" : undefined}>
      <div className="al-nm-row">
        {!compact && panel(0, "Input", "x")}
        {!compact && <span className="al-nm-arrow" aria-hidden="true">→</span>}
        {panel(1, "Noisy multiplier", "Wx + noise")}
        <span className="al-nm-arrow" aria-hidden="true">→</span>
        {panel(2, "Corrected", "95.5% less error")}
      </div>

      {!compact && (
        <>
          <label className="al-nm-slider">
            <span>noise σ = {sigma}</span>
            <input
              type="range"
              min="0"
              max="30"
              value={sigma}
              onChange={(event) => {
                touched.current = true;
                setSigma(Number(event.target.value));
              }}
              aria-label="Noise level"
            />
          </label>
          <p className="al-nm-readout" aria-live="polite">
            mean error <b>{stats ? stats.noisy.toFixed(2) : "–"}%</b> noisy
            <i>→</i>
            <b>{stats ? stats.fixed.toFixed(2) : "–"}%</b> corrected
          </p>
          <div className="al-nm-bars" role="img" aria-label="Noise tolerated before a one point ImageNet accuracy drop: baseline 1 times, corrected 11.24 times">
            <p>Noise tolerated before a 1-point ImageNet accuracy drop</p>
            <div>
              <span>baseline</span>
              <i style={{ width: `${100 / 11.24}%` }} />
              <b>1×</b>
            </div>
            <div data-win="">
              <span>corrected</span>
              <i style={{ width: "100%" }} />
              <b>11.24×</b>
            </div>
            <small>AlexNet and ResNet18 average; VGG19 never reached the threshold. Noise model simulated; correction strength measured in the thesis.</small>
          </div>
        </>
      )}
    </div>
  );
}
