import Link from "next/link";

// Frame for sign-up and log-in: no tab bar, airmail edge, centred card.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="paper-grain min-h-dvh">
      <div className="airmail h-2" />
      <div className="mx-auto max-w-md px-4 pt-8 pb-16">
        <Link href="/welcome" className="font-display text-2xl font-semibold">
          Postcard<span className="text-postbox">.</span>
        </Link>
        {children}
      </div>
    </main>
  );
}
