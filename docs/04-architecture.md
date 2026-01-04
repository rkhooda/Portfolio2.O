# 04 — Architecture

Vanilla HTML/CSS/JS, native ES modules, no build step, no dependencies.
Static files plus four Node functions under `api/`, hosted on Vercel.

## File tree

```
index.html          static shell: header, nav, rain canvas, identity block, the intro
                    turn, transcript container, prompt bar, popup. Real text in the
                    HTML so crawlers and no-JS visitors see the essentials.
404.html            "this track doesn't exist. skipped." + link home (Vercel fallback only)
vercel.json         rewrites: every non-file, non-api path → /index.html
serve.py            copied from the old repo: no-cache static server for local front-end work
resume.pdf          owner-supplied
css/tokens.css      grid vars + the five [data-theme] palettes (03-design-system)
css/tui.css         layout, block styles, prompt bar, popup, responsive, reduced motion
js/data.js          SITE, TRACKS, PROJECTS, BSIDES, STACK, THEMES, COPY (02-content)
js/state.js         the one mutable-state owner, behind accessors + a tiny event bus
js/render.js        block builders (03-design-system "Block vocabulary")
js/commands.js      the registry: every command, its aliases, group, summary, run()
js/shell.js         prompt, popup, history, parse → dispatch, URL router, nav wiring
js/intent.js        free-text keyword router + "did you mean"
js/rain.js          the glyph spectrum canvas
js/live.js          fetch helpers with tool-line spinner; now-playing poller
js/boot.js          the boot sequence; kicks off shell + rain when done
api/nowplaying.js   from the old repo, plus album + image (06-live-data)
api/github.js       from the old repo, unchanged
api/guestbook.js    from the old repo, unchanged
api/version.js      new: exposes VERCEL_GIT_COMMIT_SHA / REF for /version
assets/covers/      copied SVG + WEBP covers (02-content "Covers to copy")
test/*.test.js      node --test suites (08-quality)
docs/               this brief
```

`index.html` loads `css/tokens.css`, `css/tui.css`, the Google Fonts link,
and one `<script type="module" src="js/boot.js">`. Every other module is
imported from there. Module count stays at nine; a new feature goes into
the module that owns its concern, not a new file.

## Module ownership

The FlowPane project (Developer Brain, `decision-vanilla-js-no-build-step`)
learned that without a state owner, vanilla ES modules calcify into one
monolith because imported bindings are read-only. So:

**`state.js` owns all mutable state.** Nothing else holds `let` at module
scope except caches that are private to one module (e.g. the rain's frame
buffer).

```js
// state.js — sketch
const s = {
  turns: [],            // [{ id, input, name, args, at, node }]
  history: [],          // input strings, newest last, max 50, sessionStorage
  theme: "midnight",    // localStorage
  rain: "ambient",      // "off" | "ambient" | "loud", localStorage
  live: { np: null, gh: null, npLive: false },
  reduced: false,       // prefers-reduced-motion at boot, updated on change
};
const bus = new EventTarget();
export const on = (ev, fn) => bus.addEventListener(ev, fn);
const emit = (ev, detail) => bus.dispatchEvent(new CustomEvent(ev, { detail }));

export const theme = () => s.theme;
export function setTheme(name) { s.theme = name; persist("theme", name);
  document.documentElement.dataset.theme = name; emit("theme", name); }
export const turns = () => s.turns;
export function pushTurn(t) { s.turns.push(t); emit("turn", t); }
export function clearTurns() { s.turns = []; emit("clear"); }
// ... same shape for history, rain, live
```

Persistence helpers wrap `localStorage`/`sessionStorage` in try/catch and
treat a throw as "no storage".

Who listens to what:
- `rain.js` listens to `theme` (re-read the CSS tokens), `turn` (burst),
  `rain` level, and `live` (pulse on/off).
- The header nav listens to `turn` to move the accent to the active track.
- The vinyl listens to `live` to start/stop spinning.

## Command registry

```js
// commands.js — one entry per command
export const COMMANDS = [
  {
    name: "work",                              // canonical; used in URLs and /help
    aliases: ["track 02", "projects", "side-a"],
    group: "tracks",                           // tracks | core | live | b-sides | hidden
    summary: "Selected work — side A",         // popup and /help text
    args: "",                                  // e.g. "<project>", shown in /help
    track: "work",                             // which nav item goes active, if any
    run(ctx) { /* returns Node | Promise<Node> */ },
  },
];
```

`ctx` passed to `run`:

```js
{
  args: "credvault",          // raw string after the command, trimmed
  argv: ["credvault"],        // whitespace-split
  render,                     // the block builders
  live,                       // fetch helpers (06-live-data)
  state,                      // accessors only
  run: (input) => …,          // dispatch another command (used by /track, /cat, /ls rows)
  signal,                     // AbortSignal, aborted when the turn is cleared
  fromNav: false,             // true when the nav typed it
}
```

Rules:
- `run` never touches the DOM outside the node it returns.
- Async commands return the node immediately with a `tool` line in pending
  state and mutate that node when the fetch resolves (see `live.js`). The
  transcript never waits on a fetch to append a turn.
- `hidden` commands: never in `/help`, never in the popup, never pushed to
  the URL. Their turns still appear in the transcript.
- Alias matching prefers the longest match (`track 02` before `track`).

