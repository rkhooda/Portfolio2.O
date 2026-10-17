# 06 — Live data

Four Node functions under `api/`, plain `fetch`, no `package.json`. Three
are copied from the old repo (`/Users/rkhooda/desktop/coding/projects/portfolio/api/`).
Every consumer renders a static fallback when its endpoint fails; a missing
env var never breaks the page.

## Endpoints

| endpoint | feeds | env | cache |
|---|---|---|---|
| `GET /api/nowplaying` | `/now-playing`, `/status`, the vinyl, the spectrum's live pulse | `LASTFM_KEY`, `LASTFM_USER` | `s-maxage=30, stale-while-revalidate=120` |
| `GET /api/github` | `/github`, `/about` stats, `/status` streak | `GH_TOKEN` (classic PAT, `read:user`), optional `GH_USER` (default `rkhooda`) | `s-maxage=3600, stale-while-revalidate=86400` |
| `GET` / `POST /api/guestbook` | `/guestbook`, `/sign` | `KV_REST_API_URL` + `KV_REST_API_TOKEN` (or `UPSTASH_REDIS_REST_*`) | GET `s-maxage=30`, POST `no-store` |
| `GET /api/version` | `/version` | none (Vercel injects `VERCEL_GIT_COMMIT_SHA`, `VERCEL_GIT_COMMIT_REF`) | `s-maxage=3600` |

Edge caching means the upstreams see a handful of requests a day regardless
of traffic. Keep the headers exactly as in the old files.

## `api/nowplaying.js` — copy, then extend

Why Last.fm and not Spotify's API: one unauthenticated GET answers both
"playing now" and "last played", no OAuth, no refresh token, no Premium
requirement, and it picks up anything scrobbled, not only Spotify. This was
decided for the old site and stands.

Response today:
```json
{ "live": true, "artist": "J. Cole", "track": "Love Yourz", "playedAt": "2026-09-10T20:41:00.000Z" }
```
(`playedAt` only when not live.)

The one change: add `album` and `image`.
```js
album: (t.album && t.album["#text"]) || "",
image: pickImage(t.image),   // string URL or ""
```
`t.image` is an array of `{ size: "small"|"medium"|"large"|"extralarge", "#text": url }`.
Take `extralarge`, else the last entry. Treat Last.fm's placeholder as no
image: its URL contains `2a96cbd8b46e442fc41c2b86b821562f`. Return `""` in
that case so the client draws the `◉` frame instead.

New response:
```json
{ "live": false, "artist": "J. Cole", "track": "Love Yourz",
  "album": "2014 Forest Hills Drive",
  "image": "https://lastfm.freetls.fastly.net/i/u/300x300/….jpg",
  "playedAt": "2026-09-10T20:41:00.000Z" }
```

Client rules:
- Relative time is computed client-side (`Intl.RelativeTimeFormat`, narrow
  style: `3 min. ago`), because the response is cached for 30s.
- Poll every 30s while a `/now-playing` turn is connected and the tab is
  visible; stop otherwise. One poller, owned by `live.js`.
- `state.live.npLive` drives the vinyl and the spectrum pulse.

## `api/github.js` — copy unchanged

One GraphQL call for the contribution calendar. Returns
`{ total, streak, from, days }` where `days` is an array of counts and
`from` the ISO date of `days[0]`. The client derives the weekday offset from
`from` (GitHub weeks start on Sunday, the first is partial), lays out 7 rows
× N columns, and colours levels `0..4` from `count / max`.

Keep the file's `node api/github.js` self-check for `streakOf` (today may
be empty without breaking the streak).

## `api/guestbook.js` — copy unchanged

`GET` → `{ items: [{ n, m, t }], count }` (newest first, up to 50).
`POST { name, note, website }` → `201 { ok, entry }` or a `4xx { error }`
whose text is written for visitors and printed verbatim.

Server-side guards, all kept: 24/140 caps, control characters flattened to
spaces, a word blocklist, one signature per hashed IP per hour (`SET NX EX`),
honeypot field `website` (bots get a fake 200), `Origin` must match host.
Moderation is manual: `LREM` from the Upstash console.

Port the old `test/guestbook.js` to `test/guestbook.test.js` under
`node --test`; it stubs Upstash and needs no account.

## `api/version.js` — new

```js
module.exports = (req, res) => {
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  res.json({
    sha: (process.env.VERCEL_GIT_COMMIT_SHA || "").slice(0, 7),
    ref: process.env.VERCEL_GIT_COMMIT_REF || "",
  });
};
```

## Fallbacks per command

| command | when the endpoint fails |
|---|---|
| `/now-playing` | `⎿ ✗ last.fm: offline` then `The deck is offline. Last thing I remember: Love Yourz — J. Cole.` Vinyl stays still. |
| `/github` | `⎿ ✗ github: offline` then `GitHub isn't answering. The commits are still there: github.com/rkhooda` |
| `/about` | the two live stats print `—`; the graph hint line still shows |
| `/status` | the affected rows print `—` |
| `/guestbook` | `⎿ ✗ upstash: offline` then `The sleeve is in the other room. Try again in a minute.` |
| `/sign` | the server's `error` text under the form, or `Couldn't reach the sleeve. Try again in a minute.` on a network error |
| `/version` | prints the version string without sha and ref |

## Local development

```sh
python3 serve.py        # http://localhost:8000, caching off; api/* 404 → every command falls back
vercel dev              # same, and api/* actually runs; needs .env.local
```

`.env.local` (gitignored) carries the same names as the Vercel project
settings. Reach for `vercel dev` only when changing `api/`; front-end work
does not need it because every live feature degrades to its fallback.

`.gitignore`: `.vercel`, `.env*`, `.DS_Store`, `.playwright-mcp/`.
