import { ageInYears, MIN_AGE_TO_JOIN } from './age';
import { supabase } from './supabase';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type AuthError = { status?: number; code?: string; message: string };

function isRateLimit(e: AuthError) {
  return e.status === 429 || !!e.code?.includes('rate_limit');
}

function friendly(e: AuthError) {
  if (isRateLimit(e)) return "We've sent a lot of emails in the last hour. Please wait a little while and try again.";
  if (e.message?.toLowerCase().includes('network') || e.status === 0)
    return "Couldn't reach Postcard. Check you're online and try again.";
  return 'Something went wrong sending your code. Please try again in a minute.';
}

/** `detail` is Supabase's own wording, shown in small print to help spot setup problems. */
export type Result = { ok: true } | { ok: false; message: string; detail?: string };

const detailOf = (e: AuthError) => [e.status, e.code, e.message].filter(Boolean).join(' · ');

/** Join: check the answers, then ask Supabase to email a 6-digit code. */
export async function requestSignUpCode(name: string, email: string, dob: string): Promise<Result> {
  name = name.trim();
  email = email.trim().toLowerCase();
  if (!name) return { ok: false, message: 'What should we call you?' };
  if (name.length > 80) return { ok: false, message: "That name's a bit long. 80 characters at most, please." };
  if (!EMAIL_RE.test(email)) return { ok: false, message: "That email address doesn't look quite right." };
  const age = ageInYears(dob);
  if (age === null || age < 0 || age > 120) return { ok: false, message: 'Please enter your date of birth.' };
  if (age < MIN_AGE_TO_JOIN) return { ok: false, message: `Sorry, you need to be ${MIN_AGE_TO_JOIN} or over to join Postcard.` };

  // The database checks the age again and refuses the account if it's under 13.
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true, data: { name, date_of_birth: dob } },
  });
  if (error) {
    console.warn('sign-up code failed', error.status, error.code, error.message);
    return { ok: false, message: friendly(error), detail: detailOf(error) };
  }
  return { ok: true };
}

/** Log in: ask for a code. Says "check your inbox" whether or not the account exists. */
export async function requestLogInCode(email: string): Promise<Result> {
  email = email.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { ok: false, message: "That email address doesn't look quite right." };
  const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
  if (error && (isRateLimit(error) || error.status === 0 || error.message?.toLowerCase().includes('network'))) {
    return { ok: false, message: friendly(error), detail: detailOf(error) };
  }
  if (error && error.code !== 'otp_disabled' && error.status !== 422 && error.status !== 400) {
    // Not "no such account" (which we keep quiet about), so it's a real problem worth showing.
    return { ok: false, message: friendly(error), detail: detailOf(error) };
  }
  return { ok: true };
}

/** Check the code from the email. On success the app switches to Home by itself. */
export async function verifyCode(email: string, code: string): Promise<Result> {
  const token = code.replace(/\s/g, '');
  if (!/^\d{6,10}$/.test(token)) return { ok: false, message: 'Type the number from the email.' };
  const { error } = await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token, type: 'email' });
  if (error) {
    if (isRateLimit(error)) return { ok: false, message: friendly(error), detail: detailOf(error) };
    return {
      ok: false,
      message: "That code didn't work. Codes last an hour and work once. Check it, or send a new one.",
      detail: detailOf(error),
    };
  }
  return { ok: true };
}
