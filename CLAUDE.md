# Postcard

Postcard is a holiday-rating app. Friends rate holiday **destinations** and **where they stayed** (hotel, Airbnb, villa and so on) out of 10, and add photos, food picks and top tips.

**Status:** clickable shell plus **real accounts** (Step 1 of `docs/plan.md`). Sign-up and log-in use Supabase email links with an age check. Everything else (ratings, friends, picks, Postcards) is still sample data in `lib/data.ts`, and the Log form doesn't save yet. The roadmap is in `docs/plan.md`.

## Working with the owner

- The owner is **not technical**. Explain each step in plain English. When they need to do something on another website (Supabase, Vercel, Loops, GitHub), give exact click-by-click instructions.
- **Stop and ask before anything that costs money or can't be undone**: paid plans, deleting data or projects, changing DNS, force-pushing, sending real emails.
- Don't connect a service or add a paid one unless the current step in `docs/plan.md` calls for it and the owner has agreed.
- Work in small steps (one step of the plan per pull request), and say what to check when it's done.
- The GitHub repo is **public**. Never commit keys or passwords. Secrets go in `.env.local` (git ignores it) and in Vercel's environment variables. Only `NEXT_PUBLIC_` values may reach the browser, and the Supabase secret / service-role key never does.

## Product rules (don't break these)

