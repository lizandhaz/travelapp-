# Postcard

Postcard is a holiday-rating **phone app**. Friends rate holiday **destinations** and **where they stayed** (hotel, Airbnb, villa and so on) out of 10, and add photos, food picks and top tips.

**Status:** an **Expo (React Native)** app. It switched from a Next.js website in Nov 2026, and the website is still in git history before that change. Real accounts work through Supabase (6-digit email code + age check). **Trips are real:** "Add a trip" (the **+** in the tab bar) saves to Supabase, and You and the trip page show your own trips with edit and delete. **Lists are real too:** Saved holds your "Want to go" list and lists you make, and You has a travel map of where you've been and want to go. **The look and layout follow the owner's design prototype** (Claude artifact "XYZX without planning", https://claude.ai/artifact/3BfDhqqSC7Dp16yq5iR8vc) and the build plan made from it ("XYZX: build plan from the preview", https://claude.ai/artifact/PyyNwD1ztjQaUSEZhujhgQ). Everything except your own trips and lists (Home's picks and Friends feed, Explore, place pages, Postcards) is **sample content from that prototype** in `src/lib/sample.ts`. The roadmap is in `docs/plan.md`.

**App name:** the name is a placeholder, currently **XYZX**. It lives in **one place**, `src/constants/brand.json` (`appName`). Code uses `APP_NAME` from `src/constants/brand.ts`, and `app.config.ts` reads the same JSON for the name under the icon. Never type the app's name anywhere else. (The project was originally called "Postcard"; that's still the Expo `slug` and the repo's history, and the notifications feature is still called "Postcards".)

## Working with the owner

- The owner is **not technical**. Explain each step in plain English. When they need to do something on another website or app (Supabase, Expo, GitHub, the App Store), give exact click-by-click instructions.
- **Stop and ask before anything that costs money or can't be undone**: paid plans, Apple/Google developer accounts, deleting data or projects, force-pushing, sending real emails.
- Don't connect a service or add a paid one unless the current step in `docs/plan.md` calls for it and the owner has agreed.
- Work in small steps (one step of the plan per pull request), and say what to check when it's done.
- The GitHub repo is **public**. Never commit secrets. The Supabase **publishable** key in `src/lib/config.ts` is public by design (every installed app contains it). The Supabase **secret / service_role** key must never be in this repo or the app.

## Product rules (don't break these)

1. **Scores are out of 10 with one decimal place (8.8)** (owner's decision, Nov 2026): the trip's own score ("How was it?", a slider with a word like "Loved it") and, optionally, where you stayed. Always shown with one decimal (`formatScore`: 9.0, not 9). Words come from `scoreWord()` in `src/lib/score.ts`.
2. **Post when home, never live location.** A trip records the month of the trip, not the current place. Add a trip rejects future months (so does the database), and asks for "I'm back home" when the month picked is this month. Never add live or "I'm here now" location features. Photos are picked with `exif: false`, and GPS data must be stripped before anything is stored.
3. **Ages: 13+ to join, 18+ to go public.** (Owner's decision, Nov 2026.) Everyone gives a date of birth at sign-up, and anyone under 13 is refused. 13–17s get a private, friends-only profile: they can never switch it to public, and they don't appear in search or suggestions to people who aren't already their friends. This is enforced in the database (see below), not just in the app. Date of birth is private to its owner.
4. **Notifications are called "Postcards"** everywhere in the UI, never "notifications" or "alerts". They open from the paper-plane button at the top of Home (with the unread count), not a tab.
5. **Home has two sides:** "For you" (picks based on your taste) and "Friends" (what friends rated, newest first).
6. **No trip planning.** The app is for rating trips you've been on, not planning future ones. Don't add itineraries, planning lists, bookings or future dates.

## Stack

- **Expo SDK 58**, React Native 0.88, React 19.3 and TypeScript (strict), with **Expo Router** (file-based screens in `src/app/`).
- Styling uses `StyleSheet` / inline styles with the tokens in `src/constants/theme.ts`. There is no Tailwind.
- Drawing (perforated stamp edges, the swash under accent words, icons) uses `react-native-svg`. Photo shades and placeholders use `expo-linear-gradient`; photos use `expo-image` (and `expo-image-picker` for picking).
- **Sample photos** live in `assets/photos/` (from the prototype; all Unsplash, credited in `PHOTO_CREDITS` and shown at the bottom of Home). `src/lib/photos.ts` maps names (`'como-1'`) to the files; only photos the sample content uses are bundled.
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
EXPO_TOKEN=proxy-injected npx eas-cli@latest update --branch preview --environment preview --message "…" --non-interactive
                     # publish to Expo Go (the owner's phone); see "Publishing to the owner's phone"
```

## Publishing to the owner's phone

The owner has **no computer**, only an iPhone (with Expo Go) and an iPad. Claude publishes with **EAS Update** from the cloud session:
- Expo project `@lizandhaz/postcard` (projectId in `app.json` → `extra.eas.projectId`), `runtimeVersion` policy `appVersion`, and the channel `preview` linked to the branch `preview`.
- The QR code in `docs/expo-go-qr.png` encodes `exp://u.expo.dev/9e899203-22d1-447f-babc-27279789d30a?runtime-version=1.0.0&channel-name=preview` and always opens the latest `preview` update.
- The cloud environment "travelapp-" allows expo.dev, api.expo.dev, u.expo.dev and exp.host, and injects the owner's Expo token for api.expo.dev. Set `EXPO_TOKEN=proxy-injected` (a placeholder; the proxy supplies the real one).
- After merging a change, publish an update and tell the owner to fully close and reopen Postcard in Expo Go.
- Changing `version` in `app.json` changes the runtime version, which breaks the QR link. Update the QR code if you ever do.

## Folder map

```
app.json                  Icon, splash, plugins, Expo project link
app.config.ts             Adds the app name (from src/constants/brand.json) on top of app.json
assets/images/            App icon, splash, Android adaptive icons, favicon
assets/photos/            Sample photos from the design prototype (Unsplash)
src/
  app/                    Every file is a screen (Expo Router)
    _layout.tsx           Fonts, AuthProvider, Stack + Stack.Protected (signed in / signed out)
    welcome.tsx           Signed out: wordmark, Hydra photo stamp, "Where your friends loved staying", Join / Log in
    signup.tsx, login.tsx Join (name, email, date of birth) / Log in (email), then the 6-digit code
    (tabs)/_layout.tsx    Tab bar: Home, Explore, + (Add a trip), Saved, You
    (tabs)/index.tsx      Home: wordmark, search + Postcards buttons, For you (hero + rows) / Friends (feed)
    (tabs)/explore.tsx    "Describe your perfect trip" search, filter chips, collections, Trending this month, board
    (tabs)/add.tsx        The "+": Add a trip (components/trip/TripForm)
    (tabs)/saved.tsx      Saved: your Want to go list and your own lists (real), + New list
    (tabs)/profile.tsx    You: profile picture (tap to change), stats, Your travel map, your real trips as photo stamps (highest score first)
    list/[id].tsx         One list: its places (tap → place page), add a place, remove (×), Share, Edit, Delete (confirm)
    list/new.tsx          New list, or rename/who-can-see with ?id=; with ?place= it also adds that place
    save.tsx              "Save to a list" from a place page: tick lists (Want to go first), + New list
    postcards.tsx         Postcards (sample), opened from Home's paper-plane button
    settings.tsx          Settings (public-profile note, sign out), opened from You
    place/[slug].tsx      A sample place: photo, score, best time, what friends said, where to stay/eat, things to do,
                          culture and top tips, "I've been" (opens Add a trip with the place filled in)
    trip/[id]/index.tsx   One of your trips, with Edit and Delete (confirm first)
    trip/[id]/edit.tsx    Edit a trip (same TripForm, prefilled)
    +not-found.tsx        "Lost in the post"
  components/
    ui.tsx                Screen, PageTitle, SectionHeader, IconCircle, BackButton, Button (dark/accent/outline),
                          Input (optional icon), Field, Chip, Segmented, Card, Notice, ErrorNotice
    Text.tsx              All text goes through <Text variant="…"> (fonts + colours). A bigger fontSize without a
                          lineHeight gets lineHeight ≈ 1.28× automatically, so big numbers aren't clipped on iPhone
    AccentTitle.tsx       Heading with one italic word and a terracotta swash ("Where did *you* go?")
    Wordmark.tsx          The app name in spaced serif capitals + terracotta star, and the tagline
    ScoreStamp.tsx        Score in a perforated stamp: navy on peach (or white on teal for a stay)
    Photo.tsx             PhotoFill, Shade, PhotoTile (rounded photo), PhotoStamp (photo in a perforated frame)
    MonthPill.tsx         Tilted outline pill with a trip month ("JUN 2026")
    Avatar.tsx            Face photo or initials
    cards.tsx             Row, TrendCard, PlaceCard, TasteCard, PickCard, FeedCard, BoardTile, PhotoBadge
    lists.tsx             ListCover (photo collage), PlaceThumb, WishStar, photoForItem, placeSlugForItem
    TravelMap.tsx         "Your travel map": dotted world map, Been dots + Want to go stars, filter chips, place chips
    place.tsx             Place page pieces: PlaceFacts, BestTimeChart, SaidList, StayRow, EatRow, DoRow, MoreAbout
    TabBar.tsx            Tab definitions + tab button look (used by (tabs)/_layout.tsx)
    Icons.tsx             Line icons (home, compass, plus, heart, person, search, send, sliders, image, lock, back)
    CodeEntry.tsx, DateOfBirth.tsx, AuthFrame.tsx   Join / log-in pieces
    trip/TripForm.tsx     Add/edit a trip: place, month, slider score, who with, up to 6 photos, note, who can see it, "Add more detail"
    trip/PlacePicker.tsx  Search or type a place ("Sintra, Portugal" → name + country)
    trip/MonthPicker.tsx  This month + last 6 months as chips ("Nov 2026"), or "Earlier…"
    trip/ScorePicker.tsx  "Slide to rate out of 10": 1.0–10.0 in 0.1 steps; accessibilityRole "adjustable"
    trip/TripCard.tsx     One of your trips as a photo stamp
  constants/theme.ts      Colours, fonts, radius, GUTTER (the only place for raw hex values)
  constants/brand.json    The app name (placeholder "XYZX"); brand.ts exports APP_NAME
  lib/
    sample.ts             Sample content from the prototype: hero, rows, places, feed, board, boards, postcards
    photos.ts             Sample photo names → files
    placeDetails.ts       Sample place details from the prototype (stays, food, things to do, best time, tips)
    score.ts              formatScore, clampScore, scoreWord
    trips.ts              Trip types, fetchMyTrips/fetchTrip/saveTrip/deleteTrip/fetchPlaces, photo upload + signed URLs
    boards.ts             Lists: fetchBoards/fetchBoard/createBoard/ensureWishList/updateBoard/deleteBoard,
                          addToBoard/removeFromBoard, findOnBoard, shareBoard (phone share sheet)
    geo.ts                Rough map positions for popular places (country middle as fallback) + toMap()
    worldMap.ts           The world outline for the travel map (from the prototype, 360 × 158)
    useTripPhoto.ts       Hook: a signed URL for one of your photos (trip photos and profile picture)
    knownPlaces.ts        Popular places with countries: suggestions + countryOf()
    months.ts             "YYYY-MM" helpers (currentMonth, addMonths, longMonth, shortMonth, monthYear)
    config.ts, supabase.ts, auth.tsx, authActions.ts, age.ts   Accounts (see below)
supabase/migrations/      Database setup, as SQL files run in order (applied automatically on merge)
supabase/config.toml      Settings for the Supabase command-line tool (used by the GitHub job)
.github/workflows/supabase-database.yml   On merge to main: applies new database files to Supabase
docs/plan.md              Step-by-step plan
```

## Accounts and database

- **Auth:** passwordless, using a **6-digit code by email** (`signInWithOtp`, then `verifyOtp({ email, token, type: 'email' })`). There are no links, because links are awkward in phone apps and email scanners can use them up. Sign-up sends `name` and `date_of_birth` (`YYYY-MM-DD`) as user metadata.
- **Supabase email templates** must show the code (`{{ .Token }}`). The owner sets this up (see `docs/plan.md`, Step 1).
- **Tables:** `profiles` (handle, name, is_public) and `profile_private` (date_of_birth, owner-only, never editable). Row Level Security is on for both.
  - The `handle_new_user` trigger creates the profile and **refuses anyone under 13**.
  - Another trigger refuses `is_public = true` under 18.
- **Trips** (`20261118120000_trips.sql`): `trips` (owner, trip_month = 1st of a month, score 1–10, visibility `friends`/`private`), `trip_stops` (position 0 = main place, then extra stops, optional nights 1–365), `stays` (name, type Hotel/Airbnb/Villa/B&B/Other, score 1–10), `food_picks`, `top_tips`, and `destinations` (shared place names).
  - **Owner-only** for everything on trips, for now. Friends get read access in Step 3, for "Friends" trips only.
  - Save new and edited trips **only through `save_trip(p_trip jsonb)`**: one transaction, runs with the caller's permissions, and replaces the details on edit. The app calls it with `supabase.rpc('save_trip', { p_trip })`.
  - Places are added via the `destination_id_for()` helper (it tidies spaces and treats case as the same place). People only see the starting list plus places they've used, so private names like "Grandma's house" never leak.
  - A trigger refuses future months.
  - **Trip details** (`20261120120000_trip_details.sql`):
    - `trips.score` and `stays.score` are `numeric(3,1)`, 1.0–10.0. PostgREST may return them as strings, so the app wraps them in `Number()`.
    - `trips.companions` ("who you went with": `solo`/`partner`/`friends`/`family`) and `trips.note` (up to 500 characters). `created_at` is shown as "Added …".
  - **Photos and profile picture** (`20261121120000_photos_and_avatar.sql`): `trips.photo_paths text[]` (up to 6, the first is the cover; every path must be in the owner's folder via `paths_in_own_folder()`), replacing the earlier single `photo_path`. `profiles.avatar_path` (in the owner's folder; only that column is newly editable).
  - **Photo storage:** a private Storage bucket `trip-photos` (JPEG only, 5 MB max) holds trip photos and profile pictures (`avatar-…jpg`). Each person's files live at `<user id>/<name>.jpg`, and storage policies allow only their own folder. `uploadTripPhoto()` shrinks the photo to 1600px and re-encodes it with expo-image-manipulator, which drops EXIF/GPS (product rule 2), before uploading. Photos are shown through 1-hour signed URLs (`tripPhotoUrl`, `useTripPhoto`). Profile pictures are 800px. Replacing, removing or deleting deletes the old files.
- **Lists** (`20261122120000_boards.sql`): `boards` (owner_id, name 1–60, kind `wish` = the one "Want to go" list per person or `list`, visibility `friends`/`private`, updated_at kept fresh by triggers) and `board_items` (board_id, owner_id, optional `place_slug` for sample place pages, name, country; the same place can't be on a list twice, ignoring case and spaces). Owner-only RLS (friends read "friends" lists in Step C). Only name and visibility can be updated. Limits: 50 lists each, 300 places a list. The app makes the Want to go list the first time it's needed (`ensureWishList`). **Share** uses React Native's `Share` (text list), not a link.
- **Places and countries:** `src/lib/knownPlaces.ts` lists about 235 popular places with countries. It feeds place suggestions, and `countryOf()` fills in the country for trips saved without one (for the Countries stat and the trip page).
- **Changing the database:** add a new file in `supabase/migrations/` named `YYYYMMDDHHMMSS_what_it_does.sql` (never edit one that's already been applied). **Database updates are automatic:** when a merge to `main` touches `supabase/migrations/`, the GitHub Actions job `.github/workflows/supabase-database.yml` runs `supabase db push`, which applies new files in order, each once (tracked by Supabase's migration history). The owner no longer pastes SQL.
  - The job needs GitHub secrets `SUPABASE_ACCESS_TOKEN` and `SUPABASE_DB_PASSWORD`. The project id is in the workflow file. It can be started by hand from GitHub → Actions → "Update Supabase database" → Run workflow.
  - The first three migrations were pasted by hand, and the job marks them as applied (`supabase migration repair`) before pushing. `20261121120000_photos_and_avatar.sql` is written to be safe to run twice, in case it was pasted too.
  - **Order matters:** merge the pull request (database update) *before* publishing an app update that needs it, or the app will show "The latest database update hasn't been run". After merging, check the job went green (GitHub MCP `actions_list` / `get_job_logs`) before publishing.
  - Write migrations so they're safe if partly applied where reasonable (`if not exists`, `create or replace`).
  - Before merging, test every migration on a local Postgres with stand-ins for `auth.users`, `auth.uid()`, the `anon`/`authenticated` roles and (when needed) `storage.buckets`/`storage.objects`/`storage.foldername`, covering every rule, including the "should fail" cases.
- **Testing without Supabase access:** run `npx expo start --web`, and in Playwright use `page.route('https://<project>.supabase.co/**', …)` to stand in for `/auth/v1/otp`, `/auth/v1/verify` and `/rest/v1/...`. This exercises the real supabase-js code.

## Brand rules

The look follows the owner's prototype: **clean, warm and photo-led**. A warm off-white background, white rounded cards with thin borders, navy pill buttons, big serif headings with one italic accent word, and photos framed like postage stamps. No airmail stripes or round postmarks any more.

### Colours (`src/constants/theme.ts` → `colors.*`)

| Token | Hex | Use |
|---|---|---|
| `bg` | `#fbf9f5` | Page background |
| `card` | `#ffffff` | Cards, inputs, stamp frames |
| `line` | `#ece5db` | Borders, dividers |
| `sand` | `#e9dec8` | Quiet fills, photo placeholders |
| `mapLand` | `#d5c2a5` | Dotted land on the travel map |
| `ink` | `#13264a` | Main text, navy buttons, selected chips/tabs, the + button |
| `muted` | `#66708a` | Secondary text, labels |
| `peach` | `#f6b096` | Score stamps, the + sign |
| `mint` | `#96c7b8` | Soft tags (stay type, % match) |
| `terracotta` | `#cc754a` | Swash under accent words, star, slider fill, large text only |
| `terracottaDeep` | `#b05e37` | "Save trip" button (white text passes contrast) |
| `terracottaText` | `#a9552c` | Small terracotta text: links, taglines, kickers |
| `teal` | `#2e7a7d` | Stay score stamp |
| `onDark` | `#fffaf5` | Text on photos and navy |

`#cc754a` is too light for small text on `bg`. Use `terracottaText` for small text and `terracottaDeep` behind white text.

### Type (`fonts.*`, via `<Text variant>`)

- **Fraunces** for headings (`title` 32, `heading` 22, `subheading` 18), scores and quotes. **Fraunces Italic** for the accent word in `AccentTitle`.
- **DM Sans** for everything else.
- `label`: small uppercase letter-spaced muted text ("ADD A TRIP", "WHO CAN SEE THIS"). `kicker`: the same in terracotta (the tagline).
- Each weight is its own font family (e.g. `Fraunces-SemiBold`). Don't use `fontWeight` with custom fonts.

### Motifs

- **Wordmark**: the app name in wide-spaced serif capitals with a small terracotta four-point star, and the tagline "Picked by you and those you trust".
- **AccentTitle**: one italic word with a hand-drawn terracotta swash ("Your *trips*", "Find your *next* trip").
- **ScoreStamp**: every score sits in a small perforated stamp, navy on peach (white on teal for stays).
- **PhotoStamp**: hero photos and your trips in a white perforated frame with a dotted inner border.
- **MonthPill**: a trip month in a slightly tilted outline pill ("JUN 2026"). Never a current date or location.
- **App icon**: still the earlier red stamp with "P". Update it when the name is final.

### Voice

Warm, short and British English ("holiday", "favourite"). No description lines under headings (owner's preference). Postal touches sparingly: "Postcards", "Lost in the post", "Check your inbox".

### Layout

Single column, 20px side padding (`GUTTER`). The tab bar is **Home, Explore, a raised navy + (Add a trip), Saved, You**. Postcards open from Home's paper-plane button, and settings from You. Rows scroll sideways (`Row`). Screens use `<Screen tabBar>` so content clears the tab bar. On web the app is centred at 480px max. Light theme only.

## Conventions

- Shared UI goes in `src/components/`, and non-screen code in `src/lib/`. Only screens live in `src/app/`.
- Accessibility: give `accessibilityRole` / `accessibilityLabel` / `accessibilityState` on custom controls (tabs, score pickers, chips, checkbox), and labels on inputs and stamps.
- Before opening a PR, all of these must pass:
  - `npx tsc --noEmit`
  - `npx expo lint`
  - `npx expo export --platform ios --platform android`
  - click through the changed screens with `npx expo start --web` at phone width
