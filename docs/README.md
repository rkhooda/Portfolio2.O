# Portfolio 2.0 — build brief

This folder is the complete specification for Rakshit Hooda's portfolio: a
TUI-themed site that behaves like an AI-agent session (think Claude Code)
with a music/album theme on top. It exists so that a fresh Claude Code
session can build the whole thing without asking the owner anything except
for the secrets and files listed under "Owner supplies".

## Read in this order

| # | File | Read when |
|---|---|---|
| 0 | this file | every session |
| 1 | [01-vision.md](01-vision.md) | first session, and before any design decision |
| 2 | [02-content.md](02-content.md) | whenever rendering real content |
| 3 | [03-design-system.md](03-design-system.md) | any CSS, layout, motion or theme work |
| 4 | [04-architecture.md](04-architecture.md) | any JS work |
| 5 | [05-commands.md](05-commands.md) | implementing or changing a command |
| 6 | [06-live-data.md](06-live-data.md) | anything touching `api/` or a fetch |
| 7 | [07-build-plan.md](07-build-plan.md) | start of every session: pick the next phase |
| 8 | [08-quality.md](08-quality.md) | end of every phase |

`reference/home.png` is the screenshot the whole design is derived from.
Look at it before phase 0 and again before phase 3.

`BUILD-PROMPT.md` is the prompt that starts the build in a fresh session:
`cat docs/BUILD-PROMPT.md | pbcopy`, then paste it.

## How to use this brief

- Open `07-build-plan.md`, find the first phase not marked done, read the
  docs it lists, build it, run its acceptance checks, commit, mark it done.
  One phase per session is the intended pace; more is fine if the checks pass.
- Do not read every doc every session. Each phase names what it needs.
- When the brief and reality disagree (an API changed, a font is gone, a
  spec turns out wrong in the browser), fix the brief in the same commit.
  The brief is the source of truth only while it is true.
- The old site is the source of truth for content and for the `api/` code:
  repo `/Users/rkhooda/desktop/coding/projects/portfolio`,
  live at https://rakshithooda.vercel.app/.

## Non-negotiables

1. Vanilla HTML/CSS/JS with native ES modules. No build step, no npm
   dependencies, no framework. Vercel static hosting plus `api/` functions.
2. Anything a visitor or a third party can write (input echo, guestbook
   entries, Last.fm titles) is rendered with `textContent`, never `innerHTML`.
3. `prefers-reduced-motion` is honoured by every animation. No exceptions.
4. The anti-slop list in `01-vision.md` is a hard rule, not taste.
5. `node --test` passes before every commit.

## Owner supplies (not the builder's job)

- `resume.pdf` at the repo root, for `/resume`.
- Vercel env: `LASTFM_KEY`, `LASTFM_USER`, `GH_TOKEN`, optional `GH_USER`,
  `KV_REST_API_URL`, `KV_REST_API_TOKEN`. Same values as the old site.
- Confirmation of the `/stack` levels table in `02-content.md`.
- An OG image after phase 7 (a screenshot of the home at 1200×630).
