# XamusiceL

A music web app built with Next.js — search songs, albums, artists & bands, sign in
with Google, save tracks into playlists, and share songs/albums/playlists with a link.
UI is styled as a dark, Telegram-style chat list (rows, tabs, bottom nav).

## Stack

- **Next.js 14** (App Router) — pages + API routes, deploys to Vercel out of the box
- **NextAuth.js** — Google OAuth login, sessions stored in your database
- **Prisma + PostgreSQL** — users, playlists, saved tracks
- **iTunes Search API** — free, no API key, used for searching/looking up songs, albums
  and artists (30-second previews included). Swap `app/api/search/route.js` for
  Spotify/YouTube Music/etc. later if you want full playback instead of previews.

## 1. Install

```bash
npm install
```

## 2. Set up a database

Any Postgres works (Vercel Postgres, Neon, Supabase, Railway…). Create one and copy its
connection string.

```bash
cp .env.example .env
# paste DATABASE_URL into .env
npx prisma migrate dev --name init
```

## 3. Set up Google login

1. Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth client ID** → Application type: **Web application**.
3. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (local dev)
   - `https://YOUR-VERCEL-DOMAIN/api/auth/callback/google` (production)
4. Copy the **Client ID** and **Client Secret** into `.env`.
5. Generate a secret for NextAuth:
   ```bash
   openssl rand -base64 32
   ```
   Put it in `.env` as `NEXTAUTH_SECRET`.

## 4. Run locally

```bash
npm run dev
```

Open http://localhost:3000.

## 5. Deploy to Vercel

```bash
npm i -g vercel
vercel
```

In the Vercel project settings, add the same environment variables from `.env`
(`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` — set this
to your production URL — and `DATABASE_URL`). Vercel runs `prisma generate` automatically
via the `postinstall` script, and `next build` also runs `prisma generate` first.

After the first deploy, run the migration against your production database once:

```bash
npx prisma migrate deploy
```

## App structure

```
app/
  page.js                 Home — search (songs / albums / artists)
  playlist/page.js        Your playlists (library)
  playlist/[id]/page.js   One playlist — view, remove tracks, share, delete
  profile/page.js         Google sign in / sign out
  share/[type]/[id]/      Public, no-login share pages (song, album, artist, playlist)
  api/auth/[...nextauth]  NextAuth (Google)
  api/search/             Proxies iTunes Search API
  api/playlists/          CRUD for playlists
  api/playlists/[id]/tracks  Add/remove a saved track
components/               UI building blocks (chat-list row, sheets, bottom nav)
prisma/schema.prisma      User/Account/Session (NextAuth) + Playlist/PlaylistTrack
```

## Notes & things you may want to extend

- **Playback**: the iTunes API only gives 30-second previews (`<audio>` tag). For full
  playback you'd integrate the Spotify Web Playback SDK or YouTube Music, which need
  their own OAuth/API keys.
- **Sharing**: share links are public, read-only pages (`/share/...`) — no login needed
  to view them, so they work when pasted into Telegram/WhatsApp/etc.
- **Privacy**: playlists default to public (`isPublic: true`) so their share link works
  immediately; toggle it off via `PATCH /api/playlists/:id` if you add a settings UI.
