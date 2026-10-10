"use client";

import { useState } from "react";
import { Check, Minus } from "lucide-react";
import { CAPABILITIES, EVENT_THEMES, RLS_CHECKS, VIEWERS, stripeCut } from "@/lib/wya";

/** Viewer × capability, as wya's access-control suite proves it. */
export function AccessMatrix() {
  return (
    <figure className="cs-figure" data-reveal>
      <div className="wm hx-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">
                <span className="al-visually-hidden">Capability</span>
              </th>
              {VIEWERS.map((v) => (
                <th key={v.id} scope="col">
                  <b>{v.role}</b>
                  <span>{v.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CAPABILITIES.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {VIEWERS.map((v) => {
                  const value = row.values[v.id];
                  return (
                    <td key={v.id} data-v={value === true ? "yes" : value === false ? "no" : "part"}>
                      {value === true ? <Check aria-label="Yes" /> : value === false ? <Minus aria-label="No" /> : value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption className="cs-figcaption">
        <span>Every cell is a check in rls_check.py, which signs in as each of these people against the dev database and tries the action. Re-runnable after every migration.</span>
        <span className="al-mono">{RLS_CHECKS} checks</span>
      </figcaption>
    </figure>
  );
}

/** Generated cover art in each of the six event themes, as EventCover draws it. */
export function EventThemeStrip() {
  return (
    <figure className="cs-figure" data-reveal>
      <div className="wt">
        {EVENT_THEMES.map((t, i) => (
          <div key={t.name} className="wt-item">
            <div className="wt-cover" style={{ background: t.base, color: t.ink }}>
              {i % 3 === 0 && (
                <>
                  <span className="wt-shape wt-circle" style={{ background: t.shape }} />
                  <span className="wt-shape wt-circle wt-circle-2" style={{ background: t.shape }} />
                </>
              )}
              {i % 3 === 1 && (
                <>
                  <span className="wt-shape wt-bar" style={{ background: t.shape, top: "20%" }} />
                  <span className="wt-shape wt-bar" style={{ background: t.shape, top: "55%" }} />
                </>
              )}
              {i % 3 === 2 && <span className="wt-shape wt-blob" style={{ background: t.shape }} />}
              <b>{["B", "G", "K", "P", "S", "R"][i]}</b>
            </div>
            <span className="al-mono">{t.name}</span>
          </div>
        ))}
      </div>
      <figcaption className="cs-figcaption">
        <span>An event without a photo gets generated art: the theme’s colours, one of three shape layouts picked by a hash of the event ID, and the title’s initial. No event ever looks empty.</span>
        <span className="al-mono">6 themes</span>
      </figcaption>
    </figure>
  );
}

const money = (n) => `$${n.toFixed(2)}`;

/** Phase 3 design note: how much of a host's no-show money Stripe keeps. */
export function DepositFees() {
  const [deposit, setDeposit] = useState(5);
  const [noShows, setNoShows] = useState(3);
  const cut = stripeCut(deposit, noShows);
  const parts = [
    ["Card fees", cut.card],
    ["Payout", cut.payout],
    ["Account (monthly)", cut.account],
  ];

  return (
    <figure className="cs-figure wf" data-reveal>
      <div className="wf-controls">
        <label>
          <span>
            Deposit <b>{money(deposit)}</b>
          </span>
          <input type="range" min="2" max="25" step="1" value={deposit} onChange={(e) => setDeposit(Number(e.target.value))} />
        </label>
        <label>
          <span>
            No-shows this month <b>{noShows}</b>
          </span>
          <input type="range" min="1" max="12" step="1" value={noShows} onChange={(e) => setNoShows(Number(e.target.value))} />
        </label>
      </div>
      <div className="wf-bar" role="img" aria-label={`Of ${money(cut.collected)} collected, Stripe keeps ${money(cut.total)} and the host gets ${money(cut.host)}`}>
        <span className="wf-host" style={{ flexGrow: Math.max(cut.host, 0) }} />
        {parts.map(([label, v]) => (
          <span key={label} className="wf-fee" style={{ flexGrow: v }} title={`${label}: ${money(v)}`} />
        ))}
      </div>
      <dl className="wf-read">
        <div>
          <dt>Collected</dt>
          <dd>{money(cut.collected)}</dd>
        </div>
        <div>
          <dt>Host receives</dt>
          <dd>{money(cut.host)}</dd>
        </div>
        <div className="wf-hot">
          <dt>Stripe keeps</dt>
          <dd>
            {money(cut.total)} <small>({Math.round(cut.share * 100)}%)</small>
          </dd>
        </div>
      </dl>
      <p className="wf-parts al-mono">{parts.map(([label, v]) => `${label} ${money(v)}`).join(" · ")}</p>
      <figcaption className="cs-figcaption">
        <span>Design note for the unbuilt deposits phase, using Stripe’s published fees: 2.9% + 30¢ per charge, 0.25% + 25¢ per payout and $2 per host account paid out that month. Small deposits and few no-shows are where it hurts.</span>
        <span className="al-mono">Phase 3 · planned</span>
      </figcaption>
    </figure>
  );
}
