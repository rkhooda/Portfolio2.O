# 07 — Build plan

Eight phases, each sized for one session. Each phase says what to read,
what to build, what "done" means, and how to commit. Mark a phase done by
changing its `[ ]` to `[x]` in this file, in the same commit as the work.

Every phase ends with: `node --test` green, a manual check at 1440px and
390px widths, and the reduced-motion check in `08-quality.md`. Commits use
Conventional Commits with a subject line only, no body, no attribution.

## [ ] Phase 0 — Scaffold: the static intro

Read: `01-vision.md`, `02-content.md` (identity, tracks, copy), `03-design-system.md`, `reference/home.png`.

Build:
- `index.html` with the header, nav (`<a href="/work">` …), the rain
  `<canvas aria-hidden>` sized 14lh (empty for now), the identity block
  with the CSS vinyl, the intro turn as static HTML (chip + bullet), an
  empty transcript container (`role="log"`), the prompt bar, an empty popup
  container. Meta tags, favicon data URI, Vercel analytics script tag.
- `css/tokens.css` with the grid variables and all five theme blocks;
  `midnight` duplicated on bare `:root`.
- `css/tui.css` with layout, the identity block, chip, bullet, prompt bar,
  responsive rules, focus rings, `prefers-reduced-motion` guards.
- `js/data.js` ported from `02-content.md` (all exports, no logic).
- `serve.py` copied from the old repo; `vercel.json`; `.gitignore`; `404.html`.
- Copy the covers into `assets/covers/`.

Done when:
- `python3 serve.py` shows a page that matches `reference/home.png` in
  proportions at 1440px, with the intro turn visible and the prompt fixed at
  the bottom, and stacks correctly at 390px.
- `data-theme="paper"` set by hand in devtools produces a readable light page.
- No JS is loaded yet; the page is pure HTML/CSS.

Commit: `feat: static intro shell and design tokens`

## [ ] Phase 1 — Shell: commands, transcript, URL

Read: `04-architecture.md`, `05-commands.md` (tracks, `/help`, `/projects`, `/clear`), `02-content.md` (track intros, errors).

Build:
- `js/state.js` with accessors and the event bus.
- `js/render.js`: `chip`, `bullet`, `tool`, `row`, `kv`, `frame`, `link`,
  `tree` (the rest come with their commands).
- `js/commands.js` with `/help`, `/track`, `/work`, `/b-sides`, `/about`
  (static parts only), `/contact` (with copy email), `/projects`, `/clear`.
- `js/shell.js`: parse, alias resolution (exported pure), submit, transcript
  append with the stdout reveal, scroll-to-top, URL push/popstate, nav
  interception with the typing animation, active-nav highlight, `Ctrl+L`,
  `/` to focus.
- `js/boot.js` for now just imports and starts the shell (the boot sequence
  arrives in phase 3).
- `test/shell.test.js`: parse cases, alias precedence (`track 02` over
  `track`), URL ↔ input round-trips, `/projects` matching (exact, title,
  subsequence, ambiguous).

Done when:
- Clicking "About" types `/about` and runs it; the turn scrolls to the top
  under the header; the nav highlights About.
- Typing `/projects cred` opens the CredVault card; `next` walks side A.
- Reload on `/projects/credvault` reproduces the turn; back button re-runs the
  previous command; `/clear` returns to `/`.
- `grep -r innerHTML js/` returns nothing.

Commit: `feat: command shell, transcript and url router`

## [ ] Phase 2 — Autocomplete, intent, history

Read: `05-commands.md` (popup, intent router, did-you-mean, shortcuts).

Build:
- Popup in `shell.js` (listbox semantics, keys, mobile chip strip).
- `js/intent.js`: `route(text)`, `didYouMean(name)`; the routed-turn
  `⎿ → /cmd` line; greeting and thanks replies.
- History with `↑`/`↓` and sessionStorage; `/history` command.
- Placeholder hint rotation.
- `test/intent.test.js`: every row of the intent table has at least one
  passing example; did-you-mean for `/wrok`, `/contac`, `/np`, `/xyz`.

Done when:
- Focus shows six suggestions; `/` lists all; `/np` + Tab completes to
  `/now-playing`; Enter runs; Esc closes; screen reader announces options.
- `what are you building` prints `⎿ → /queue` (the command itself lands
  in phase 4; until then it may print the unknown line) and `hey` greets.
- `/wrok` suggests `/work`.

Commit: `feat: autocomplete popup and free-text intent router`

## [ ] Phase 3 — Spectrum, boot, vinyl

Read: `01-vision.md` (signature element, first visit), `03-design-system.md` (motion, vinyl), `reference/home.png`.

Build:
- `js/rain.js`: character-grid canvas, density and colour ramps from CSS
  tokens, idle noise, burst on `turn`, live pulse on `live`, levels from
  `state.rain`, pause on hidden/offscreen, static frame under reduced motion,
  resize handling that keeps whole cells.
