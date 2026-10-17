# 02 — Content

Everything the site says, verbatim. Ported from the old site's `js/data.js`
and `index.html` (repo `/Users/rkhooda/desktop/coding/projects/portfolio`).
The new `js/data.js` exports exactly these shapes. Change content here and
in `data.js` together.

## Identity

```js
export const SITE = {
  name: "Rakshit Hooda",
  tagline: "Full-stack developer chasing good ideas and good music.",
  roles: "~Code & build stuff/Learn everything/Shipping always",
  email: "rakshit.official703@gmail.com",
  github: "https://github.com/rkhooda",
  githubUser: "rkhooda",
  linkedin: "https://www.linkedin.com/in/rakshit-hooda/",
  timezone: "Asia/Kolkata",     // IST, for /status
  version: "2.0.0",
};
```

- `<title>`: `Rakshit Hooda — Full-Stack Builder`
- Meta description: `Rakshit Hooda — full-stack developer chasing good ideas and good music. Web3, AI agents, apps, tools & other questionable decisions.`
- OG title: `Rakshit Hooda — Full-Stack Builder` · OG description: `A portfolio that plays like an album. Web3, AI, apps, tools.`
- Theme-color meta: the active theme's `--bg`.
- Favicon: the vinyl (an inline SVG data URI: dark disc, two groove rings, `--label` centre, tiny hole). The old site's favicon is the same idea in sage.

## Bio (liner notes)

Two paragraphs, in this order:

1. I pick things up fast and actually ship them. Web3, AI agents, full-stack apps, Linux, Discord bots — if it's interesting, I'll figure it out and build something real with it.
2. No scammy products, no hollow AI wrappers, nothing built to manipulate. I'd rather make something genuinely useful — even if it's small.

Domain tags: `WEB · AI · APPS · GAMES · WEB3 · TOOLS · AUTOMATION · LAB`

Stats on `/about` and `/status`:

| stat | source | fallback |
|---|---|---|
| contributions (last 12 months) | `api/github` `total` | `—` |
| day streak | `api/github` `streak` | `—` |
| projects shipped | count of non-wip in PROJECTS + BSIDES (12 today) | never fails |
| in the studio | count of wip (3 today) | never fails |

## Tracks

```js
export const TRACKS = [
  { n: "01", id: "intro",   title: "Intro",         meta: "" },
  { n: "02", id: "work",    title: "Selected work", side: "A", meta: "09 tracks · mixed 2023–2026" },
  { n: "03", id: "b-sides", title: "The lab",       side: "B", meta: "experiments, games & other questionable decisions" },
  { n: "04", id: "about",   title: "Liner notes",   meta: "the artist" },
  { n: "05", id: "contact", title: "Outro",         meta: "inbox always open" },
];
```

The nav shows `Work · B-sides · About · Contact` and maps to tracks 02–05.
The intro turn's chip reads `> /track 01  Intro`.

## Side A — PROJECTS

Order is tracklist order. `slug` is what `/play` matches and what the URL
uses. `wip: true` renders an `UNRELEASED` tag, `--:--` duration, no link.

