"use client";

import { useState } from "react";

// Shell only: nothing is sent anywhere yet. Loops gets wired in later (see docs/plan.md).
export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <p role="status" className="mt-8 rounded-md border border-sea/40 bg-card p-4 text-sm">
        <strong className="font-display text-base">Thanks!</strong> This is a preview, so we haven&apos;t saved{" "}
        {email}. Once the waitlist is live, this is where you&apos;d get a confirmation.
      </p>
    );
  }

  return (
    <form
      className="mt-8 flex flex-col gap-2 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
    >
      <label htmlFor="waitlist-email" className="sr-only">
        Email address
      </label>
      <input
        id="waitlist-email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="min-w-0 flex-1 rounded-md border border-sand bg-card px-4 py-3 text-base placeholder:text-ink-soft/70"
      />
      <button type="submit" className="rounded-md bg-postbox px-5 py-3 font-semibold text-card hover:bg-postbox/90">
        Join the waitlist
      </button>
    </form>
  );
}
