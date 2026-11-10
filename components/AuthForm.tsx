"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Postmark } from "./Postmark";
import type { AuthFormState } from "@/app/(auth)/actions";

type Action = (prev: AuthFormState, form: FormData) => Promise<AuthFormState>;

const inputClass =
  "w-full rounded-md border border-sand bg-card px-3 py-3 text-base placeholder:text-ink-soft/60";

export function AuthForm({ mode, action }: { mode: "signup" | "login"; action: Action }) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" });

  if (state.status === "sent") {
    return (
      <div role="status" className="mt-10 overflow-hidden rounded-md border border-sand bg-card">
        <div className="airmail h-1.5" />
        <div className="p-5">
          <Postmark place="In the post" date="Check inbox" size={72} />
          <h1 className="mt-4 text-3xl font-semibold">Check your inbox</h1>
          <p className="mt-2 text-ink-soft">
            {mode === "signup" ? "We've sent a link to " : "If there's an account for "}
            <strong className="text-ink">{state.email}</strong>
            {mode === "signup" ? ". Tap it to finish joining." : ", we've sent it a link to log in."}
          </p>
          <p className="mt-4 text-sm text-ink-soft">
            Nothing after a few minutes? Check your spam folder, or{" "}
            <a href={mode === "signup" ? "/signup" : "/login"} className="font-medium text-airmail underline">
              try again
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  const values = state.status === "error" ? state.values : {};

  return (
    <>
      <h1 className="mt-10 text-4xl leading-tight font-semibold">
        {mode === "signup" ? "Join Postcard" : "Welcome back"}
      </h1>
      <p className="mt-2 text-ink-soft">
        {mode === "signup"
          ? "No password needed. We'll email you a link to sign in."
          : "Enter your email and we'll send you a link to log in."}
      </p>

      <form action={formAction} className="mt-8 space-y-5" noValidate>
        {mode === "signup" && (
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
              Your name
            </label>
            <input id="name" name="name" autoComplete="name" defaultValue={values.name} className={inputClass} />
          </div>
        )}
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            defaultValue={values.email}
            className={inputClass}
          />
        </div>
        {mode === "signup" && (
          <div>
            <label htmlFor="dob" className="mb-1.5 block text-sm font-medium">
              Date of birth
            </label>
            <input id="dob" name="dob" type="date" autoComplete="bday" defaultValue={values.dob} className={inputClass} />
            <p className="mt-2 text-xs text-ink-soft">
              Only you can see this. You need to be 13 or over to join. Under 18? Your profile stays private, just for
              friends.
            </p>
          </div>
        )}

        {state.status === "error" && (
          <p role="alert" className="rounded-md border border-postbox/40 bg-postbox/10 p-3 text-sm text-ink">
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-postbox px-4 py-3.5 text-lg font-semibold text-card disabled:opacity-60"
        >
          {pending ? "Sending…" : mode === "signup" ? "Send my link" : "Send my log-in link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        {mode === "signup" ? (
          <>
            Already joined?{" "}
            <Link href="/login" className="font-semibold text-airmail">
              Log in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/signup" className="font-semibold text-airmail">
              Join Postcard
            </Link>
          </>
        )}
      </p>
    </>
  );
}
