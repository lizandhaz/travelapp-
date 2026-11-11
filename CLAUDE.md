# Postcard

Postcard is a holiday-rating **phone app**. Friends rate holiday **destinations** and **where they stayed** (hotel, Airbnb, villa and so on) out of 10, and add photos, food picks and top tips.

**Status:** an **Expo (React Native)** app. It switched from a Next.js website in Nov 2026, and the website is still in git history before that change. Real accounts work through Supabase (6-digit email code + age check). Everything else (ratings, friends, picks, Postcards) is sample data in `src/lib/data.ts`, and the Log form doesn't save yet. The roadmap is in `docs/plan.md`.

## Working with the owner

- The owner is **not technical**. Explain each step in plain English. When they need to do something on another website or app (Supabase, Expo, GitHub, the App Store), give exact click-by-click instructions.
- **Stop and ask before anything that costs money or can't be undone**: paid plans, Apple/Google developer accounts, deleting data or projects, force-pushing, sending real emails.
- Don't connect a service or add a paid one unless the current step in `docs/plan.md` calls for it and the owner has agreed.
- Work in small steps (one step of the plan per pull request), and say what to check when it's done.
- The GitHub repo is **public**. Never commit secrets. The Supabase **publishable** key in `src/lib/config.ts` is public by design (every installed app contains it). The Supabase **secret / service_role** key must never be in this repo or the app.

## Product rules (don't break these)

