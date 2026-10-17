# 03 — Design system

Read with `reference/home.png` open. Everything here derives from that
screenshot plus the rule that this is a real terminal grid, not a web page
set in a monospace font.

## The grid

Two custom properties drive every dimension:

```css
:root {
  --fs: 14px;                 /* 13px under 480px */
  --lh: calc(var(--fs) * 1.5);/* one line = 21px desktop, 19.5px mobile */
  --ch: 1ch;                  /* one character cell, measured by the browser */
}
```

Rules:
- Vertical rhythm is whole lines. Padding, margins and heights are
  `calc(var(--lh) * n)`. Nothing sits at half a line.
- Horizontal measures are in `ch`. The content column is `88ch`, the avatar
  gutter `10ch`, the tracklist number column `4ch`, the tag column `20ch`.
- Boxes are drawn with box-drawing characters or 1px borders that sit on
  cell edges. Never rounded corners larger than 2px. The turn chip is the
  one exception (a 3px radius pill, as in the screenshot).
- The rain canvas is sized in whole cells: `cols × ch` by `rows × lh`, and
  draws one glyph per cell with the same font. That is what makes it read as
  part of the terminal instead of a background image.

## Type

- One family: **JetBrains Mono**, weights 400 and 500 (700 only for the
  `/ascii` banner if needed). Google Fonts, `display=swap`, `font-feature-settings: "liga" 0, "calt" 0`.
- Fallback stack: `"JetBrains Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace`.
- Size: one size. `--fs` everywhere. The name in the header is 500 weight,
  not larger. Section titles are 500 weight in `--text`; everything else 400.
- Colour is the hierarchy: `--text` for content, `--muted` for chrome and
  metadata, `--accent` for the active nav item, links on hover, and the
  `>` chip prefix.
- Tabular numerals on: `font-variant-numeric: tabular-nums`.
- Letter-spacing 0. Uppercase only for tags (`WEB3`), track labels and the
  `NOW PLAYING` label, matching the old site.

## Layout

Desktop (≥ 900px):

```
header    sticky top, height 3lh, padding-inline 3ch, name left, nav right,
          background --bg at 92% with backdrop-blur 6px once scrolled past the rain
rain      full width, height 14lh, scrolls away with the page
main      max-width 88ch, margin-inline auto, padding-inline 3ch, padding-bottom 6lh
  intro   grid: [10ch avatar] [1fr text]; vinyl 6ch wide, top-aligned to the name
  turns   each turn: chip (1lh), blank line, response block; margin-bottom 2lh
prompt    fixed bottom, height 3lh (+ safe-area), border-top 1px --line,
          background --bar; inner max-width 88ch to align with main
popup     absolute above the prompt, same 88ch column, max 8 rows + header row
```

Mobile (< 900px): main padding-inline 2ch; intro stacks (vinyl 5ch above the
name); rain 8lh; nav collapses to the four labels in a single row at `--muted`
with the active one in `--accent` (no hamburger); popup becomes a horizontal
chip strip above the prompt; viewport meta includes
`interactive-widget=resizes-content` and heights use `100dvh` so the fixed
prompt stays above the iOS keyboard.

`scroll-margin-top` on every turn = `calc(var(--lh) * 3 + 1lh)` so a turn
scrolled to the top clears the sticky header with one blank line.

## Themes

Themes are `[data-theme="…"]` blocks on `<html>`, setting the same token
set. No component references a colour by value; only by token. `midnight` is
also the bare `:root` block so the page is correct before JS runs.

| token | midnight (default) | night-sage | amber | paper | neon |
|---|---|---|---|---|---|
| `--bg` | `#0f0f11` | `#0a0b0a` | `#0c0a07` | `#f4f2ec` | `#0b0b14` |
| `--bar` (prompt bar) | `#0a0a0c` | `#070807` | `#080604` | `#ebe8df` | `#07070f` |
| `--surface` | `#1a1a1e` | `#131513` | `#161208` | `#e9e6dd` | `#14142a` |
| `--chip` | `#26262b` | `#1c1f1c` | `#221b0b` | `#dcd8cc` | `#1d1d3a` |
| `--line` | `#26262b` | `rgba(234,234,226,.09)` | `#2e2410` | `#d3cfc2` | `#22224a` |
| `--text` | `#e6e6e8` | `#eaeae2` | `#ffb000` | `#17171a` | `#e8e8ff` |
| `--muted` | `#8b8b93` | `#7e827a` | `#a07a2a` | `#6b6b70` | `#7b7b9e` |
| `--accent` | `#6f8cff` | `#a8b58a` | `#ffd166` | `#2f4fd6` | `#5ff3e0` |
| `--label` (vinyl centre) | `#d63b3b` | `#a8b58a` | `#ff6a00` | `#d63b3b` | `#ff6ad5` |
| `--rain-1` | `#3d3a7a` | `#3a4032` | `#4a3410` | `#c9c4b4` | `#2a2a5a` |
| `--rain-2` | `#7c5cf6` | `#6f7a5c` | `#a07a2a` | `#8f89c9` | `#ff6ad5` |
| `--rain-3` | `#a78bfa` | `#a8b58a` | `#ffb000` | `#4b5fd6` | `#5ff3e0` |
| `--rain-peak` | `#ffffff` | `#eaeae2` | `#ffe3a3` | `#17171a` | `#ffffff` |
| `--selection` | `--accent` on `--bg` | same | same | same | same |

