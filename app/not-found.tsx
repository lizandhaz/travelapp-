import Link from "next/link";
import { Postmark } from "@/components/Postmark";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-4 text-center">
      <Postmark place="Return to sender" date="404" waves={false} />
      <h1 className="mt-6 text-3xl font-semibold">Lost in the post</h1>
      <p className="mt-2 text-ink-soft">We couldn&apos;t find that page.</p>
      <Link href="/" className="mt-6 rounded-md bg-postbox px-5 py-3 font-semibold text-card">
        Back home
      </Link>
    </main>
  );
}
