import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { PageHeader } from "@/components/PageHeader";
import { formatDay, getPerson, postcards } from "@/lib/data";

export const metadata: Metadata = { title: "Postcards" };

// "Postcards" is what Postcard calls notifications.
export default function PostcardsPage() {
  return (
    <>
      <PageHeader title="Postcards" kicker="Your post" />
      <ul className="space-y-2 px-4">
        {postcards.map((p) => {
          const from = p.from ? getPerson(p.from) : undefined;
          return (
            <li key={p.id}>
              <Link
                href={p.href}
                className={`flex items-start gap-3 rounded-md border p-3 ${
                  p.unread ? "border-postbox/30 bg-card" : "border-sand bg-card/60"
                }`}
              >
                {from ? (
                  <Avatar person={from} />
                ) : (
                  <span
                    aria-hidden
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sand font-display text-lg text-postbox"
                  >
                    ✉
                  </span>
                )}
                <p className="min-w-0 flex-1 text-sm leading-snug">
                  {from && <span className="font-semibold">{from.name} </span>}
                  {p.text}
                  <span className="mt-0.5 block text-xs text-ink-soft">{formatDay(p.sentAt)}</span>
                </p>
                {p.unread && (
                  <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-postbox">
                    <span className="sr-only">Unread</span>
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
