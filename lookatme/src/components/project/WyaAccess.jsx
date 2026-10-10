"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, Lock, MapPin, MessageCircle, Pencil, Share2, X } from "lucide-react";
import { EVENT, GUESTS, RLS_CHECKS, SHOWCASE_VIEWERS } from "@/lib/wya";

/**
 * One wya event, shown to four different people. Pick a person: the phone
 * shows the event page as they get it, and the list beside it says plainly
 * what they can and can't see. Drawn in wya's After dark theme as an
 * illustration of the app; the rules are its real access rules. Cycles on its
 * own until touched, and Jo's "I'm in" works.
 */
const CYCLE_MS = 4500;
const STATUS = { yes: "Going", maybe: "Maybe", invited: "No answer", no: "Can’t go" };
const JO_AFTER = {
  yes: "Jo said yes. The chat opens, and Jo now shows up for everyone else as going.",
  maybe: "A maybe counts as coming for the chat, and Jo shows up as a maybe.",
  no: "Jo can’t go. The event stays visible, but the chat stays shut and other guests don’t see Jo.",
};
const JO_CHAT = {
  yes: [true, "Open now that Jo said yes"],
  maybe: [true, "A maybe opens it too"],
  no: [false, "Jo can’t go, so it stays shut"],
};

function Avatar({ name, color, size = 22 }) {
  return (
    <span className="wa-av" style={{ background: color, width: size, height: size, fontSize: size * 0.45 }}>
      {name[0]}
    </span>
  );
}

function Cover({ actions }) {
  const t = EVENT.theme;
  return (
    <div className="wa-cover" style={{ background: t.base, color: t.ink }}>
      <span className="wa-cover-shape" style={{ background: t.shape }} />
      <span className="wa-cover-shape wa-cover-shape-2" style={{ background: t.shape }} />
      <b>{EVENT.title[0]}</b>
      <span className="wa-sticker">{EVENT.when}</span>
      {actions}
    </div>
  );
}

