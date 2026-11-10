import type { Metadata } from "next";
import { ProfileView } from "@/components/ProfileView";
import { ME, getPerson } from "@/lib/data";

export const metadata: Metadata = { title: "You" };

export default function MyProfilePage() {
  const me = getPerson(ME)!;
  return (
    <ProfileView person={me}>
      <section className="mx-4 mt-6 rounded-md border border-sand bg-card p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold">Public profile</p>
            <p className="text-sm text-ink-soft">Let anyone on Postcard see your ratings, not just friends.</p>
          </div>
          <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-ink-soft">Off</span>
        </div>
        <p className="mt-3 text-xs text-ink-soft">
          Public profiles are for over-18s only. We check your date of birth when you sign up.
        </p>
      </section>
    </ProfileView>
  );
}
