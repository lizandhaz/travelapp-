"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Postmark } from "./Postmark";
import { Stamp } from "./Stamp";
import { STAY_TYPES, destinations, formatMonth, type StayType } from "@/lib/data";

type Draft = {
  place: string;
  country: string;
  tripMonth: string;
  destinationScore: number | null;
  stayName: string;
  stayType: StayType | null;
  stayScore: number | null;
  headline: string;
  review: string;
  food: string[];
  tips: string[];
  home: boolean;
};

const EMPTY: Draft = {
  place: "",
  country: "",
  tripMonth: "",
  destinationScore: null,
  stayName: "",
  stayType: null,
  stayScore: null,
  headline: "",
  review: "",
  food: ["", "", ""],
  tips: ["", "", ""],
  home: false,
};

/**
 * The "Log a holiday" form. In the shell it only checks the answers and shows a preview.
 * Step 2 of docs/plan.md replaces the preview with a real save to Supabase.
 */
export function LogForm() {
  const [d, setD] = useState<Draft>(EMPTY);
  const [photos, setPhotos] = useState<{ url: string; name: string }[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  // Free the temporary photo previews when they change or the form closes.
  useEffect(() => () => photos.forEach((p) => URL.revokeObjectURL(p.url)), [photos]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setD((prev) => ({ ...prev, [key]: value }));
  const setListItem = (key: "food" | "tips", i: number, value: string) =>
    setD((prev) => ({ ...prev, [key]: prev[key].map((v, j) => (j === i ? value : v)) }));

  function validate(): string[] {
    const errs: string[] = [];
    if (!d.place.trim()) errs.push("Where did you go?");
    if (!d.tripMonth) errs.push("Pick the month you went.");
    else {
      const now = new Date();
      const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      if (d.tripMonth > thisMonth) errs.push("That month is in the future. Postcard is for trips you're back from.");
    }
    if (!d.destinationScore) errs.push("Give the destination a score out of 10.");
    if (!d.stayName.trim()) errs.push("Where did you stay?");
    if (!d.stayType) errs.push("What kind of place was it?");
    if (!d.stayScore) errs.push("Give your stay a score out of 10.");
    if (!d.home) errs.push("Tick to confirm you're back home. We never post while you're away.");
    return errs;
  }

  if (submitted) {
    return (
      <div className="px-4" role="status">
        <div className="overflow-hidden rounded-md border border-sand bg-card">
          <div className="airmail h-2" />
          <div className="p-5">
            <div className="flex items-start justify-between">
              <Postmark place={d.place} date={formatMonth(d.tripMonth)} size={72} />
              <Stamp score={d.destinationScore!} label="Place" size="lg" tilt={5} />
            </div>
            <h2 className="mt-4 text-2xl font-semibold">{d.headline || `${d.place}, rated`}</h2>
            <p className="mt-1 text-sm text-ink-soft">
              {d.stayName} ({d.stayType}) · {d.stayScore}/10
            </p>
          </div>
        </div>
        <p className="mt-5 rounded-md border border-sun/50 bg-sun/15 p-4 text-sm">
          <strong>Preview only.</strong> This is the sample app, so nothing has been saved yet. Once accounts are
          connected, this would post to your friends.
        </p>
        <div className="mt-5 flex gap-3">
          <button
            onClick={() => {
              setD(EMPTY);
              setPhotos([]);
              setSubmitted(false);
            }}
            className="flex-1 rounded-md border border-ink px-4 py-3 font-semibold"
          >
            Log another
          </button>
          <Link href="/" className="flex-1 rounded-md bg-postbox px-4 py-3 text-center font-semibold text-card">
            Back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      noValidate
      className="space-y-7 px-4"
      onSubmit={(e) => {
        e.preventDefault();
        const errs = validate();
        setErrors(errs);
        if (errs.length === 0) {
          setSubmitted(true);
          window.scrollTo({ top: 0 });
        }
      }}
    >
      <Fieldset legend="The place">
        <Field label="Where did you go?" htmlFor="place">
          <input
            id="place"
            list="known-places"
            value={d.place}
            onChange={(e) => {
              const match = destinations.find((x) => x.name.toLowerCase() === e.target.value.toLowerCase());
              setD((prev) => ({ ...prev, place: e.target.value, country: match ? match.country : prev.country }));
            }}
            placeholder="e.g. Lisbon"
            className={inputClass}
          />
          <datalist id="known-places">
            {destinations.map((x) => (
              <option key={x.slug} value={x.name} />
            ))}
          </datalist>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Country" htmlFor="country">
            <input
              id="country"
              value={d.country}
              onChange={(e) => set("country", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="When did you go?" htmlFor="month">
            <input
              id="month"
              type="month"
              value={d.tripMonth}
              onChange={(e) => set("tripMonth", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        <ScorePicker name="destination" label="Destination score" value={d.destinationScore} onChange={(v) => set("destinationScore", v)} />
      </Fieldset>

      <Fieldset legend="Where you stayed">
        <Field label="Name of the place" htmlFor="stay">
          <input
            id="stay"
            value={d.stayName}
            onChange={(e) => set("stayName", e.target.value)}
            placeholder="e.g. Casa do Miradouro"
            className={inputClass}
          />
        </Field>
        <div>
          <p className="mb-2 text-sm font-medium">Type of stay</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Type of stay">
            {STAY_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={d.stayType === t}
                onClick={() => set("stayType", t)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                  d.stayType === t ? "border-ink bg-ink text-card" : "border-sand bg-card text-ink-soft"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <ScorePicker name="stay" label="Stay score" value={d.stayScore} onChange={(v) => set("stayScore", v)} />
      </Fieldset>

      <Fieldset legend="Tell your friends">
        <Field label="Headline" htmlFor="headline">
          <input
            id="headline"
            value={d.headline}
            onChange={(e) => set("headline", e.target.value)}
            placeholder="Pastéis for breakfast, lunch and tea"
            className={inputClass}
          />
        </Field>
        <Field label="How was it?" htmlFor="review">
          <textarea
            id="review"
            rows={4}
            value={d.review}
            onChange={(e) => set("review", e.target.value)}
            className={inputClass}
          />
        </Field>
        <div>
          <p className="mb-2 text-sm font-medium">Food picks</p>
          <div className="space-y-2">
            {d.food.map((v, i) => (
              <input
                key={i}
                aria-label={`Food pick ${i + 1}`}
                value={v}
                onChange={(e) => setListItem("food", i, e.target.value)}
                placeholder={i === 0 ? "Restaurant, café or dish" : ""}
                className={inputClass}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Top tips</p>
          <div className="space-y-2">
            {d.tips.map((v, i) => (
              <input
                key={i}
                aria-label={`Top tip ${i + 1}`}
                value={v}
                onChange={(e) => setListItem("tips", i, e.target.value)}
                placeholder={i === 0 ? "Something you wish you'd known" : ""}
                className={inputClass}
              />
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="photos" className="mb-2 block text-sm font-medium">
            Photos
          </label>
          <input
            id="photos"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) =>
              setPhotos(
                Array.from(e.target.files ?? [])
                  .slice(0, 6)
                  .map((f) => ({ url: URL.createObjectURL(f), name: f.name })),
              )
            }
            className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:font-semibold file:text-card"
          />
          {photos.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {photos.map((p) => (
                // Temporary local previews; next/image isn't needed for blob URLs.
                // eslint-disable-next-line @next/next/no-img-element
                <img key={p.url} src={p.url} alt={p.name} className="aspect-square w-full rounded-sm object-cover" />
              ))}
            </div>
          )}
          <p className="mt-2 text-xs text-ink-soft">Up to 6. Location data in photos will be removed before posting.</p>
        </div>
      </Fieldset>

      <label className="flex items-start gap-3 rounded-md border border-sand bg-card p-4">
        <input
          type="checkbox"
          checked={d.home}
          onChange={(e) => set("home", e.target.checked)}
          className="mt-1 size-4 accent-postbox"
        />
        <span className="text-sm">
          <strong>I&apos;m back home.</strong> Postcard never shares where you are right now, only where you&apos;ve been.
        </span>
      </label>

      {errors.length > 0 && (
        <div role="alert" className="rounded-md border border-postbox/40 bg-postbox/10 p-4 text-sm">
          <p className="font-semibold text-postbox">Nearly there:</p>
          <ul className="mt-1 list-disc pl-5">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <button type="submit" className="w-full rounded-md bg-postbox px-4 py-3.5 text-lg font-semibold text-card">
        Send postcard
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-md border border-sand bg-card px-3 py-2.5 text-base placeholder:text-ink-soft/60";

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <legend className="mb-3 font-display text-xl font-semibold">{legend}</legend>
      {children}
    </fieldset>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}

function ScorePicker({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">
        {label} <span className="text-ink-soft">(out of 10)</span>
      </legend>
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <label key={n} className="relative">
            <input
              type="radio"
              name={name}
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              className="peer sr-only"
            />
            <span className="flex h-10 cursor-pointer items-center justify-center rounded-sm border border-sand bg-card font-display font-semibold text-ink-soft peer-checked:border-postbox peer-checked:bg-postbox peer-checked:text-card peer-focus-visible:outline-2 peer-focus-visible:outline-airmail">
              {n}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
