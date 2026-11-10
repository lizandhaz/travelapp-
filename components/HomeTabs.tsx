"use client";

import { useState } from "react";

/** The two sides of Home: "For you" and "Friends". */
export function HomeTabs({ forYou, friends }: { forYou: React.ReactNode; friends: React.ReactNode }) {
  const [tab, setTab] = useState<"for-you" | "friends">("for-you");
  const tabs = [
    { id: "for-you", label: "For you" },
    { id: "friends", label: "Friends" },
  ] as const;

  return (
    <>
      <div role="tablist" aria-label="Home" className="mx-4 grid grid-cols-2 rounded-full border border-sand bg-card p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`rounded-full py-2 text-sm font-semibold transition-colors ${
              tab === t.id ? "bg-ink text-card" : "text-ink-soft"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-5">
        {tab === "for-you" ? forYou : friends}
      </div>
    </>
  );
}
