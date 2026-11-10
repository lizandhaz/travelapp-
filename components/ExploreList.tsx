"use client";

import { useMemo, useState } from "react";
import { DestinationCard } from "./DestinationCard";
import type { Destination } from "@/lib/data";

export function ExploreList({ destinations }: { destinations: Destination[] }) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const tags = useMemo(() => [...new Set(destinations.flatMap((d) => d.tags))].sort(), [destinations]);

  const q = query.trim().toLowerCase();
  const shown = destinations.filter(
    (d) =>
      (!tag || d.tags.includes(tag)) &&
      (!q || d.name.toLowerCase().includes(q) || d.country.toLowerCase().includes(q)),
  );

  return (
    <div className="px-4">
      <label htmlFor="search" className="sr-only">
        Search destinations
      </label>
      <input
        id="search"
        type="search"
        placeholder="Search a place or country"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-full border border-sand bg-card px-4 py-3 text-base placeholder:text-ink-soft/70"
      />
      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {[null, ...tags].map((t) => (
          <button
            key={t ?? "all"}
            onClick={() => setTag(t)}
            aria-pressed={tag === t}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium capitalize ${
              tag === t ? "border-ink bg-ink text-card" : "border-sand bg-card text-ink-soft"
            }`}
          >
            {t ?? "All"}
          </button>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {shown.map((d) => (
          <DestinationCard key={d.slug} destination={d} />
        ))}
      </div>
      {shown.length === 0 && (
        <p className="mt-10 text-center text-ink-soft">No friends have rated anywhere like that yet.</p>
      )}
    </div>
  );
}
