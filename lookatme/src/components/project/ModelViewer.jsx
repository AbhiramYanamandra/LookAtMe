"use client";

import { useEffect, useState } from "react";

/**
 * A draggable 3D model. `@google/model-viewer` is a web component and a large
 * dependency, so it is imported only when this mounts; until then (and when
 * WebGL is unavailable) the poster image stands in.
 *
 * Wheel zoom is off, touch-action is `pan-y`, and wheel/touch gestures only
 * reach the model once it is focused (`interaction-policy`), so dragging
 * rotates it while scrolling the page still works over it.
 */
export function ModelViewer({ src, poster, alt, hotspots = [] }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let live = true;
    import("@google/model-viewer")
      .then(() => live && setReady(true))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

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
      <p className="al-model-hint" aria-hidden="true">
        drag to rotate · flip it over
      </p>
    </div>
  );
}
