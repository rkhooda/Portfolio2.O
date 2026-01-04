# 08 — Quality

Run at the end of every phase. Each list is a gate, not a suggestion.

## Every phase

- [ ] `node --test` passes.
- [ ] No console errors or warnings with `serve.py` (no api) and with `vercel dev`.
- [ ] `grep -rn innerHTML js/` returns nothing.
- [ ] 1440px and 390px both look right; nothing scrolls horizontally except
      the `/ascii` block and the graph on very narrow screens.
- [ ] OS "reduce motion" on: nothing loops, nothing types itself, reveals
      are instant, the boot is skipped, the page is still the same page.
- [ ] Every new interactive element has a visible focus ring and works with
      Enter/Space.
- [ ] Every new string comes from `02-content.md`.

## Keyboard-only walkthrough (phase 2 onward)

Unplug the mouse:
1. `/` focuses the prompt. Type `/wo`, `Tab`, `Enter` → Work turn, scrolled
   to the top, nav shows Work active.
2. `Tab` from the prompt lands on the first tracklist row; `Enter` opens the
   card; `Tab` reaches the external link and the `next` link.
3. `Shift+Tab` back to the prompt, `↑` recalls `/work`.
4. `Esc` closes the popup, `Esc` again blurs; `Ctrl+L` clears.
5. Nav: `Tab` to "About", `Enter` runs it without the typing animation.
6. `/sign`: `Tab` through name, note, Sign, Cancel; `Enter` in note submits.

## Screen reader (phase 2 onward, VoiceOver on macOS is enough)

- The transcript is announced as new turns land (`role="log"`).
- The popup announces "listbox, 6 items" and the selected option changes
  with the arrows.
- The rain canvas is silent; the identity text is read.
- Tracklist rows read as "Play CredVault, button".
- The vinyl reads as "Now playing, button".

## Contrast (phase 0 and 5)

For each theme, with a contrast checker:
- `--text` on `--bg` ≥ 7:1
- `--muted` on `--bg` ≥ 4.5:1
- `--accent` on `--bg` ≥ 4.5:1
- `--accent` on `--chip` ≥ 4.5:1 (the chip prefix)
- `--rain-1` is allowed to fail; it is decoration.

## Mobile (every phase from 0)

- iOS Safari and Android Chrome: the prompt bar sits above the keyboard when
  focused (`100dvh`, `interactive-widget=resizes-content`, safe-area inset).
- No auto-focus on load (no keyboard pop).
- The popup chip strip is reachable with a thumb and scrolls sideways.
- Tap targets ≥ 44px tall for rows, chips and nav items (pad the row, keep
  the text on the grid).
- Text at 13px stays readable; the graph shows 26 weeks.

## Performance (phase 3 and 7)

- Total JS ≤ 60 KB, CSS ≤ 25 KB (`wc -c`).
- Rain frame ≤ 2ms; 0 frames while hidden (`document.visibilityState`).
- Fonts: 2 weights, `display=swap`, `preconnect` to `fonts.gstatic.com`.
- Lighthouse mobile in production: Performance ≥ 95, Accessibility ≥ 95,
  Best Practices ≥ 95, SEO ≥ 95.
- LCP element is the identity block text, not the canvas.

## SEO and sharing (phase 0 and 7)

- `<title>`, meta description, OG title/description/image, `theme-color`.
- The identity block, nav links, bio hook and contact links exist in the
  static HTML.
- `<noscript>` with the email, GitHub and LinkedIn links.
- Every command URL (`/work`, `/projects/credvault`, …) renders the intro plus
  that turn on load, so shared links land on content.

## Security (phase 4)

- Guestbook: caps, control characters, blocklist, rate limit, honeypot and
  Origin check all exercised by `test/guestbook.test.js`.
- Last.fm strings and guestbook rows rendered via `textContent`.
- External links `rel="noopener"`.
- `api/version.js` leaks nothing but the short SHA and ref.
- No secrets in the repo; `.env*` ignored.

## Tests (`node --test test/`)

| file | covers |
|---|---|
| `test/shell.test.js` | parse, alias precedence, URL ↔ input, `/projects` matching, `/track` argument forms |
| `test/intent.test.js` | one example per intent row, greeting/thanks, did-you-mean cases |
| `test/commands.test.js` | unique names and aliases, every non-hidden command has group + summary, `/help` covers every non-hidden command |
| `test/guestbook.test.js` | the `clean` guard, ported from the old repo |
| `node api/github.js` | `streakOf` edge cases (self-check in the file) |

Modules under test export their pure functions and never touch `document`
at import time.

## Definition of done (phase 7)

- All gates above pass in production.
- The brief in `docs/` matches what shipped; any drift was fixed in the
  same commit as the code.
- `README.md` tells a stranger how to run it and how to change content.
- Developer Brain has `projects/portfolio-2/overview.md`.
