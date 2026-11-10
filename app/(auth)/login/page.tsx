import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import { logIn } from "../actions";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <>
      {error === "link" && (
        <p role="alert" className="mt-8 rounded-md border border-postbox/40 bg-postbox/10 p-3 text-sm">
          That link has expired or was already used. Links only work once, for about an hour. Pop your email in below
          for a fresh one.
        </p>
      )}
      <AuthForm mode="login" action={logIn} />
    </>
  );
}
