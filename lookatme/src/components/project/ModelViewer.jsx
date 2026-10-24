"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A draggable 3D model. `@google/model-viewer` is a web component and a large
 * dependency, so it is imported only when this mounts; until then (and when
 * WebGL is unavailable) the poster image stands in.
 *
 * Wheel zoom is off, touch-action is `pan-y`, and wheel/touch gestures only
 * reach the model once it is focused (`interaction-policy`), so dragging
 * rotates it while scrolling the page still works over it.
 *
 * If the model has a material named "Enclosure", a control switches the case
 * between solid, clear (the default, so the board shows through) and off.
 */
const CASE_MODES = [
  { id: "solid", label: "Case" },
  { id: "clear", label: "Clear" },
  { id: "off", label: "Board" },
];

export function ModelViewer({ src, poster, alt, hotspots = [] }) {
  const [ready, setReady] = useState(false);
  const viewer = useRef(null);
  const [enclosure, setEnclosure] = useState(null);
  const [caseMode, setCaseMode] = useState("clear");

  useEffect(() => {
    let live = true;
    import("@google/model-viewer")
      .then(() => live && setReady(true))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    const element = viewer.current;
    if (!element) return undefined;
    const onLoad = () => setEnclosure(element.model?.materials.find((material) => material.name === "Enclosure") ?? null);
    element.addEventListener("load", onLoad);
    return () => element.removeEventListener("load", onLoad);
  }, [ready]);

  useEffect(() => {
    if (!enclosure) return;
    const [r, g, b] = enclosure.pbrMetallicRoughness.baseColorFactor;
    // MASK with alpha 0 discards every fragment, so "off" hides the case and its shadow.
    enclosure.setAlphaMode(caseMode === "solid" ? "OPAQUE" : caseMode === "clear" ? "BLEND" : "MASK");
    enclosure.pbrMetallicRoughness.setBaseColorFactor([r, g, b, caseMode === "solid" ? 1 : caseMode === "clear" ? 0.3 : 0]);
  }, [enclosure, caseMode]);

  if (!ready) {
    return (
      <div className="al-model al-model-poster">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={poster} alt={alt} />
      </div>
    );
  }

  return (
    <div className="al-model">
      <model-viewer
        ref={viewer}
        src={src}
        poster={poster}
        alt={alt}
        camera-controls=""
        disable-zoom=""
        disable-pan=""
        auto-rotate=""
        auto-rotate-delay="1500"
        rotation-per-second="14deg"
        interaction-prompt="none"
        touch-action="pan-y"
        interaction-policy="allow-when-focused"
        shadow-intensity="1.1"
        shadow-softness="1"
        exposure="1"
        environment-image="neutral"
        camera-orbit="32deg 58deg auto"
        min-camera-orbit="auto 10deg auto"
        max-camera-orbit="auto 172deg auto"
        field-of-view="28deg"
      >
        {hotspots.map((hotspot, index) => (
          <button
            key={hotspot.label}
            type="button"
            className="al-hotspot"
            slot={`hotspot-${index}`}
            data-position={hotspot.position}
            data-normal={hotspot.normal ?? "0m 1m 0m"}
            data-visibility-attribute="visible"
            tabIndex={-1}
          >
            <span>{hotspot.label}</span>
          </button>
        ))}
      </model-viewer>
      {enclosure && (
        <div className="al-model-case" role="group" aria-label="Enclosure">
          {CASE_MODES.map((mode) => (
            <button key={mode.id} type="button" aria-pressed={caseMode === mode.id} onClick={() => setCaseMode(mode.id)}>
              {mode.label}
            </button>
          ))}
        </div>
      )}
      <p className="al-model-hint" aria-hidden="true">
        drag to rotate · flip it over
      </p>
    </div>
  );
}
