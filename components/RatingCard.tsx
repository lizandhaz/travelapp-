import Link from "next/link";
import { Avatar } from "./Avatar";
import { Photo } from "./Photo";
import { Stamp } from "./Stamp";
import { formatDay, formatMonth, getDestination, getPerson, type Rating } from "@/lib/data";

/** One friend's rating, styled like the back of a postcard. */
export function RatingCard({ rating, showAuthor = true }: { rating: Rating; showAuthor?: boolean }) {
  const person = getPerson(rating.author);
  const place = getDestination(rating.destination);
  if (!person || !place) return null;

  return (
    <article className="overflow-hidden rounded-md border border-sand bg-card shadow-[0_1px_0_rgb(31_42_68/0.06)]">
      <div className="airmail h-1.5" />
      <Link href={`/rating/${rating.id}`} className="block p-4">
        {showAuthor && (
          <div className="mb-3 flex items-center gap-2.5">
            <Avatar person={person} size="sm" />
            <p className="text-sm leading-tight">
              <span className="font-semibold">{person.name}</span>
              <span className="block text-xs text-ink-soft">
                Went {formatMonth(rating.tripMonth)} · posted {formatDay(rating.postedAt)}
              </span>
            </p>
          </div>
        )}
        <div className="flex gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold tracking-[0.14em] text-ink-soft uppercase">
              {place.name}, {place.country}
            </p>
            <h3 className="mt-1 text-xl leading-snug font-semibold">{rating.headline}</h3>
            <p className="mt-2 text-sm text-ink-soft">
              Stayed at <span className="font-medium text-ink">{rating.stay.name}</span> ({rating.stay.type}) ·{" "}
              {rating.stay.score}/10
            </p>
          </div>
          <Stamp score={rating.destinationScore} tilt={3} />
        </div>
        {rating.photos[0] && (
          <Photo palette={rating.photos[0].palette} caption={rating.photos[0].caption} className="mt-4 h-40" />
        )}
        {rating.foodPicks[0] && (
          <p className="mt-3 text-sm">
            <span className="mr-1.5 rounded-sm bg-sun/25 px-1.5 py-0.5 text-xs font-semibold">Eat</span>
            {rating.foodPicks[0].name}
          </p>
        )}
      </Link>
    </article>
  );
}
