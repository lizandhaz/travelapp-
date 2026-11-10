import type { Metadata } from "next";
import { Postmark } from "@/components/Postmark";
import { confirmLink } from "../../actions";

export const metadata: Metadata = { title: "Log in" };

/**
 * Where the email link lands (custom templates: ?token_hash=…&type=email).
 * Nothing happens until the person taps the button. That stops email virus
 * scanners, which "click" every link, from using up the one-time link.
 */
export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string }>;
}) {
  const { token_hash, type } = await searchParams;

  return (
    <div className="mt-10 overflow-hidden rounded-md border border-sand bg-card">
      <div className="airmail h-1.5" />
      <div className="p-5">
        <Postmark place="Welcome home" date="Hello" size={72} />
        <h1 className="mt-4 text-3xl font-semibold">You&apos;re nearly in</h1>
        {token_hash && type ? (
          <form action={confirmLink} className="mt-5">
            <input type="hidden" name="token_hash" value={token_hash} />
            <input type="hidden" name="type" value={type} />
            <button type="submit" className="w-full rounded-md bg-postbox px-4 py-3.5 text-lg font-semibold text-card">
              Log me in
            </button>
          </form>
        ) : (
          <p className="mt-2 text-ink-soft">
            This link looks incomplete. Try tapping it again from the email, or{" "}
            <a href="/login" className="font-medium text-airmail underline">
              ask for a new one
            </a>
            .
          </p>
        )}
      </div>
    </div>
  );
}
