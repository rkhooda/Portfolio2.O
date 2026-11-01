# 05 — Commands

The full catalog. Every command lists its canonical name, aliases, group
(for `/help` and the popup), what it prints (as an ASCII mock using the
block vocabulary from `03-design-system.md`), and behaviour notes. Copy
strings come from `02-content.md`; do not invent new ones here.

Groups: `tracks` · `core` · `live` · `b-sides` · `hidden`.

## `/help` — how it lays out the groups

```
> /help
● Commands. Type / to autocomplete, ↑ for history, Tab to complete.

  tracks
  /work              Selected work — side A
  /b-sides           The lab — side B
  /about             Liner notes
  /contact           Outro — let's talk
  /track <n>         Play a track by number, 01–05

  core
  /help              This list
  /play <project>    Open a project; no argument shuffles
  /themes            List themes         /theme <name>   Switch
  /resume            Résumé (PDF)
  /share             Copy a link to this command
  /clear             Wipe the transcript (Ctrl+L)

  live
  /now-playing       What's on, via Spotify
  /github            Contributions, last 12 months
  /status            Time, streak, what's building, what's playing
  /queue             In the studio
  /sign              Sign the sleeve       /guestbook      Read the sleeve

  b-sides
  /stack  /shuffle  /timeline  /ascii  /ls  /cat <file>  /eq  /history  /version  /credits

  Free text works too — ask about work, music, or contact.
```

Each `/command` in the list is clickable and runs it. Hidden commands are
not listed.

---

## tracks

### `/work`
aliases `track 02`, `projects`, `side-a` · sets active nav `Work`
```
> /work
● Side A — selected work. 09 tracks, mixed 2023–2026.
  01  CredVault ····························  WEB3 PLATFORM      2025  04:12
  02  Multiagent Builder ···················  UNRELEASED         2026  --:--
  03  Cult-Bot ·····························  AUTOMATION TOOLS   2025  05:01
  04  Clixo ································  WEB3 WEB           2026  03:47
  05  Bellsy ·······························  TOOLS              2025  02:48
  06  FlowPane ·····························  APPS TOOLS         2025  03:24
  07  ProcrastiNO ··························  APPS               2026  03:12
  08  StatisticalStudies ···················  WEB APPS           2025  04:37
  09  Developer Brain ······················  UNRELEASED         2026  ∞
```
Rows are buttons → `/play <slug>`. Hover/focus swaps the duration for `▶`.

### `/b-sides`
aliases `track 03`, `lab`, `side-b`, `bsides` · active nav `B-sides`
Same layout with BSIDES; tags column shows `tags`, and the row's hover
reveals `stack` joined by ` · ` in place of the leader dots.

### `/about`
aliases `track 04`, `liner-notes`, `whoami`, `bio` · active nav `About`
```
> /about
● Liner notes.
  I pick things up fast and actually ship them. Web3, AI agents, full-stack
  apps, Linux, Discord bots — if it's interesting, I'll figure it out and
  build something real with it.

  No scammy products, no hollow AI wrappers, nothing built to manipulate.
  I'd rather make something genuinely useful — even if it's small.

  ⎿ github: 1,284 contributions · 12 day streak
  contributions   1,284      streak      12 days
  shipped         12         in studio   03

  WEB · AI · APPS · GAMES · WEB3 · TOOLS · AUTOMATION · LAB

  /github for the graph · /stack for the mixer · /queue for what's next
```
The two live numbers arrive through the tool line; the two derived ones
print immediately. Numbers under 100 are zero-padded to two digits, larger
ones use locale grouping (same rule as the old site).

### `/contact`
aliases `track 05`, `outro`, `email`, `hire` · active nav `Contact`
```
> /contact
● Let's talk
  Got an idea, a project, or a song recommendation? All three are welcome.

  email      rakshit.official703@gmail.com   [Copy email]   no spam, i promise
  github     github.com/rkhooda ↗                           where the code lives
  linkedin   linkedin.com/in/rakshit-hooda ↗                the formal version of me

  /sign to leave a note on the sleeve instead
```
`[Copy email]` uses the Clipboard API and replaces itself with `Copied.`
for 2s. The email is also a `mailto:` link.

### `/track <n>`
aliases `t`
`01` → intro turn · `02`–`05` → the track above · anything else → `Unknown command: /track 07. /help lists everything.` Accepts `1`, `01`, `track01`.
The intro turn (`/track 01`) prints the intro copy under the chip `> /track 01  Intro`.

