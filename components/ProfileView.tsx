import Link from "next/link";
import { Avatar } from "./Avatar";
import { RatingCard } from "./RatingCard";
import { ME, getDestination, ratingsBy, type Person } from "@/lib/data";

export function ProfileView({ person, children }: { person: Person; children?: React.ReactNode }) {
  const rs = ratingsBy(person.handle);
  const countries = new Set(rs.map((r) => getDestination(r.destination)?.country)).size;
  const avg = rs.length ? (rs.reduce((s, r) => s + r.destinationScore, 0) / rs.length).toFixed(1) : "–";
  const isMe = person.handle === ME;

  return (
    <>
      <div className="airmail h-2" />
      <header className="px-4 pt-6 pb-4 text-center">
        {!isMe && (
          <Link href="/" className="mb-2 flex items-center gap-1 text-sm font-medium text-airmail">
            <span aria-hidden>←</span> Home
          </Link>
        )}
        <div className="flex justify-center">
          <Avatar person={person} size="lg" />
        </div>
        <h1 className="mt-3 text-3xl font-semibold">{person.name}</h1>
        <p className="text-sm text-ink-soft">
          @{person.handle} · {person.homeTown}
        </p>
        <p className="mx-auto mt-3 max-w-xs font-display italic">{person.bio}</p>
        {!isMe && (
          <p className="mt-3 inline-block rounded-full bg-sea/15 px-3 py-1 text-xs font-semibold text-sea">
            {person.isFriend ? "Friends" : "Add friend"}
          </p>
        )}
      </header>

      <dl className="mx-4 grid grid-cols-3 divide-x divide-sand rounded-md border border-sand bg-card text-center">
        <Stat label="Holidays" value={rs.length} />
        <Stat label="Countries" value={countries} />
        <Stat label="Avg score" value={avg} />
      </dl>

      {children}

      <section className="mt-8 space-y-4 px-4">
        <h2 className="text-xl font-semibold">{isMe ? "Your holidays" : "Holidays"}</h2>
        {rs.map((r) => (
          <RatingCard key={r.id} rating={r} showAuthor={false} />
        ))}
        {rs.length === 0 && <p className="text-ink-soft">No holidays rated yet.</p>}
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="py-3">
      <dt className="text-[0.7rem] font-semibold tracking-[0.12em] text-ink-soft uppercase">{label}</dt>
      <dd className="font-display text-2xl font-semibold">{value}</dd>
    </div>
  );
}
