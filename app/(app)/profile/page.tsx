import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logOut } from "@/app/(auth)/actions";
import { ProfileView } from "@/components/ProfileView";
import type { Person } from "@/lib/data";
import { getCurrentProfile } from "@/lib/profile";

export const metadata: Metadata = { title: "You" };

const COLOURS: Person["colour"][] = ["postbox", "airmail", "sea", "sun", "ink"];

export default async function MyProfilePage() {
  const me = await getCurrentProfile();
  if (!me) redirect("/welcome");

  const person: Person = {
    handle: me.handle,
    name: me.name,
    initials: me.name
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    homeTown: "",
    bio: "",
    colour: COLOURS[me.id.charCodeAt(0) % COLOURS.length],
    isFriend: false,
  };

  return (
    <ProfileView person={person} isMe>
      <Link
        href="/log"
        className="mx-4 mt-6 block rounded-md bg-postbox px-4 py-3 text-center font-semibold text-card"
      >
        Log your first holiday
      </Link>

      <section className="mx-4 mt-6 rounded-md border border-sand bg-card p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold">Public profile</p>
            <p className="text-sm text-ink-soft">Let anyone on Postcard see your ratings, not just friends.</p>
          </div>
          <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-ink-soft">
            {me.isPublic ? "On" : "Off"}
          </span>
        </div>
        <p className="mt-3 text-xs text-ink-soft">
          {me.canGoPublic
            ? "Public profiles are coming soon."
            : "Public profiles are for over-18s. Until then, your profile is just for friends."}
        </p>
      </section>

      <section className="mx-4 mt-4 rounded-md border border-sand bg-card p-4 text-sm">
        <p className="text-ink-soft">
          Signed in as <span className="font-medium text-ink">{me.email}</span>
        </p>
        <form action={logOut} className="mt-3">
          <button type="submit" className="rounded-md border border-ink px-4 py-2 font-semibold">
            Log out
          </button>
        </form>
      </section>
    </ProfileView>
  );
}
