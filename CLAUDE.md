# Postcard

Postcard is a holiday-rating app. Friends rate holiday **destinations** and **where they stayed** (hotel, Airbnb, villa and so on) out of 10, and add photos, food picks and top tips.

This repo is currently a **clickable shell**: every screen works, but it all runs on sample data in `lib/data.ts`. There is no backend, no accounts and no saving yet. The roadmap is in `docs/plan.md`.

## Working with the owner

- The owner is **not technical**. Explain each step in plain English. When they need to do something on another website (Supabase, Vercel, Loops, GitHub), give exact click-by-click instructions.
- **Stop and ask before anything that costs money or can't be undone**: paid plans, deleting data or projects, changing DNS, force-pushing, sending real emails.
- Don't connect a service or add a paid one unless the current step in `docs/plan.md` calls for it and the owner has agreed.
- Work in small steps (one step of the plan per pull request), and say what to check when it's done.
- The GitHub repo is **public**. Never commit keys or passwords. Secrets go in `.env.local` (git ignores it) and in Vercel's environment variables. Only `NEXT_PUBLIC_` values may reach the browser, and the Supabase secret / service-role key never does.

## Product rules (don't break these)

1. **Scores are whole numbers out of 10.** There are two per trip: the destination and the stay. Averages show one decimal place.
2. **Post when home, never live location.** A rating records the month of the trip, not the current place. The Log form requires "I'm back home" and rejects future months. Never add live or "I'm here now" location features, and strip GPS data from photos before storing them.
3. **Public profiles are 18+ only.** Everyone gives a date of birth at sign-up. Under-18s can never switch their profile to public, and this must be enforced in the database, not just hidden in the UI. Date of birth is private to its owner.
4. **Notifications are called "Postcards"** everywhere in the UI, never "notifications" or "alerts".
5. **Home has two sides:** "For you" (picks based on your taste) and "Friends" (what friends rated, newest first).

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS 4**: configured in CSS (`app/globals.css`, `@theme`). There is no `tailwind.config.js`.
- Fonts are self-hosted via `@fontsource-variable/fraunces` and `@fontsource-variable/dm-sans`, imported in `app/layout.tsx`. No Google Fonts request at build or run time.
- Planned: **Supabase** (accounts, database, photo storage), **Vercel** (hosting), **Loops** (waitlist email). None are connected yet.

### Next.js 16 notes

The APIs differ from older Next.js versions, so check the docs that ship with the installed version in `node_modules/next/dist/docs/` before relying on memory.
- `params` and `searchParams` are **Promises**: `const { slug } = await params`.
- Middleware is now **`proxy.ts`** (not `middleware.ts`).
- Linting uses the ESLint CLI (`npm run lint` runs `eslint .`), with flat config in `eslint.config.mjs`. `next lint` no longer exists.

## Commands

```bash
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
  welcome/                Waitlist landing page (no tab bar)
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
docs/plan.md              Step-by-step plan from shell to real app
```

## Screens

| Route | Screen | Notes |
|---|---|---|
| `/welcome` | Waitlist landing | Email form shows a thank-you but sends nothing yet (Loops later). |
| `/` | Home | Tabs: **For you** (top pick + grid, from `forYouPicks()`) and **Friends** (feed of `RatingCard`s). |
| `/explore` | Explore | Search by name/country and filter by tag chips. |
| `/destination/[slug]` | Destination | Friends' average stamp, where friends stayed, food picks, top tips, all ratings. |
| `/rating/[id]` | Rating | Postcard layout: postmark (place + trip month), place stamp, review, photos, stay stamp, food, tips. |
| `/log` | Log a holiday | Place, country, month, destination score, stay name/type/score, headline, review, 3 food picks, 3 tips, photos, "I'm back home". Validates, then shows a preview. **Nothing is saved.** |
| `/postcards` | Postcards | Notification list with unread dots; the count shows on the tab bar. |
| `/profile` | You | Stats, public-profile setting (off; 18+ note), your ratings. |
| `/people/[handle]` | Friend profile | Same view as yours, without the settings. |

The signed-in person is faked as `ME = "sam"` in `lib/data.ts`.

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

## Conventions

- Server Components by default. Add `"use client"` only for interactivity (tabs, forms, search, nav highlighting).
- Shared UI goes in `components/`, and route-specific bits sit next to the route (e.g. `app/welcome/WaitlistForm.tsx`).
- Keep accessible markup: labelled inputs, `role="tab"`/`aria-selected` on tabs, `aria-label` on stamps and postmarks.
- Before opening a PR: `npm run build` and `npm run lint` must both pass, and click through the changed screens at phone width.
