import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseEnv } from "./env";

/** Pages anyone can see without being signed in. */
const PUBLIC_PATHS = ["/welcome", "/login", "/signup", "/auth"];
/** Pages that make no sense once you're signed in. */
const SIGNED_OUT_ONLY = ["/login", "/signup"];

const matches = (path: string, list: string[]) => list.some((p) => path === p || path.startsWith(p + "/"));

/**
 * Runs before every page: refreshes the Supabase session cookie, sends signed-out
 * visitors to /welcome, and sends signed-in people away from /login and /signup.
 */
export async function updateSession(request: NextRequest) {
  const { url, key } = supabaseEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });

  // Don't put code between createServerClient and getClaims: it's what refreshes the session.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);
  const path = request.nextUrl.pathname;

  const redirectTo = (to: string) => {
    const target = request.nextUrl.clone();
    target.pathname = to;
    target.search = "";
    const redirect = NextResponse.redirect(target);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  };

  if (!signedIn && !matches(path, PUBLIC_PATHS)) return redirectTo("/welcome");
  if (signedIn && matches(path, SIGNED_OUT_ONLY)) return redirectTo("/");
  return response;
}
