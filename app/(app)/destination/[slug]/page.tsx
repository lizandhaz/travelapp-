import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { PageHeader } from "@/components/PageHeader";
import { Photo } from "@/components/Photo";
import { RatingCard } from "@/components/RatingCard";
import { Stamp } from "@/components/Stamp";
import { averageScore, destinations, getDestination, getPerson, ratingsFor } from "@/lib/data";

export function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: getDestination(slug)?.name ?? "Destination" };
}

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const place = getDestination(slug);
  if (!place) notFound();

  const rs = ratingsFor(slug);
  const avg = averageScore(slug);
  const stays = rs.map((r) => ({ ...r.stay, by: r.author, ratingId: r.id }));
  const food = rs.flatMap((r) => r.foodPicks.map((f) => ({ ...f, by: r.author })));
  const tips = rs.flatMap((r) => r.topTips.map((t) => ({ tip: t, by: r.author })));

  return (
    <>
      <Photo palette={place.palette} className="h-56 rounded-none" />
      <PageHeader title={place.name} kicker={place.country} back={{ href: "/explore", label: "Explore" }}>
        {avg !== null && <Stamp score={avg} label="Friends" tilt={-3} />}
      </PageHeader>
      <div className="space-y-8 px-4">
        <p className="text-ink-soft">{place.blurb}</p>

        {rs.length === 0 ? (
          <div className="rounded-md border border-dashed border-sand p-5 text-center">
            <p className="font-display text-lg">No friends have rated {place.name} yet.</p>
            <Link href="/log" className="mt-3 inline-block font-semibold text-postbox">
              Been? Rate it →
            </Link>
          </div>
        ) : (
          <>
            <Section title="Where friends stayed">
              <ul className="divide-y divide-sand rounded-md border border-sand bg-card">
                {stays.map((s) => (
                  <li key={s.ratingId}>
                    <Link href={`/rating/${s.ratingId}`} className="flex items-center justify-between gap-3 p-3">
                      <span>
                        <span className="font-medium">{s.name}</span>
                        <span className="block text-xs text-ink-soft">
                          {s.type} · {getPerson(s.by)?.name}
                        </span>
                      </span>
                      <Stamp score={s.score} size="sm" />
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Food picks">
              <ul className="space-y-2">
                {food.map((f) => (
                  <li key={f.by + f.name} className="rounded-md border border-sand bg-card p-3">
                    <p className="font-medium">{f.name}</p>
                    <p className="text-sm text-ink-soft">{f.note}</p>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Top tips">
              <ul className="space-y-3">
                {tips.map((t) => {
                  const p = getPerson(t.by)!;
                  return (
                    <li key={t.by + t.tip} className="flex gap-3">
                      <Avatar person={p} size="sm" />
                      <p className="font-display text-[1.05rem] leading-snug italic">&ldquo;{t.tip}&rdquo;</p>
                    </li>
                  );
                })}
              </ul>
            </Section>

            <Section title="Ratings">
              <div className="space-y-4">
                {rs.map((r) => (
                  <RatingCard key={r.id} rating={r} />
                ))}
              </div>
            </Section>
          </>
        )}
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}
