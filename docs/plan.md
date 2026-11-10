# Postcard: from clickable shell to real app

Each step is small, ends with something you can click and check, and becomes its own pull request. For each step you'll see:

- **You do**: things only you can do (accounts, clicking in other websites, decisions)
- **Claude does**: the code
- **Done when**: how you'll know it worked
- **Cost**: whether it's free, and when it might not be

💷 marks anything that could cost money. Claude will always stop and ask first.

---

## Step 0: Clickable shell ✅

Every screen works with made-up sample data.

---

## Step 1: Sign up and log in (Supabase, email link, age check). Code built ✅, your setup next

**What it means:** people create an account with just their email. There are no passwords: they type their email and get a link to tap. At sign-up they also give their name and date of birth. **Anyone 13 or over can join** (decided Nov 2026). Everyone starts with a private profile, and only people aged 18 or over will ever be able to make it public. The database itself enforces both age rules.

**Already done**
- ✅ Age decision: 13+ to join, 18+ for public profiles. Because 13–17s can use Postcard, UK rules for young users apply (the Children's Code and the Online Safety Act). Book a quick legal check before launch (see "Before inviting real users").
- ✅ You created the Supabase project and shared the Project URL and Publishable key.
- ✅ Claude built:
  - **Sign up** (`/signup`): name, email, date of birth. Under-13s are refused on the screen, again on the server, and again by the database.
  - **Log in** (`/login`): email only. It always says "check your inbox", so it never reveals who has an account.
  - **Email link page** (`/auth/confirm`): a **Log me in** button. A tap is needed because some email services (Outlook, many workplaces) automatically "click" links to scan them, which would use up a one-time link.
  - **Log out**, plus your real name on Home and You.
  - Signed-out visitors are sent to the welcome page. Only Welcome, Join and Log in are open to everyone.
  - The database setup (`supabase/migrations/20261110120000_profiles.sql`): profiles, a private date-of-birth table only you can read or never edit, and the 13+/18+ rules. All of it was tested on a local copy of the database.

**You do, in this order**

1. **Merge the Step 1 pull request** on GitHub (**Merge pull request** → **Confirm merge**).
2. **Run the database setup in Supabase** (2 minutes):
   1. On GitHub, open the repo, then the `supabase` folder → `migrations` → `20261110120000_profiles.sql`.
   2. Click the **Copy raw file** button (two overlapping squares, top right of the file).
   3. In Supabase, click **SQL Editor** in the left sidebar → **New query**. Paste, then click **Run**.
   4. You should see **"Success. No rows returned"**. If you see a red error instead, copy it to Claude. Don't run it twice: the second time it will say things "already exist", which is harmless but confusing.
3. **Put the app online with Vercel** so you can try it. See **Step 1b** below.
4. **Tell Supabase where the app lives.** In Supabase: **Authentication** → **URL Configuration**:
   - **Site URL**: your Vercel address, e.g. `https://travelapp-abc.vercel.app` (no slash at the end). Click **Save**.
   - **Redirect URLs** → **Add URL**: the same address followed by `/**`, e.g. `https://travelapp-abc.vercel.app/**`. Save.
5. **Change the two log-in emails** so links work on any device:
   1. In Supabase: **Authentication** → **Emails** (it may be called **Email Templates**).
   2. Open **Confirm signup**. Set the subject to `Finish joining Postcard` and replace the message body with:
      ```html
      <h2>Welcome to Postcard</h2>
      <p>Tap below to finish joining.</p>
      <p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Finish joining Postcard</a></p>
      <p>If you didn't ask to join Postcard, you can ignore this email.</p>
      ```
      Click **Save**.
   3. Open **Magic Link** (or **Magic link or OTP**). Set the subject to `Your Postcard log-in link` and replace the body with:
      ```html
      <h2>Log in to Postcard</h2>
      <p>Tap below to log in. The link works once, for about an hour.</p>
      <p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Log in to Postcard</a></p>
      <p>If you didn't ask for this, you can ignore this email.</p>
      ```
      Click **Save**.
6. **Try it** (the "Done when" list below) on your phone and computer.

**Done when**
- You join with your email, tap the link in the email, tap **Log me in**, and land on Home saying "Hello" with your name.
- **You** shows your name, a handle like `@yourname1234` and your email. **Log out** takes you to the welcome page, and logging back in works.
- A date of birth under 13 is refused with a kind message.
- Signed out, opening any app page sends you to the welcome page.

**Cost:** free. Supabase's free plan is plenty for building and testing. Two things to know:
- Free projects **pause after about a week with no activity**. Un-pause from the Supabase dashboard in one click.
- Supabase's built-in email sender only allows **a few emails per hour** across the whole project. If testing gets "We've sent a lot of emails…", wait an hour. 💷 Before real users arrive we'll set up a proper email sender (several have free tiers). Claude will ask first.

**Good to know:** you can't add people by hand in Supabase's **Authentication → Users** page, because the database refuses accounts without a date of birth. That's deliberate: everyone joins through the app.

---

## Step 1b: Put the app online (Vercel)

**Why now:** it's the easiest way for you to try sign-up for real, on your phone, without installing anything.

**You do** (about 10 minutes, after merging the Step 1 pull request):
1. Go to **vercel.com** and click **Sign Up**. Choose **Hobby** ("I'm working on personal projects"), enter your name, then click **Continue with GitHub**.
2. If GitHub asks to install Vercel, choose **Only select repositories** → **travelapp-** → **Install**.
3. In Vercel, click **Add New…** → **Project**. Next to **travelapp-**, click **Import**.
4. Open **Environment Variables** and add two. For each, type the name, paste the value and click **Add**:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Project URL (`https://….supabase.co`, without `/rest/v1/`)
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = your Publishable key (`sb_publishable_…`)
5. Click **Deploy** and wait a minute or two. Click **Continue to Dashboard**, then copy the address under **Domains** (ending in `.vercel.app`). That's your app. Use it in Step 1, point 4.

**Claude does:** checks the online version once you share the address, and fixes anything that differs from the local build.

**Done when:** the Vercel address shows the Postcard welcome page, on your phone too.

**Cost:** 💷 Vercel's free **Hobby** plan is for **non-commercial** use. That's fine while building and testing with friends, but once Postcard is a business (ads, payments, a company) Vercel requires the paid **Pro** plan. A custom domain (e.g. postcard.app) is also a paid purchase. Claude will ask before either.

---

## Step 2: Save a real holiday rating from the Log screen

**What it means:** the Log form stops being a preview. Pressing **Send postcard** saves the rating to your database, and it then appears on your profile and on the destination page.

**You do**

1. Run the database setup Claude gives you (same as before: **SQL Editor** → **New query** → paste → **Run**).
2. Log a real holiday and check it shows up.

**Claude does**

- Database tables:
  - `destinations` (name, country), with the sample places added as a starting list. New places are added when someone logs one, matched by name + country so "Lisbon" isn't created twice.
  - `ratings`: who, where, trip month, destination score, stay name, stay type, stay score, headline, review, posted date.
  - `food_picks` and `top_tips`, linked to a rating.
- Database rules: scores must be whole numbers 1–10, the trip month can't be in the future, you can only create, edit or delete **your own** ratings, and (for now) only you can read them. Friends get access in step 3.
- Changes the Log form so it sends to the server, re-checks everything there (never trusting the browser alone), saves, and takes you to your new rating's page.
- Makes **You**, **Rating** and **Destination** read your real ratings instead of sample data.
- Edit and delete for your own ratings.
- Photos stay as a preview for now (they're step 4).

**Done when:** you log a holiday, refresh the page and it's still there, and you see it on your profile and on that destination's page. Someone else's account can't see it yet.

**Cost:** free.

---

## Later steps (each a separate pull request, in this order unless you'd rather change it)

### Step 3: Friends
Find people by handle, send/accept friend requests, and database rules so friends (only) can read each other's ratings. The **Friends** side of Home becomes real.

### Step 4: Photos
Upload up to 6 photos per rating to Supabase Storage. Photos are shrunk and have their **location data (GPS) removed before they're stored**, so the never-live-location rule holds. Free storage covers early testing. 💷 Large numbers of photos would eventually need a paid plan.

### Step 5: Postcards (notifications)
In-app Postcards when a friend rates somewhere, saves your tip or accepts your request, plus the unread count on the tab bar. Email or phone push notifications come later, if wanted.

### Step 6: "For you" from real data
Replace the sample picks with ones based on what you rated highly and what your friends loved, using the same idea as today's shell, just with real data.

### Step 7: Public profiles (18+)
The **Public profile** switch on You becomes real (the database already refuses it for under-18s from step 1). Then public profiles get a shareable page.

### Step 8: Waitlist email (Loops)
Connect the `/welcome` form to Loops so sign-ups land in your Loops audience and get a welcome email. **You:** create a Loops account and an API key (Claude will walk you through it). The key is secret, so it goes in Vercel's settings, not in chat or the repo. **Cost:** Loops has a free tier for small lists. 💷 Check before the list grows. *(This can move earlier, e.g. straight after step 1b, if you want to start collecting emails sooner.)*

### Before inviting real users
- **Young users (13–17):** private, friends-only profiles; hidden from search and suggestions for non-friends; safe default settings; easy report and block. Get a quick legal check against the UK Children's Code and Online Safety Act duties
- Privacy policy and terms (what's stored, including date of birth), and a cookie notice if needed
- Account deletion that really deletes your data (a UK GDPR requirement)
- Report and block, for ratings and people
- A proper email sender for log-in links (see step 1)
- Backups: the free Supabase plan has limited backups. 💷 Consider Pro before launch.
- Tidy-up: the development-only code-check tools currently show some "moderate" security warnings (`npm audit`). They don't affect the app people use. Update them when the fixed versions are out.
