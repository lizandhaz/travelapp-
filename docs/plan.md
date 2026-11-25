# Postcard: from clickable shell to real phone app

Each step is small, ends with something you can tap and check, and becomes its own pull request. For each step you'll see:

- **You do**: things only you can do (accounts, clicking in other websites, decisions)
- **Claude does**: the code
- **Done when**: how you'll know it worked
- **Cost**: whether it's free, and when it might not be

💷 marks anything that could cost money. Claude will always stop and ask first.

---

## Step 0: Clickable shell ✅

Every screen works with made-up sample data.

## Step 0b: Switched to a phone app (Expo) ✅

In Nov 2026 Postcard moved from a website (Next.js) to a **phone app built with Expo**, so it can go in the App Store and Google Play later. Every screen was rebuilt for phones, in the same brand style. You can try it on your own phone with the free **Expo Go** app (see "Trying the app on your phone" below). The database setup from Step 1 carries over unchanged.

---

## Step 1: Join and log in (Supabase, email code, age check) ✅

**What it means:** people create an account with just their email. There are no passwords: Postcard emails them a **6-digit code** to type into the app. At sign-up they also give their name and date of birth. **Anyone 13 or over can join** (decided Nov 2026). Everyone starts with a private profile, and only people aged 18 or over will ever be able to make it public. The database itself enforces both age rules.

