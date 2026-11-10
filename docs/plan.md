# Postcard: from clickable shell to real app

Each step is small, ends with something you can click and check, and becomes its own pull request. For each step you'll see:

- **You do**: things only you can do (accounts, clicking in other websites, decisions)
- **Claude does**: the code
- **Done when**: how you'll know it worked
- **Cost**: whether it's free, and when it might not be

💷 marks anything that could cost money. Claude will always stop and ask first.

---

## Step 0: Clickable shell ✅ (this pull request)

Every screen works with made-up sample data. Nothing is saved and nothing is connected.

---

## Step 1: Sign up and log in (Supabase, email link, age check)

**What it means:** people can create an account with just their email. There are no passwords: they type their email and get a "magic link" to click. At sign-up they also give their name and date of birth. **Anyone 13 or over can join** (decided Nov 2026). Everyone starts with a private profile. Only people aged 18 or over will ever be able to make their profile public (the switch comes in a later step, but the rule is built in now).

**You do**

1. ~~Decide the minimum age~~ ✅ **Decided: 13+ to join, 18+ for public profiles.** Because 13–17s can use Postcard, UK rules for young users apply (the Children's Code and the Online Safety Act). Book a quick check with a lawyer before launch (see "Before inviting real users").
2. **Create a free Supabase account and project** (about 5 minutes):
   1. Go to **supabase.com** and click **Start your project**. Sign up with your GitHub account (click **Continue with GitHub**).
   2. If asked to create an organisation, name it "Postcard" and choose the **Free** plan. 💷 If you ever see a card-details screen, stop and tell Claude.
   3. Click **New project**. Name: `postcard`. Database password: click **Generate a password** and **save it in your password manager** (you'll rarely need it, but it can't be shown again). Region: **West EU (London)**. Click **Create new project** and wait a minute or two.
3. **Give Claude the two public settings.** In the project, click **Project Settings** (the cog, bottom left), then **API Keys**, then copy the **Publishable key** (older projects call it the **anon** key). Then go to **Data API** (or **API**) and copy the **Project URL**. Paste both into the chat. These two are safe to share. **Never paste the "secret" or "service_role" key**: that one is a master key.
4. **Tell Supabase where the app lives.** Go to **Authentication** → **URL Configuration**. Set **Site URL** to `http://localhost:3000` for now, and under **Redirect URLs** click **Add URL** and add `http://localhost:3000/**`. (When the app goes online we'll add the real address too.)
5. When Claude asks, paste the database setup it gives you into **SQL Editor** → **New query** → **Run**. (Or Claude can give you an alternative way. Either is fine.)

**Claude does**

- Adds Supabase's official Next.js helper (`@supabase/ssr` and `@supabase/supabase-js`, both free).
- Creates `.env.example` (a blank template) and tells you how to create your own `.env.local`, which git ignores so your keys never reach the public repo.
- Writes the database setup:
  - a `profiles` table (name, handle, date of birth, `is_public`, created date), created automatically when someone signs up
  - **database rules (Row Level Security)** so people can only read and edit their own profile, and only they can see their date of birth
  - a rule that **refuses `is_public = true` for anyone under 18**, enforced by the database itself, so no bug in the app can get around it
- Builds the new screens in the existing style:
  - **Sign up** (`/signup`): email, name, date of birth. Under-13s are refused. The check happens on the screen *and* again on the server. Then "Check your inbox".
  - **Log in** (`/login`): email only. Then "Check your inbox".
  - **Link landing** (`/auth/confirm`): where the email link takes you, which signs you in and sends you Home.
  - **Log out** on the You screen.
- Adds `proxy.ts` so you stay signed in, and sends signed-out visitors to `/welcome` or `/login`.
- Swaps the fake "Sam" for the real signed-in person's name on Home and You (everything else is still sample data until later steps).

**Done when:** you sign up with your email and a date of birth, click the link in the email, land on Home, see your own name, log out and log back in. A date of birth under 13 is refused with a kind message, and a 13–17 account can't be made public.

**Cost:** free. Supabase's free plan is plenty for building and testing. Two things to know:
- Free projects **pause after about a week with no activity**. You can un-pause them from the dashboard in one click.
- Supabase's built-in email sender only allows **a few emails per hour**. That's fine for testing, but 💷 before real users arrive we'll set up a proper email sender (several have free tiers). Claude will ask first.

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
- Database rules: scores must be whole numbers 1–10, the trip month can't be in the future, you can only create, edit or delete **your own** ratings, and (for now) only you can read them. Friends get access in step 4.
- Changes the Log form so it sends to the server, re-checks everything there (never trusting the browser alone), saves, and takes you to your new rating's page.
- Makes **You**, **Rating** and **Destination** read your real ratings instead of sample data.
- Edit and delete for your own ratings.
- Photos stay as a preview for now (they're step 5).

**Done when:** you log a holiday, refresh the page and it's still there, and you see it on your profile and on that destination's page. Someone else's account can't see it yet.

**Cost:** free.

---

## Later steps (each a separate pull request, in this order unless you'd rather change it)

### Step 3: Put the app online (Vercel)
- **You:** create a Vercel account with GitHub (**vercel.com** → **Sign Up** → **Continue with GitHub**), click **Add New… → Project**, pick this repo, paste the two Supabase settings into **Environment Variables**, and click **Deploy**. Claude will give exact steps. Then add the new web address in Supabase's **URL Configuration**.
- **Claude:** checks the online build, and sets up preview links for every pull request so you can try changes on your phone before merging.
- **Cost:** 💷 Vercel's free **Hobby** plan is for **non-commercial** use. That's fine while building and testing with friends, but once Postcard is a business (ads, payments, a company) Vercel requires the paid **Pro** plan. A custom domain (e.g. postcard.app) is also a paid purchase. Claude will ask before either.

### Step 4: Friends
Find people by handle, send/accept friend requests, and database rules so friends (only) can read each other's ratings. The **Friends** side of Home becomes real.

### Step 5: Photos
Upload up to 6 photos per rating to Supabase Storage. Photos are shrunk and have their **location data (GPS) removed before they're stored**, so the never-live-location rule holds. Free storage covers early testing. 💷 Large numbers of photos would eventually need a paid plan.

### Step 6: Postcards (notifications)
In-app Postcards when a friend rates somewhere, saves your tip or accepts your request, plus the unread count on the tab bar. Email or phone push notifications come later, if wanted.

### Step 7: "For you" from real data
Replace the sample picks with ones based on what you rated highly and what your friends loved, using the same idea as today's shell, just with real data.

### Step 8: Public profiles (18+)
The **Public profile** switch on You becomes real (the database already refuses it for under-18s from step 1). Then public profiles get a shareable page.

### Step 9: Waitlist email (Loops)
Connect the `/welcome` form to Loops so sign-ups land in your Loops audience and get a welcome email. **You:** create a Loops account and an API key (Claude will walk you through it). The key is secret, so it goes in Vercel's settings, not in chat or the repo. **Cost:** Loops has a free tier for small lists. 💷 Check before the list grows. *(This can move earlier, e.g. straight after step 3, if you want to start collecting emails sooner.)*

### Before inviting real users
- **Young users (13–17):** private, friends-only profiles; hidden from search and suggestions for non-friends; safe default settings; easy report and block. Get a quick legal check against the UK Children's Code and Online Safety Act duties
- Privacy policy and terms (what's stored, including date of birth), and a cookie notice if needed
- Account deletion that really deletes your data (a UK GDPR requirement)
- Report and block, for ratings and people
- A proper email sender for log-in links (see step 1)
- Backups: the free Supabase plan has limited backups. 💷 Consider Pro before launch.
- Tidy-up: the development-only code-check tools currently show some "moderate" security warnings (`npm audit`). They don't affect the app people use. Update them when the fixed versions are out.