1. **Scores are whole numbers out of 10.** There are two per trip: the destination and the stay. Averages show one decimal place.
2. **Post when home, never live location.** A rating records the month of the trip, not the current place. The Log form requires "I'm back home" and rejects future months. Never add live or "I'm here now" location features, and strip GPS data from photos before storing them.
3. **Ages: 13+ to join, 18+ to go public.** (Owner's decision, Nov 2026.) Everyone gives a date of birth at sign-up, and anyone under 13 is refused. 13–17s get a private, friends-only profile: they can never switch it to public, and they don't appear in search or suggestions to people who aren't already their friends. Enforce this in the database, not just in the UI. Date of birth is private to its owner.
4. **Notifications are called "Postcards"** everywhere in the UI, never "notifications" or "alerts".
5. **Home has two sides:** "For you" (picks based on your taste) and "Friends" (what friends rated, newest first).

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS 4**: configured in CSS (`app/globals.css`, `@theme`). There is no `tailwind.config.js`.
- Fonts are self-hosted via `@fontsource-variable/fraunces` and `@fontsource-variable/dm-sans`, imported in `app/layout.tsx`. No Google Fonts request at build or run time.
- **Supabase**: connected for accounts and profiles (`@supabase/ssr`). Database, storage and the rest come in later steps.
- Planned: **Vercel** (hosting), **Loops** (waitlist email). Not connected yet.

### Next.js 16 notes

The APIs differ from older Next.js versions, so check the docs that ship with the installed version in `node_modules/next/dist/docs/` before relying on memory.
- `params` and `searchParams` are **Promises**: `const { slug } = await params`.
- Middleware is now **`proxy.ts`** (not `middleware.ts`).
- Linting uses the ESLint CLI (`npm run lint` runs `eslint .`), with flat config in `eslint.config.mjs`. `next lint` no longer exists.

## Commands

```bash
cp .env.example .env.local   # first time only, then fill in the two Supabase values
npm install       # first time only: downloads dependencies
npm run dev       # local preview at http://localhost:3000
npm run build     # production build: must pass before any PR
npm run lint      # code checks: must pass before any PR
npm start         # serve the production build
```

Node 20.9 or newer is required (developed on Node 22).

## Folder map

```
app/
  layout.tsx              Root: fonts, <html>, metadata
  globals.css             Brand tokens + stamp / airmail / paper-grain styles
  not-found.tsx           "Lost in the post" 404
  welcome/                Waitlist landing page (no tab bar), with Join / Log in links
  (auth)/                 Sign-up, log-in and email-link screens (no tab bar)
    actions.ts            Server actions: signUp, logIn, confirmLink, logOut
    signup/, login/       The forms (components/AuthForm.tsx)
    auth/confirm/         Email link lands here; the "Log me in" button verifies it
  auth/callback/          Fallback for Supabase's default email links (?code=)
  (app)/                  Every in-app screen; (app) is a route group, so it's not in the URL
    layout.tsx            Phone-width column + bottom tab bar
    page.tsx              Home: For you / Friends
    explore/              Search + filter destinations
    destination/[slug]/   A destination: friends' average, stays, food, tips, ratings
    rating/[id]/          One rating, shown as a postcard
    log/                  "Log a holiday" form (preview only for now)
    postcards/            Postcards (notifications)
    profile/              Your profile + public-profile (18+) setting
    people/[handle]/      A friend's profile
components/               Shared UI (see Brand rules below)
lib/data.ts               Sample data, types and helpers (forYouPicks, friendFeed, …)
lib/supabase/             Supabase clients: server.ts (pages/actions), proxy.ts (session refresh + redirects), env.ts
lib/profile.ts            getCurrentProfile(): the signed-in person's profile
lib/age.ts                ageInYears(), MIN_AGE_TO_JOIN (13), MIN_AGE_FOR_PUBLIC_PROFILE (18)
proxy.ts                  Next.js proxy: runs lib/supabase/proxy.ts before every page
supabase/migrations/      Database setup, as SQL files run in order
docs/plan.md              Step-by-step plan from shell to real app
```

## Screens

| Route | Screen | Notes |
|---|---|---|
| `/welcome` | Waitlist landing | Email form shows a thank-you but sends nothing yet (Loops later). Join / Log in links. |
| `/signup` | Join | Name, email, date of birth. 13+ checked here, on the server and in the database. Then "Check your inbox". |
| `/login` | Log in | Email only. Always says "check your inbox", so it never reveals who has an account. |
| `/auth/confirm` | Email link | "Log me in" button (a tap is needed so email scanners can't use up the one-time link). |
| `/` | Home | Tabs: **For you** (top pick + grid, from `forYouPicks()`) and **Friends** (feed of `RatingCard`s). |
| `/explore` | Explore | Search by name/country and filter by tag chips. |
| `/destination/[slug]` | Destination | Friends' average stamp, where friends stayed, food picks, top tips, all ratings. |
| `/rating/[id]` | Rating | Postcard layout: postmark (place + trip month), place stamp, review, photos, stay stamp, food, tips. |
| `/log` | Log a holiday | Place, country, month, destination score, stay name/type/score, headline, review, 3 food picks, 3 tips, photos, "I'm back home". Validates, then shows a preview. **Nothing is saved.** |
| `/postcards` | Postcards | Notification list with unread dots; the count shows on the tab bar. |
| `/profile` | You | Real name, handle and email; public-profile setting (18+ note); Log out. Ratings come in Step 2. |
| `/people/[handle]` | Friend profile | Same view as yours, without the settings. |

Signed-out visitors are sent to `/welcome` by `proxy.ts`. Only `/welcome`, `/signup`, `/login` and `/auth/*` are public. Home's greeting and You use the real profile. The sample content still treats `ME = "sam"` in `lib/data.ts` as "you".

## Brand rules

The look is **a vintage postcard**: warm card stock, fountain-pen ink, postage stamps, postmarks and airmail stripes. Friendly, a little nostalgic, never twee.

### Colours (`app/globals.css` → Tailwind classes like `bg-paper`, `text-ink`)

| Token | Hex | Use |
|---|---|---|
| `paper` | `#f6efe3` | Page background |
| `card` | `#fffbf4` | Cards, inputs, stamp backgrounds |
| `sand` | `#e8d9bf` | Borders, dividers, quiet fills |
| `ink` | `#1f2a44` | Main text, selected chips/tabs |
| `ink-soft` | `#5b6478` | Secondary text |
| `postbox` | `#b5392a` | Primary buttons, Log button, unread dots, kickers, scores under 6 |
| `airmail` | `#2f5d8a` | Links, postmarks, scores 6–7.9 |
| `sea` | `#3e7c7a` | Scores 8+, success |
| `sun` | `#e2a43b` | Food-pick tags, highlights (fill only, never text) |

Always use tokens, not raw hex values in components. The only exception is photo-placeholder gradients in sample data. Text colours above are chosen to pass WCAG AA on `paper` and `card`.

### Type

- **Fraunces** (`font-display`, serif) for headings (`h1`–`h3` automatically), scores, quotes and reviews. Italic Fraunces is for tips, quotes and asides.
- **DM Sans** (`font-sans`, the default) for everything else: body, labels, buttons.
- Small uppercase "kicker" labels above headings: `text-xs font-semibold uppercase tracking-[0.18em] text-postbox`.

### Motifs (in `components/`)

- **Stamp** (`Stamp.tsx`, `.stamp` in CSS): every score is a perforated postage stamp, coloured by score (8+ sea, 6–7.9 airmail, under 6 postbox), optionally tilted a few degrees. The label defaults to "/ 10" and can be "Place", "Stay" or "Friends".
- **Postmark** (`Postmark.tsx`): a round airmail-blue ink stamp with place and **trip month** around it and wavy cancellation lines. Used on a rating and its preview, never with a current date or location.
- **Airmail stripe** (`.airmail`): red/blue diagonal stripes as a thin top edge on cards and pages.
- **Paper grain** (`.paper-grain`): faint dot texture for big empty surfaces (welcome page).
- Photo placeholders (`Photo.tsx`) are gradients with an italic caption until real uploads exist.

### Voice

Warm, short and British English ("holiday", "favourite"). Postal puns sparingly: "Send postcard", "Lost in the post", "Your post".

### Layout

Mobile-first, a single column at `max-w-md`, 16px side padding (`px-4`) and a fixed bottom tab bar (Home, Explore, a centre **Log** button, Postcards, You). Light theme only for now.

## Accounts and database

- **Auth:** passwordless email links (`signInWithOtp`). Sign-up sends `name` and `date_of_birth` as user metadata, and a database trigger (`handle_new_user`) creates the profile, **refusing anyone under 13**.
- **Email links:** custom Supabase templates point to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`. Supabase's default links go via `/auth/callback?code=` and only work in the same browser.
- **Tables:** `profiles` (handle, name, is_public) and `profile_private` (date_of_birth, owner-only, never editable). Row Level Security is on for both. A trigger refuses `is_public = true` under 18.
- **Changing the database:** add a new numbered file in `supabase/migrations/` (never edit one that's already been run). The owner runs it in Supabase → SQL Editor. Before handing it over, test it on a local Postgres with stand-ins for `auth.users`, `auth.uid()` and the `anon`/`authenticated` roles, covering every rule, including the "should fail" cases.
- **Keys:** `.env.local` locally and Vercel environment variables online: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Never the secret key.
- Use `supabase.auth.getClaims()` (not `getSession()`) to check who's signed in on the server.

## Conventions

- Server Components by default. Add `"use client"` only for interactivity (tabs, forms, search, nav highlighting).
- Shared UI goes in `components/`, and route-specific bits sit next to the route (e.g. `app/welcome/WaitlistForm.tsx`).
- Keep accessible markup: labelled inputs, `role="tab"`/`aria-selected` on tabs, `aria-label` on stamps and postmarks.
- Before opening a PR: `npm run build` and `npm run lint` must both pass, and click through the changed screens at phone width.
