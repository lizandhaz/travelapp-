# Instructions for coding agents (Codex and others)

**Read `CLAUDE.md` first and follow it.** It is the single source of truth for this project: the product rules, the look, the stack,
the database and how changes are checked. Everything there applies to you too, even though it is named for Claude.

A few points that matter most when two agents work on the same app:

- The owner is **not technical**. Explain what you did and what to check in plain English.
- **Work on your own branch and open a pull request.** Never push to `main` directly, never force-push, and don't work on a branch
  another agent is using (Claude uses `claude/...` branches).
- Before a pull request, all of these must pass: `npx tsc --noEmit`, `npx expo lint`, `npm test`,
  `npx expo export --platform ios --platform android`.
- **Database changes** (anything in `supabase/migrations/`) need the owner's OK before merging. Never edit a migration that has
  already been applied; add a new file.
- **Never commit secrets.** The repo is public. Only the Supabase publishable key in `src/lib/config.ts` belongs in it.
- **Photos:** only the owner's own or licensed photos (`assets/photos/own-*.jpg`), with location data stripped. No stock photos.
- Keep `CLAUDE.md` up to date when you change how something works, so the next agent knows.
- Publishing to the owner's phone (EAS Update to the `preview` branch) is done from Claude's cloud session, which holds the Expo
  login. If you can't publish, say so in your pull request and the owner will ask Claude to.
