"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ALL_FIELDS, libraryHref } from "@/lib/project-queries";

/**
 * Field filter chips. Server-rendered links (they work without JavaScript);
 * with JavaScript the pressed chip fills immediately while the new results
 * load, and scroll position is kept.
 */
export function FilterChips({ fields, total, field, sort }) {
  const [pending, setPending] = useState(null);
  useEffect(() => setPending(null), [field, sort]);

  const chip = (id, label, count) => {
    const active = pending ? pending === id : field === id;
    return (
      <Link
        key={id}
        href={id === ALL_FIELDS ? libraryHref({ sort }) : libraryHref({ field: id, sort })}
        scroll={false}
        aria-current={active ? "true" : undefined}
        className={pending === id && field !== id ? "is-pending" : undefined}
        onClick={() => setPending(id)}
      >
        {label} <span className="pl-count">{count}</span>
      </Link>
    );
  };

  return (
    <nav className="pl-filters" aria-label="Filter by engineering field">
      {chip(ALL_FIELDS, "All", total)}
      {fields.map((item) => chip(item.id, item.label, item.count))}
    </nav>
  );
}