```js
export const PROJECTS = [
  { slug: "credvault", title: "CredVault",
    desc: "Secure, decentralized issuance & verification of credentials on the blockchain.",
    tags: ["WEB3", "PLATFORM"], year: "2025", dur: "04:12",
    url: "https://cred-vaulte.vercel.app", cover: "assets/covers/credvault.svg", tint: "#8FA98F" },
  { slug: "multiagent-builder", title: "Multiagent Builder",
    desc: "Multi-agent AI system for end-to-end product development.",
    tags: ["AI", "SYSTEM"], year: "2026", dur: "--:--",
    url: null, wip: true, cover: "assets/covers/multiagent-builder.svg", tint: "#A8B58A" },
  { slug: "cult-bot", title: "Cult-Bot",
    desc: "Discord dev-productivity bot — todos, streaks, XP, GitHub/LeetCode/Codeforces stats. All buttons, no syntax.",
    tags: ["AUTOMATION", "TOOLS"], year: "2025", dur: "05:01",
    url: "https://cult-bot.vercel.app", cover: "assets/covers/cult-bot.svg", tint: "#9A9B6A" },
  { slug: "clixo", title: "Clixo",
    desc: "Decentralised data-labelling platform on Ethereum.",
    tags: ["WEB3", "WEB"], year: "2026", dur: "03:47",
    url: "https://clixoo.vercel.app", cover: "assets/covers/clixo.svg", tint: "#7C8F6E" },
  { slug: "bellsy", title: "Bellsy",
    desc: "npm package + VS Code extension that pings you when coding agents and CLI tasks finish, fail, or need approval.",
    tags: ["TOOLS"], year: "2025", dur: "02:48",
    url: "https://bellsy.vercel.app", cover: "assets/covers/bellsy.svg", tint: "#C2B28A" },
  { slug: "flowpane", title: "FlowPane",
    desc: "Lightweight, always-on-top desktop to-do app with a translucent UI.",
    tags: ["APPS", "TOOLS"], year: "2025", dur: "03:24",
    url: "https://flowpane.vercel.app", cover: "assets/covers/flowpane.svg", tint: "#A9A18F" },
  { slug: "procrastino", title: "ProcrastiNO",
    desc: "Aesthetic productivity tracker for pairs — todos, workouts, video journals.",
    tags: ["APPS"], year: "2026", dur: "03:12",
    url: "https://github.com/rkhooda/ProcrastiNO", cover: "assets/covers/procrastino.svg", tint: "#B08968" },
  { slug: "statisticalstudies", title: "StatisticalStudies",
    desc: "Educational platform for statistics & math — lectures, UGC-NET prep, premium content.",
    tags: ["WEB", "APPS"], year: "2025", dur: "04:37",
    url: "https://statistical-studies.vercel.app", cover: "assets/covers/statisticalstudies.svg", tint: "#7E9089" },
  { slug: "developer-brain", title: "Developer Brain",
    desc: "My long-term engineering operating system — an AI-augmented knowledge base.",
    tags: ["TOOLS", "LAB"], year: "2026", dur: "∞",
    url: null, wip: true, cover: "assets/covers/developer-brain.svg", tint: "#A98F62" },
];
```

## Side B — BSIDES

`blurb` is the long description shown on the `/play` card; `desc` is the
tracklist line.

```js
export const BSIDES = [
  { slug: "maankibaat", title: "MaanKiBaat",
    desc: "Mental-health AI chatbot that actually listens.",
    blurb: "A judgment-free chat companion in Hindi and English. Tuned to listen first and suggest second — and to know when to step back.",
    stack: ["JavaScript", "HTML/CSS"], tags: ["AI"], year: "2024", dur: "02:31",
    url: "https://maan-ki-baat.vercel.app", cover: "assets/covers/maankibaat.webp", tint: "#8FA98F" },
  { slug: "recipify", title: "Recipify",
    desc: "AI recipe generator — fridge in, dinner out.",
    blurb: "Photograph the fridge, get a dinner you'll actually cook. Ranks recipes by what you already own instead of what a brand wants to sell you.",
    stack: ["JavaScript", "Python"], tags: ["AI"], year: "2024", dur: "01:58",
    url: "https://recipifyi.vercel.app", cover: "assets/covers/recipify.webp", tint: "#C2B28A" },
  { slug: "slotmachine", title: "SlotMachine",
    desc: "Multi-platform slot machine game.",
    blurb: "One reel engine, three front-ends. Built to learn how RNG, payout tables and pacing actually feel once they're in your hands.",
    stack: ["Python", "JavaScript"], tags: ["GAMES"], year: "2024", dur: "02:14",
    url: "https://slot-machine-casino.vercel.app", cover: "assets/covers/slotmachine.webp", tint: "#A98F62" },
  { slug: "payline-slot-engine", title: "Payline Slot Engine",
    desc: "Classic payline slot — fixed grid, medium volatility, readable wins.",
    blurb: "A faithful payline slot: fixed 5×3 grid, medium volatility, wins you can read without a spreadsheet. Ships with its own maths sim.",
    stack: ["Python"], tags: ["GAMES"], year: "2026", dur: "--:--",
    url: null, wip: true, cover: null, tint: "#B08968" },
  { slug: "flappy-bird", title: "Flappy-Bird",
    desc: "The clone every builder owes the universe.",
    blurb: "Sixty lines of physics and a lifetime of regret. Collision maths written from scratch, because that was the whole point.",
    stack: ["Python", "Pygame"], tags: ["GAMES", "LAB"], year: "2023", dur: "00:45",
    url: "https://github.com/rkhooda/Flappy-Bird", cover: "assets/covers/flappy-bird.webp", tint: "#7E9089" },
  { slug: "snake", title: "Snake",
    desc: "Python classic. Eats apples, teaches loops.",
    blurb: "Written the long way on purpose — no engine, no helpers, just a loop, a grid and a tail that keeps getting in the way.",
    stack: ["Python", "Pygame"], tags: ["GAMES", "LAB"], year: "2023", dur: "00:32",
    url: "https://github.com/rkhooda/snake-game", cover: "assets/covers/snake-game.webp", tint: "#9A9B6A" },
];
```

