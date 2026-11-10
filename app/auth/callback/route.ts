import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Landing spot for Supabase's *default* email links (?code=…).
 * These only work in the same browser that asked for the link. Our custom
 * email templates use /auth/confirm instead, which works on any device.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) redirect("/");
    console.error("exchangeCodeForSession failed:", error.code, error.message);
  }
  redirect("/login?error=link");
}
