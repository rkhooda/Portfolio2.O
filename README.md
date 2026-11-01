# Portfolio 2.0

Rakshit Hooda's terminal-session portfolio, built with HTML, CSS, native JavaScript modules, and plain Node functions.

Run locally with `python3 serve.py` and open http://localhost:8000. Front-end commands work without API credentials; live commands use their documented offline fallbacks. For API development use `vercel dev` with the environment variables below.

Content and project metadata live in `js/data.js` and are specified in `docs/02-content.md`. Styles use tokens in `css/tokens.css`; the command catalog is `js/commands.js`.

| Variable | Use |
|---|---|
| `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN` | Spotify current playback (backend only) |
| `GH_TOKEN`, `GH_USER` | GitHub contribution calendar |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Guestbook |

The guestbook API also accepts `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. Set these in Vercel project settings or `.env.local`. Copy `.env.example` as a placeholder reference. Spotify credentials are read only by the backend and must never be added to frontend JavaScript. Never commit `.env.local` or credentials.

Deployment: import the repository into Vercel, add the environment variables above, then deploy with `vercel --prod`. `resume.pdf` and `assets/og.png` are owner supplied.
