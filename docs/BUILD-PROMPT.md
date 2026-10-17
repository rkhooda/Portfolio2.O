Build Portfolio 2.0 in this repo, end to end, strictly from the brief in `docs/`.

## Ground rules

1. Read `CLAUDE.md`, then every file in `docs/` in the order `docs/README.md` gives, and look at `docs/reference/home.png`. Do this once, fully, before writing any code.
2. The brief is the spec. Do not redesign, rename, reorder, add features, add dependencies, or invent copy. Every string comes from `docs/02-content.md`, every colour and motion from `docs/03-design-system.md`, every command from `docs/05-commands.md`, every module and its ownership from `docs/04-architecture.md`.
3. If the brief and reality disagree (an API shape, a font, a browser limit), fix the brief in the same commit as the code and say so in the final report. Do not silently drift.
4. Hard constraints, no exceptions: vanilla HTML/CSS/JS with native ES modules, no build step, no npm dependencies, no framework, no TypeScript. No `innerHTML` anywhere in `js/`. `prefers-reduced-motion` honoured by every animation. The anti-slop rules in `docs/01-vision.md` and the motion table in `docs/03-design-system.md` are law.
5. Source of truth for content, covers, `serve.py` and the `api/` functions is the old site at `/Users/rkhooda/desktop/coding/projects/portfolio`. Copy those files; do not rewrite them.

## Git

- Run `git init -b main` first. Add the `.gitignore` from `docs/06-live-data.md`. First commit: `docs: portfolio 2.0 build brief`.
- Commit after every completed feature, not only at phase ends. A phase should produce several commits, for example `feat: design tokens and five themes`, `feat: static intro shell`, `feat: command registry and parser`, `feat: transcript and url router`.
- Conventional Commits. Subject line only, under 60 characters, plain and specific. No body. No `Co-authored-by`, no `Generated-by`, no tool or model names, no attribution of any kind.
- Never commit broken code. `node --test test/` (once tests exist) and a load in the browser pass before every commit.
- Tick the phase's box in `docs/07-build-plan.md` in the last commit of that phase.

## Order of work

Build phases 0 → 7 from `docs/07-build-plan.md`, in order, without stopping between phases. For each phase: re-open the docs it lists, build everything it lists, run every "Done when" check, run the gates in `docs/08-quality.md` that apply, fix failures, commit, tick.

## Verification

- After phases 0, 3, 5 and 7: serve with `python3 serve.py` in the background, open it in a browser (use the Playwright browser tools if available), screenshot at 1440×900 and 390×844, and compare against `docs/reference/home.png` and the wireframe in `docs/01-vision.md`. Fix proportions before moving on.
- Check reduced motion by emulating it in the browser, not by reading the code.
- `grep -rn innerHTML js/` must return nothing at every commit.
- `node --test test/` and `node api/github.js` are green at every commit from phase 1 on.

## Do not ask; proceed with these assumptions

- No env values are available locally. Build every live feature against the documented API contracts, verify the fallback path with `serve.py`, and note in the final report that production verification needs the owner's env in Vercel.
- `resume.pdf` and `assets/og.png` are not present. Implement `/resume` with its 404 fallback and wire the OG meta tags to `assets/og.png`. List both files as owner TODOs.
- Use the `/stack` table in `docs/02-content.md` as written.
- Do not run `vercel deploy` or `vercel link`. Finish phase 7 up to the deploy step, then print the exact commands and env names the owner needs.
- Skip the Developer Brain `overview.md` step in phase 7. The owner does it after the first deploy.

## Finish

Stop only when phases 0 to 6 are ticked, phase 7 is complete except deploy, production verification and the Brain note, and `git log --oneline` reads as a series of small, clean commits. Then report in this order: phases done, every check run with its result, any brief edits you made and why, the owner TODO list, and the deploy commands.