**Already done**
- ✅ Age decision: 13+ to join, 18+ for public profiles. Because 13–17s can use Postcard, UK rules for young users apply (the Children's Code and the Online Safety Act). Book a quick legal check before launch (see "Before inviting real users").
- ✅ Supabase project created, and its two public settings are in the app.
- ✅ Claude built:
  - **Join**: name, email, date of birth. Under-13s are refused by the app and again by the database.
  - **Log in**: email only. It always says "check your inbox", so it never reveals who has an account.
  - **Code screen**: type the code from the email. There's also "Send a new code" and "Change email".
  - **Log out** on You, plus your real name on Home and You.
  - When you're signed out, you only see Welcome, Join and Log in.
  - The database setup (`supabase/migrations/20261110120000_profiles.sql`): profiles, a private date-of-birth table only you can read and nobody can edit, and the 13+/18+ rules. All of it was tested on a local copy of the database.

**You do, in this order**

1. ✅ **Merge the pull request** on GitHub.
2. ✅ **Run the database setup in Supabase** (2 minutes). Done: the `profiles` and `profile_private` tables exist. Running it again shows `relation "profiles" already exists`, which is harmless and changes nothing.
   1. Open https://github.com/lizandhaz/travelapp-/blob/main/supabase/migrations/20261110120000_profiles.sql
   2. Click the **Copy raw file** button (two overlapping squares, top right of the file).
   3. In Supabase, click **SQL Editor** in the left sidebar → **New query**. Paste, then click **Run**.
   4. You should see **"Success. No rows returned"**. If you see a red error instead, copy it to Claude. Only run it once.
3. ✅ **Connect an email sender (Resend).** Supabase only lets you edit email templates once a custom sender ("SMTP") is set up. Done Nov 2026 with a free Resend account:
   - Supabase → Authentication → Emails → **SMTP Settings**: sender `onboarding@resend.dev`, name `Postcard`, host `smtp.resend.com`, port `465`, username `resend`, password = a Resend API key.
   - **Limit:** until Postcard has its own domain verified in Resend, emails only reach the address the Resend account was created with. 💷 A domain (about £10 a year) is needed before friends can join. Claude will ask first.
4. ✅ **Make the emails show a code** (5 minutes):
   1. In Supabase: **Authentication** → **Emails** (it may be called **Email Templates**).
   2. Open **Confirm signup**. Set the subject to `Your Postcard code` and replace the message body with:
      ```html
      <h2>Welcome to Postcard</h2>
      <p>Your code to finish joining is:</p>
      <p style="font-size:28px;font-weight:bold;letter-spacing:4px">{{ .Token }}</p>
      <p>Type it into the Postcard app. It works once, for about an hour.</p>
      <p>If you didn't ask to join Postcard, you can ignore this email.</p>
      ```
      Click **Save**.
   3. Open **Magic Link** (or **Magic link or OTP**). Set the subject to `Your Postcard log-in code` and replace the body with:
      ```html
      <h2>Log in to Postcard</h2>
      <p>Your log-in code is:</p>
      <p style="font-size:28px;font-weight:bold;letter-spacing:4px">{{ .Token }}</p>
      <p>Type it into the Postcard app. It works once, for about an hour.</p>
      <p>If you didn't ask for this, you can ignore this email.</p>
      ```
      Click **Save**.
5. **Try it on your phone** (see the next section), and go through the "Done when" list.

**Done when**
- You join with your email, type the code from the email, and land on Home saying "Hello" with your name.
- **You** shows your name, a handle like `@yourname1234` and your email. **Log out** takes you to Welcome, and logging back in with a new code works.
- A date of birth under 13 is refused with a kind message.

**Cost:** free. Supabase's free plan is plenty for building and testing. Two things to know:
- Free projects **pause after about a week with no activity**. Un-pause from the Supabase dashboard in one click.
- Supabase's built-in email sender only allows **a few emails per hour** across the whole project. If testing gets "We've sent a lot of emails…", wait an hour. 💷 Before real users arrive we'll set up a proper email sender (several have free tiers). Claude will ask first.

**Good to know:** you can't add people by hand in Supabase's **Authentication → Users** page, because the database refuses accounts without a date of birth. That's deliberate: everyone joins through the app.

---

## Trying the app on your phone (free) ✅ set up

Postcard is published to Expo Go from Claude's cloud computer, so **no computer is needed**: just an iPhone (or Android phone) with **Expo Go**, logged in to the Expo account **lizandhaz**.

**To open Postcard:** show `docs/expo-go-qr.png` on another screen (e.g. your iPad) and point your iPhone's **Camera** at it, then tap the banner. It always opens the **newest** published version. After the first time, Postcard also appears in Expo Go's list of recent projects.

**When Claude makes changes,** Claude publishes them (`eas update --branch preview`). Fully close Postcard in Expo Go and open it again to get the new version.

How it's set up (done in Nov 2026):
- Expo project **@lizandhaz/postcard**, with an update **channel and branch both called `preview`**.
- The link in the QR code is `exp://u.expo.dev/9e899203-22d1-447f-babc-27279789d30a?runtime-version=1.0.0&channel-name=preview`.
- Claude's cloud setup ("travelapp-" environment) is allowed to reach Expo, and holds your Expo access key as a saved secret. The key is not in the repo or chat. To revoke it: expo.dev → Account settings → Access tokens → delete.

**Alternative, with a computer:** download the repo ZIP from GitHub, install Node.js (nodejs.org, LTS), run `npm install` then `npx expo start` in the folder, and scan the QR code it shows.

---

## Step 2 (Step A in the build plan): Save a real trip ✅

**What it means:** the centre **Add** tab is now **"Add a trip"**: one simple screen with Where did you go?, When did you go?, How was it? (1–10 with a word), Who can see this? (Friends / Just me) and an optional photo (preview only for now). Under **Add more detail** you can add extra stops with nights, where you stayed (with its own score), your best meal and a top tip. Trips save to your database. **You** shows your real trips, highest score first, and each trip has its own page with **Edit** and **Delete**. The app's name is a placeholder, **XYZX**, kept in one place (`src/constants/brand.json`).

**Claude did**
- Database tables: `destinations`, `trips`, `trip_stops`, `stays`, `food_picks` and `top_tips`, plus a `save_trip` action that saves a whole trip in one go (`supabase/migrations/20261118120000_trips.sql`).
- Rules: only you can read, edit or delete your trips (friends come in Step 3). Scores are whole numbers 1–10, there are no future months, nights are 1–365, and places you type in stay private to you.
- Tested on a local copy of the database as two different people, including everything that should be refused, and with the exact trips the app sends.

**You do**
1. **Run the database setup in Supabase** (2 minutes):
   1. Open the file `supabase/migrations/20261118120000_trips.sql` on GitHub (Claude gives you the link).
   2. Click **Copy raw file** (two overlapping squares, top right).
   3. In Supabase: **SQL Editor** → **New query** → paste → **Run**.
   4. You should see **"Success. No rows returned"**. Run it once only. A second run says something "already exists", which is harmless.
2. **Try it on your phone** (see "Done when").

**Done when**
- You add a trip, it opens on its own page, and it's on **You**, still there after fully closing and reopening the app.
- Trips on **You** are sorted highest score first.
- **Edit** changes stick, and **Delete** (after "Delete this trip?") removes the trip.
- Someone else's account can't see your trips.

**Cost:** free.

---

## Step B: Match the design prototype. Code built ✅, your setup next

**What it means:** the app now looks and is laid out like your prototype ("XYZX without planning"):
- **Tabs:** Home, Explore, a navy **+** for Add a trip, Saved and You. **Postcards** open from the paper-plane button on Home, and **settings** from the button on You.
- **Home:** For you (the Lake Como hero, then Where's trending, Island escapes, Weekends away, One night away, Made for your taste and Picked for you) and Friends.
- **Explore:** search, chips, collections, Trending this month, and the photo board.
- **Saved:** your boards.
- **Your trips:** shown as photo stamps on **You**, with a new trip page.
- **Scores have one decimal place (8.8)**, set with a slider.
- **Sample content comes from the prototype; the photos are only your own** (the Unsplash photos were removed, Nov 2026). Only your own trips are real so far.

**Also in this step (Nov 2026):** each trip can now say **who you went with** (Solo, Partner, Friends, Family), have a **note**, and a **photo that's saved for real**. Photos are private to you, shrunk, and have location data removed before saving.

**You do**
1. **Run the trip-details update in Supabase** (1 minute): open `supabase/migrations/20261120120000_trip_details.sql` (Claude sends you the file or the link), copy all of it, then in Supabase go to **SQL Editor** → **New query** → paste → **Run**. You should see "Success. No rows returned". Run it once. It switches scores to decimals (8 becomes 8.0), adds who-with, note and photo, and creates the private photo store. There's nothing else to click.
2. Try it on your phone (fully close and reopen Expo Go).

**Cost:** free.

---

## Photos and profile picture. Code built ✅, your setup next

- Up to **6 photos per trip** (the first is the cover); the trip page shows them all.
- A **profile picture**: tap your initials on You. Remove it in Settings.
- Places like "Venice" or "Algarve" now know their country (search suggests "Venice, Italy"), so the Countries count is right even for trips saved without a country.
- Big numbers in stamps and on the slider no longer get cut off on iPhone.

**You do:** run `supabase/migrations/20261121120000_photos_and_avatar.sql` in Supabase (**SQL Editor** → **New query** → paste → **Run**, once). Existing trip photos are kept as each trip's first photo.

---

## Automatic database updates. Built ✅, one-time setup next

From now on, **merging a pull request also updates the database**. A GitHub job sends any new database files to Supabase, so there's no more pasting into the SQL Editor.

**One-time setup (about 10 minutes):** add two private settings in GitHub, `SUPABASE_ACCESS_TOKEN` (made in Supabase → Account → Access Tokens) and `SUPABASE_DB_PASSWORD` (the database password from when the project was created, or a new one from Supabase → Project Settings → Database → Reset database password). Add both in GitHub → the repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**. To see it working, open the repo's **Actions** tab after a merge: a green tick means the database is up to date.

---

## Lists and the travel map ✅

**What it means:** **Saved** is real. Everyone has a **Want to go** list, and you can make your own lists ("Summer 2027"), rename them, choose who can see them (Friends / Just me), add places (from any place page with **Save to a list**, or by typing a place on the list), remove places and delete lists. **Share** sends a list as a message through the phone's share sheet (Messages, WhatsApp, email). **You** has **Your travel map**: places from your trips (terracotta dots) and your Want to go list (teal stars), with All / Been / Want to go.

- Database: `supabase/migrations/20261122120000_boards.sql` (applied automatically when merged). Lists are owner-only for now; friends get to see "Friends" lists in Step C.
- Map positions are approximate (a dot on a small world map), from a built-in list of popular places, or the middle of the country otherwise. Never a live location.

---

## Trip length, more places, a nicer map ✅

- **How long did you stay?** is now required when adding or editing a trip (1 night to two weeks, or type up to 365). Older trips keep working; editing one asks for it.
- Place suggestions cover about 10,000 towns and cities worldwide plus every country and ~525 holiday spots, and ignore accents ("malaga" finds Málaga).
- The score slider no longer triggers the iPhone's swipe-back.
- One tap **Want to go** on every place page. The travel map zooms to your places, with names on the pins and "Whole world".

---

## Personal scores and matches ✅

Every score out of 10 and every % match is now worked out for you, in two equal halves: what you've enjoyed (your trips) and what you want next (Want to go, your lists and their names, and the place pages you keep looking at). Who you travel with, the stays you rated and your friends' ratings (friends who agree with you count more) count too. Browsing can be switched off or cleared in Settings. Add a trip or save a place and the numbers change straight away. Place pages say why ("Like Venice, which you gave 9.0") and have "How we worked this out". Home's top picture is your best match you haven't been to. Friends are still sample people until Step C; real friends plug straight in.

---

## Overnight audit (24–25 Nov 2026) ✅

Claude clicked through every screen with realistic made-up data and fixed the biggest gaps (pull requests #82–#85, all on Expo Go). The morning plan with details: "COVA Morning Plan" (https://claude.ai/artifact/9gGKFLrNLbYWcaqJoMKNHu).
- ✅ Explore search understands holiday searches ("beach in February", "romantic weekend no flying", "Greece", "ski", "cheap family holiday") and shows Best matches with reasons.
- ✅ Share with a friend on your trips (score, stay, restaurants, tip as a message; never a location or link).
- ✅ Trips without photos use your own photo of the place (Corfu, Dubai, Tenerife, Venice…) or a warm blush card, not grey.
- ✅ Your trip links to the place's page ("More about Lake Como"); long names fit beside the score stamp.
- **Waiting for your OK (database):** trips for "this month" can be refused for a few hours at the start of a month, because the database checks the month in UK winter time (GMT) while the phone uses local time. Fix: let the database allow the month of the date in the furthest-ahead time zone.
- **Found for later:** likes/comments/saved trips stay on one phone and Postcards are samples (Step H); places only the owner has photographed have no page and sample map pins are rough (Step E); restaurant cards reuse a few food photos (Step E); new people see the sample friends' feed until they follow someone (Step I); the app icon is still the old red "P".

## Next steps (from the build plan, one pull request each)

Each step's ready-made prompt is in your build plan doc ("XYZX: build plan from the preview").

| Step | What you'll be able to do | Aim to finish |
|---|---|---|
| C ✅ | Followers ✅ (Find people, requests); people you follow see your "Followers" trips and boards, and Home's friends feed shows their real trips (Nov 2026). Likes and comments are still kept on each phone | Wed 2 Dec |
| D ✅ | Save places to lists on Saved, plus a "Want to go" list (done early; friends see "Friends" lists once Step C is in) | Fri 4 Dec |
| E | Real place, stay and restaurant pages, and Explore from the database | Sun 6 Dec |
| F | For you and trending from real ratings | Tue 8 Dec |
| G ✅ | Add photos to trips (location data removed first) (done early) | Wed 9 Dec |
| H | Postcards inside the app: likes and comments saved for real, Postcards show likes, comments, follow requests (accept/decline) and new followers, with an unread count (built Nov 2026, database part waiting for your OK) | Thu 10 Dec |
| I | First-time setup for new people | Fri 11 Dec |
| J | Block, report and delete account; privacy policy (built Nov 2026, database part waiting for your OK; still to do: download your data, a legal check of the policy and a contact email) | Sat 12 Dec |
| K | Beta on TestFlight (💷 Apple Developer, about £79 a year: Claude asks first) | Sun 13 Dec |

**After the beta:** public profiles (18+), booking links, the yearly recap, "Found in your photos", push notifications, First Class payments, and the App Store and Google Play launch. Trip planning stays out unless you decide to bring it back.

### Before inviting real users
- **Young users (13–17):** private, friends-only profiles; hidden from search and suggestions for non-friends; safe default settings; easy report and block. Get a quick legal check against the UK Children's Code and Online Safety Act duties.
- Privacy policy and terms (what's stored, including date of birth and the place pages you've looked at).
- Account deletion that really deletes your data, from inside the app (a UK GDPR requirement, and required by both app stores).
- Report and block, for ratings and people.
- A proper email sender for log-in codes (see step 1).
- Backups: the free Supabase plan has limited backups. 💷 Consider Pro before launch.
- Tidy-up: some development-only tools show "moderate" security warnings (`npm audit`). They don't affect the app on phones. Update them when fixed versions are out.
