"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { DURATION, STATIC_AT, TARGETS, frameAt } from "@/lib/presto-script";

/**
 * A scripted, looping walkthrough of Presto: log in, create a presentation,
 * add a slide. It is an animated stand-in drawn in HTML and CSS, not the real
 * app, and it says so. The timeline lives in src/lib/presto-script.js; this
 * only draws it. Under reduced motion it holds a finished frame.
 */
const at = ([x, y]) => ({ left: `${x}%`, top: `${y}%` });

function Field({ id, label, value, frame, mask }) {
  return (
    <label className="pw-field" data-focus={frame.focus === id ? "" : undefined} style={at(TARGETS[id])}>
      <span>{label}</span>
      <div>
        {value}
        {frame.focus === id && <i className="pw-caret" />}
      </div>
    </label>
  );
}

function Button({ id, children, frame, variant = "solid", ...rest }) {
  return (
    <span className="pw-btn" data-variant={variant} data-down={frame.down === id ? "" : undefined} style={at(TARGETS[id] ?? rest.pos)}>
      {children}
    </span>
  );
}

function Screen({ frame }) {
  const { scene, typed } = frame;

  if (scene === "landing") {
    return (
      <div className="pw-scene">
        <h4 className="pw-hero">Presto</h4>
        <p className="pw-sub">A better way to build presentations.</p>
        <Button id="loginLanding" frame={frame}>Login</Button>
        <Button pos={[56.5, 58]} frame={frame} variant="ghost">Register</Button>
      </div>
    );
  }

  if (scene === "login") {
    return (
      <div className="pw-scene">
        <div className="pw-card">
          <h4>Login</h4>
        </div>
        <Field id="email" label="Email" value={typed.email} frame={frame} />
        <Field id="password" label="Password" value={typed.password} frame={frame} />
        <Button id="loginSubmit" frame={frame}>Login</Button>
      </div>
    );
  }

  if (scene === "dashboard") {
    return (
      <div className="pw-scene">
        <header className="pw-bar">
          <b>Presto</b>
          <span>Logout</span>
        </header>
        <h4 className="pw-dash">Dashboard</h4>
        <Button id="newPresentation" frame={frame}>New Presentation</Button>
        {frame.cards === 0 && <p className="pw-empty">No presentations yet.</p>}
        {frame.cards > 0 && (
          <button type="button" tabIndex={-1} className="pw-deck" style={at(TARGETS.card)} data-down={frame.down === "card" ? "" : undefined}>
            <span className="pw-deck-cover">1</span>
            <b>Hello from Abhiram</b>
            <small>1 slide</small>
          </button>
        )}
        {frame.modal && (
          <>
            <div className="pw-scrim" />
            <div className="pw-modal">
              <h5>New presentation</h5>
            </div>
            <Field id="modalName" label="Name" value={typed.name} frame={frame} />
            <Button id="modalCreate" frame={frame}>Create</Button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="pw-scene pw-editor">
      <header className="pw-bar">
        <span>← Dashboard</span>
        <b>Hello from Abhiram</b>
        <span>Preview</span>
      </header>
      {[
        ["+ Text", [23, 17]],
        ["+ Slide", TARGETS.addSlide],
        ["Background", [58, 17]],
        ["History", [75, 17]],
      ].map(([label, pos]) => (
        <span key={label} className="pw-tool" data-down={label === "+ Slide" && frame.down === "addSlide" ? "" : undefined} style={at(pos)}>
          {label}
        </span>
      ))}
      <aside className="pw-thumbs" aria-hidden="true">
        {Array.from({ length: frame.slides }, (_, i) => (
          <div key={i} className="pw-thumb" data-active={i === frame.slides - 1 ? "" : undefined}>
            <small>{i + 1}</small>
            <i>{i === 0 ? typed.title : typed.body ? "…" : ""}</i>
          </div>
        ))}
      </aside>
      <div className="pw-canvas">
        {frame.slides === 1 ? (
          <div className="pw-box" data-focus={frame.focus === "title" ? "" : undefined} style={{ left: "50%", top: "47%" }}>
            <h5>{typed.title}</h5>
            {frame.focus === "title" && <i className="pw-caret" />}
          </div>
        ) : (
          <div className="pw-box pw-box-body" data-focus={frame.focus === "body" ? "" : undefined} style={{ left: "50%", top: "62%" }}>
            <p>{typed.body}</p>
            {frame.focus === "body" && <i className="pw-caret" />}
          </div>
        )}
        {frame.slides === 2 && <h5 className="pw-slide-title">Hello, Presto</h5>}
      </div>
    </div>
  );
}

export function PrestoWalkthrough({ url }) {
  const [frame, setFrame] = useState(() => frameAt(0));
  const [animate, setAnimate] = useState(false);
  const root = useRef(null);
  const cursor = useRef(null);
  const signature = useRef("");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setAnimate(!reduced.matches);
    sync();
    reduced.addEventListener("change", sync);
    return () => reduced.removeEventListener("change", sync);
  }, []);

  // Reduced motion: hold a finished frame.
  useEffect(() => {
    if (!animate) setFrame(frameAt(STATIC_AT));
  }, [animate]);

  // Play while on screen: the cursor moves by direct DOM writes, everything
  // else only re-renders when the visible state actually changes.
  useEffect(() => {
    const el = root.current;
    if (!animate || !el) return undefined;
    let raf = 0;
    let visible = false;
    let origin = 0;
    const tick = (now) => {
      if (!visible) return;
      if (!origin) origin = now;
      const next = frameAt((now - origin) % DURATION);
      if (cursor.current) {
        cursor.current.style.left = `${next.cursor.x}%`;
        cursor.current.style.top = `${next.cursor.y}%`;
        cursor.current.style.opacity = String(next.fade);
        if (next.down) cursor.current.dataset.down = "";
        else delete cursor.current.dataset.down;
      }
      el.style.setProperty("--pw-fade", String(next.fade));
      const key = JSON.stringify([next.scene, next.modal, next.cards, next.slides, next.focus, next.down, next.typed]);
      if (key !== signature.current) {
        signature.current = key;
        setFrame(next);
      }
      raf = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) {
        origin = 0;
        raf = requestAnimationFrame(tick);
      }
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [animate]);

  return (
    <div ref={root} className="al-embed pw" role="img" aria-label="Animated walkthrough of Presto: logging in, creating a presentation called Hello from Abhiram, and adding a second slide">
      <div className="al-embed-bar">
        <span className="al-embed-dots" aria-hidden="true">
          <b />
          <b />
          <b />
        </span>
        <span className="al-embed-url">presto · walkthrough</span>
        <a href={url} target="_blank" rel="noopener noreferrer" aria-label="Open the Presto site in a new tab">
          site <ArrowUpRight aria-hidden="true" />
        </a>
      </div>
      <div className="pw-window">
        <div className="pw-stage" aria-hidden="true">
          <Screen frame={frame} />
          {animate && <span ref={cursor} className="pw-cursor" />}
        </div>
        <p className="pw-note">Animated walkthrough, not the live app</p>
      </div>
    </div>
  );
}
