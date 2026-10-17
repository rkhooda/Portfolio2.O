# Portfolio 2.0 — Claude Operating Manual

## Developer Brain

Developer Brain lives at: `/Users/rkhooda/Documents/Rkxee Obsidian/Developer's brain`

At the start of every session, read in this order:

1. `/Users/rkhooda/Documents/Rkxee Obsidian/Developer's brain/CLAUDE.md` — governing operating principles
2. `/Users/rkhooda/Documents/Rkxee Obsidian/Developer's brain/ARCHITECTURE.md` — zone structure and content boundaries
3. `/Users/rkhooda/Documents/Rkxee Obsidian/Developer's brain/projects/portfolio-2/overview.md` — project context in Developer Brain (read if the file exists; skip if not)

The principles in Developer Brain govern every session in this repository. Do not duplicate them here. If anything here conflicts with Developer Brain, follow Developer Brain and flag the conflict.

---

## Project

**Name:** `portfolio-2`
*Must match the folder name at `Developer Brain/projects/portfolio-2/`.*

**What it is:** Rakshit Hooda's portfolio as a TUI: a Claude-Code-style agent session driven by slash commands, with an album/music theme, live Last.fm and GitHub data, and switchable themes.

**Stack:** Vanilla HTML/CSS/JS with native ES modules, no build step, no npm dependencies. Vercel static hosting plus plain-Node functions in `api/`. Tests with `node --test`.

---

## Rules

- **The brief is in `docs/`. Read `docs/README.md` first**, then only the docs the current phase lists. `docs/07-build-plan.md` is the work queue: build the first unticked phase, run its acceptance checks, tick it in the same commit.
- Content and copy come from `docs/02-content.md`. Do not write new copy, jokes or placeholder text; if a string is missing, add it there first.
- The anti-slop rules in `docs/01-vision.md` and the motion table in `docs/03-design-system.md` are hard constraints.
- No dependencies, no bundler, no framework, no TypeScript. If a feature seems to need one, it is the wrong feature.
- Every visitor- or third-party-originated string is rendered with `textContent`. `innerHTML` does not appear in `js/`.
- `prefers-reduced-motion` is honoured by every animation.
- Run: `python3 serve.py` for front-end work (live features fall back), `vercel dev` with `.env.local` only when touching `api/`.
- Test: `node --test test/` and `node api/github.js` before every commit.
- Commits: Conventional Commits, subject line only, no body, no attribution.
- When the brief and reality disagree, fix the brief in the same commit.
- Old site, source of truth for content and `api/` code: `/Users/rkhooda/desktop/coding/projects/portfolio` and https://rakshithooda.vercel.app/.

---

## Session End

At the end of any significant session:

1. Has the project's technical state changed substantially? → Update `Developer Brain path/projects/portfolio-2/overview.md`
2. Was a significant architectural decision made? → Create `Developer Brain path/projects/portfolio-2/decision-[topic].md`
3. Does any knowledge from this session pass the promotion criteria in `Developer Brain path/WORKFLOW.md`? → Promote it

Do not update Developer Brain for routine task completion or information visible from the code.
