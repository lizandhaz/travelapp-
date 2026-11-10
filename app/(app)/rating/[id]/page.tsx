import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { Photo } from "@/components/Photo";
import { Postmark } from "@/components/Postmark";
import { Stamp } from "@/components/Stamp";
import { formatDay, formatMonth, getDestination, getPerson, getRating, ratings } from "@/lib/data";

export function generateStaticParams() {
  return ratings.map((r) => ({ id: r.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const r = getRating(id);
  return { title: r ? r.headline : "Rating" };
}

export default async function RatingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rating = getRating(id);
  const person = rating && getPerson(rating.author);
  const place = rating && getDestination(rating.destination);
  if (!rating || !person || !place) notFound();

  return (
    <article className="px-4 pt-6">
      <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-airmail">
        <span aria-hidden>←</span> Home
      </Link>

      {/* The postcard itself */}
      <div className="relative mt-4 overflow-hidden rounded-md border border-sand bg-card">
        <div className="airmail h-2" />
        <div className="p-5">
          <div className="flex items-start justify-between gap-2">
            <Postmark place={place.name} date={formatMonth(rating.tripMonth)} size={72} />
            <Stamp score={rating.destinationScore} label="Place" size="lg" tilt={5} />
          </div>
          <h1 className="mt-4 text-3xl leading-tight font-semibold">{rating.headline}</h1>
          <Link href={`/destination/${place.slug}`} className="mt-1 inline-block text-sm font-medium text-airmail">
            {place.name}, {place.country}
          </Link>
          <p className="mt-4 font-display text-lg leading-relaxed">{rating.review}</p>
          <Link href={`/people/${person.handle}`} className="mt-5 flex items-center gap-2.5">
            <Avatar person={person} size="sm" />
            <span className="text-sm">
              <span className="font-semibold">{person.name}</span>
              <span className="block text-xs text-ink-soft">Posted {formatDay(rating.postedAt)}, once home</span>
            </span>
          </Link>
        </div>
      </div>

      <div className="no-scrollbar -mx-4 mt-5 flex gap-3 overflow-x-auto px-4">
        {rating.photos.map((p) => (
          <Photo key={p.caption} palette={p.palette} caption={p.caption} className="h-52 w-72 shrink-0" />
        ))}
      </div>

      <section className="mt-6 flex items-center justify-between gap-4 rounded-md border border-sand bg-card p-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-ink-soft uppercase">Where they stayed</p>
          <p className="mt-1 text-lg font-semibold">{rating.stay.name}</p>
          <p className="text-sm text-ink-soft">{rating.stay.type}</p>
        </div>
        <Stamp score={rating.stay.score} label="Stay" tilt={-3} />
      </section>

      {rating.foodPicks.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-xl font-semibold">Food picks</h2>
          <ul className="space-y-2">
            {rating.foodPicks.map((f) => (
              <li key={f.name} className="rounded-md border border-sand bg-card p-3">
                <p className="font-medium">{f.name}</p>
                <p className="text-sm text-ink-soft">{f.note}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {rating.topTips.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-xl font-semibold">Top tips</h2>
          <ol className="space-y-2">
            {rating.topTips.map((t, i) => (
              <li key={t} className="flex gap-3">
                <span className="font-display text-xl font-semibold text-postbox">{i + 1}</span>
                <span className="pt-1">{t}</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </article>
  );
}
