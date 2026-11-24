# Postcard

Postcard is a holiday-rating **phone app**. Friends rate holiday **destinations** and **where they stayed** (hotel, Airbnb, villa and so on) out of 10, and add photos, food picks and top tips.

**Status:** an **Expo (React Native)** app. **Followers see each other's "Followers" trips** (Step C, Nov 2026), and Home's friends feed shows them. It switched from a Next.js website in Nov 2026, and the website is still in git history before that change. Real accounts work through Supabase (6-digit email code + age check). **Trips are real:** "Add a trip" (the **+** in the tab bar) saves to Supabase, and You and the trip page show your own trips with edit and delete. **Lists are real too:** Saved holds your "Want to go" list and lists you make, and You has a travel map of where you've been and want to go. **The look and layout follow the owner's design prototype** (Claude artifact "XYZX without planning", https://claude.ai/artifact/3BfDhqqSC7Dp16yq5iR8vc) and the build plan made from it ("XYZX: build plan from the preview", https://claude.ai/artifact/PyyNwD1ztjQaUSEZhujhgQ). Everything except your own trips and lists (Home's picks and Friends feed, Explore, place pages, Postcards) is **sample content from that prototype** in `src/lib/sample.ts` (40 places, each with details; 39 have a map, South Africa doesn't yet). The roadmap is in `docs/plan.md`.

**App name:** **COVA** (owner, 23 Nov 2026; before that ATLO, and the placeholder XYZX). It lives in **one place**, `src/constants/brand.json` (`appName`). Code uses `APP_NAME` from `src/constants/brand.ts`, and `app.config.ts` reads the same JSON for the name under the icon. Never type the app's name anywhere else. (The project was originally called "Postcard"; that's still the Expo `slug` and the repo's history, and the notifications feature is still called "Postcards".)

## Working with the owner

- The owner is **not technical**. Explain each step in plain English. When they need to do something on another website or app (Supabase, Expo, GitHub, the App Store), give exact click-by-click instructions.
- **Stop and ask before anything that costs money or can't be undone**: paid plans, Apple/Google developer accounts, deleting data or projects, force-pushing, sending real emails.
- Don't connect a service or add a paid one unless the current step in `docs/plan.md` calls for it and the owner has agreed.
- Work in small steps (one step of the plan per pull request), and say what to check when it's done.
- **Merging is autonomous** (owner's standing approval, 22 Nov 2026): once a pull request's checks all pass (tsc, lint, `npm test`, the phone export, and a click-through), Claude merges it itself (GitHub MCP `merge_pull_request`, merge method "merge") and publishes the EAS update, then tells the owner what changed and what to check. Don't wait for "merged".
  - **Exception: database changes.** If a pull request adds or changes anything in `supabase/migrations/`, stop and ask the owner before merging. After they say yes, merge, check the "Update Supabase database" job went green, then publish.
  - Everything in "Stop and ask" below still applies (money, deleting data, force-pushing, real emails).
- The GitHub repo is **public**. Never commit secrets. The Supabase **publishable** key in `src/lib/config.ts` is public by design (every installed app contains it). The Supabase **secret / service_role** key must never be in this repo or the app.

## Product rules (don't break these)

1. **Scores are out of 10 with one decimal place (8.8)** (owner's decision, Nov 2026): the trip's own score ("How was it?", a slider with a word like "Loved it") and, optionally, where you stayed. Always shown with one decimal (`formatScore`: 9.0, not 9). Words come from `scoreWord()` in `src/lib/score.ts`.
2. **Post when home, never live location.** A trip records the month of the trip, not the current place. Add a trip rejects future months (so does the database). (The "I'm back home" tick for this month was removed, owner Nov 2026.) Never add live or "I'm here now" location features. Photos are picked with `exif: false`, and GPS data must be stripped before anything is stored.
3. **Ages: 13+ to join, 18+ to go public.** (Owner's decision, Nov 2026.) Everyone gives a date of birth at sign-up, and anyone under 13 is refused. 13–17s get a private, friends-only profile: they can never switch it to public, and they don't appear in search or suggestions to people who aren't already their friends. This is enforced in the database (see below), not just in the app. Date of birth is private to its owner.
4. **Notifications are called "Postcards"** everywhere in the UI, never "notifications" or "alerts". They open from the paper-plane button at the top of Home (with the unread count), not a tab.
5. **Home is top picks, collections, then friends** (owner, 22 Nov 2026; the For you / Friends switch is gone): "Top picks for you" (your best matches you haven't been to or saved), "Dip into collections", then "From your friends" (what friends rated, newest first). Everything else lives in Explore.
6. **No trip planning.** The app is for rating trips you've been on, not planning future ones. Don't add itineraries, planning lists, bookings or future dates.

## Stack

- **Expo SDK 58**, React Native 0.88, React 19.3 and TypeScript (strict), with **Expo Router** (file-based screens in `src/app/`).
- Styling uses `StyleSheet` / inline styles with the tokens in `src/constants/theme.ts`. There is no Tailwind.
- Drawing (perforated stamp edges, the swash under accent words, icons) uses `react-native-svg`. Photo shades and placeholders use `expo-linear-gradient`; photos use `expo-image` (and `expo-image-picker` for picking).
- **Sample photos** live in `assets/photos/` and are **only the owner's own holiday photos** (`own-*.jpg`, EXIF/GPS stripped; the prototype's Unsplash photos were all removed, owner Nov 2026, so there are no photo credits). `src/lib/photos.ts` maps names to files; some prototype names point at the owner's files (`'bath-1'` → own-bath, `'maldives-1'` → own-maldives-beach, `'orlando-1'` → own-disney…; Longleat has no photo, as the giraffes are from South Africa). Sample places, stays, restaurants and feed posts with no photo of the owner's have `photo: null`: place headers and tiles show the blush-to-terracotta placeholder, feed posts the blush no-photo layout, sample friends their initials. Photo-led rows in Explore (Trending, Made for your taste and the Just for you feed) leave out anything without a photo; Home's top picks don't (owner Nov 2026: best matches first, photo or not; the stamp shows the name on the blush placeholder); collections need a cover (their own `photo` or a place with one). `photoForPlaceName()` (sample.ts) gives trips and board places the owner's photo for places without a page (`OWN_PLACE_PHOTOS`: Corfu, Dubai, Tenerife, Venice, Singapore, New York, Las Vegas (+ the Strip), San Francisco, the Whitsundays, Hamilton Island, Victoria Falls, Rottnest, Disney World, Avoriaz…). A place can have several (New York 6, Singapore 4, Algarve 3, Mallorca 3, Milan, Tenerife, Venice 2); `photoForPlaceName(name, seed)` picks one from the trip's or board item's id so trips to the same place differ. Paris's page also has the Louvre and Hôtel de Ville; "City breaks" uses Central Park as its cover. Add new owner photos as `own-<what>.jpg`, re-saved at 1000px with no EXIF. Never add stock or Unsplash photos.
- Fonts come from `@expo-google-fonts/fraunces` and `@expo-google-fonts/dm-sans`. Import each style from its own subpath (e.g. `@expo-google-fonts/fraunces/600SemiBold`) so only the styles used get bundled.
- **Supabase** (`@supabase/supabase-js`) handles accounts and profiles. The session is kept on the phone with `@react-native-async-storage/async-storage`.
- **Real maps:** `react-native-maps` (in Expo Go: Apple Maps on iPhone, no key) for a place's big "Map" view (`components/AreaMap.tsx`: Apple's `mutedStandard` style in dark (`userInterfaceStyle="dark"`, owner Nov 2026, on the page and full screen), Apple's own points of interest hidden, our numbered pins with name labels; `AreaMap.web.tsx` is a world-outline stand-in, as the library doesn't run on the web). Apple Maps can't be recoloured in Expo Go (custom map styles need Google Maps and a development build). Never show or ask for the user's location (rule 2): `showsUserLocation={false}`.
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
npm test             # matching engine + search tests: must pass before any PR
npx expo export --platform ios --platform android   # proves the phone bundles build
EXPO_TOKEN=proxy-injected npx eas-cli@latest update --branch preview --environment preview --message "…" --non-interactive
                     # publish to Expo Go (the owner's phone); see "Publishing to the owner's phone"
```

## Publishing to the owner's phone

The owner has **no computer**, only an iPhone (with Expo Go) and an iPad. Claude publishes with **EAS Update** from the cloud session:
- Expo project `@postcardapp/postcard`, in the **postcardapp** organisation (moved from the personal account lizandhaz on 21 Nov 2026 so testers can be invited as View only; a project can only be transferred four times). projectId in `app.json` → `extra.eas.projectId`, `runtimeVersion` policy `appVersion`, and the channel `preview` linked to the branch `preview`.
- The QR code in `docs/expo-go-qr.png` encodes `exp://u.expo.dev/9e899203-22d1-447f-babc-27279789d30a?runtime-version=1.0.0&channel-name=preview` and always opens the latest `preview` update.
- The cloud environment "travelapp-" allows expo.dev, api.expo.dev, u.expo.dev and exp.host, and injects the owner's Expo token for api.expo.dev. Set `EXPO_TOKEN=proxy-injected` (a placeholder; the proxy supplies the real one).
- **Testers:** the project is private ("hidden"). Invite people to the postcardapp organisation as **View only** (expo.dev → postcardapp → Settings → Members); they sign in to Expo Go with their own Expo account and scan the QR code. Log-in codes only reach the owner's email until a domain is verified in Resend, so a tester's app account uses a "+" alias of the owner's email and the owner passes the code on.
- After merging a change (Claude merges app-only pull requests itself; see "Working with the owner"), publish an update and tell the owner to fully close and reopen Postcard in Expo Go.
- Changing `version` in `app.json` changes the runtime version, which breaks the QR link. Update the QR code if you ever do.

## Folder map

```
app.json                  Icon, splash, plugins, Expo project link
app.config.ts             Adds the app name (from src/constants/brand.json) on top of app.json
assets/images/            App icon, splash, Android adaptive icons, favicon
assets/photos/            Sample photos: only the owner's own (own-*.jpg); no stock/Unsplash photos
assets/maps/              Illustrated place maps from the prototype, drawn to JPEG (now only the web stand-in; pin positions come from them)
src/
  app/                    Every file is a screen (Expo Router)
    _layout.tsx           Fonts, AuthProvider, Stack + Stack.Protected (signed in / signed out)
    welcome.tsx           Signed out: wordmark, Corfu photo stamp (the owner's own photo), "Where your friends loved staying", Join / Log in
    signup.tsx, login.tsx Join (name, email, date of birth) / Log in (email), then the 6-digit code
    (tabs)/_layout.tsx    Tab bar: Home, Explore, + (Add a trip), Saved, You
    (tabs)/index.tsx      Home: wordmark + Find friends and Postcards buttons; "Top picks for you" (big photo stamps with your score, sideways;
                          no text under them); "Dip into collections" (Explore's collection tiles); "From your friends" (FeedCard: big photo
                          with who, when they posted, month, place and score, or for a post without photos a blush top with the place in big
                          type, then their quote, stay, and Like / Comment / Save; opens as a postcard (postcard/[id] with the friend's trip id), owner Nov 2026. Real trips from people
                          you follow (lib/friendsFeed) replace the sample feed once there are any; the sample feed mixes photos/no photos on purpose). A thin line sits above "From your friends"
    (tabs)/explore.tsx    Explore (prototype layout): pinned search + filter chips (picking one, or searching, filters the feed and
                          jumps down to it), "Find your next trip" collection tiles (24, each opens its collection, no counts),
                          Trending this month, "Made for your taste" (chips + things to eat/do/stay, on a sage band; moved from Home),
                          and "Just for you": a long two-column photo feed (60 at a time, more as you scroll)
    (tabs)/add.tsx        The "+": Add a trip (components/trip/TripForm)
    (tabs)/saved.tsx      Saved ("Your boards"; lists are called **boards** in the UI, owner Nov 2026, though the code and database still
                          say boards/lists): your Want to go board and your own boards ("Made by you", + New board), and
                          Friends' trips you've saved (SavedTripCard grid)
    (tabs)/profile.tsx    You: profile picture (tap to change), Find friends / Add a trip buttons, stats, Your taste (plain outline tags, no
                          colours), Followers / Following / Requests counts (tap → people.tsx), travel map card (tap → map), "Your collections" (your lists + saved friends' trips, each opens; See all
                          → Saved), your trips as photo
                          stamps: Newest (default) / Oldest / Top rated, and a year filter
    list/[id].tsx         One board: cover (chosen photo, or a collage of its places) with the name, Share/Edit circles, places as a
                          2-column grid of photo cards (score stamp, "N saved spots", × to remove; tap → its saved hotels/restaurants
                          in a sheet with "Open <place>", or the place page); "Hotels, restaurants & more" for spots whose place isn't
                          on the board; on Want to go, "With Maya" and "+ Invite" under each place (InviteSheet); Add a place (opens a search sheet so the keyboard never hides the suggestions; "Cancel" closes it, never "Done"); Delete
    list/new.tsx          New board, or rename/cover/who-can-see with ?id=; cover photo picker (Collage, the board's places, a dozen
                          favourites); with ?place= (and kind/parent for a spot) it also adds that
    collection/[id].tsx   One Explore collection (places or things) as a 2-column grid, best for you first
    map.tsx               The full travel map: All/Been/Want to go, names on pins, pinch to zoom (iPhone), Whole world, place chips
    save.tsx              "Save to a board" from a place page (or a hotel/restaurant/thing to do's bookmark: ?kind=stay|eat|do|gem
                          &parent=<place>&parentSlug=): tick boards (Want to go first), + New board
    postcards.tsx         Postcards (sample), opened from Home's paper-plane button; ones about a friend's trip open postcard/[id],
                          the rest (the app's news, a friend joining) open the place
    people.tsx            People (real; followers & following, owner Nov 2026): search by name or @username with Follow / Follow back /
                          Requested / Following; tabs Followers / Following / Requests (?tab=); remove a follower, unfollow, accept or
                          decline (each asks once); Invite friends (share sheet with your @username)
    postcard/[id].tsx     Opened from Postcards (id = the Postcard's id) or the friends feed (id = the friend's trip id). A friend's trip as a postcard, titled "<who>'s <place> trip", the same template for everyone (components/
                          PostcardCard: photo front "Greetings from <place>" with their score as the postage stamp, top right; tap/"Turn over" for the back: the place, region and
                          month and a photo stamp,
                          then like a real postcard a line down the middle: their quote and top tip on the left; score + word, who
                          with, nights, where they slept (+ score), where they ate on the right). No personal messages and no
                          To/From lines (owner, Nov 2026). Anything not filled in is left out and the card rearranges: no words →
                          a big photo on the left (or details full width), no photos → no front: the whole trip (the back) shows
                          straight away, with no Turn over (owner disliked the olive-orange stand-in), and the back's
                          content sets the card's height. Then Like / Comment / Save, big photos, "See <who>'s whole trip" and "More about <place>"
    person/[who].tsx      A sample friend's profile (owner Nov 2026; lib/samplePeople.ts): face/initials, name, @handle · home town, "Follows you",
                          bio, Follow/Following (local only), stats tiles (Trips, Countries, Of the world), Followers/Following counts,
                          their travel map (TravelMapCard title + open={false}), then Trips / Boards / Followers / Following tabs (trips open
                          friend-trip/[id]; boards are Want to go + one themed board with place chips; people open their profile).
                          Linked from friends' avatars on feed cards, place pages' "What friends said" (FriendName), friend-trip and postcard
                          pages ("See <who>'s profile"). Place pages also show "See <who>'s trip →" (FriendTripLink) under each friend's quote
    friend-trip/[id].tsx  A friend's trip (sample id "maya-hydra", or a real trip's id via useFriendTrip): their score, who with, nights, quote, photos,
                          where they stayed, where they ate, what they did, their tips, "More about <place>"
    settings.tsx          Settings (public-profile note, Your scores: switches for my trips / saved places / friends' scores / places
                          I look at, clear viewed places, sign out), opened from You
    place/[slug].tsx      A sample place: photo, one-tap "Want to go" (on the photo and under the score), score, On the map, best time, what friends said, where to stay/eat, things to do,
                          culture and top tips, "I've been" (opens Add a trip with the place filled in)
    trip/[id]/index.tsx   One of your trips (title sized with fitWordSize/fitLines beside the stamp); at the bottom a "More about <place>" card with
                          the place photo (when it has a page), then Share (terracotta, share icon) and Edit (outline, pencil) side by side, and a quiet
                          "Delete trip" text link (owner, Nov 2026: four stacked full-width buttons looked heavy). Share (lib/share.ts tripShareText: place, month, score, who/nights, note, stay,
                          restaurants, tip as plain text; never a location or link), Edit and Delete (confirm first)
    trip/[id]/edit.tsx    Edit a trip (same TripForm, prefilled)
    +not-found.tsx        "Lost in the post"
  components/
    ui.tsx                Screen, PageTitle, SectionHeader, IconCircle, BackButton, Button (dark/accent/outline, optional icon),
                          Input (optional icon), Field, Chip, Segmented, Card (tone: white/blush/sage/sky), Notice, ErrorNotice
    Text.tsx              All text goes through <Text variant="…"> (fonts + colours). A bigger fontSize without a
                          lineHeight gets lineHeight ≈ 1.28× automatically, so big numbers aren't clipped on iPhone
    AccentTitle.tsx       Heading with one italic word and a terracotta swash ("Where did *you* go?")
    Wordmark.tsx          The app name in spaced serif capitals + terracotta star, and the tagline
    ScoreStamp.tsx        Score in a perforated stamp: ink on blush (or white on olive for a stay)
    Photo.tsx             PhotoFill, Shade, PhotoTile (rounded photo), PhotoStamp (photo in a perforated frame)
    MonthPill.tsx         Tilted outline pill with a trip month ("JUN 2026")
    Avatar.tsx            Face photo or initials
    cards.tsx             Row, TrendCard, PlaceCard, TasteCard, FeedCard, BoardTile, PhotoBadge, SavedTripCard
    explore.tsx           CollectionTile, ItemCard, sorting helpers (used by Explore and collection pages)
    lists.tsx             ListCover (photo collage), PlaceThumb, WishStar, WantToGoButton, photoForItem, placeSlugForItem
    TravelMap.tsx         TravelMapCard (You: calm map zoomed to your places, pins only, one-line key, tap to open) and
                          TravelMapFull (map screen: names placed so they don't overlap, filters, pinch zoom, place chips)
    place.tsx             Place page pieces (stay/eat/do cards have a bookmark to save that spot to a board under its place): YourScore, PlaceFacts (Best time / Stays as plain text, no boxes), PlaceMapSection
                          (on the page: the real map itself, interactive (pinch, drag, tap a pin to open it in the key) + the numbered
                          key with your score for each spot, tap for why; tap the map or "Full screen" for the big real map (zoom from the street to the world) +
                          "Where are you staying?" (typing only; picks the stay once one name matches) → "Near <stay>": the rest
                          nearest first, Right nearby / A short way / Further out. The drawn maps are no longer shown on phones
                          (owner, Nov 2026); they're only the web stand-in), BestTimeChart, SaidList, StayRow, EatRow, DoRow, MoreAbout
    AreaMap.tsx           The real map of a place (Apple Maps, mutedStandard; numbered pins with name labels; `preview` = still, tap to
                          open). AreaMap.web.tsx shows the drawn map instead, as react-native-maps doesn't run on the web
    TripActions.tsx       Like (heart + count), Comment (sheet with comments and a box to add yours) and Save (a sheet: "Save <place>"
                          → save.tsx, or "Save <who>'s trip" → Saved → Friends' trips; the bookmark fills when the trip is saved) for a
                          friend's trip; on feed cards and the friend's trip page
    TabBar.tsx            Tab definitions + tab button look (used by (tabs)/_layout.tsx)
    Icons.tsx             Line icons (home, compass, plus, heart, person, search, send, sliders, image, lock, back)
    CodeEntry.tsx, DateOfBirth.tsx, AuthFrame.tsx   Join / log-in pieces
    trip/TripForm.tsx     Add/edit a trip (owner Nov 2026: tidy rows you tap into): the place; one card of rows (When, How long (required),
                          Who with), each showing your answer and opening its own page that slides up (SheetRow; picking a chip closes it);
                          "How was it?" on blush (big centred score + slider); "Add more (optional)" rows that open pages with a "Save …"
                          button: photos (up to 6, hold one then drag to reorder; screen readers get Move left/right/Make cover), note,
                          where you stayed (score optional), other places, best restaurants (several, up to 10), top tip; a "Just me" switch; Save
    trip/PlacePicker.tsx  Search or type a place ("Sintra, Portugal" → name + country)
    trip/StayPicker.tsx   "Where you stayed": opens with "Popular in <area>" for the trip's place (lib/stayGuide via lib/knownStays:
                          Santa Cruz de Tenerife → Tenerife → Bahía del Duque, Abama…), each letter narrows it, matches elsewhere after;
                          tap one to fill the name and kind, or keep typing your own
    trip/NightsPicker.tsx "How long did you stay?": 1 night … two weeks, or "Longer…" (type up to 365)
    trip/MonthPicker.tsx  This month + last 6 months as chips ("Nov 2026"), or "Earlier…"
    trip/ScorePicker.tsx  "Slide to rate out of 10": 1.0–10.0 in 0.1 steps; accessibilityRole "adjustable"
    trip/TripCard.tsx     One of your trips as a photo stamp: the name on its own full-width line, the score under it (no "Loved it" word, owner Nov 2026)
  constants/theme.ts      Colours, fonts, radius, GUTTER (the only place for raw hex values)
  constants/brand.json    The app name ("COVA"); brand.ts exports APP_NAME. Sample text writes {app} for it (postcards.ts fills it in)
  lib/
    sample.ts             Sample content from the prototype: hero, rows, places, feed, board, boards, postcards
    photos.ts             Sample photo names → files
    placeMaps.ts          Each sample place's map picture and its numbered pins (stay / eat / do / hidden gem), each with `at`:
                          where its tip sits on the 400 × 250 picture (taken from the prototype's drawing); placeCentres: each
                          place's real latitude/longitude and how much area the real map shows first; pinLatLng(): a pin's ROUGH
                          real position from the drawing (owner chose rough over looking up ~340 places, Nov 2026; replace with
                          real coordinates in Step E)
    placeDetails.ts       Sample place details from the prototype (stays, food, things to do, best time, tips)
    score.ts              formatScore, clampScore, scoreWord
    fit.ts                fitWordSize(): a font size that keeps a place name's longest word on one line (Fraunces is wide,
                          wider on iPhone: 0.74 × size per letter), and fitLines(): one line per word and shrink-to-fit on iPhone, so a
                          word never breaks. Use both wherever a place name is in big type (owner Nov 2026: "Singapore" looked funny)
    trips.ts              Trip types, fetchMyTrips/fetchTrip/saveTrip/deleteTrip/fetchPlaces, photo upload + signed URLs
    boards.ts             Lists: fetchBoards/fetchBoard/createBoard/ensureWishList/updateBoard/deleteBoard,
                          addToBoard/removeFromBoard, findOnBoard, shareBoard (phone share sheet)
    geo.ts                Rough map positions for popular places (country middle as fallback) + toMap()
    worldMap.ts           The world outline for the travel map (from the prototype, 360 × 158)
    useTripPhoto.ts       Hook: a signed URL for one of your photos (trip photos and profile picture)
    knownPlaces.ts        ~525 popular holiday places + countries + WORLD_PLACES: suggestions, countryOf(), plain()
    worldPlaces.ts        Generated: ~10,400 towns/cities with positions (GeoNames, CC BY 4.0; credited in Settings)
    tripQuery.ts          Explore's search (pure, tested in tests/tripQuery.test.mjs): parseTripQuery() reads "beach in February",
                          "romantic weekend", "winter sun", "no flying", "cheap", "Greece" into months/warmth/holiday types/who/short/
                          no-fly/budget/place words; searchPlaces() ranks places (more than half of what was asked; reasons like
                          "27° in February"). explore.ts searchTrips() feeds it the sample places; Explore shows "Best matches" + "Looking for …"
    explore.ts            Explore's collections (worked out from place details: "Sunshine in <month>" from monthly temps,
                          Island escapes, Holiday without flying, Good value…), things gathered from every place, exploreFeed()
                          (the prototype's board first, then every other place, stay, restaurant, thing to do and gem)
    travelPlaces.ts       beenPlaces/wishPlaces (your map's places) + useTravelPlaces() for the map screen
    useWantToGo.ts        Hook: is a place on your Want to go list, and toggle() it in one tap
    match.ts              The matching engine (pure, tested in tests/match.test.mjs): profile, fit, % match, score, reasons
    placeFeatures.ts      Places in the engine's terms (holiday types, position, warmth, who it suits, base rating)
                          + the sample friends' ratings
    taste.tsx             TasteProvider/useTaste(): your profile from trips + lists, rebuilt on tasteChanged()
    tasteEvents.ts        tasteChanged()/onTasteChanged(): saveTrip/deleteTrip, list changes and new views call it
    views.ts              Place pages you've looked at: recordPlaceView, fetchPlaceViews, clearPlaceViews, on/off setting
    matchSettings.ts      What scores may use (trips, saves, friends; stored on the phone): getMatchSettings/setMatchSetting
    samplePeople.ts       Example profiles for the six sample friends: getPerson, personHref, tripsOf, statsOf, boardsOf (Want to go +
                          a board themed on the holidays they take most), followers worked out from who follows whom
    friendTrips.ts        Sample friends' trips from the Friends feed or the place details naming that friend (getTrip, getFriendTrip,
                          tripId, companionsLabel); who-with and nights are sample values and may be null (not filled in)
    postcards.ts          Sample Postcards, each linked to the friend's trip it's about (postcards, getPostcard)
    friends.ts            Followers & following: searchPeople, fetchFollows (followers / following / requests / sent), mutuals,
                          follow, unfollow, acceptFollower, removeFollower, inviteFriends
    InviteSheet.tsx       (components) "Who do you want to go with?": pick mutual follows → share_wish_item
    friendsFeed.ts        Real trips from people you follow (Step C): fetchMyPeople (my_people()), fetchFriendsTrips, feedItemFor,
                          useFriendTrip(id) (sample or real), postedAgo
    reactions.ts          Likes, comments and saved friends' trips: sample counts + yours, kept on the phone (useReactions, toggleLike,
                          addComment, toggleSavedTrip, useSavedTrips). Moves to the database when friends' real trips arrive
    share.ts              shareText() (phone share sheet; copies on web) and tripShareText(); boards.ts shareBoard uses it
    knownStays.ts         Stays for suggestions: the stay guide + the sample place details; searchStays(query, tripPlace, limit, tripCountry)
    stayGuide.ts          Hand-picked well-known stays (~1,280 hotels, villas, B&Bs, hostels, lodges) in ~250 holiday areas, each with
                          the towns in it, so a trip's place finds its area. Add areas here; names must be real places
    months.ts             "YYYY-MM" helpers (currentMonth, addMonths, longMonth, shortMonth, monthYear)
    config.ts, supabase.ts, auth.tsx, authActions.ts, age.ts   Accounts (see below)
supabase/migrations/      Database setup, as SQL files run in order (applied automatically on merge)
supabase/config.toml      Settings for the Supabase command-line tool (used by the GitHub job)
.github/workflows/supabase-database.yml   On merge to main: applies new database files to Supabase
.github/workflows/website.yml             On merge to main (website/** or brand.json): builds and publishes the landing page to GitHub Pages
website/                  The landing page (owner, Nov 2026): index.html (writes {{app}} for the capitals wordmark and {{appWord}} ("Cova") for the name in sentences, both filled from brand.json by build.mjs,
                          plus the public Supabase URL/key from src/lib/config.ts), img/ (the owner's own holiday photos, own-*.jpg, resized and re-saved so EXIF/GPS is stripped), favicon.png.
                          Light only, the app's oat milk + the owner's coastal palette (sage, dusty blue, champagne) + blush score badges.
                          The waitlist form calls join_waitlist(). The Boards section's chips (Want to go, Beach resorts, Winter sun, City breaks)
                          switch the moodboard's photos (a tidy 3 × 3 grid, 2 × 4 on phones). Examples on the page use made-up hotels/restaurants (never invented
                          scores for real businesses) and no photos of recognisable people. `node website/build.mjs` builds _site/
docs/plan.md              Step-by-step plan
```

## Accounts and database

- **Auth:** passwordless, using a **6-digit code by email** (`signInWithOtp`, then `verifyOtp({ email, token, type: 'email' })`). There are no links, because links are awkward in phone apps and email scanners can use them up. Sign-up sends `name` and `date_of_birth` (`YYYY-MM-DD`) as user metadata.
- **Supabase email templates** must show the code (`{{ .Token }}`). The owner sets this up (see `docs/plan.md`, Step 1).
- **Tables:** `profiles` (handle, name, is_public) and `profile_private` (date_of_birth, owner-only, never editable). Row Level Security is on for both.
  - The `handle_new_user` trigger creates the profile and **refuses anyone under 13**.
  - Another trigger refuses `is_public = true` under 18.
- **Trips** (`20261118120000_trips.sql`): `trips` (owner, trip_month = 1st of a month, score 1–10, visibility `friends`/`private`), `trip_stops` (position 0 = main place, then extra stops, optional nights 1–365), `stays` (name, type Hotel/Airbnb/Villa/B&B/Other, score 1–10), `food_picks`, `top_tips`, and `destinations` (shared place names).
  - **Followers can read** (Step C, `20261128120000_followers_see_trips.sql`): accepted followers see trips set to Followers (`visibility = 'friends'`) with their stops, stay, restaurants, tip, place names and photos; changes stay owner-only. See "Followers see trips and boards" below.
  - Save new and edited trips **only through `save_trip(p_trip jsonb)`**: one transaction, runs with the caller's permissions, and replaces the details on edit. The app calls it with `supabase.rpc('save_trip', { p_trip })`.
  - Places are added via the `destination_id_for()` helper (it tidies spaces and treats case as the same place). People only see the starting list plus places they've used, so private names like "Grandma's house" never leak.
  - A trigger refuses future months.
  - **Trip details** (`20261120120000_trip_details.sql`):
    - `trips.score` and `stays.score` are `numeric(3,1)`, 1.0–10.0. PostgREST may return them as strings, so the app wraps them in `Number()`.
    - `trips.companions` ("who you went with": `solo`/`partner`/`friends`/`family`) and `trips.note` (up to 500 characters). `created_at` is shown as "Added …".
  - **Photos and profile picture** (`20261121120000_photos_and_avatar.sql`): `trips.photo_paths text[]` (up to 6, the first is the cover; every path must be in the owner's folder via `paths_in_own_folder()`), replacing the earlier single `photo_path`. `profiles.avatar_path` (in the owner's folder; only that column is newly editable).
  - **Photo storage:** a private Storage bucket `trip-photos` (JPEG only, 5 MB max) holds trip photos and profile pictures (`avatar-…jpg`). Each person's files live at `<user id>/<name>.jpg`, and storage policies allow only their own folder. `uploadTripPhoto()` shrinks the photo to 1600px and re-encodes it with expo-image-manipulator, which drops EXIF/GPS (product rule 2), before uploading. Photos are shown through 1-hour signed URLs (`tripPhotoUrl`, `useTripPhoto`). Profile pictures are 800px. Replacing, removing or deleting deletes the old files.
- **Lists** (`20261122120000_boards.sql`): `boards` (owner_id, name 1–60, kind `wish` = the one "Want to go" list per person or `list`, visibility `friends`/`private`, updated_at kept fresh by triggers) and `board_items` (board_id, owner_id, optional `place_slug` for sample place pages, name, country; the same place can't be on a list twice, ignoring case and spaces). Owner-only RLS (friends read "friends" lists in Step C). Only name and visibility can be updated. Limits: 50 lists each, 300 places a list. The app makes the Want to go list the first time it's needed (`ensureWishList`). **Share** uses React Native's `Share` (text list), not a link.
- **Places and countries:** `src/lib/knownPlaces.ts` lists about 525 popular holiday places with countries, plus every country and ~10,400 towns and cities from `worldPlaces.ts` (generated from GeoNames via the `all-the-cities` package: cities over 100k, towns over 15k in Europe/the Mediterranean, capitals; CC BY 4.0, credited in Settings). Suggestions (`PlacePicker`) ignore accents and rank exact name, then starts-with, then word matches. `countryOf()` fills in the country for trips saved without one. Map positions: `geo.ts` (hand-picked places, then GeoNames towns, then the country's middle or capital).
- **Best restaurants** (`20261127120000_restaurants.sql`): a trip has up to 10 restaurants, in order, as `food_picks` rows with a `position`. `save_trip` takes `restaurants: string[]` (and still accepts the older single `meal` when `restaurants` isn't sent). The app's `Trip.restaurants` replaces `meal`. The same file makes `stays.score` optional (null = not rated).
- **How long you stayed** (`20261123120000_trip_nights.sql`): the main place (`trip_stops.position = 0`) must have nights (check constraint `main_stop_has_nights`, `NOT VALID` so older trips without nights still load; editing one asks for nights).
- **Changing the database:** add a new file in `supabase/migrations/` named `YYYYMMDDHHMMSS_what_it_does.sql` (never edit one that's already been applied). **Database updates are automatic:** when a merge to `main` touches `supabase/migrations/`, the GitHub Actions job `.github/workflows/supabase-database.yml` runs `supabase db push`, which applies new files in order, each once (tracked by Supabase's migration history). The owner no longer pastes SQL.
  - The job needs GitHub secrets `SUPABASE_ACCESS_TOKEN` and `SUPABASE_DB_PASSWORD`. The project id is in the workflow file. It can be started by hand from GitHub → Actions → "Update Supabase database" → Run workflow.
  - The first three migrations were pasted by hand, and the job marks them as applied (`supabase migration repair`) before pushing. `20261121120000_photos_and_avatar.sql` is written to be safe to run twice, in case it was pasted too.
  - **Order matters:** merge the pull request (database update) *before* publishing an app update that needs it, or the app will show "The latest database update hasn't been run". After merging, check the job went green (GitHub MCP `actions_list` / `get_job_logs`) before publishing.
  - Write migrations so they're safe if partly applied where reasonable (`if not exists`, `create or replace`).
  - Before merging, test every migration on a local Postgres with stand-ins for `auth.users`, `auth.uid()`, the `anon`/`authenticated` roles and (when needed) `storage.buckets`/`storage.objects`/`storage.foldername`, covering every rule, including the "should fail" cases.
- **Matching (your score out of 10)** — `src/lib/match.ts`, wired up in `taste.tsx`. **The app shows only scores out of 10, never a % match** (owner's decision, Nov 2026: one number is clearer). Fit and "match" still exist inside the engine for ordering.
  - **Two halves of taste, equal say:** *enjoyed* (your trips: 10 → +1, 6.5 → 0, 3.5 → −1; halves every 3 years; longer stays count a bit more) and *want next* (Want to go = 1.0 and other lists = 0.7, fading by half a year but never below 60%; list names like "Ski trips" via `tagsForListName`; place pages you look at, up to 0.5 each, halving every 45 days, 0.3× for places you've saved or been). So a long trip history can't drown out what someone's saving now.
  - **Fit (0–1)** from four parts, each blended 50/50 from the two halves where both know something: kind of holiday (holiday-type overlap, minus dislikes) 55%, near places (1,200 km falloff) 15%, warmth 15% (left out for ski places, which are judged in winter), company 15%. **Rare holiday types count more** (`tagRarity()` over the sample places, in `profile.tagWeights`: a type most places have, like food, counts half; ski or wildlife up to 2×). Places outside the samples get types from `KNOWN_TAGS` in placeFeatures.ts (~600 places, incl. ski resorts and beach towns), then name clues, then the country (who you've travelled with + who your saved places suit). Pulled towards neutral by confidence (`1 − e^(−evidence/1.5)`). Places you keep looking at get a direct lift (`interestLift`, up to +0.15 fit).
  - **% match** = 70 + (fit − 0.5) × 70, within 40–99. **Score** = base (Bayesian blend of the place's rating, worth 2 friends, and friends' ratings; friends who agree with you count up to 2×) + 3 × (fit − 0.5), within 1–10, levelling off above 9 (`softTop`: 10 → 9.6) so the best matches don't all read 10.0. Places you've been show your own score. "For you" order: `rankValue` = 0.6 × score + 0.04 × match. Home's top picks are new to you (not been, not saved).
  - **"Made for your taste" items and place-page stays/restaurants** get a score out of 10 judged on the item itself (`itemScore` / `stayScore`, via `tasteItemInfo`): the friend's score (or 7.6 if a friend recommends it, 7.2 if none has been), nudged at most about ±0.6 by how much that kind of thing stands out among your interests (food for cafés, culture for museums…) or, for stays, the kind of stay you rate well and your usual price. Their line says why ("Maya gave it 9.3", "Priya stayed and gave it 9.1", "Recommended by Tom", "New to your friends"), never a place you saved. "Picked for you" is ordered by the score shown.
  - **Reasons:** "Like Venice, which you gave 9.0", "Like La Digue on your Want to go list", "You've looked at it 4 times", "Maya gave it 9.1", company.
  - Every card reads scores through `useTaste()`, so Home, Explore, place pages (score card + "How we worked this out", stays/eats % match), lists and "Your taste" update after a trip, a save, or leaving a place page.
  - The React Compiler memoises values inside components, so per-profile caches live outside them (`resultsByProfile` WeakMap in taste.tsx). Don't create caches with `new Map()` inside a component.
  - `npm test` runs the engine's tests (Node's built-in runner, `--experimental-strip-types`, with `tests/register.mjs` + `hooks.mjs` so tests can load the real sample places). `tests/personas.test.mjs` checks a beach lover gets beaches/islands in their top 8, a skier ski resorts in their top 6, a city lover Paris and no tropical islands in their top 8. Keep these passing when tuning.
- **What scores use** (owner, Nov 2026): Settings → Your scores has a switch each for trips, saved places, friends' scores and the places you look at. `taste.tsx` leaves switched-off signals out; with friends off, no friend ratings, friend reasons or friend-based item scores are used (items say "Judged on your taste"), and `tasteNote` drops "plus your friends' ratings".
- **Friends** (`20261125120000_friends.sql`, now replaced by follows below): `friendships` (requester_id, addressee_id, status `pending`/`accepted`, one row per pair either way round). People can read and delete their own rows directly (cancel, decline, unfriend); sending and accepting only via `send_friend_request(p_user)` (accepts theirs if they'd already asked; refuses yourself, unknown people and under-18s; at most 200 pending) and `accept_friend_request(p_friendship)` (addressee only). `search_people(p_query)` (2+ characters, name contains or handle starts with, leaves out you and under-18s who aren't already your friends, says friends/sent/received/none) and `my_friendships()` return names and handles (security definer; `profiles` itself stays owner-only). Helpers `is_adult()` and `are_friends()` aren't callable by users. Profile pictures aren't shown to others yet (storage is owner-only), so people show initials. Next: friends see each other's "Friends" trips and lists, and the Friends feed shows them.
- **Followers, spots on boards, shared Want to go** (`20261126120000_follows_boards_sharing.sql`, owner Nov 2026):
  - `follows` (follower_id, followee_id, status pending/accepted; existing friendships were copied in: friends follow each other). Read/delete your own rows (unfollow, cancel, decline, remove follower); follow only via `follow_user(p_user)` (public account → accepted, otherwise pending; refuses yourself, unknown people, and under-18s who don't already follow you; at most 300 pending) and accept via `accept_follower(p_user)`. `search_people_follows(q)` (status following/requested/none + follows_you; under-18s only if a follow exists either way) and `my_follows()`. The old friendships table and functions are left in place, unused.
  - `board_items.kind` (place default, or stay/eat/do/gem) with `parent_name`/`parent_slug` (the place a spot is in); `boards.cover` (an app photo name; updatable with name and visibility). Taste and the travel map only use `kind = 'place'` (`placesOn`).
  - `board_items.share_id`: `share_wish_item(p_item, p_users[])` (your Want to go item; only people you follow who follow you back; up to 20) adds a copy to each person's Want to go with the same share_id; `my_shared_wishes()` gives the other names ("With Maya"). Removing yours leaves theirs.
- **Followers see trips and boards** (Step C, `20261128120000_followers_see_trips.sql`, owner Nov 2026): read-only SELECT policies so accepted followers see your Followers trips (+ trip_stops, stays, food_picks, top_tips, the destinations on them) and Followers boards (+ items), via security-definer helpers `i_follow()`, `can_see_trip()`, `can_see_board()`. Storage: `can_see_photo()` lets them open photos on those trips and the profile picture of anyone they follow or who follows them (accepted). `my_people()` gives names, handles and avatar paths of accepted follows either way. **Because of this, "my" queries must filter by owner**: `fetchMyTrips`, `fetchBoards` and `ensureWishList` use `.eq('owner_id', myUserId())` (lib/supabase.ts). `lib/friendsFeed.ts` loads followed people's trips for Home (newest first; the sample feed shows until there are any) and `useFriendTrip(id)` loads one (sample id or a real trip's uuid) for postcard/[id], friend-trip/[id] and Saved. Likes and comments are still kept on the phone.
- **Waitlist** (`20261129120000_waitlist.sql`): `waitlist` (email, unique ignoring case/spaces; source; created_at). RLS on with no grants or policies, so nobody can read or write it directly; signed-out visitors and users add an email only via `join_waitlist(p_email, p_source)` (security definer, checks the email, ignores repeats, at most 30 new sign-ups a minute). The owner reads it in the Supabase dashboard → Table Editor → waitlist.
- **Place views** (`20261124120000_place_views.sql`): `place_views` (owner_id + place_slug, views, seconds, first/last viewed). Owner-only: select and delete directly; recording only via `record_place_view(slug, name, country, seconds)` (security definer, own row only, at most 600 s a visit). The place page records a visit when you leave it (3 s minimum, `lib/views.ts`). Settings → Your matches: "Use the places I look at" (stored on the phone; off = nothing recorded or used) and "Clear the places I've looked at". Mention viewing history in the privacy policy (plan Step J).
- **Testing without Supabase access:** run `npx expo start --web`, and in Playwright use `page.route('https://<project>.supabase.co/**', …)` to stand in for `/auth/v1/otp`, `/auth/v1/verify` and `/rest/v1/...`. This exercises the real supabase-js code.

## Brand rules

The look follows the owner's prototype: **clean, warm and photo-led**. A warm oat-milk background, white rounded cards with thin borders, olive and terracotta pill buttons, big serif headings with one italic accent word, and photos framed like postage stamps. No airmail stripes or round postmarks any more.

### Colours (`src/constants/theme.ts` → `colors.*`)

From the owner's palette (Nov 2026): Oat Milk, Blush Petal, Terracotta Clay, Sage Whisper, Misty Sky, Olive Grove. The palette has no dark colour, so text and dark buttons use a deep olive charcoal.

| Token | Hex | Use |
|---|---|---|
| `bg` | `#f2ede2` | Page background (Oat Milk) |
| `card` | `#ffffff` | Cards, inputs, stamp frames |
| `line` | `#e2dacb` | Borders, dividers |
| `sand` | `#e6dccb` | Quiet fills, photo placeholders |
| `mapLand` | `#b9c3ad` | Dotted land on the travel map (light sage) |
| `ink` | `#353b2c` | Main text (deep olive charcoal) |
| `muted` | `#646858` | Secondary text, labels |
| `stamp` | `#e7b9b2` | Score stamps, the + sign (Blush Petal) |
| `sage` | `#a7b59c` | Soft tags (stay type) (Sage Whisper) |
| `sky` | `#b7c6d6` | Quieter months in the best-time chart (Misty Sky) |
| `accent` | `#c47a5c` | Terracotta Clay: swash under accent words, star, slider fill, large text only |
| `accentDeep` | `#a95d40` | "Save trip" / "I've been" buttons (white text passes contrast) |
| `accentText` | `#9a5236` | Small terracotta text: links, taglines, kickers |
| `olive` | `#636b51` | Olive Grove, a shade deeper so small text passes: stay score stamp, stay pins, Want to go / saved |
| `blushSoft` / `sageSoft` / `skySoft` | `#f6e1dc` / `#e2e8da` / `#e1e8f0` | Soft fills for cards and bands (`<Card tone="blush">`, `toneFill()`, `TONES` cycle) |
| `skyDeep` | `#5b7389` | Misty sky deep enough for white initials (avatars) |
| `gold` | `#b9975b` | Hidden-gem pins on place maps |
| `onDark` | `#faf7f0` | Text on photos and dark buttons |

Trips without photos use soft blush (`blushSoft`) with dark text (feed posts, saved-trip tiles, a friend's trip page); never the olive-to-terracotta gradient (owner disliked it). **Use plenty of colour** (owner, Nov 2026: "not enough colour"): selected chips, segmented switches and the tab bar's + and active tab are terracotta; dark buttons are olive; Explore's "Made for your taste" sits on a sage band; friends' feed cards are white with the stay on a sage strip; Trending rank badges (`PhotoBadge accent`) and the line under trend cards are terracotta; You's stats are three coloured tiles (Trips, Countries, % "Of the world" = countries / 195; no average score, owner Nov 2026); avatars without a photo use olive/terracotta/sky; place score card blush, place facts sky/blush; Saved's Want to go card blush. The owner tried and didn't want fully tinted feed cards or a band behind Explore's Trending (too much), nor all-plain (too little): keep this middle ground. Collection tiles show no count.

`accent` is too light for small text on `bg`. Use `accentText` for small text and `accentDeep` behind white text. The place maps in `assets/maps/` have their pins drawn in `olive`/`accent`/`ink`/`gold` (rendered from the prototype's SVGs with those colours swapped in); if those change, redraw the maps so the key still matches.

### Type (`fonts.*`, via `<Text variant>`)

- **Fraunces** for headings (`title` 32, `heading` 22, `subheading` 18), scores and quotes. **Fraunces Italic** for the accent word in `AccentTitle`.
- **DM Sans** for everything else.
- `label`: small uppercase letter-spaced muted text ("ADD A TRIP", "WHO CAN SEE THIS"). `kicker`: the same in terracotta (the tagline).
- Each weight is its own font family (e.g. `Fraunces-SemiBold`). Don't use `fontWeight` with custom fonts.

### Motifs

- **Wordmark**: the app name in wide-spaced serif capitals with a small terracotta four-point star, and the tagline "Picked by you and those you trust".
- **AccentTitle**: one italic word with a hand-drawn terracotta swash ("Your *trips*", "Find your *next* trip").
- **ScoreStamp**: every score sits in a small perforated stamp, dark ink on blush (white on olive for stays).
- **PhotoStamp**: hero photos and your trips in a white perforated frame with a dotted inner border.
- **MonthPill**: a trip month in a slightly tilted outline pill ("JUN 2026"). Never a current date or location.
- **App icon**: still the earlier red stamp with "P". The name is now COVA, so it needs redoing.

### Voice

Warm, short and British English ("holiday", "favourite"). No description lines under headings (owner's preference). Postal touches sparingly: "Postcards", "Lost in the post", "Check your inbox".

### Layout

Single column, 20px side padding (`GUTTER`). **Photo headers** (a trip, a friend's trip, a place, a board) stack the back button and the title in normal flow with a `minHeight`, never `position: 'absolute'` at the bottom of a fixed height: a long title then grows the header instead of running into the back button (owner, Nov 2026). The tab bar is **Home, Explore, a raised terracotta + (Add a trip), Saved, You**. Postcards open from Home's paper-plane button, and settings from You. Rows scroll sideways (`Row`). Screens use `<Screen tabBar>` so content clears the tab bar. On web the app is centred at 480px max. Light theme only.

## Conventions

- Shared UI goes in `src/components/`, and non-screen code in `src/lib/`. Only screens live in `src/app/`.
- Accessibility: give `accessibilityRole` / `accessibilityLabel` / `accessibilityState` on custom controls (tabs, score pickers, chips, checkbox), and labels on inputs and stamps.
- Before opening a PR, all of these must pass:
  - `npx tsc --noEmit`
  - `npx expo lint`
  - `npm test`
  - `npx expo export --platform ios --platform android`
  - click through the changed screens with `npx expo start --web` at phone width