A project with `cover: null` renders a generated cover: a box-drawing frame
filled with the project's `tint` at 20% and its initials in the centre.

## Queue (in the studio)

Derived, never hand-listed: every entry with `wip: true`, PROJECTS first,
then BSIDES. Today: Multiagent Builder, Developer Brain, Payline Slot Engine.

## Covers to copy

From the old repo `assets/img/covers/` into the new `assets/covers/`:

```
bellsy.svg  clixo.svg  credvault.svg  cult-bot.svg  developer-brain.svg
flowpane.svg  multiagent-builder.svg  procrastino.svg  statisticalstudies.svg
maankibaat.webp  recipify.webp  slotmachine.webp  flappy-bird.webp  snake-game.webp
```

Skip the `.jpg`/`.png` duplicates and the two `*-logo.webp` files. The SVG
covers are hand-designed album art; do not regenerate them.

## Stack (for `/stack`) — OWNER TO CONFIRM

Levels mean how often the fader is up, not skill: `daily` / `often` /
`dabbled`. Derived from the projects' real stacks (Developer Brain project
notes). The owner should edit this table before phase 6; until then the
builder uses it as written.

| channel | instrument | level |
|---|---|---|
| FRONTEND | JavaScript / TypeScript | daily |
| FRONTEND | HTML / CSS | daily |
| FRONTEND | React / Next.js | often |
| FRONTEND | React Native / Expo | often |
| FRONTEND | Tailwind | often |
| FRONTEND | Three.js / GSAP | dabbled |
| BACKEND | Node | daily |
| BACKEND | Python / FastAPI | often |
| BACKEND | PostgreSQL / Prisma | often |
| BACKEND | Supabase | often |
| BACKEND | Redis (Upstash) | dabbled |
| WEB3 | Solidity | often |
| WEB3 | Ethers / wallets | often |
| AI | LangGraph / agent pipelines | often |
| AI | Claude Code / agentic workflows | daily |
| AI | LLM routing (litellm) | dabbled |
| APPS & TOOLS | Tauri + Rust | dabbled |
| APPS & TOOLS | discord.js | often |
| APPS & TOOLS | VS Code extension API | dabbled |
| APPS & TOOLS | Pygame | dabbled |
| INFRA | Vercel | daily |
| INFRA | Linux | daily |
| INFRA | Docker | dabbled |

## Copy bank

Every string the agent says. Keys are what `data.js` exports as `COPY`.

### Boot
```
rk-portfolio 2.0 · booting
⎿ loading tracks ........ ok  {sideA} side A · {sideB} side B
⎿ tuning last.fm ........ ok
⎿ warming the spectrum .. ok
> ready. type /help
```
(`{sideA}`/`{sideB}` are zero-padded counts, e.g. `09`, `06`.)

### Intro turn (`/track 01`)
```
Hey. This is my portfolio, and it's a terminal.
Type /help to see what it can do, or click a track above.
```

### Track intros
- `/work`: `Side A — selected work. 09 tracks, mixed 2023–2026.`
- `/b-sides`: `Side B — the lab. Experiments, games & other questionable decisions.`
- `/about`: `Liner notes.`
- `/contact`: title `Let's talk` · sub `Got an idea, a project, or a song recommendation? All three are welcome.`
  - rows: `email  rakshit.official703@gmail.com  [Copy email]  no spam, i promise` · `github  github.com/rkhooda  where the code lives` · `linkedin  linkedin.com/in/rakshit-hooda  the formal version of me`
  - after copy: `Copied.`

### Help
- intro: `Commands. Type / to autocomplete, ↑ for history, Tab to complete.`
- footer: `Free text works too — ask about work, music, or contact.`

### Player (`/now-playing`)
- live label: `NOW PLAYING` · not live: `LAST PLAYED · {ago}` (`3 min. ago`, `2 hr. ago`, `1 day ago`, `just now`)
- source line: `via last.fm`
- unreachable: `The deck is offline. Last thing I remember: Love Yourz — J. Cole.`

### GitHub
- header: `{user} on GitHub` · tool line: `github: {total} contributions · {streak} day streak`
- unreachable: `GitHub isn't answering. The commits are still there: github.com/rkhooda`

### Status
```
time      {HH:MM} IST · {probably awake | probably asleep}
streak    {n} days
building  {first wip title}
playing   {track} — {artist} · {ago | live}
```
Awake window: 09:00–02:00 IST.