## Turn lifecycle

```
input string
  → shell.parse(input)         "/projects cred vault" → { name: "projects", args: "cred vault" }
  → registry.resolve(name)     canonical entry via name or alias; null if none
  → if null and input starts with "/": intent.didYouMean(name) → error turn
  → if null and plain text:     intent.route(input) → command | reply turn
  → entry.run(ctx)             → node (sync or with pending tool line)
  → state.pushTurn({ id, input, name, args, at: Date.now(), node })
  → shell.append(turn)         chip + node into the transcript; stdout reveal
  → shell.pushUrl(turn)        unless hidden or replayed from popstate
  → node.scrollIntoView(...)   respecting reduced motion
```

Parsing details:
- Leading `/` optional in `parse`; the popup and the intent router decide
  what to do with its absence. `:q`, `:wq`, `:q!` are recognised only while
  the vim easter egg is armed (60s after `/vim`).
- Command names are case-insensitive; args keep their case.
- Empty input does nothing (no empty turn).

## URL router

Path is the command and its args, `/`-joined and URL-encoded:

| command | path |
|---|---|
| `/work` | `/work` |
| `/track 03` | `/track/03` |
| `/projects credvault` | `/projects/credvault` |
| `/clear` | `/` |
| hidden commands | no change |

- On load: boot → render intro → if `location.pathname !== "/"`, parse the
  path back into an input and run it with `fromNav: true` (typing animation
  skipped). Unknown path → the "this track doesn't exist" turn, then intro.
- Each command pushes `history.pushState({ input }, "", path)`.
- `popstate` re-runs `state.input` without pushing again. Going back does
  not remove turns from the transcript; it appends the earlier command
  again, which is what a terminal would do.
- `vercel.json`: `{ "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }] }`.
  Vercel serves real files first, so `css/`, `js/`, `assets/` and
  `resume.pdf` are unaffected.

## Nav wiring

Nav items are real links (`<a href="/about">`). `shell.js` intercepts
click, calls `shell.type("/about")`, which fills the prompt at 30ms per
character (instantly under reduced motion) and submits. Keyboard activation
of a nav link (Enter on a focused link) submits instantly without the typing
animation: keyboard-initiated actions never animate.

## Autocomplete and history

- The popup source is the registry minus `hidden`. Clicking the empty prompt
  shows every available command; initial programmatic focus does not open it.
  Slash input filters commands. After `/projects `, it shows matching projects
  from Side A and Side B. Max 8 rows visible; the list scrolls.
- History is `state.history`. `↑`/`↓` walk it only when the popup is closed
  or the input is empty; otherwise the arrows move the popup selection.
- `/` anywhere on the page (not inside an input) focuses the prompt.
  `Ctrl+L` runs `/clear`. `Esc` closes the popup, then blurs.

## Live data plumbing (`live.js`)

```js
// returns a tool-line node in pending state, and a promise for the data
const { line, data } = live.call("last.fm", "/api/nowplaying", { signal });
```
`line` shows the spinner; when `data` resolves the caller replaces the
line's text (`last.fm: live`) and fills the block. On rejection the line
becomes `✗ last.fm: offline` and the caller prints its fallback from
`COPY`. All fetches carry the turn's `AbortSignal`, so `/clear` cancels
in-flight work.

The now-playing poller re-fetches every 30s while a `/now-playing` node is
connected to the document and the tab is visible, updates the node in place,
and sets `state.live.npLive`. Only one poller ever runs.

## Storage

| key | store | what |
|---|---|---|
| `theme` | localStorage | theme name |
| `rain` | localStorage | `off` / `ambient` / `loud` |
| `booted` | sessionStorage | boot sequence already shown this tab |
| `history` | sessionStorage | last 50 inputs |

All reads and writes wrapped; a private window that throws behaves like a
first visit.

## Security

- Every string that originated outside `data.js` (prompt echo, guestbook
  rows, Last.fm artist/track/album, GitHub numbers) goes through
  `textContent`. `render.js` has no `innerHTML` at all; a grep for
  `innerHTML` in `js/` should return nothing.
- Guestbook guards stay server-side exactly as in the old `api/guestbook.js`
  (caps, control-character flattening, blocklist, hashed-IP rate limit,
  honeypot, Origin check).
- External links use `rel="noopener"`.
- `api/version.js` exposes only the short SHA and ref, nothing from the
  environment beyond that.

## Performance budget

| metric | budget |
|---|---|
| JS total, unminified | ≤ 60 KB |
| CSS total | ≤ 25 KB |
| fonts | 2 weights of one family, `display=swap` |
| rain | ≤ 30fps, ≤ 2ms per frame on a 2020 laptop, paused when hidden |
| LCP on 4G | < 1.5s (the identity block is static HTML, so it does not wait on JS) |
| Lighthouse | ≥ 95 on all four |

No bundling means every module is a request; nine small files over HTTP/2
are fine. Do not inline them into index.html to save requests.

## Tests

`node --test test/` with the built-in runner, zero dependencies. Modules
under test must not touch the DOM at import time: `intent.js`, the parse
and alias-resolution helpers of `shell.js` (exported as pure functions), the
URL mapping, and `api/guestbook.js`'s `clean` (ported test from the old
repo). `api/github.js` keeps its `node api/github.js` self-check.
