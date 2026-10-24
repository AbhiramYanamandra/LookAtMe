"use client";

import { useEffect, useRef, useState } from "react";

/**
 * <Clip src poster width height caption /> — a short, silent video shown like
 * a <Figure>. It plays on a loop only while on screen. With reduced motion it
 * never autoplays; the controls are there to play it on request.
 */
export function Clip({ src, poster, width, height, caption, alt }) {
  const video = useRef(null);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const element = video.current;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStill(true);
      return undefined;
    }
    const watch = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) element.play().catch(() => setStill(true));
      else element.pause();
    }, { threshold: 0.4 });
    watch.observe(element);
    return () => watch.disconnect();
  }, []);

  return (
    <figure className="cs-figure cs-clip" data-reveal>
      <div className="cs-figure-frame">
        <video
          ref={video}
          src={src}
          poster={poster}
          width={width}
          height={height}
          aria-label={alt}
          muted
          loop
          playsInline
          preload="metadata"
          controls={still}
        />
      </div>
      <figcaption className="cs-figcaption">
        <span>{caption}</span>
        <span className="al-mono">Video</span>
      </figcaption>
    </figure>
  );
}
