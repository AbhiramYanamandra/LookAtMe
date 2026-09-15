"use client";

import { useLayoutEffect, useRef } from "react";

/**
 * Renders text as words so a heading can reveal one line at a time.
 * Words are grouped into lines by their rendered position (re-measured on
 * resize) and given a `--line` index that the reveal CSS turns into a delay.
 * Without JavaScript the words simply render inline.
 */
export function LineReveal({ text, as: Tag = "span", ...props }) {
  const ref = useRef(null);
  const words = text.split(" ");

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => {
      let line = -1;
      let lastTop = null;
      el.querySelectorAll(".lr-word").forEach((word) => {
        const top = word.offsetTop;
        if (top !== lastTop) {
          line += 1;
          lastTop = top;
        }
        word.style.setProperty("--line", String(line));
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text]);

  return (
    <Tag ref={ref} {...props}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`}>
          <span className="lr-word">{word}</span>
          {index < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