---

## core

### `/help`
aliases `?`, `commands`, `h` · layout above.

### `/play <project>`
aliases `open`, `p`
Match: exact slug → case-insensitive title → subsequence over slug and title
(so `/play cred`, `/play multi`, `/play flappy` all work). Ambiguous match
lists the candidates as rows. No argument → same as `/shuffle`.
```
> /play credvault
● CredVault                                        WEB3 · PLATFORM · 2025
  ┌────────────────────────────┐
  │                            │   Secure, decentralized issuance &
  │        [cover art]         │   verification of credentials on the
  │                            │   blockchain.
  └────────────────────────────┘
  track 01 of side A · 04:12
  ↗ cred-vaulte.vercel.app

  ⎿ next: /play multiagent-builder · back: /work
```
The cover is the `cover` file inside a `frame`; B-sides show `blurb` and a
`stack` line. `wip` cards show `UNRELEASED · in the studio` instead of a
link. `next` wraps around within the same side.

### `/themes` and `/theme <name>`
aliases `theme` (no arg → list), `colors`, `colours`
```
> /themes
● Themes
  ██ ██ ██  midnight     the reference mix          ← current
  ██ ██ ██  night-sage   the first album
  ██ ██ ██  amber        phosphor
  ██ ██ ██  paper        liner notes, in daylight
  ██ ██ ██  neon         side B at 2am
  /theme <name> to switch. Click a row too.
```
`/theme amber` → `state.setTheme`, the redraw wipe, and a one-line turn
`● Theme: amber.` Unknown name → `No theme called x. /themes lists them.`
The theme persists in localStorage.

### `/resume`
aliases `cv`
Opens `/resume.pdf` in a new tab and prints `Résumé — opens as PDF.` with a
link. Before opening, `HEAD /resume.pdf`; on 404 print the "remastered"
fallback and do not open a tab.

