import Link from "next/link";
import { Photo } from "./Photo";
import { Stamp } from "./Stamp";
import { averageScore, type Destination } from "@/lib/data";

export function DestinationCard({ destination, note }: { destination: Destination; note?: string }) {
  const avg = averageScore(destination.slug);
  return (
    <Link
      href={`/destination/${destination.slug}`}
      className="block overflow-hidden rounded-md border border-sand bg-card"
    >
      <div className="relative">
        <Photo palette={destination.palette} className="h-32 rounded-none" />
        {avg !== null && (
          <div className="absolute top-2 right-2">
            <Stamp score={avg} size="sm" tilt={-4} />
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-lg leading-tight font-semibold">{destination.name}</h3>
        <p className="text-sm text-ink-soft">{destination.country}</p>
        {note && <p className="mt-1.5 text-xs font-medium text-airmail">{note}</p>}
      </div>
    </Link>
  );
}
