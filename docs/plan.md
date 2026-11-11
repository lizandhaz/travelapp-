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

## Step 1: Join and log in (Supabase, email code, age check). Code built ✅, your setup next

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

## Step 2: Save a real holiday rating from the Log screen

**What it means:** the Log form stops being a preview. Tapping **Send postcard** saves the rating to your database, and it then appears on your profile and on the destination page.

**You do**

1. Run the database setup Claude gives you (same as before: **SQL Editor** → **New query** → paste → **Run**).
2. Log a real holiday and check it shows up.

**Claude does**

- Database tables:
  - `destinations` (name, country), with the sample places added as a starting list. New places are added when someone logs one, matched by name + country so "Lisbon" isn't created twice.
  - `ratings`: who, where, trip month, destination score, stay name, stay type, stay score, headline, review, posted date.
  - `food_picks` and `top_tips`, linked to a rating.
- Database rules: scores must be whole numbers 1–10, the trip month can't be in the future, you can only create, edit or delete **your own** ratings, and (for now) only you can read them. Friends get access in step 3.
- Changes the Log screen to save, and takes you to your new rating.
- Makes **You**, **Rating** and **Destination** show your real ratings instead of sample data.
- Edit and delete for your own ratings.
- Photos stay as a preview for now (they're step 4).

**Done when:** you log a holiday, close and reopen the app, and it's still there, on your profile and on that destination's page. Someone else's account can't see it yet.

**Cost:** free.

---

## Later steps (each a separate pull request, in this order unless you'd rather change it)

### Step 3: Friends
Find people by handle, send/accept friend requests, and database rules so friends (only) can read each other's ratings. The **Friends** side of Home becomes real.

### Step 4: Photos
Upload up to 6 photos per rating to Supabase Storage. Photos are shrunk and have their **location data (GPS) removed before they're stored**, so the never-live-location rule holds. Free storage covers early testing. 💷 Large numbers of photos would eventually need a paid plan.

### Step 5: Postcards (notifications)
In-app Postcards when a friend rates somewhere, saves your tip or accepts your request, plus the unread count on the tab bar. Phone push notifications can come later (they need a development build rather than Expo Go).

### Step 6: "For you" from real data
Replace the sample picks with ones based on what you rated highly and what your friends loved, using the same idea as today, just with real data.

### Step 7: Public profiles (18+)
The **Public profile** switch on You becomes real (the database already refuses it for under-18s from step 1).

### Step 8: Into the app stores
Build proper installable versions with Expo's cloud build service (EAS) and submit them to Apple and Google. **You:** 💷 Apple Developer Program (about **£79 a year**) and Google Play (a **one-off US$25**), plus store listings (screenshots, description, age rating). Claude walks you through each and asks before anything is paid for. Both stores also require in-app account deletion, report and block, and a privacy policy (see below).

### Step 9: Waitlist (Loops) and a simple website
A one-page website for Postcard with a waitlist form connected to Loops, so people can sign up before it's in the stores. It can use the web version of the app, or a simple page hosted for free (e.g. on Vercel). **You:** create a Loops account and an API key (secret, so it goes in the hosting settings, not in chat or the repo). **Cost:** Loops and Vercel have free tiers for this size. 💷 Vercel's free plan is non-commercial only. *(Can move earlier if you want to start collecting emails sooner.)*

### Before inviting real users
- **Young users (13–17):** private, friends-only profiles; hidden from search and suggestions for non-friends; safe default settings; easy report and block. Get a quick legal check against the UK Children's Code and Online Safety Act duties.
- Privacy policy and terms (what's stored, including date of birth).
- Account deletion that really deletes your data, from inside the app (a UK GDPR requirement, and required by both app stores).
- Report and block, for ratings and people.
- A proper email sender for log-in codes (see step 1).
- Backups: the free Supabase plan has limited backups. 💷 Consider Pro before launch.
- Tidy-up: some development-only tools show "moderate" security warnings (`npm audit`). They don't affect the app on phones. Update them when fixed versions are out.