Contrast (computed, WCAG): `--text`/`--bg` is ≥ 11:1 on every theme;
`--muted`/`--bg` is 5.7 (midnight), 5.0 (night-sage), 5.0 (amber), 4.7
(paper), 4.8 (neon); `--accent`/`--bg` is ≥ 5.9 everywhere. Re-verify with
a contrast checker if any value changes; `--muted` must stay ≥ 4.5.

`amber` adds an opt-in scanline overlay (`body::after`, 2px repeating
gradient at 4% opacity). `midnight` and the others have no overlay; the old
site's film grain is dropped.

`color-scheme` is set per theme (`dark` / `light` for paper) so native
controls and the caret match.

## Block vocabulary

`render.js` exposes exactly these builders. Every command's output is
composed from them. Each returns a DOM node built with `createElement` and
`textContent`.

### chip — the turn header
```
 > /track 02  Selected work
```
Pill on `--chip`, padding `0 1ch`, `>` and the command in `--accent`, the
title in `--text`. Clicking the chip re-runs the command.

### bullet — the response opener
```
● Side A — selected work. 09 tracks, mixed 2023–2026.
  continuation lines hang 2ch under the text
```
`●` in `--text`. One per turn; the rest of the response is indented 2ch.

### tool — a live step
```
  ⎿ last.fm: live
  ⎿ ⠋ last.fm …           (while pending; spinner frames ⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏ at 80ms)
  ⎿ ✗ last.fm: offline    (on failure; the command then prints its fallback)
```
`⎿` and text in `--muted`. The spinner is the only "loading" UI; no skeletons, no bars.

### row — a tracklist line
```
  02  Cult-Bot ·······················  AUTOMATION TOOLS  2025  05:01
```
Columns: `4ch` number in `--muted`, title in `--text`, leader dots in
`--line` filling to the tags column, tags `20ch` uppercase `--muted`, year
`6ch`, duration `5ch` right-aligned. The whole row is a `<button>`; hover and
focus set `--surface` behind it and the duration cell shows `▶` instead.
`wip` rows show `UNRELEASED` in the tags column and `--:--`.

### kv — key/value lines
```
  email     rakshit.official703@gmail.com   [Copy email]   no spam, i promise
```
Key `10ch` in `--muted`, value in `--text`, optional action as a text button
in `--accent`, note in `--muted`.

### frame — a box
```
  ┌──────────────────────────┐
  │                          │
  └──────────────────────────┘
```
Drawn with real box-drawing characters in `--line`, one per cell, so it
stays on the grid at any width. Used for the `/play` cover and the player.

### bar — cells
```
  ▮▮▮▯▯   (stack fader, 3 or 5 cells)
  ▮▮▮▮▮▮▮▮▮▮▮▮▯▯▯▯▯▯▯▯   (player EQ, 20 cells, animated only while live)
```
Filled `--accent`, empty `--line`.

### graph — 52 × 7 contribution cells
One glyph per day: `·` for zero in `--line`; `▪` for levels 1–4 coloured
`--rain-1`, `--rain-2`, `--rain-3`, `--rain-peak`. Month initials above in
`--muted`. Mobile shows the last 26 weeks.

### swatch
```
  ██ ██ ██  midnight   the reference mix   ← current
```
Three `██` pairs in that theme's `--bg`, `--accent`, `--rain-2`.

### link
Inline `<a>` in `--text` with a 1px underline in `--line`; hover: text and
underline `--accent`. External links get a trailing ` ↗`.