1. **Scores are whole numbers out of 10.** There are two per trip: the destination and the stay. Averages show one decimal place.
2. **Post when home, never live location.** A rating records the month of the trip, not the current place. The Log form requires "I'm back home" and rejects future months. Never add live or "I'm here now" location features. Photos are picked with `exif: false`, and GPS data must be stripped before anything is stored.
3. **Ages: 13+ to join, 18+ to go public.** (Owner's decision, Nov 2026.) Everyone gives a date of birth at sign-up, and anyone under 13 is refused. 13–17s get a private, friends-only profile: they can never switch it to public, and they don't appear in search or suggestions to people who aren't already their friends. This is enforced in the database (see below), not just in the app. Date of birth is private to its owner.
4. **Notifications are called "Postcards"** everywhere in the UI, never "notifications" or "alerts".
5. **Home has two sides:** "For you" (picks based on your taste) and "Friends" (what friends rated, newest first).

## Stack

- **Expo SDK 58**, React Native 0.88, React 19.3 and TypeScript (strict), with **Expo Router** (file-based screens in `src/app/`).
- Styling uses `StyleSheet` / inline styles with the tokens in `src/constants/theme.ts`. There is no Tailwind.
- Drawing (stamps, postmarks, airmail stripes, icons) uses `react-native-svg`. Gradients use `expo-linear-gradient`, photos use `expo-image-picker` and `expo-image`.
- Fonts come from `@expo-google-fonts/fraunces` and `@expo-google-fonts/dm-sans`. Import each style from its own subpath (e.g. `@expo-google-fonts/fraunces/600SemiBold`) so only the styles used get bundled.
- **Supabase** (`@supabase/supabase-js`) handles accounts and profiles. The session is kept on the phone with `@react-native-async-storage/async-storage`.
- Every native module used must be one **Expo Go** includes, so the owner can test with Expo Go. Adding anything else needs a development build. Ask first.

### Expo notes

Expo changes a lot between SDK versions, so don't trust memory.
- Install packages with `npx expo install <pkg>` (it picks SDK-compatible versions). If Expo's servers are blocked, use `EXPO_OFFLINE=1 npx expo install <pkg>`, which reads the versions bundled with `expo`.
- Check APIs in `node_modules/<pkg>/build/*.d.ts` when the docs site isn't reachable.
- **Tabs** use `expo-router/ui` (`Tabs`, `TabSlot`, `TabList`, `TabTrigger`). The `<TabTrigger>`s must be written **directly inside `<TabList>` in `src/app/(tabs)/_layout.tsx`**, or the tabs silently do nothing. `Tabs` and `TabSlot` need `style={{ flex: 1 }}`, or on web the whole page scrolls and the tab bar floats.
- Signed-in vs signed-out screens use `Stack.Protected` with `redirectTo` in `src/app/_layout.tsx`.
- Element refs: use `ComponentRef<typeof TextInput>` (RN 0.88 types), not `TextInput` as a type.
- `app.json` → `web.output` is `"single"`, because AsyncStorage can't run during static rendering.
- `npx expo start` in CI mode (`CI=1`) doesn't watch files. Restart it after changes.

## Commands

```bash
npm install          # first time only
npx expo start       # dev server; scan the QR code with Expo Go
npx expo start --web # same app in a browser
npx tsc --noEmit     # type check: must pass before any PR
npx expo lint        # lint: must pass before any PR
npx expo export --platform ios --platform android   # proves the phone bundles build
```

## Folder map

```
app.json                  App name, icon, splash, plugins (image-picker permission text)
assets/images/            App icon, splash, Android adaptive icons, favicon (a red perforated stamp with "P")
src/
  app/                    Every file is a screen (Expo Router)
    _layout.tsx           Fonts, AuthProvider, Stack + Stack.Protected (signed in / signed out)
    welcome.tsx           First screen when signed out: pitch + Join / Log in
    signup.tsx            Name, email, date of birth → 6-digit code
    login.tsx             Email → 6-digit code (never reveals who has an account)
    (tabs)/_layout.tsx    Bottom tab bar: Home, Explore, centre Log button, Postcards, You
    (tabs)/index.tsx      Home: For you / Friends
    (tabs)/explore.tsx    Search + tag chips + destination grid
    (tabs)/log.tsx        Log a holiday (validates, then previews; doesn't save yet)
    (tabs)/postcards.tsx  Postcards (notifications)
    (tabs)/profile.tsx    You: real name/handle/email, public-profile note, Log out
    destination/[slug].tsx  Friends' average, where they stayed, food, tips, ratings
    rating/[id].tsx       One rating, laid out as a postcard
    people/[handle].tsx   A friend's profile
    +not-found.tsx        "Lost in the post"
  components/             Shared UI (see Brand rules)
    ui.tsx                Screen, Header, BackLink, Button, Input, Field, Chip, Card, Notice
    Text.tsx              All text goes through <Text variant="…"> (fonts + colours)
    TabBar.tsx            Tab definitions + tab button look (used by (tabs)/_layout.tsx)
    CodeEntry.tsx, DateOfBirth.tsx, AuthFrame.tsx   Join / log-in pieces
  constants/theme.ts      Colours, fonts, spacing (the only place for raw hex values)
  lib/
    data.ts               Sample data, types and helpers (forYouPicks, friendFeed, …)
    config.ts             Supabase URL + publishable key (public by design)
    supabase.ts           Supabase client (AsyncStorage session, auto-refresh while app is open)
    auth.tsx              AuthProvider / useAuth(): session, profile, signOut
    authActions.ts        requestSignUpCode, requestLogInCode, verifyCode
    age.ts                ageInYears(), MIN_AGE_TO_JOIN (13), MIN_AGE_FOR_PUBLIC_PROFILE (18)
supabase/migrations/      Database setup, as SQL files run in order
docs/plan.md              Step-by-step plan
```

## Accounts and database

- **Auth:** passwordless, using a **6-digit code by email** (`signInWithOtp`, then `verifyOtp({ email, token, type: 'email' })`). There are no links, because links are awkward in phone apps and email scanners can use them up. Sign-up sends `name` and `date_of_birth` (`YYYY-MM-DD`) as user metadata.
- **Supabase email templates** must show the code (`{{ .Token }}`). The owner sets this up (see `docs/plan.md`, Step 1).
- **Tables:** `profiles` (handle, name, is_public) and `profile_private` (date_of_birth, owner-only, never editable). Row Level Security is on for both.
  - The `handle_new_user` trigger creates the profile and **refuses anyone under 13**.
  - Another trigger refuses `is_public = true` under 18.
- **Changing the database:** add a new numbered file in `supabase/migrations/` (never edit one that's already been run). The owner runs it in Supabase → SQL Editor. Before handing it over, test it on a local Postgres with stand-ins for `auth.users`, `auth.uid()` and the `anon`/`authenticated` roles, covering every rule, including the "should fail" cases.
- **Testing without Supabase access:** run `npx expo start --web`, and in Playwright use `page.route('https://<project>.supabase.co/**', …)` to stand in for `/auth/v1/otp`, `/auth/v1/verify` and `/rest/v1/...`. This exercises the real supabase-js code.

## Brand rules

The look is **a vintage postcard**: warm card stock, fountain-pen ink, postage stamps, postmarks and airmail stripes. Friendly, a little nostalgic, never twee.

### Colours (`src/constants/theme.ts` → `colors.*`)

| Token | Hex | Use |
|---|---|---|
| `paper` | `#f6efe3` | Screen background |
| `card` | `#fffbf4` | Cards, inputs, stamp backgrounds |
| `sand` | `#e8d9bf` | Borders, dividers, quiet fills |
| `ink` | `#1f2a44` | Main text, selected chips/tabs |
| `inkSoft` | `#5b6478` | Secondary text |
| `postbox` | `#b5392a` | Primary buttons, Log button, unread dots, kickers, scores under 6 |
| `airmail` | `#2f5d8a` | Links, postmarks, scores 6–7.9 |
| `sea` | `#3e7c7a` | Scores 8+, success |
| `sun` | `#e2a43b` | Food-pick tags, highlights (fill only, never text) |

Text colours pass WCAG AA on `paper` and `card`.

### Type (`fonts.*`, via `<Text variant>`)

- **Fraunces** for headings (`title`, `heading`, `hero`), scores, reviews (`review`) and italic quotes and tips (`quote`).
- **DM Sans** for everything else: body, labels, buttons.
- `kicker` is small uppercase letter-spaced postbox red, used above headings.
- In React Native each weight is its own font family (e.g. `Fraunces-SemiBold`). Don't use `fontWeight` with custom fonts.

### Motifs (`src/components/`)

- **Stamp** (`Stamp.tsx`): every score is a perforated postage stamp (an SVG path with half-circle bites), coloured by score (8+ sea, 6–7.9 airmail, under 6 postbox), optionally tilted. The label defaults to "/ 10" and can be "Place", "Stay" or "Friends".
- **Postmark** (`Postmark.tsx`): a round airmail-blue ink stamp with place and **trip month** around it and wavy cancellation lines. Never shows a current date or location.
- **Airmail stripe** (`Airmail.tsx`): red/blue diagonal stripes as a thin top edge on cards and screens.
- **Photo** (`Photo.tsx`): gradient placeholders with an italic caption until real uploads exist.
- **App icon:** a cream background with a red perforated stamp, a Fraunces "P" and wavy lines.

### Voice

Warm, short and British English ("holiday", "favourite"). Postal puns sparingly: "Send postcard", "Lost in the post", "Your post", "Check your inbox".

### Layout

Single column, 16px side padding (`GUTTER`) and a bottom tab bar (Home, Explore, a raised centre **Log** button, Postcards, You). Screens use `<Screen tabBar>` so content clears the tab bar. On web the app is centred at 480px max. Light theme only for now.

## Conventions

- Shared UI goes in `src/components/`, and non-screen code in `src/lib/`. Only screens live in `src/app/`.
- Accessibility: give `accessibilityRole` / `accessibilityLabel` / `accessibilityState` on custom controls (tabs, score pickers, chips, checkbox), and labels on inputs and stamps.
- Before opening a PR, all of these must pass:
  - `npx tsc --noEmit`
  - `npx expo lint`
  - `npx expo export --platform ios --platform android`
  - click through the changed screens with `npx expo start --web` at phone width
