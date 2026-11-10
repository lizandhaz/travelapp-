import Link from "next/link";
import { DestinationCard } from "@/components/DestinationCard";
import { HomeTabs } from "@/components/HomeTabs";
import { RatingCard } from "@/components/RatingCard";
import { Stamp } from "@/components/Stamp";
import { averageScore, forYouPicks, friendFeed } from "@/lib/data";
import { getCurrentProfile } from "@/lib/profile";

export default async function HomePage() {
  const me = await getCurrentProfile();
  const [top, ...rest] = forYouPicks();
  const feed = friendFeed();
  const topAvg = averageScore(top.destination.slug);

  const forYou = (
    <section className="space-y-6 px-4" aria-label="Picks for you">
      <Link
        href={`/destination/${top.destination.slug}`}
        className="relative block overflow-hidden rounded-md border border-sand bg-card p-5"
      >
        <div className="airmail absolute inset-x-0 top-0 h-1.5" />
        <p className="text-xs font-semibold tracking-[0.18em] text-postbox uppercase">Top pick for you</p>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold">{top.destination.name}</h2>
            <p className="text-ink-soft">{top.destination.country}</p>
            <p className="mt-3 text-sm">{top.destination.blurb}</p>
            <p className="mt-3 text-xs font-medium text-airmail">
              {top.match}% match · {top.reason}
            </p>
          </div>
          {topAvg !== null && <Stamp score={topAvg} label="Friends" size="lg" tilt={4} />}
        </div>
      </Link>
      <div>
        <h2 className="mb-3 text-xl font-semibold">More you might love</h2>
        <div className="grid grid-cols-2 gap-3">
          {rest.slice(0, 6).map((p) => (
            <DestinationCard key={p.destination.slug} destination={p.destination} note={`${p.match}% match`} />
          ))}
        </div>
      </div>
    </section>
  );

  const friends = (
    <section className="space-y-4 px-4" aria-label="Friends' ratings">
      {feed.map((r) => (
        <RatingCard key={r.id} rating={r} />
      ))}
    </section>
  );

  return (
    <>
      <header className="flex items-center justify-between px-4 pt-6 pb-4">
        <div>
          <p className="font-display text-sm text-ink-soft italic">Hello {me?.name.split(" ")[0] ?? "there"},</p>
          <h1 className="text-3xl font-semibold">
            Postcard<span className="text-postbox">.</span>
          </h1>
        </div>
        <Link
          href="/welcome"
          className="text-xs font-medium text-airmail underline underline-offset-4"
        >
          About
        </Link>
      </header>
      <p className="mx-4 mb-4 rounded-md border border-dashed border-sand px-3 py-2 text-xs text-ink-soft">
        Preview: the picks and ratings below are sample content. Real ones arrive as friends start rating.
      </p>
      <HomeTabs forYou={forYou} friends={friends} />
    </>
  );
}
