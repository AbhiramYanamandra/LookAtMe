"use client";

import { useState } from "react";
import { COUNTS, CREATE_SQL, QUERIES } from "@/lib/petspot-sql";

const TABS = [{ id: "schema", kind: "CREATE" }, ...QUERIES];

/**
 * Part D: the team's PostgreSQL tables and queries, with the results the
 * script returns when it's run as submitted.
 */
export function SqlRunner() {
  const [tab, setTab] = useState("3.a");
  const q = QUERIES.find((x) => x.id === tab);

  return (
    <figure className="cs-figure sq" data-reveal>
      <div className="sq-tabs" role="tablist" aria-label="Part D">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>
            <b>{t.id === "schema" ? "Tables" : t.id}</b>
            <span>{t.kind}</span>
          </button>
        ))}
      </div>
      {q ? (
        <div className="sq-body" role="tabpanel">
          <p className="sq-question">
            <span className="al-mono">Question {q.id}</span>
            {q.question}
          </p>
          <pre className="sq-code">
            <code>{q.sql}</code>
          </pre>
          <div className="sq-result">
            <table>
              <thead>
                <tr>
                  {q.cols.map((c) => (
                    <th key={c}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {q.rows.map((r, i) => (
                  <tr key={i}>
                    {r.map((v, k) => (
                      <td key={k} className={v === "NULL" ? "sq-null" : undefined}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="sq-meta al-mono">
            ({q.rows.length} row{q.rows.length === 1 ? "" : "s"}){q.note ? ` · ${q.note}` : ""}
          </p>
        </div>
      ) : (
        <div className="sq-body" role="tabpanel">
          <p className="sq-question">
            <span className="al-mono">Part D scope</span>
            The seller side of the model: {COUNTS.tables} tables, seeded with {COUNTS.sellers} sellers, {COUNTS.services} services and {COUNTS.enquiries} enquiries.
          </p>
          <pre className="sq-code sq-code-tall">
            <code>{CREATE_SQL}</code>
          </pre>
        </div>
      )}
      <figcaption className="cs-figcaption">
        <span>The team&rsquo;s PartD.SQL, run unchanged on PostgreSQL 17. Results are its actual output; empty costs are NULL.</span>
        <span className="al-mono">Ran it</span>
      </figcaption>
    </figure>
  );
}