function EventScreen({ viewer, joStatus, onAnswer }) {
  const isHost = viewer === "host";
  const mine = viewer === "going" ? "yes" : viewer === "invited" ? joStatus : null;
  const guests = GUESTS.map((g) => (g.name === "Jo" ? { ...g, status: joStatus } : g));
  const visible = isHost ? guests : guests.filter((g) => g.status === "yes" || g.status === "maybe");
  const canChat = isHost || mine === "yes" || mine === "maybe";

  return (
    <div className="wa-screen">
      <Cover
        actions={
          <span className="wa-round-row">
            {isHost && (
              <span className="wa-round">
                <Pencil aria-hidden="true" />
              </span>
            )}
            <span className="wa-round">
              <Share2 aria-hidden="true" />
            </span>
          </span>
        }
      />
      <div className="wa-pad">
        <p className="wa-kicker">{isHost ? "You’re hosting" : `${EVENT.host} is hosting`}</p>
        <h4 className="wa-title">{EVENT.title}</h4>
        <p className="wa-place">
          <MapPin aria-hidden="true" />
          <span>
            {EVENT.venue} · {EVENT.address}
          </span>
        </p>

        {mine && (
          <div className="wa-card">
            <p className="wa-h">{mine === "invited" ? "Are you coming?" : "Your RSVP"}</p>
            <div className="wa-choices">
              {[
                ["yes", "I’m in"],
                ["maybe", "Maybe"],
                ["no", "Can’t go"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className="wa-choice"
                  data-value={value}
                  data-nudge={viewer === "invited" && mine === "invited" && value === "yes" ? "" : undefined}
                  aria-pressed={mine === value}
                  disabled={viewer !== "invited"}
                  onClick={() => onAnswer(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="wa-label">{isHost ? "Guests" : "Who’s going"}</p>
        <ul className="wa-guests">
          {visible.map((g) => (
            <li key={g.name}>
              <Avatar name={g.name} color={g.color} />
              <span className="wa-guest-name">{g.name}</span>
              <span className="wa-chip" data-status={g.status}>
                {STATUS[g.status]}
              </span>
              {isHost && g.note && <span className="wa-note">“{g.note}”</span>}
            </li>
          ))}
        </ul>

        <p className="wa-label">Chat</p>
        {canChat ? (
          <div className="wa-chat">
            <p className="wa-bubble">
              <b>Hannah</b> Who’s bringing dessert?
            </p>
            <p className="wa-bubble wa-bubble-me">
              <b>Gary</b> On it 🍰
            </p>
          </div>
        ) : (
          <div className="wa-locked">
            <MessageCircle aria-hidden="true" />
            <span>Chat is for people who are coming</span>
          </div>
        )}
      </div>
    </div>
  );
}

function PreviewScreen() {
  return (
    <div className="wa-screen">
      <Cover />
      <div className="wa-pad">
        <p className="wa-kicker">{EVENT.host} invited you to</p>
        <h4 className="wa-title">{EVENT.title}</h4>
        <p className="wa-place wa-hidden">
          <Lock aria-hidden="true" />
          <span>Address shown after you join</span>
        </p>
        <span className="wa-btn">Create account</span>
        <span className="wa-btn wa-btn-ghost">I have an account</span>
      </div>
    </div>
  );
}

export function WyaAccess({ url }) {
  const [viewer, setViewer] = useState("host");
  const [joStatus, setJoStatus] = useState("invited");
  const [burst, setBurst] = useState(0);
  const touched = useRef(false);
  const root = useRef(null);
  const current = SHOWCASE_VIEWERS.find((v) => v.id === viewer);
  const sees =
    viewer === "invited" && JO_CHAT[joStatus]
      ? current.sees.map((row) => (row[0] === "The group chat" ? [row[0], ...JO_CHAT[joStatus]] : row))
      : current.sees;

  // Cycle through the people while on screen, until someone picks one.
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    let timer = 0;
    const observer = new IntersectionObserver(([entry]) => {
      clearInterval(timer);
      if (!entry.isIntersecting || touched.current) return;
      timer = setInterval(() => {
        if (touched.current) return clearInterval(timer);
        setViewer((v) => SHOWCASE_VIEWERS[(SHOWCASE_VIEWERS.findIndex((x) => x.id === v) + 1) % SHOWCASE_VIEWERS.length].id);
      }, CYCLE_MS);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      clearInterval(timer);
    };
  }, []);

  const pick = (id) => {
    touched.current = true;
    setViewer(id);
    if (id !== "invited") setJoStatus("invited");
  };
  const answer = (value) => {
    touched.current = true;
    setJoStatus(value);
    if (value === "yes") setBurst((n) => n + 1);
  };

  return (
    <div ref={root} className="al-embed wa">
      <div className="al-embed-bar">
        <span className="al-embed-dots" aria-hidden="true">
          <b />
          <b />
          <b />
        </span>
        <span className="al-embed-url">wya · four people</span>
        <a href={url} target="_blank" rel="noopener noreferrer" aria-label="Open the wya site in a new tab">
          site <ArrowUpRight aria-hidden="true" />
        </a>
      </div>
      <div className="wa-window">
        <p className="wa-headline">
          Same party. <span>Each person sees only what they should.</span>
        </p>
        <div className="wa-viewers" role="group" aria-label="See the event as">
          {SHOWCASE_VIEWERS.map((v) => (
            <button key={v.id} type="button" aria-pressed={viewer === v.id} onClick={() => pick(v.id)}>
              <Avatar name={v.name} color={v.color} size={26} />
              <span>
                <b>{v.name}</b>
                <small>{v.role}</small>
              </span>
            </button>
          ))}
        </div>
        <div className="wa-body">
          <div className="wa-phone">
            <div className="wa-notch" aria-hidden="true" />
            <div className="wa-scroll" key={viewer}>
              {viewer === "anon" ? <PreviewScreen /> : <EventScreen viewer={viewer} joStatus={joStatus} onAnswer={answer} />}
            </div>
            {burst > 0 && viewer === "invited" && joStatus === "yes" && (
              <span className="wa-confetti" key={burst} aria-hidden="true">
                {Array.from({ length: 14 }, (_, i) => (
                  <i key={i} style={{ "--i": i }} />
                ))}
              </span>
            )}
          </div>
          <div className="wa-rule" aria-live="polite">
            <p className="wa-rule-who">What {current.name === "A friend" ? "they" : current.name} can see</p>
            <ul className="wa-sees">
              {sees.map(([what, ok, detail]) => (
                <li key={what} data-ok={ok ? "" : undefined}>
                  {ok ? <Check aria-label="Yes" /> : <X aria-label="No" />}
                  <span>
                    {what}
                    {detail && <small>{detail}</small>}
                  </span>
                </li>
              ))}
            </ul>
            <p className="wa-blurb">{viewer === "invited" ? JO_AFTER[joStatus] ?? current.blurb : current.blurb}</p>
          </div>
        </div>
        <p className="wa-foot">
          <span>The database enforces this, not the app, and {RLS_CHECKS} automated checks prove it.</span>
          <span>Illustration of the app</span>
        </p>
      </div>
    </div>
  );
}
