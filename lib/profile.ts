import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { ageInYears, MIN_AGE_FOR_PUBLIC_PROFILE } from "@/lib/age";

export type CurrentProfile = {
  id: string;
  email: string;
  name: string;
  handle: string;
  isPublic: boolean;
  canGoPublic: boolean;
};

/** The signed-in person's profile, or null if signed out. Cached per request. */
export const getCurrentProfile = cache(async (): Promise<CurrentProfile | null> => {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const claims = auth?.claims;
  if (!claims?.sub) return null;

  const [{ data: profile }, { data: priv }] = await Promise.all([
    supabase.from("profiles").select("name, handle, is_public").eq("id", claims.sub).maybeSingle(),
    supabase.from("profile_private").select("date_of_birth").eq("id", claims.sub).maybeSingle(),
  ]);
  if (!profile) return null;

  const age = priv?.date_of_birth ? ageInYears(priv.date_of_birth) : null;
  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : "",
    name: profile.name,
    handle: profile.handle,
    isPublic: profile.is_public,
    canGoPublic: age !== null && age >= MIN_AGE_FOR_PUBLIC_PROFILE,
  };
});