- `js/boot.js`: the boot lines once per tab session, any-key skip, reduced
  motion skip, then hand over to the shell.
- Vinyl: `.live` class wiring (the flag arrives in phase 4; wire the class now).
- `/eq` command.

Done when:
- At rest the header looks like the screenshot; a submit produces one
  visible burst; `/eq off` blanks it; `/eq loud` doubles it.
- Frame cost ≤ 2ms in the Performance panel; 0 frames while the tab is hidden.
- With "reduce motion" on in the OS: no boot, no rain animation, no typing
  animation, instant reveals, and the page is still recognisably the same.
- Second load in the same tab skips the boot; a new tab shows it.

Commit: `feat: glyph spectrum, boot sequence and vinyl`

## [ ] Phase 4 — Live data

Read: `06-live-data.md`, `05-commands.md` (live group), `02-content.md` (player, github, status, guestbook copy).

Build:
- Copy `api/github.js`, `api/guestbook.js`; copy and extend `api/nowplaying.js`;
  add `api/version.js`.
- `js/live.js`: `call()` with the tool-line spinner and AbortSignal; the
  now-playing poller; `state.live` updates.
- `render.graph`, `render.bar`, `render.form`.
- Commands: `/now-playing`, `/github`, `/status`, `/queue`, `/sign`,
  `/guestbook`, `/version`; the live stats in `/about`.
- `test/guestbook.test.js` ported from the old repo.

Done when:
- With `vercel dev` and real env: `/now-playing` shows art, track, artist,
  album, the correct label; the vinyl spins only while live; the spectrum
  pulses only while live; the turn updates within 30s of a track change.
- With `serve.py` (no api): every live command prints its fallback, nothing
  throws, no console errors.
- `/sign` round-trips; a second signature within the hour prints the server's
  rate-limit text; the honeypot path returns 200 and stores nothing.
- `/clear` during a pending fetch aborts it (no late DOM mutation).

Commit: `feat: last.fm player, github graph, guestbook and status`

## [ ] Phase 5 — Themes

Read: `03-design-system.md` (themes, palette transitions), `05-commands.md` (`/themes`).

Build:
- `/themes` picker, palette previews, persistence, `color-scheme`
  and `theme-color` meta updates, smooth in-place palette transitions, the rain
  re-reading its tokens, the amber scanline overlay.

Done when:
- All five themes pass the contrast numbers in `03-design-system.md`
  (check `--muted`/`--bg` and `--accent`/`--bg` with a contrast tool).
- Theme survives reload; the page never flashes the wrong theme on load
  (apply `data-theme` from storage in an inline script in `<head>` before CSS paints).
- Palette transitions are instant under reduced motion.

Commit: `feat: five themes with /themes picker`

## [ ] Phase 6 — B-sides and easter eggs

Read: `05-commands.md` (b-sides, hidden), `02-content.md` (stack table, banner, easter-egg copy).

Build:
- `/stack`, `/shuffle`, `/timeline`, `/ascii`, `/ls`, `/cat`, `/credits`,
  `/share`, `/resume` (with the HEAD check).
- Hidden: `/sudo`, `/rm`, `/vim` + armed `:q`, `/exit` family, `/matrix`,
  Konami listener.

Done when:
- Every command in `05-commands.md` exists in the registry and appears in
  exactly one `/help` group or is hidden; a test asserts this
  (`test/commands.test.js`: names unique, aliases unique, every non-hidden
  command has a summary, groups are one of the five).
- The banner does not wrap at 390px (scrolls inside its block).
- `/matrix` restores the previous rain level after 5s.

Commit: `feat: b-side commands and easter eggs`

## [ ] Phase 7 — Quality, docs, deploy

Read: `08-quality.md` in full.

Build:
- Run every checklist in `08-quality.md`; fix what fails.
- `README.md` at the repo root: what it is, how to run, how to edit
  content, the env table (adapt the old README; do not duplicate this brief).
- OG image: the owner supplies a 1200×630 screenshot as `assets/og.png`;
  wire the meta tags.
- Deploy to Vercel; set env; verify every live command in production.
- Developer Brain: create `projects/portfolio-2/overview.md` from the
  vault's project-overview template. Record one decision note only if a
  choice was made that the brief did not already make.

Done when:
- Lighthouse ≥ 95 on Performance, Accessibility, Best Practices, SEO in
  production.
- Keyboard-only walkthrough completes every command in `05-commands.md`.
- `07-build-plan.md` has all eight boxes ticked and the brief matches what
  shipped.

Commit: `docs: readme, og image and quality pass` (separate from any fix commits)

## After phase 7

The site is done. Later ideas go through the same filter as everything else
in `01-vision.md`: does it get a visitor to `/work` or `/contact` faster, or
make them type one more command? If neither, it is not a feature.