### Queue
- header: `Up next — in the studio` · empty: `Nothing queued. Suspicious.`

### Guestbook
- header: `Signatures · {count}` · tool line: `upstash: {count} total, showing {shown}`
- empty: `Nobody has signed yet. /sign to be first.`
- form title: `Sign the sleeve` · fields `name` (24 max) · `note` (140 max) · button `Sign` · `Cancel`
- success: `Signed. Thanks for listening.`
- server errors are shown verbatim (they are already written for visitors: `one signature an hour — come back later`, `that word isn't welcome here`).
- unreachable (`/guestbook`): `The sleeve is in the other room. Try again in a minute.`
- network error on `/sign`: `Couldn't reach the sleeve. Try again in a minute.`

### Themes
- header: `Themes` · footer: `/theme <name> to switch. Click a row too.`
- after switch: `Theme: {name}.`
- unknown theme: `No theme called {x}. /themes lists them.`
- descriptions: `midnight  the reference mix` · `night-sage  the first album` · `amber  phosphor` · `paper  liner notes, in daylight` · `neon  side B at 2am`

### Stack
- header: `The mixer — no percentages, just how often the fader's up`

### Shuffle
- header while flickering: `Shuffling…` · then the `/play` card

### Timeline
- header: `Discography` · wip suffix: `· in the studio`

### ls / cat
```
work/        09 tracks
b-sides/     06 tracks
about.md
contact.md
now-playing
themes/
resume.pdf
```
- `/cat` unknown file: `cat: {file}: no such track`

### Résumé
- `Résumé — opens as PDF.` · if the file 404s: `The résumé is being remastered. Email me instead: /contact`

### Share
- `Link copied: {url}` · clipboard blocked: `Copy this: {url}`

### Version
- `portfolio {version} · {sha} · {ref} · deps: 0 · build step: none`

### Credits
```
Built with caffeine and questionable decisions.
Type: JetBrains Mono. Hosting: Vercel. Now playing: last.fm.
Frameworks: none. Dependencies: none. Build step: none.
End of side B — thanks for listening.
```

### Errors and free text
- unknown slash, close match: `Unknown command: {input}. Did you mean {suggestion}?`
- unknown slash, no match: `Unknown command: {input}. /help lists everything.`
- free text, no intent: `I only speak slash. Try /help — or ask about work, music, contact.`
- intent routed: tool line `→ {command}` above the routed output
- greeting: `Hey. /help if you're lost, /work if you're in a hurry.`
- thanks: `Anytime. Sign the sleeve on your way out: /sign`
- unknown URL path on load: `this track doesn't exist. skipped.` then the intro turn

### Easter eggs
- `/sudo …`: `rkhooda is not in the sudoers file. This incident will be reported.`
- `/rm -rf /` (any `/rm`): `Permission denied. Nice try.`
- `/vim`: `You're in vim now. :q to leave. (I know.)` · then `:q` / `:wq` / `:q!`: `Free. That was the hard part.`
- `/exit` `/quit` `/q`: `There's no exit. It's a website. ⌘W works though.`
- `/matrix`: `Green mode for five seconds. Don't tell anyone.`
- Konami code: same as `/matrix`.

### Prompt placeholder hints (rotate every 6s while empty and unfocused)
`/now-playing` · `/help` · `/work` · `/themes` · `type / for commands`

### 404.html
`this track doesn't exist. skipped.` · link: `back to side A →` (href `/`)

### ASCII banner (`/ascii`), figlet "ANSI Shadow", 52 columns wide
```
██████╗  █████╗ ██╗  ██╗███████╗██╗  ██╗██╗████████╗
██╔══██╗██╔══██╗██║ ██╔╝██╔════╝██║  ██║██║╚══██╔══╝
██████╔╝███████║█████╔╝ ███████╗███████║██║   ██║
██╔══██╗██╔══██║██╔═██╗ ╚════██║██╔══██║██║   ██║
██║  ██║██║  ██║██║  ██╗███████║██║  ██║██║   ██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝   ╚═╝
██╗  ██╗ ██████╗  ██████╗ ██████╗  █████╗
██║  ██║██╔═══██╗██╔═══██╗██╔══██╗██╔══██╗
███████║██║   ██║██║   ██║██║  ██║███████║
██╔══██║██║   ██║██║   ██║██║  ██║██╔══██║
██║  ██║╚██████╔╝╚██████╔╝██████╔╝██║  ██║
╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═════╝ ╚═╝  ╚═╝
```
Render inside a block with `overflow-x: auto` so it never wraps on phones.
