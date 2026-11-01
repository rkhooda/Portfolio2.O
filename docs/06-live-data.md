# 06 — Live data

Four Node functions under `api/`, plain `fetch`, no `package.json`. The
GitHub and guestbook functions are restored from the legacy repo
(`/Users/rkhooda/Desktop/Coding/Portfolio/api/`).
Every consumer renders a static fallback when its endpoint fails; a missing
env var never breaks the page.

## Endpoints

| endpoint | feeds | env | cache |
|---|---|---|---|
| `GET /api/nowplaying` | `/now-playing`, `/status`, the vinyl, the spectrum's live pulse | `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN` | `s-maxage=30, stale-while-revalidate=120` |
| `GET /api/github` | `/github`, `/about` stats, `/status` streak | `GH_TOKEN` (classic PAT, `read:user`), optional `GH_USER` (default `rkhooda`) | `s-maxage=3600, stale-while-revalidate=86400` |
| `GET` / `POST /api/guestbook` | `/guestbook`, `/sign` | `KV_REST_API_URL` + `KV_REST_API_TOKEN` (or `UPSTASH_REDIS_REST_*`) | GET `s-maxage=30`, POST `no-store` |
| `GET /api/version` | `/version` | none (Vercel injects `VERCEL_GIT_COMMIT_SHA`, `VERCEL_GIT_COMMIT_REF`) | `s-maxage=3600` |

Edge caching means the upstreams see a handful of requests a day regardless
of traffic. Keep the headers exactly as in the old files.

## `api/nowplaying.js` — Spotify current playback

The server reads `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, and
`SPOTIFY_REFRESH_TOKEN` from Vercel's environment. For direct local API use it
also reads only those keys from the git-ignored `.env.local`; credentials are
never returned or logged. Access tokens are refreshed server-side and the
endpoint retries once after an expired-token response. Missing credentials,
no active playback, paused playback, rate limits, and upstream errors all use
safe empty or offline states. Spotify is the source of truth for `live`.

Playing response (paused playback has `live: false`, `paused: true`):
```json
{ "live": true, "paused": false, "artist": "Artist One, Artist Two",
  "track": "Track", "album": "Album", "image": "https://i.scdn.co/image/…",
  "url": "https://open.spotify.com/track/…" }
```

No playback returns the same shape with empty strings and both flags false.
The existing `live` flag continues to drive vinyl rotation and spectrum pulse.
Track URLs are rendered as external links with `rel="noopener"`.

Client rules:
- Playback state is polled every 30 seconds while the command turn is
  connected and the tab is visible.
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

### Legacy source restoration

The original checkout was recovered at `/Users/rkhooda/Desktop/Coding/Portfolio`
(the earlier nested path in this brief was incorrect). The guestbook endpoint
and its full blocked-word list have been restored from that checkout. The 14
cover assets specified in `02-content.md` were copied from `assets/img/covers/`.
The original blocklist, validation, origin guard, honeypot, one-per-hour hashed
IP rate limit, 200-entry retention, and lifetime count are covered by
`test/guestbook.test.js`. Review the recovered moderation list before enabling
public writes if its policy changes.

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
| `/now-playing` | `⎿ ✗ Spotify: offline` then the documented player fallback. Vinyl stays still. |
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
settings. Copy `.env.example` as a placeholder reference; use
`node scripts/spotify-auth.js` to obtain the Spotify values. Use `vercel dev`
when changing `api/`; front-end work can use its documented fallbacks.

`.gitignore`: `.vercel`, `.env*`, `.DS_Store`, `.playwright-mcp/`.