### `/share`
Copies `location.href` (the current command's URL) and prints
`Link copied: {url}`. If the clipboard is unavailable, prints `Copy this: {url}`
with the URL selectable. Hidden from the URL router (it never pushes).

### `/clear`
aliases `cls`, `reset` · shortcut `Ctrl+L`
Aborts in-flight fetches, empties the transcript, re-renders the intro turn,
sets the URL to `/`, keeps history and theme.

---

## live

### `/now-playing`
aliases `np`, `listening`, `music`, `spotify`, `playing`
```
> /now-playing
● The player
  ⎿ Spotify: live

  ┌──────────┐  Love Yourz
  │          │  J. Cole · 2014 Forest Hills Drive
  │  [art]   │  ▮▮▮▮▮▮▮▮▮▮▮▮▯▯▯▯▯▯▯▯
  │          │  NOW PLAYING · via Spotify
  └──────────┘
```
- Art: the `image` URL from the API inside a `frame`; if the API returns no
  usable image, the frame shows a vinyl glyph `◉` centred.
- The 20-cell bar is an equaliser, not a progress bar. While live, cells
  step randomly ±1 every 250ms around a mean
  of 12; when not live the bar is static at 8 cells. Under reduced motion,
  static in both states.
- Paused: the current Spotify track remains visible with the `PAUSED` label.
- No active track: `No active track · via Spotify`.
- The turn keeps polling every 30s while on screen (see `live.js`). The
  vinyl avatar and the spectrum's live pulse follow the same flag.
- Offline: `⎿ ✗ Spotify: offline` then the fallback line from the copy bank.

### `/github`
aliases `graph`, `contributions`, `commits`
```
> /github
● rkhooda on GitHub
  ⎿ github: 1,284 contributions · 12 day streak
      Oct   Nov   Dec   Jan   Feb   Mar   Apr   May   Jun   Jul   Aug   Sep
  Mon ·▪▪·▪▪▪▪·▪▪▪▪▪▪·▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪
      ·▪·▪·▪▪·▪▪▪·▪▪·▪▪▪▪▪·▪▪▪▪▪▪·▪▪▪▪▪▪▪▪▪▪·▪▪▪▪▪▪▪▪▪▪▪▪▪▪
  Wed ▪▪▪▪▪▪·▪▪▪▪▪▪▪▪▪▪·▪▪▪▪▪▪▪▪▪▪▪▪▪▪·▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪
      … 7 rows × 52 columns
  ↗ github.com/rkhooda
```
Levels 0–4 from `count / max`, as in the old `live.js`. Each cell has a
`title` of `{date}: {n} contributions`. Mobile renders the last 26 weeks.

### `/status`
aliases `uptime`, `now`
```
> /status
● Status
  time      02:14 IST · probably asleep
  streak    12 days
  building  Multiagent Builder
  playing   Love Yourz — J. Cole · 3 min. ago
```
Time via `Intl.DateTimeFormat` with `SITE.timezone`. Two tool lines
(github, Spotify) resolve into the `streak` and `playing` rows; on failure
those rows print `—`.

### `/queue`
aliases `studio`, `wip`, `next`, `building`
```
> /queue
● Up next — in the studio
  01  Multiagent Builder ·················  AI SYSTEM          2026
  02  Developer Brain ····················  TOOLS LAB          2026
  03  Payline Slot Engine ················  GAMES              2026
```
Rows → `/play`.

### `/sign`
aliases `guestbook sign`, `signature`
```
> /sign
● Sign the sleeve
  name   [________________________]          24 max
  note   [__________________________________________]   140 max
  [Sign]  Cancel
```
Inline form; a hidden honeypot field named `website`. Submit → `POST /api/guestbook`.
Success replaces the form with `Signed. Thanks for listening.` and the new
entry as a guestbook row. Server error text prints under the form. Enter in
the note field submits; `Cancel` removes the form (the chip stays).

### `/guestbook`
aliases `sleeve`, `signatures`
```
> /guestbook
● Signatures · 37
  ⎿ upstash: 37 total, showing 10
  Maya         good taste in music                         2 hr. ago
  arjun_dev    the /vim one got me                          1 day ago
  …
  /guestbook all for the rest · /sign to add yours
```
`/guestbook all` shows every entry the API returns (50). Names and notes
are `textContent`. Empty state from the copy bank.

---

## b-sides

### `/stack`
aliases `skills`, `tools`, `tech`
```
> /stack
● The mixer — no percentages, just how often the fader's up
  FRONTEND      JavaScript / TypeScript     ▮▮▮  daily
                HTML / CSS                  ▮▮▮  daily
                React / Next.js             ▮▮▯  often
                React Native / Expo         ▮▮▯  often
                Tailwind                    ▮▮▯  often
                Three.js / GSAP             ▮▯▯  dabbled
  BACKEND       Node                        ▮▮▮  daily
  …
```
Data from `STACK` in `data.js`. Three cells: daily 3, often 2, dabbled 1.

### `/shuffle`
aliases `random`, `surprise`
Prints `● Shuffling…`, then the title cell cycles through random titles for
600ms (instant under reduced motion), then the turn becomes a `/play` card
for a random non-wip project. Not pushed to the URL as `/shuffle`; the
resulting card pushes `/play/<slug>`.

### `/timeline`
aliases `discography`, `years`
```
> /timeline
● Discography
  2026 ─┬─ Multiagent Builder     AI · in the studio
        ├─ Clixo                  WEB3
        ├─ ProcrastiNO            APPS
        ├─ Developer Brain        TOOLS · in the studio
        └─ Payline Slot Engine    GAMES · in the studio
  2025 ─┬─ CredVault              WEB3
        ├─ Cult-Bot               AUTOMATION
        ├─ Bellsy                 TOOLS
        ├─ FlowPane               APPS
        └─ StatisticalStudies     WEB
  2024 ─┬─ MaanKiBaat             AI
        ├─ Recipify               AI
        └─ SlotMachine            GAMES
  2023 ─┬─ Flappy-Bird            GAMES
        └─ Snake                  GAMES
```
Grouped by `year`, newest first, PROJECTS before BSIDES within a year, first
tag only. Titles → `/play`.

### `/ascii`
aliases `banner`, `logo`
Prints the banner from `02-content.md` in `--accent`, inside an
`overflow-x: auto` block.

### `/ls`
aliases `dir`, `tree`
Prints the listing from the copy bank; every entry is a button:
`work/` → `/work`, `b-sides/` → `/b-sides`, `about.md` → `/about`,
`contact.md` → `/contact`, `now-playing` → `/now-playing`, `themes/` → `/themes`,
`resume.pdf` → `/resume`.

### `/cat <file>`
Same mapping as `/ls` (`about.md`, `contact.md`, `work`, `b-sides`, …).
Unknown → `cat: {file}: no such track`.

### `/eq <level>`
aliases `rain`, `spectrum`
`off` · `ambient` (default) · `loud` (columns twice as tall and the burst
twice as strong). No argument prints the current level and the options.
Persists in localStorage.

### `/history`
Prints this session's inputs, oldest first, each a button that re-runs it.
Not pushed to the URL.

### `/version`
aliases `v`, `about-site`
`portfolio 2.0.0 · a1b2c3d · main · deps: 0 · build step: none`, from
`/api/version`; if that fails, prints the version without sha and ref.

### `/credits`
aliases `footer`, `colophon`
The four credit lines from the copy bank.

---

## hidden (easter eggs)

Not in `/help`, not in the popup, never pushed to the URL. Their turns do
appear in the transcript. All replies are in `02-content.md`.

| input | behaviour |
|---|---|
| `/sudo …` | the sudoers line |
| `/rm …` | `Permission denied. Nice try.` |
| `/vim`, `/vi`, `/nano` | the vim line; arms `:q`, `:q!`, `:wq` for 60s |
| `:q` (armed) | `Free. That was the hard part.` |
| `/exit`, `/quit`, `/q` | the no-exit line |
| `/matrix` | the green line; spectrum full height in `#33ff66` at `loud` for 5s, then back |
| Konami code (↑↑↓↓←→←→BA on the page, not in the input) | same as `/matrix` |

---

## Autocomplete popup

- **Opens** on prompt focus (empty input → the six suggested: `help`,
  `work`, `now-playing`, `themes`, `about`, `contact`) and whenever the
  input starts with `/`.
- **Filters** by the text after `/` up to the first space: exact canonical
  names first, then canonical-name prefixes, alias prefixes, and subsequence
  matches (`/np` → `now-playing` via alias, `/gtb` → `github`), preserving
  registry order inside each tier. Aliases match but the row shows the
  canonical name. Once a space is typed, the popup closes (args are free text).
- **Keys**: `↑`/`↓` move the selection (wrapping), `Tab` completes the
  selected name into the input and adds a trailing space if the command
  takes args, `Enter` runs the selected row (or the raw input when nothing
  is selected), `Esc` closes. Mouse click on a row runs it.
- **Renders** at most 8 rows; the list scrolls to keep the selection
  visible. Footer: `↑↓ move · Tab complete · Enter run · Esc close`.
- **Mobile**: a single horizontal, scrollable chip strip above the prompt;
  tap runs.
- No open/close animation.

## Free-text intent router (`intent.js`)

Applies only when the input does not start with `/` (and is not an armed
`:q`). Lowercase, match whole words, first matching row wins.

| keywords (any) | routes to |
|---|---|
| work, project, projects, built, portfolio, side a | `/work` |
| lab, experiment, experiments, game, games, b-side, b-sides, side b | `/b-sides` |
| who, about, bio, yourself, background | `/about` |
| email, mail, contact, reach, hire, hiring, talk, linkedin | `/contact` |
| listen, listening, song, music, playing, spotify, lastfm, last.fm | `/now-playing` |
| github, commit, commits, streak, contributions | `/github` |
| theme, themes, dark, light, colour, color, colours, colors | `/themes` |
| resume, cv | `/resume` |
| building, working on, next, studio, wip, queue | `/queue` |
| stack, skills, tech, languages, tools | `/stack` |
| help, commands, what can you do | `/help` |
| time, awake, status | `/status` |
| sign, guestbook, sleeve | `/guestbook` |
| hi, hello, hey, yo, sup, hola, namaste | greeting reply (no command) |
| thanks, thank you, ty, cheers | thanks reply (no command) |

A routed turn echoes the raw text in the chip and prints `⎿ → /queue`
above the routed output, so the interpretation is visible. No match → the
"I only speak slash" line.

**Did you mean** (unknown slash command): candidates are all non-hidden
names and aliases; suggest the first with edit distance ≤ 2 or a shared
prefix of ≥ 3 characters. Otherwise the plain unknown line.

## Keyboard shortcuts

| key | where | does |
|---|---|---|
| `/` | anywhere outside an input | focus the prompt with `/` typed |
| `Enter` | prompt | run |
| `Tab` | prompt, popup open | complete |
| `↑` `↓` | prompt, popup open | move selection |
| `↑` `↓` | prompt, popup closed | walk history |
| `Esc` | prompt | close popup, then blur |
| `Ctrl+L` | anywhere | `/clear` |
| Konami | anywhere outside an input | `/matrix` |

Shortcuts never animate.
