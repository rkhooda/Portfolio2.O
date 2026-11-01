# Portfolio 2.0

Rakshit Hooda's terminal-session portfolio, built with HTML, CSS, native JavaScript modules, and plain Node functions.

Run locally with `python3 serve.py` and open http://localhost:8000. Front-end commands work without API credentials; live commands use their documented offline fallbacks. For API development use `vercel dev` with the environment variables below.

Content and project metadata live in `js/data.js` and are specified in `docs/02-content.md`. Styles use tokens in `css/tokens.css`; the command catalog is `js/commands.js`.

| Variable | Use |
|---|---|
| `LASTFM_KEY`, `LASTFM_USER` | Last.fm player |
| `GH_TOKEN`, `GH_USER` | GitHub contribution calendar |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Guestbook |

The API also accepts `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. Set these in Vercel project settings or `.env.local`. Never commit credentials.

Deployment: import the repository into Vercel, add the environment variables above, then deploy with `vercel --prod`. `resume.pdf` and `assets/og.png` are owner supplied.
