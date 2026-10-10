"use client";

import { useRouter } from "next/navigation";
import { SORT_OPTIONS, libraryHref } from "@/lib/project-queries";
import { formatRange } from "@/lib/spectrum";

/**
 * Sort selector. It is a plain GET form so it works without JavaScript
 * (the Apply button submits); with JavaScript the change navigates at once
 * and the button is hidden.
 */
export function SortControl({ field, sort, view, range, options = SORT_OPTIONS }) {
  const router = useRouter();

  return (
    <form method="get" action="/projects" className="pl-sort">
      {field !== "all" && <input type="hidden" name="field" value={field} />}
      {view === "list" && <input type="hidden" name="view" value="list" />}
      {formatRange(range) && <input type="hidden" name="range" value={formatRange(range)} />}
      <label htmlFor="library-sort">Sort by</label>
      <select
        id="library-sort"
        name="sort"
        defaultValue={sort}
        onChange={(event) => router.push(libraryHref({ field, sort: event.target.value, view, range }), { scroll: false })}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      <noscript>
        <button type="submit">Apply</button>
      </noscript>
    </form>
  );
}
