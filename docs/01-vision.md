# 01 — Vision

## One sentence

A portfolio that is a terminal session: the visitor types slash commands to
an agent whose whole personality is Rakshit's work and music taste.

## The frame

The page is a Claude Code session where the agent is the portfolio.

- The visitor talks to it through a prompt fixed at the bottom of the screen.
- Every command becomes a **turn**: the echoed command as a chip, then the
  agent's response. Turns stack into a transcript. The newest turn is
  scrolled to the top of the view so it reads like a fresh page, but the
  history stays above it. `/clear` wipes it. The browser's back and forward
  buttons walk it.
- Live data (Last.fm, GitHub, the guestbook) shows up the way tool calls
  show up in an agent: a `⎿` line with a spinner that resolves in place.
- The nav at the top is a shortcut into the same system, not a second
  navigation: clicking "About" types `/about` into the prompt and runs it.
- Free text is understood by a small local keyword router. There is no LLM.

On top of the TUI sits the album theme carried over from the first portfolio
("a portfolio that plays like an album"):

| TUI thing | Album thing | What it actually is |
|---|---|---|
| section | track | 01 Intro · 02 Selected work (Side A) · 03 The lab (B-sides) · 04 Liner notes (About) · 05 Outro (Contact) |
| project | track on a side | Side A = selected work, Side B = the lab |
| project length | duration | the `dur` field; decorative but consistent |
| "in the studio" | the queue | projects marked `wip` |
| guestbook | signing the sleeve | Upstash-backed signatures |
| avatar | the record | a CSS vinyl that spins only while music is actually playing |
| header | the glyph spectrum | the signature element, below |
| `/now-playing` | the player | Last.fm: what's on right now, or what was on last |

## Single job of the page

Get a visitor to `/work` and `/contact` in under ten seconds, and make them
want to type one more command. Everything creative is secondary to that. If
a creative feature slows down the first two, cut the feature.

## Reference layout

`reference/home.png` is the source. As a wireframe (desktop, one cell is
one character):

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Rakshit Hooda                          Work · B-sides · About · Contact │  header, sticky
│                                                                          │
│      ·  +        ✱ +      ▪ ▪    ·      + ·  ✱ ▪ ▪ +   ·   ·  ·          │
│   ·  +  ·   +  · ✱ # ✱ ·  +  ✱  ·  ·  + ✱ # ✱ ·  ·   ·  ▪ ▪              │  glyph spectrum
│   ▪ ▪  ·  ▪ ▪  · + ✱ + ·  ·  +  ·  ·  ▪ + # + ▪  ·   ·  · ·              │  (canvas, 14 lines)
│                  · ▪ ·                    · ▪ ·                           │
│                                                                          │
│   ╭────╮  Rakshit Hooda                                                  │
│   │ ◉  │  Full-stack developer chasing good ideas and good music.        │  identity block
│   ╰────╯  ~Code & build stuff/Learn everything/Shipping always           │  (the record)
│                                                                          │
│           > /track 01  Intro                                             │  turn header chip
│                                                                          │
│           ● Hey. This is my portfolio, and it's a terminal.              │  response bullet
│             Type /help to see what it can do, or click a track above.    │
│                                                                          │
│           > /work                                                        │  next turn
│           ● Side A — selected work. 09 tracks, mixed 2023–2026.          │
│             01  CredVault ···························  WEB3  2025  04:12 │
│             …                                                            │
├──────────────────────────────────────────────────────────────────────────┤
│  > /now-playing▌                                                         │  prompt bar, fixed
└──────────────────────────────────────────────────────────────────────────┘
```

Proportions from the screenshot: header about 3 lines tall; spectrum about
260px (14 lines); content column starts about 250px from the left on a
1440px viewport with the vinyl sitting in the gutter; text wraps at about
88 characters; the prompt bar is about 56px tall with a hairline above it
on a slightly darker ground. The active track in the nav is drawn in the
accent colour (in the screenshot, "Contact").

## First visit, second by second

- **0.0s** — boot lines, once per tab session, at most 0.9s, any key
  skips, reduced motion skips entirely:
  ```
  rk-portfolio 2.0 · booting
  ⎿ loading tracks ........ ok  09 side A · 06 side B
  ⎿ tuning last.fm ........ ok
  ⎿ warming the spectrum .. ok
  > ready. type /help
  ```
- **0.9s** — the page as in the wireframe: header, spectrum settling in,
  identity block, the intro turn already rendered. The prompt is focused on
  desktop, not on mobile (no keyboard pop).
- **Visitor clicks "Work"** — `/work` types itself into the prompt at
  30ms per character, submits, the Work turn appends and scrolls to the top
  of the view, the spectrum bursts once.
- **Visitor types `/`** — the popup lists commands; typing filters; Tab
  completes; Enter runs.
- **Visitor types `what are you listening to`** — the intent router
  answers with `/now-playing`, and says so on a `⎿ → /now-playing` line.

## The signature element: the glyph spectrum

The one place the design takes a risk. A canvas drawn on the character
grid: 12 to 16 columns of glyphs, each column a bar of a lo-fi spectrum
analyser rendered in text.

- Density ramp, low to high: ` ` `·` `▪` `+` `✱` `#`.
- Intensity ramp, colour: `--rain-1 → --rain-2 → --rain-3`, peaking in
  `--rain-peak` (white on the default theme). Each theme sets its own ramp.
- Idle: slow noise, every column breathing at its own rate, capped at 30fps.
  It should look like the analyser on a paused deck: alive, not busy.
- On command submit: one burst. All columns jump, then decay over ~600ms.
- While `/now-playing` reports live: a steady pulse at about 90bpm on top
  of the idle noise. Not a fake beat sync. Just "the deck is on".
- Reduced motion: one static frame, tuned to look like the screenshot.
- 8 lines tall on mobile. Paused when the tab is hidden or the canvas has
  scrolled out of view.

Everything else on the page is quiet so this can be loud.

## Voice

- Dry, first person, short. The agent is Rakshit, not a mascot.
- Sentence case. No exclamation marks in UI chrome.
- All copy lives in `02-content.md`. The builder does not write new jokes.
- Errors give direction and never apologise: `Unknown command. Did you mean /work?`
- Empty states are invitations: `Nobody has signed yet. /sign to be first.`
- Labels name what the visitor controls: "Copy email", not "Submit".

## Anti-slop rules (hard rules)

1. One motion device for content: line-by-line stdout reveal. No opacity,
   translate or blur entrances on anything.
2. No hover scale, anywhere. Hover is a background highlight.
3. No stagger on lists. A tracklist prints; it does not cascade.
4. No pulsing, breathing or glowing indicators. The only looped animations
   are the spectrum, and the vinyl while music is live.
5. No gradient text, no glassmorphism, no drop shadows on cards. Boxes are
   box-drawing characters or 1px lines.
6. Numbers only where they mean something: track numbers, years,
   durations, counts from real data. No invented percentages on `/stack`.
7. One typeface. Hierarchy comes from weight and colour.
8. No emoji in UI chrome.
9. No quotes from famous people. No "passionate about". No "crafting
   digital experiences".
10. If a feature would look at home on a template, it does not ship.

## Non-goals

- No LLM. Free text is handled by the local keyword router in `05-commands.md`.
- No ambient audio loop. The old site had one; this site's music is the
  visitor's own, through Last.fm.
- No CMS, no blog, no analytics beyond Vercel's script tag.
- No app-like gestures. It is a terminal. It scrolls.
