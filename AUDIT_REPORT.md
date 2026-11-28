# Overnight audit report

**Branch:** `overnight-audit` (started from `main` at `e798a15`). Nothing was merged into `main`, published to your phone or deployed.
**Date:** 28 November 2026

## Summary

**Overall health: good.** The app is in much better shape than most at this stage.
- **Security:** every database table is protected by row-level security (people can only read and change what they're allowed to). There are no secret keys anywhere in the code or its history, and the GitHub automation is locked down.
- **Stability:** I opened all 36 screens in three situations (a normal account, a brand-new user with no trips or friends, and no internet) and nothing crashed.

The problems I found were mostly about the app being honest when something goes wrong (offline screens that looked like "not found" or "nothing here"), one real bug in the friends feed, a few accessibility and layout issues, and things that will matter as the app grows.

**What I fixed: 12 things, each in its own commit so you can undo any one of them.**
1. **Friends feed:** Home's friends feed could show strangers' trips (labelled "Someone") from any public profile. It now only shows people you're connected with.
2. **Offline, "not found":** a friend's trip, its postcard and a real profile said "not found" or "not available" when the real problem was no internet. They now say "Couldn't connect", with Try again.
3. **Offline, "looks empty":** Postcards and the travel map looked empty when offline. They now say they couldn't connect.
4. **Screen readers:** VoiceOver users couldn't reach the options in three bottom sheets.
5. **Placeholder contrast:** hint text in text boxes was too faint to read for many people.
6. **Colours:** two selected states were near-black instead of the app's olive.
7. **Long place names:** these pushed chips off the screen in Add a trip.
8. **Small phones:** row titles were cut off in Add a trip ("Who did you go wit…").
9. **Profiles:** trip postcards loaded every photo at once. They now load as you swipe.
10. **Privacy policy:** it didn't mention exact dates, tagged friends or public profiles.
11. **Dead code:** removed two unused functions.
12. **Deleting your account:** it now also clears what was stored only on the phone.

**Top 10 things still to fix**, in priority order (details in Section 2):
1. **(High) Phone-only data isn't tied to an account.** On a shared phone or iPad, the next person to sign in inherits the last person's saved friends' trips and setup answers.
2. **(High) The privacy policy is still a draft.** It needs a legal check, a contact email, and the companies that handle data, before launch.
3. **(High) The friends feed is built on the phone.** That won't scale to people who follow hundreds or thousands of others. It should be built on the server, a page at a time.
4. **(Medium) Saved friends' trips live only on the phone.** They're lost on a new phone or a reinstall.
5. **(Medium) Viewing someone else's profile is slow.** It asks for every one of their trip photos before showing anything.
6. **(Medium) Trip "posted" dates can be faked.** Someone using the database directly can set a future date and pin a trip to the top of friends' feeds. This needs a small database change.
7. **(Medium) No "you're offline" message.** Screens wait about 8 seconds before saying anything when there's no internet.
8. **(Medium) Only the scoring and search logic have automated tests.** Screens and saving don't.
9. **(Medium) The app's code is large (6.8 MB),** mostly built-in sample places and a 10,000-town list. Every update downloads it, and older phones start slower.
10. **(Low) "% of the world" counts England, Scotland and Wales separately.** It can count "UK" and "England" twice.

---

## Section 1: What I fixed

None of these are on your phone yet: they're on the `overnight-audit` branch. When you're happy, ask me to merge the branch and publish it. Then fully close and reopen COVA in Expo Go, and use the "How to test" steps below. To undo a single fix, ask me to revert its commit (the code next to each title).

### 1. Friends feed only shows people you're connected with (`1971352`)
- **What was wrong:** Home's "From your friends" asked the database for every trip that wasn't yours. The database also lets anyone read trips on public profiles. So as more people made their profiles public, your friends feed would fill with strangers' trips, shown as "Someone".
- **What I changed:** the feed now asks only for trips from people you follow or who follow you, and doesn't ask at all if you have none. You still see the example trips until friends post.
- **Files:** `src/lib/friendsFeed.ts`
- **How to test:** with a test account that follows a friend, Home should show only that friend's trips. A brand-new account should show the example trips.

### 2. "Couldn't connect" instead of "not found" on a friend's trip, postcard and profile (`9d5317b`)
- **What was wrong:** with no internet, a friend's real trip and its postcard showed "Lost in the post: we couldn't find that page", and a real person's profile said "This profile isn't available". Both look as if the trip or person had gone.
- **What I changed:** a failed connection now shows "Couldn't connect. Check you're online and try again." with a back button and a **Try again** button. "Not found" and "not available" are kept for things that really are missing, private or blocked.
- **Files:** `src/components/ui.tsx` (new shared `LoadFailed` screen), `src/lib/friendsFeed.ts`, `src/lib/profiles.ts`, `src/app/friend-trip/[id].tsx`, `src/app/postcard/[id].tsx`, `src/app/user/[id].tsx`
- **How to test:** turn on Airplane mode and open a friend's trip from Home. After a few seconds you should see "Couldn't connect". Turn Airplane mode off and tap Try again; the trip should load.

### 3. Postcards and the travel map say when they can't connect (`45a48b7`)
- **What was wrong:** offline, Postcards' "Your trips and followers" said nobody had liked or followed you yet, and the travel map showed "0 countries" and an empty map, as if you'd never travelled.
- **What I changed:** both now say "Couldn't connect…". Postcards has a Try again button; the map tries again when you reopen it. The unread number on Home's paper plane still fails quietly, as it should.
- **Files:** `src/lib/postcardsLive.ts`, `src/app/postcards.tsx`, `src/lib/travelPlaces.ts`, `src/app/map.tsx`
- **How to test:** in Airplane mode, open Postcards and the full travel map from You. Both should say they couldn't connect.

### 4. Screen readers can reach the options in three bottom sheets (`59dc3d7`)
- **What was wrong:** three sheets that slide up from the bottom wrapped everything inside one big "tap outside to close" button:
  - Save on a friend's trip;
  - "Who do you want to go with?" on your Want to go board;
  - a board's saved hotels and restaurants.

  iPhone's VoiceOver reads everything inside a button as a single item, so the whole sheet was just "Close", and its options couldn't be reached.
- **What I changed:** the dark backdrop is now its own Close button behind the sheet. It looks and works exactly the same for everyone else.
- **Files:** `src/components/TripActions.tsx`, `src/components/InviteSheet.tsx`, `src/app/list/[id].tsx`
- **How to test:** turn on VoiceOver (Settings → Accessibility → VoiceOver), open a friend's trip and tap Save. You should be able to swipe to "Save Hydra" and "Save Maya's trip" separately.

### 5. Easier-to-read hint text in text boxes (`be5af18`)
- **What was wrong:** the grey hint text inside boxes ("Describe your perfect trip", "Search a city…") had a contrast of 3.2:1, below the 4.5:1 that makes text readable for people with weaker eyesight.
- **What I changed:** it now uses the app's normal secondary text colour (5.3:1), still lighter than what you type.
- **Files:** `src/components/ui.tsx`
- **How to test:** Explore's search box hint should look a little darker.

### 6. Olive for selected choices on the map and "Save to a board" (`ae012c0`)
- **What was wrong:** everywhere else, a selected choice is olive. The travel map's All / Been / Want to go tab and the round ticks on "Save to a board" were near-black.
- **What I changed:** both are now olive.
- **Files:** `src/components/TravelMap.tsx`, `src/app/save.tsx`
- **How to test:** open the full travel map from You (the selected tab is olive), and tap "Save to a board" on a place page (the ticks are olive).

### 7. Long place names fit in Add a trip (`f221c80`)
- **What was wrong:** a very long place name (e.g. "Llanfairpwllgwyngyll…") made its chip run off the right of the screen, hiding the × that removes it.
- **What I changed:** chips now stay on screen. A long name shortens with "…" while the country stays readable, and the × has a bigger tap area (about 44 points, Apple's recommended minimum).
- **Files:** `src/components/trip/PlacePicker.tsx`
- **How to test:** in Add a trip, type a very long made-up place and tap "Use …". The chip should fit, with the × visible.

### 8. Row titles aren't cut off on small phones (`644bc36`)
- **What was wrong:** on a small phone, a row with its answer filled in got cut off, e.g. "Who did you go wit…  Family".
- **What I changed:** on narrow screens the answer moves under the title sooner.
- **Files:** `src/components/trip/TripForm.tsx`
- **How to test:** on a smaller iPhone (or with Display Zoom on), fill in "Who did you go with?". The title and the answer should both be fully visible.

### 9. Profile trip postcards load as you swipe (`90b4a13`)
- **What was wrong:** the trip postcards on You and on friends' profiles were all drawn at once, and each one with a photo asked the server for a private link straight away. Someone with 150 trips would send 150 requests just by opening You.
- **What I changed:** the row now draws about 4 postcards at first, and more as you swipe. Sorting, the year filter and tapping work as before.
- **Files:** `src/components/profile.tsx`
- **How to test:** on You, swipe through your trips. They should appear smoothly as you go.

### 10. Privacy policy covers the newer features (`f515de3`)
- **What was wrong:** the draft policy didn't mention optional exact trip dates, tagging friends on trips, or public profiles.
- **What I changed:** I added accurate lines for each, matching what the database actually enforces:
  - you can only tag people you follow who follow you back;
  - a tagged friend can remove themselves;
  - names show only to people who know them;
  - "Just me" trips stay private even on a public profile.
- **Files:** `src/app/privacy.tsx`
- **How to test:** Settings → Privacy policy.

### 11. Removed two unused functions (`88e4422`)
- **What was wrong:** an old Explore search (`searchExplore`, replaced by the current smart search) and a date helper (`shortMonth`) weren't used anywhere.
- **What I changed:** I removed both. Nothing in the app changes.
- **Files:** `src/lib/explore.ts`, `src/lib/months.ts`, `CLAUDE.md`
- **How to test:** nothing to see; the type check, linter, tests and phone build all pass.

### 12. Deleting your account also clears what was stored only on the phone (`f13f715`)
- **What was wrong:** "Delete account" removed everything on the server, but some things are kept only on the phone:
  - friends' trips you'd saved, and likes on example trips;
  - your first-time setup answers and score settings;
  - your departure city.

  These stayed behind, so anyone signing in on the same phone afterwards inherited them. That also contradicted the privacy policy ("deletes everything").
- **What I changed:** account deletion now clears these too. Signing out still keeps them; see Section 2, issue H1.
- **Files:** `src/lib/safety.ts`, `src/lib/reactions.ts`, `src/lib/startTaste.ts`, `src/lib/matchSettings.ts`, `src/lib/views.ts`
- **How to test:** use a throwaway test account only. Save a friend's trip, then Settings → Delete account. After signing up again on the same phone, Saved → Friends' trips should be empty.

---

## Section 2: What still needs fixing

Severity: **Critical** (fix now) · **High** (fix before launch) · **Medium** (fix soon) · **Low** (when convenient). I found nothing Critical.

### High

**H1. Data kept on the phone isn't tied to an account.** Size: **medium**
- **Problem:** friends' trips you save, likes on example trips, setup answers and score settings are stored on the phone for whoever is signed in. If someone signs out and another person signs in on the same phone (a family iPad, a tester's phone), the second person sees the first person's saved trips, and their scores are shaped by the first person's setup answers. Fix 12 handles account deletion, but not signing out.
- **Where:** `src/lib/reactions.ts`, `src/lib/startTaste.ts`, `src/lib/matchSettings.ts`, `src/lib/views.ts`
- **Suggested fix:** store each of these under the account's id (as the departure city already is), moving any existing values to the current account the first time. Better still for saved trips, see M1.

**H2. The privacy policy is still a draft.** Size: **small** (writing, not code)
- **Problem:** it says itself that it needs a legal check and a contact email. It also doesn't yet name the companies that handle data:
  - Supabase (database and log-in);
  - Expo (app updates);
  - Resend (emails).

  It also doesn't say how long data is kept.
- **Where:** `src/app/privacy.tsx`
- **Suggested fix:** have it checked by someone qualified before the app is public, then add those details.

**H3. The friends feed is assembled on the phone.** Size: **medium** (includes a database change)
- **Problem:** after fix 1, the phone first fetches everyone you know, then asks for their latest 30 trips. With hundreds or thousands of connections this request gets very long (it's capped at 500 people), and the feed can't load more than 30 trips or page further back.
- **Where:** `src/lib/friendsFeed.ts` (`fetchFriendsTrips`)
- **Suggested fix:** a database function that returns the feed a page at a time ("trips from people I follow, newest first, 20 after this one"), with an index on trips by owner and date.

### Medium

**M1. Saved friends' trips only exist on the phone.** Size: **medium** (database change)
- **Problem:** saving a friend's trip (Saved → Friends' trips) is stored only on that phone. It's lost on a new phone, a reinstall or after signing out and back in elsewhere.
- **Where:** `src/lib/reactions.ts`
- **Suggested fix:** a `saved_trips` table in the database, readable only by its owner.

**M2. Opening someone else's profile asks for all their trip photos first.** Size: **small–medium**
- **Problem:** a real person's profile signs a private photo link for every visible trip (up to 200) before anything shows, so a profile with many trips is slow to open and makes lots of requests.
- **Where:** `src/lib/friendsFeed.ts` (`fetchTripsOfPerson`), used by `src/app/user/[id].tsx`
- **Suggested fix:** sign each photo when its postcard appears (as your own trips now do after fix 9).

**M3. A trip's "posted" time can be set by the person posting it.** Size: **small** (database change)
- **Problem:** the database lets people choose a trip's `created_at` time when adding it directly (not through the app). Someone with technical knowledge could give a trip a date in the future to keep it at the top of their followers' feeds. The app itself never does this.
- **Where:** database permissions on `trips` (`supabase/migrations/…_trips.sql`)
- **Suggested fix:** a new migration that removes permission to set `created_at` and `id` (or forces `created_at` to now).

**M4. There's no general "You're offline" message.** Size: **medium**
- **Problem:** the database library retries for about 8 seconds before giving up, so with no internet screens show a spinner for a while before saying "Couldn't connect".
- **Where:** app-wide
- **Suggested fix:** a small "You're offline" bar at the top when the phone has no connection. Expo's network-status module works in Expo Go.

**M5. The app's code bundle is large (6.8 MB).** Size: **large**
- **Problem:** the built-in sample content (91 places with all their details), the hotel guide and a list of about 10,000 towns are compiled into the app. Every update downloads it, and it slows start-up on older phones.
- **Where:** `src/lib/placeDetails.ts`, `src/lib/worldPlaces.ts`, `src/lib/stayGuide.ts`, `src/lib/sample.ts`
- **Suggested fix:** move this content into the database (it needs to be there anyway once places are real), or load it only when needed.

**M6. Most of the app runs on sample content.** Size: **large** (product step)
- **Problem:** Explore, place pages, hotels and top picks all come from built-in sample data, not the database. To recommend "the right places for each person" across thousands of hotels, these need to come from a real, growing database.
- **Where:** `src/lib/sample.ts`, `src/lib/placeDetails.ts`
- **Suggested fix:** follow `docs/plan.md`'s real-data steps. This is the biggest piece of work ahead.

**M7. Automated tests cover only the logic, not the screens.** Size: **medium**
- **Problem:** the 60 tests check the scoring engine, search, the location blending and dates. Nothing automatically checks screens, saving trips or log-in, so a broken button would only be caught by clicking through.
- **Where:** `tests/`
- **Suggested fix:** add tests for the data layer (`trips.ts`, `boards.ts` with a stand-in database), plus a handful of screen tests or a scripted click-through of the main flows.

**M8. "% of the world" can over-count.** Size: **small**
- **Problem:** the countries list counts England, Scotland and Wales as separate countries. A trip saved as "UK" and another as "England" count twice. Places we don't recognise count too. The headline percentage is "out of 195 countries", so this inflates it.
- **Where:** `src/lib/trips.ts` (`visitedCountries`), `src/lib/countryInfo.ts`
- **Suggested fix:** for the percentage only, count the four UK nations as one country (the United Kingdom) and leave out unrecognised names. The list can still show England, Scotland and Wales.

### Low

**L1. Two small database hardening items.** Size: **small** (database change)
- A board item's `share_id` can be set to anything when adding it. It only matters if someone knew another person's id, but it's cleaner to set it only through the share function.
- The helper that adds new place names can be called directly. It only adds names visible to that person, so it's harmless, but a limit would stop spam.

**L2. GitHub automation housekeeping.** Size: **small**
- The workflows use pinned version tags rather than exact commit ids. That's safe enough, but exact ids are the gold standard.
- GitHub warns that Node 20 is being phased out.

**L3. iPad support is switched off for real builds.** Size: **small** (a decision)
- `app.json` has `supportsTablet: false`. That's fine in Expo Go, but an App Store build would run in iPhone mode on your iPad. Decide before the first real build.

**L4. Two places still use the old "oat milk" colour.** Size: **small** (a design decision)
- The splash screen background and the tab bar's tint use the old colour, while pages are now white. Change them if you'd like everything white.

**L5. The "When did you go?" wheels can miss a very quick change.** Size: **small**
- Scrolling the month and then the year within about a fifth of a second can drop the month change. It's rare, but the fix is simple.
- **Where:** `src/components/trip/WhenPicker.tsx`

**L6. Removing a place from a board has no undo.** Size: **small**
- Tapping × on a board's place removes it straight away. Consider a short "Removed. Undo" message.

**L7. Very long trip notes appear in very large text.** Size: **small**
- A 500-character note fills several screens in the big quote style on the trip page. Consider a smaller size for long notes.

**L8. Some deliberately kept unused code.** Size: **small**
- `TasteCard`, `TASTES` (for "Made for your taste") and `TONES` are unused but documented as kept on purpose. Tidy them up when you decide about that section.

**L9. Build-tool security warnings.** Size: **small** (wait)
- `npm audit` reports 10 "moderate" issues, all in Expo's command-line tool and ESLint (file-pattern matching), not in the app people install.
- `npm audit fix --force` would *downgrade* Expo to version 52 and break things, so don't run it. They'll go away with Expo's next routine update.

**L10. The travel map has no Try again button when offline.** Size: **small**
- After fix 3 it says it couldn't connect and tries again when you reopen it. A button like Postcards' would be nicer.

---

## Section 3: Notes

### Things that broke and were undone
None of the fixes broke the type check, linter, tests or phone build, so nothing had to be reverted. One fix needed a second pass before committing: for long place names, my first version squashed the country to "W…". I adjusted it so the country stays readable and the name shortens instead.

### Assumptions I made
- **Branch:** I pushed the `overnight-audit` branch to GitHub so the work is safe if this cloud session ends. I didn't open a pull request, merge into `main` or publish.
- **Friends feed:** "your friends" means people you follow **or** who follow you (accepted), matching how the rest of the app uses "people you know". If you'd prefer only people *you* follow, it's a one-line change.
- **Phone data:** deleting an account clears the phone-only data; signing out doesn't, so a person who signs out and back in keeps their saved trips. Making this per-account is H1.
- **Code I left alone:**
  - `TasteCard`, `TASTES` and `TONES`, because `CLAUDE.md` says to keep them.
  - The web preview's teal switch colour, because it's a web-only quirk and phones show olive.
- **Sample content:** I treated it as intentional and only flagged where it matters (M5, M6).

### What I couldn't check
- **Real phones:** I tested in a web browser at phone sizes (360, 390 and 430 points wide) with stand-ins for the database. I couldn't use a real iPhone or Android, so these still need checking by hand:
  - VoiceOver itself;
  - Apple Maps pins and gestures;
  - the location permission prompt;
  - the photo picker;
  - performance on an older phone.
- **The live database:** I checked its security by building an identical copy on this machine from the migration files and inspecting it. I didn't touch the real database or any real data.
- **Emails:** the log-in code emails weren't sent or received.
- **Scale:** I couldn't load-test with thousands of users. The scale notes (H3, M2, M5) come from reading the code and counting requests.

### How the audit was done
- **Checks:** type check, linter, 60 tests and the iOS/Android build, run before the first fix and after every fix.
- **Secrets:** scanned the code and all 316 commits in the history.
- **Database:** built from the migrations and inspected for tables without protection, open permissions and risky functions.
- **Screens:** all 36 crawled as a normal account, a brand-new user and offline, plus long-text and small/large-screen checks. Each fix was then clicked through, and every screen was crawled again at the end.

## Suggested order of work
1. **Before inviting more testers:** H1 (per-account phone data), then M1 (saved trips in the database). These go together.
2. **Before launch:** H2 (privacy policy legal check), M3 (posted-time permission), and L3 (decide about iPad).
3. **As people join:** H3 (server-side feed), M2 (lazy profile photos), M4 (offline bar).
4. **Quality:** M7 (tests for saving and log-in), M8 (world percentage), L5–L7 and L10 (small polish).
5. **The big one:** M6 and M5 (move sample places and hotels into the database). This also shrinks the app.
6. **Housekeeping, any time:** L1, L2, L4, L8, L9.
