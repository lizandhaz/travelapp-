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

1. **Merge the pull request** on GitHub (**Merge pull request** → **Confirm merge**).
2. **Run the database setup in Supabase** (2 minutes):
   1. Open https://github.com/lizandhaz/travelapp-/blob/main/supabase/migrations/20261110120000_profiles.sql
   2. Click the **Copy raw file** button (two overlapping squares, top right of the file).
   3. In Supabase, click **SQL Editor** in the left sidebar → **New query**. Paste, then click **Run**.
   4. You should see **"Success. No rows returned"**. If you see a red error instead, copy it to Claude. Only run it once.
3. **Make the emails show a code** (5 minutes):
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
4. **Try it on your phone** (see the next section), and go through the "Done when" list.

**Done when**
- You join with your email, type the code from the email, and land on Home saying "Hello" with your name.
- **You** shows your name, a handle like `@yourname1234` and your email. **Log out** takes you to Welcome, and logging back in with a new code works.
- A date of birth under 13 is refused with a kind message.

**Cost:** free. Supabase's free plan is plenty for building and testing. Two things to know:
- Free projects **pause after about a week with no activity**. Un-pause from the Supabase dashboard in one click.
- Supabase's built-in email sender only allows **a few emails per hour** across the whole project. If testing gets "We've sent a lot of emails…", wait an hour. 💷 Before real users arrive we'll set up a proper email sender (several have free tiers). Claude will ask first.

**Good to know:** you can't add people by hand in Supabase's **Authentication → Users** page, because the database refuses accounts without a date of birth. That's deliberate: everyone joins through the app.

---

## Trying the app on your phone (free)

Expo Go is a free app that runs Postcard while it's being built. The project has to be running on a computer, and your phone connects to it. Claude's cloud computer can't reach Expo's services, so for now this runs **on your computer**. It takes about 15 minutes the first time, and 1 minute after that.

**One-time setup**
1. **On your phone:** install **Expo Go** from the App Store (iPhone) or Google Play (Android). It's free.
2. **On your computer:** go to **nodejs.org**, download the version marked **LTS**, and install it (keep clicking **Continue** / **Next**).
3. **Download Postcard:** open https://github.com/lizandhaz/travelapp-, click the green **Code** button → **Download ZIP**. Unzip it (double-click it), giving you a folder called `travelapp--main`.
4. **Open a terminal in that folder:**
   - **Mac:** right-click the folder → **Services** → **New Terminal at Folder**. (If you don't see it, open the **Terminal** app, type `cd ` with a space after it, drag the folder into the window, and press **Enter**.)
   - **Windows:** open the folder, click in the address bar at the top, type `powershell` and press **Enter**.
5. Type `npm install` and press **Enter**. Wait a minute or two until it finishes.

**Each time you want to try it**
1. In the terminal (opened in the folder as above), type `npx expo start` and press **Enter**. A QR code appears.
2. Make sure your phone and computer are on the **same Wi-Fi**.
3. **iPhone:** open the normal **Camera** app, point it at the QR code and tap the banner. **Android:** open **Expo Go** and tap **Scan QR code**.
4. Postcard opens in Expo Go. To stop, press **Ctrl + C** in the terminal.

**If it doesn't connect** (e.g. work or public Wi-Fi), use `npx expo start --tunnel` instead.

**When Claude has made changes:** download the ZIP again (step 3), unzip it, and run steps 4–5 in the new folder.

*Possible later improvement:* Claude could publish test versions straight from its cloud computer (using Expo's free "EAS Update"), so you'd only need Expo Go. That needs a free Expo account, an access key and permission for Claude's computer to reach Expo. Ask if you'd like to set it up.

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
