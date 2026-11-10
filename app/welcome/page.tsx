import type { Metadata } from "next";
import Link from "next/link";
import { Postmark } from "@/components/Postmark";
import { Stamp } from "@/components/Stamp";
import { WaitlistForm } from "./WaitlistForm";

export const metadata: Metadata = { title: "Join the waitlist" };

export default function WelcomePage() {
  return (
    <main className="paper-grain min-h-dvh">
      <div className="airmail h-2" />
      <div className="mx-auto max-w-md px-4 pt-10 pb-16">
        <div className="flex items-start justify-between">
          <p className="font-display text-2xl font-semibold">
            Postcard<span className="text-postbox">.</span>
          </p>
          <Stamp score={9} tilt={6} />
        </div>

        <h1 className="mt-10 text-5xl leading-[1.05] font-semibold">
          Holidays, rated by friends you <em className="text-postbox">actually</em> trust.
        </h1>
        <p className="mt-5 text-lg text-ink-soft">
          Your friends rate where they went and where they stayed, out of 10. Add photos, food picks and top tips. No
          strangers, no sponsored reviews.
        </p>

        <Postmark place="Coming soon" date="2027" className="mt-8" />

        <WaitlistForm />

        <ul className="mt-12 space-y-4 text-sm">
          <li className="flex gap-3">
            <span className="font-display text-xl text-postbox">1</span>
            <span>
              <strong>Rate it when you&apos;re home.</strong> Destination and stay, out of 10. We never share live
              location.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-display text-xl text-postbox">2</span>
            <span>
              <strong>See what friends loved.</strong> The Friends feed shows every trip your people have rated.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-display text-xl text-postbox">3</span>
            <span>
              <strong>Get picks for you.</strong> The more you rate, the better your For you suggestions.
            </span>
          </li>
        </ul>

        <p className="mt-12 text-xs text-ink-soft">
          Public profiles are for over-18s only.{" "}
          <Link href="/" className="font-medium text-airmail underline underline-offset-4">
            Peek at the app
          </Link>
        </p>
      </div>
    </main>
  );
}