### form — inline inputs (guestbook only)
Inputs are real `<input>`s styled as `[________]` on `--surface`, 1px
`--line` border, focus border `--accent`. Buttons are text buttons.

### tree — the timeline
```
  2026 ─┬─ Clixo                  WEB3
        ├─ ProcrastiNO            APPS
        └─ Developer Brain        TOOLS · in the studio
```

## Components outside the transcript

### Vinyl avatar
A 6ch (≈ 84px) disc drawn in CSS: `background: repeating-radial-gradient`
(2px groove pitch, `--surface`/`--bg`), a centre label 34% of the diameter in
`--label`, a 4px `--bg` spindle hole. `transform: rotate()` via one
`@keyframes spin 4s linear infinite`, applied **only** when `.live` is set
by the now-playing poller. Clicking the record runs `/now-playing`. Under
reduced motion it never spins; the label shows a static `●` glyph instead.

### Header and nav
Name at 500 weight left; nav right as `Work · B-sides · About · Contact`
with `·` separators in `--line`. The active track (the track of the newest
turn) is `--accent`. Nav items are `<a href="/work">` etc. so they work as
plain links; JS intercepts the click to type the command instead.

### Prompt bar
`> ` in `--muted`, then a borderless `<input>` on `--bar`, `caret-color: --accent`.
Placeholder in `--muted` rotates the hints from `02-content.md`. On the
right edge, a `--muted` hint `/ for commands` on desktop only.

### Autocomplete popup
Sits directly above the bar in the 88ch column, on `--surface` with a 1px
`--line` border. Each row: command `18ch` in `--text`, summary in `--muted`.
The selected row has `--chip` behind it and a `›` in `--accent` in its
first cell. A one-line footer in `--muted`: `↑↓ move · Tab complete · Enter run · Esc close`.

## Motion

Frequency gate first: anything the visitor triggers many times per visit
(typing, arrowing through the popup, hovering rows) does not animate.
Everything else follows this table.

| moment | device | duration | reduced motion |
|---|---|---|---|
| response content appears | line-by-line stdout reveal: each `--lh` row becomes visible in order, ~16ms per line, capped at 300ms total | ≤ 300ms | instant |
| new turn scrolls to top | `scrollIntoView({ block: "start", behavior: "smooth" })` | browser default | `behavior: "auto"` |
| nav click | the command types into the prompt at 30ms per character, then submits | ≤ 400ms | instant fill, then submit |
| live fetch pending | spinner frames on the tool line | until resolved | static `…` |
| spectrum idle | noise-driven column heights, ≤ 30fps | continuous | static frame |
| spectrum burst | on submit, all columns +40% then decay | ~600ms | none |
| spectrum live pulse | +15% at ~90bpm while now-playing is live | continuous | none |
| vinyl | one revolution per 4s while live | continuous | none |
| theme switch | top-to-bottom redraw wipe: rows repaint in the new palette in order | ~300ms | instant |
| row / link hover | background or colour change | 120ms | 120ms |
| popup open / close | none. It appears. | 0 | 0 |
| boot | lines print one by one | ≤ 900ms total | skipped |
| `/shuffle` | the title cell cycles through random titles | 600ms | picks instantly |
| `/matrix` | spectrum goes full-height in green for 5s | 5s | prints the line only |

Easing for anything that eases: `cubic-bezier(0.2, 0, 0, 1)`. Never the
CSS defaults `ease` or `ease-in-out`. Never a spring with overshoot.

Anything that loops is wrapped in `@media (prefers-reduced-motion: no-preference)`.
The JS side checks `matchMedia("(prefers-reduced-motion: reduce)")` once at
boot and again on change.

## Accessibility baseline

- Focus ring: `outline: 1px solid var(--accent); outline-offset: 2px` on
  every interactive element, never removed.
- Transcript container: `role="log" aria-live="polite" aria-relevant="additions"`.
- Popup: `role="listbox"` with `role="option"` rows and `aria-activedescendant`
  on the input; the input has `aria-autocomplete="list"` and `aria-expanded`.
- Tool-line spinner: `aria-busy="true"` on the turn while pending.
- The rain canvas: `aria-hidden="true"`, and the identity block carries the
  real text so nothing meaningful lives only in the canvas.
- Tracklist rows are buttons with an `aria-label` of `Play {title}`.
- Every theme meets the contrast numbers above.
- Text zoom to 200% must not break the grid: sizes are in `ch`/`lh`, so
  it scales; verify the prompt bar and popup at 200%.
