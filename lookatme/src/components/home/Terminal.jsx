"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PROMPT, complete, runCommand } from "@/lib/terminal-commands";

const CHIPS = ["neofetch", "projects", "interests", "cycling", "open wya", "clap"];

/**
 * A pretend shell: type a command (or tap a suggestion) and read the answer.
 * Commands live in src/lib/terminal-commands.js and only ever return text.
 * It never takes focus by itself, so it cannot pull the page's scroll.
 */
export function Terminal({ ctx, greeting }) {
  const router = useRouter();
  const [entries, setEntries] = useState(() => [
    { id: 0, command: "neofetch", lines: runCommand("neofetch", ctx).lines },
    { id: 1, lines: greeting.map((text) => ({ t: "text", text })) },
  ]);
  const [value, setValue] = useState("");
  const [clapping, setClapping] = useState(false);
  const history = useRef([]);
  const cursor = useRef(-1);
  const nextId = useRef(2);
  const screen = useRef(null);
  const input = useRef(null);

  // Keep the newest output in view inside the window (not the page).
  useEffect(() => {
    const el = screen.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  const submit = (line) => {
    const command = line.trim();
    if (command) history.current.push(command);
    cursor.current = -1;
    const result = runCommand(command, ctx);
    if (result.action?.type === "clear") {
      setEntries([]);
    } else {
      setEntries((previous) => [...previous, { id: nextId.current++, command: line, lines: result.lines }]);
    }
    if (result.action?.type === "clap") {
      setClapping(true);
      window.setTimeout(() => setClapping(false), 1400);
    }
    if (result.action?.type === "navigate") {
      window.setTimeout(() => router.push(result.action.href), 450);
    }
    setValue("");
  };

  const onKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submit(value);
    } else if (event.key === "Tab") {
      event.preventDefault();
      setValue(complete(value, ctx));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const past = history.current;
      if (past.length === 0) return;
      cursor.current = cursor.current === -1 ? past.length - 1 : Math.max(0, cursor.current - 1);
      setValue(past[cursor.current]);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      const past = history.current;
      if (cursor.current === -1) return;
      cursor.current += 1;
      if (cursor.current >= past.length) {
        cursor.current = -1;
        setValue("");
      } else {
        setValue(past[cursor.current]);
      }
    } else if (event.key === "l" && event.ctrlKey) {
      event.preventDefault();
      setEntries([]);
    }
  };

  return (
    <div className="al-term" data-clap={clapping ? "" : undefined}>
      <div className="al-term-bar">
        <span className="al-term-dots" aria-hidden="true">
          <b />
          <b />
          <b />
        </span>
        <span className="al-term-title">abhiram@lookatme: ~</span>
        <span className="al-term-led" aria-hidden="true" title="status LED" />
      </div>
      <div
        ref={screen}
        className="al-term-screen"
        role="log"
        aria-live="polite"
        aria-label="Terminal output"
        onClick={() => input.current?.focus({ preventScroll: true })}
      >
        {entries.map((entry) => (
          <div key={entry.id} className="al-term-entry">
            {entry.command !== undefined && (
              <p className="al-term-cmd">
                <span>{PROMPT}</span> {entry.command}
              </p>
            )}
            {entry.lines.map((line, index) =>
              line.t === "gap" ? (
                <p key={index} className="al-term-gap" />
              ) : line.t === "art" ? (
                <pre key={index} className="al-term-art" aria-hidden="true">
                  {line.text}
                </pre>
              ) : line.t === "card" ? (
                <div key={index} className="al-term-card">
                  <pre className="al-term-art" aria-hidden="true">
                    {line.art}
                  </pre>
                  <dl>
                    <dt className="al-term-head">{line.title}</dt>
                    <dd className="al-term-rule" aria-hidden="true" />
                    {line.rows.map(([key, value]) => (
                      <div key={key}>
                        <dt>{key}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : line.t === "link" ? (
                <p key={index} className="al-term-line">
                  {line.href.startsWith("/") ? (
                    <Link href={line.href}>{line.text}</Link>
                  ) : (
                    <a href={line.href} target={line.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                      {line.text}
                    </a>
                  )}
                </p>
              ) : (
                <p key={index} className={`al-term-line al-term-${line.t}`}>
                  {line.text}
                </p>
              ),
            )}
          </div>
        ))}
        <label className="al-term-prompt">
          <span>{PROMPT}</span>
          <input
            ref={input}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            aria-label="Type a command"
            placeholder="type help"
          />
        </label>
      </div>
      <div className="al-term-chips" role="group" aria-label="Suggested commands">
        <span className="al-mono">try</span>
        {CHIPS.map((chip) => (
          <button key={chip} type="button" onClick={() => submit(chip)}>
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}
