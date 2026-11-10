"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { ageInYears, MIN_AGE_TO_JOIN } from "@/lib/age";

export type AuthFormState =
  | { status: "idle" }
  | { status: "error"; message: string; values: Record<string, string> }
  | { status: "sent"; email: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function linkTarget() {
  const h = await headers();
  const origin = h.get("origin") ?? `https://${h.get("host")}`;
  return `${origin}/auth/callback`;
}

function friendlyAuthError(error: { status?: number; code?: string; message: string }): string {
  if (error.status === 429 || error.code?.includes("rate_limit")) {
    return "We've sent a lot of emails in the last hour. Please wait a little while and try again.";
  }
  return "Something went wrong sending your link. Please try again in a minute.";
}

export async function signUp(_prev: AuthFormState, form: FormData): Promise<AuthFormState> {
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const dob = String(form.get("dob") ?? "");
  const values = { name, email, dob };
  const fail = (message: string): AuthFormState => ({ status: "error", message, values });

  if (!name) return fail("What should we call you?");
  if (name.length > 80) return fail("That name's a bit long. 80 characters at most, please.");
  if (!EMAIL_RE.test(email)) return fail("That email address doesn't look quite right.");
  const age = ageInYears(dob);
  if (age === null || age < 0 || age > 120) return fail("Please enter your date of birth.");
  if (age < MIN_AGE_TO_JOIN) return fail(`Sorry, you need to be ${MIN_AGE_TO_JOIN} or over to join Postcard.`);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: await linkTarget(),
      data: { name, date_of_birth: dob },
    },
  });
  if (error) {
    console.error("signUp failed:", error.status, error.code, error.message);
    return fail(friendlyAuthError(error));
  }
  return { status: "sent", email };
}

export async function logIn(_prev: AuthFormState, form: FormData): Promise<AuthFormState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return { status: "error", message: "That email address doesn't look quite right.", values: { email } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: await linkTarget() },
  });

  // If there's no account, Supabase says so, but we show the same "check your inbox"
  // message either way so nobody can use this form to find out who has an account.
  if (error && (error.status === 429 || error.code?.includes("rate_limit"))) {
    return { status: "error", message: friendlyAuthError(error), values: { email } };
  }
  if (error && error.code !== "otp_disabled" && error.status !== 422 && error.status !== 400) {
    console.error("logIn failed:", error.status, error.code, error.message);
  }
  return { status: "sent", email };
}

export async function logOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/welcome");
}

/** The "Log me in" button on /auth/confirm. */
export async function confirmLink(form: FormData) {
  const tokenHash = String(form.get("token_hash") ?? "");
  const type = String(form.get("type") ?? "") as EmailOtpType;
  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) redirect("/");
    console.error("verifyOtp failed:", error.code, error.message);
  }
  redirect("/login?error=link");
}
