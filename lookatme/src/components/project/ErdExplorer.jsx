"use client";

import { useState } from "react";
import { ENTITIES, RELATIONSHIPS, RULES } from "@/lib/petspot";

const ROW = 26;

/** Associative (enquiry) entities show only their own attributes, as on the report's ERD. */
const shown = (e) => (e.assoc ? e.attrs.filter((a) => !a[1]) : e.attrs);
const label = ([name, key]) => name + (key?.includes("fk") ? " (FK)" : "");
/** Wide enough for the longest line: 13px mono attributes (bold for keys) and the 13px title. */
const rect = (id) => {
  const e = ENTITIES[id];
  const attrs = shown(e);
  const w = Math.ceil(Math.max(e.w, ...attrs.map((a) => label(a).length * 8.4 + 22), e.name.length * 7.4 + 18));
  return { x: e.x, y: e.y, w, h: ROW * (attrs.length + 1) };
};
const VIEW_W = Math.max(...Object.keys(ENTITIES).map((id) => rect(id).x + rect(id).w)) + 8;

/** Route a relationship: side-to-side when the boxes share rows, top-to-bottom when they share columns, else an L. */
function route(a, b) {
  const A = rect(a);
  const B = rect(b);
  const yLo = Math.max(A.y, B.y);
  const yHi = Math.min(A.y + A.h, B.y + B.h);
  const xLo = Math.max(A.x, B.x);
  const xHi = Math.min(A.x + A.w, B.x + B.w);
  if (yHi > yLo) {
    const y = (yLo + yHi) / 2;
    const [ax, bx] = A.x < B.x ? [A.x + A.w, B.x] : [A.x, B.x + B.w];
    return { d: `M${ax} ${y}H${bx}`, end: { x: bx, y }, dir: { x: Math.sign(bx - ax), y: 0 } };
  }
  if (xHi > xLo) {
    const x = (xLo + xHi) / 2;
    const [ay, by] = A.y < B.y ? [A.y + A.h, B.y] : [A.y, B.y + B.h];
    return { d: `M${x} ${ay}V${by}`, end: { x, y: by }, dir: { x: 0, y: Math.sign(by - ay) } };
  }
  // L-shape: up/down out of A, then across into B's side.
  const ax = A.x + A.w * 0.75;
  const y = B.y + B.h * 0.65;
  const bx = A.x < B.x ? B.x : B.x + B.w;
  return { d: `M${ax} ${A.y < B.y ? A.y + A.h : A.y}V${y}H${bx}`, end: { x: bx, y }, dir: { x: Math.sign(bx - ax), y: 0 } };
}

function foot({ end, dir }) {
  const { x, y } = end;
  const bx = x - dir.x * 14;
  const by = y - dir.y * 14;
  const px = -dir.y * 8;
  const py = dir.x * 8;
  return `M${bx} ${by}L${x + px} ${y + py}M${bx} ${by}L${x} ${y}M${bx} ${by}L${x - px} ${y - py}`;
}

/**
 * The team's revised ERD. Select an entity to see its relation, keys,
 * functional dependency and the business rules it implements.
 */
export function ErdExplorer() {
  const [sel, setSel] = useState("pet");
  const e = ENTITIES[sel];
  const linked = new Set(RELATIONSHIPS.filter(([a, b]) => a === sel || b === sel).flatMap(([a, b]) => [a, b]));

  return (
    <figure className="cs-figure ee" data-reveal>
      <div className="hx-scroll ee-scroll">
        <svg viewBox={`-4 -4 ${VIEW_W} 572`} className="hx-svg ee-svg" role="img" aria-label="PETspot entity-relationship diagram">
          {RELATIONSHIPS.map(([a, b, identifying]) => {
            const r = route(a, b);
            const on = a === sel || b === sel;
            return (
              <g key={`${a}-${b}`} className={`ee-rel${identifying ? " ee-id" : ""}${on ? " ee-on" : ""}`}>
                <path d={r.d} />
                <path d={foot(r)} />
              </g>
            );
          })}
          <path className={`ee-rel-self${sel === "pet" ? " ee-on" : ""}`} d="M850 68V50H950V68" />
          {Object.entries(ENTITIES).map(([id, ent]) => {
            const R = rect(id);
            const attrs = shown(ent);
            const cls = id === sel ? "ee-ent ee-sel" : linked.has(id) ? "ee-ent ee-near" : "ee-ent";
            return (
              <g key={id} className={cls} onClick={() => setSel(id)} role="button" tabIndex={0} aria-pressed={id === sel} aria-label={ent.name} onKeyDown={(ev) => (ev.key === "Enter" || ev.key === " ") && (ev.preventDefault(), setSel(id))}>
                <rect x={R.x} y={R.y} width={R.w} height={R.h} rx={ent.assoc ? 16 : 3} />
                <line x1={R.x} x2={R.x + R.w} y1={R.y + ROW} y2={R.y + ROW} />
                <text className="ee-title" x={R.x + R.w / 2} y={R.y + 17} textAnchor="middle">
                  {ent.name}
                </text>
                {attrs.map(([name, key], k) => (
                  <text key={name} className={key?.includes("pk") ? "ee-attr ee-pk" : "ee-attr"} x={R.x + 10} y={R.y + ROW * (k + 1) + 17}>
                    {label([name, key])}
                  </text>
                ))}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="ee-panel" aria-live="polite">
        <p className="al-mono ee-kicker">{e.assoc ? "Associative entity" : "Entity"}</p>
        <h3>{e.name}</h3>
        <code className="ee-rel-text">{e.relation}</code>
        <dl>
          <div>
            <dt>Key</dt>
            <dd>
              {e.attrs
                .filter((a) => a[1]?.includes("pk"))
                .map((a) => a[0])
                .join(" + ")}
            </dd>
          </div>
          <div>
            <dt>Functional dependency</dt>
            <dd className="ee-fd">{e.fds[0]}</dd>
          </div>
        </dl>
        <ul>
          {e.rules.map((n) => (
            <li key={n}>
              <b>BR{n}</b> {RULES[n]}
            </li>
          ))}
        </ul>
      </div>
      <figcaption className="cs-figcaption">
        <span>The revised ERD from Part C of the report, redrawn. Underlined attributes are primary keys; a crow&rsquo;s foot marks the &ldquo;many&rdquo; side; thick lines are identifying relationships, so a pet or service is keyed by its seller.</span>
        <span className="al-mono">From the report</span>
      </figcaption>
    </figure>
  );
}
