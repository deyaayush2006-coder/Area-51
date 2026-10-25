# AREA 51 — Restricted Access Terminal

A single-page briefing terminal themed around the Groom Lake / Area 51 facility.
The project is a full-stack web app split into two independent packages:
`frontend/` (Vite + React + Tailwind) and `backend/` (Express + Mongoose, also
deployable to Vercel as a serverless function).

---

## Table of Contents

1. [Repository layout](#1-repository-layout)
2. [Tech stack at a glance](#2-tech-stack-at-a-glance)
3. [Frontend deep-dive](#3-frontend-deep-dive)
   - [Page structure and sections](#31-page-structure-and-sections)
   - [Navigation](#32-navigation)
   - [Styling system](#33-styling-system)
   - [Animation and effects inventory](#34-animation-and-effects-inventory)
   - [API client contract](#35-api-client-contract)
   - [Feedback form and live log](#36-feedback-form-and-live-log)
   - [Reduced-motion handling](#37-reduced-motion-handling)
   - [Build and dev commands](#38-build-and-dev-commands)
4. [Backend deep-dive](#4-backend-deep-dive)
   - [Endpoints](#41-endpoints)
   - [Security middleware stack](#42-security-middleware-stack)
   - [Validation layers](#43-validation-layers)
   - [Database connection strategy](#44-database-connection-strategy)
   - [Vercel deployment](#45-vercel-deployment)
5. [Environment variables](#5-environment-variables)
6. [Unused / dead-code files](#6-unused--dead-code-files)
7. [Known constraints and gotchas](#7-known-constraints-and-gotchas)

---

## 1. Repository layout

```
practice3.0/                  ← repo root (github.com/deyaayush2006-coder/Area-51)
├── .gitignore                ← ignores node_modules, dist, .env, .env.*
├── frontend/
│   ├── index.html            ← shell; loads Google Fonts (Orbitron, IBM Plex Sans/Mono)
│   ├── vite.config.js        ← Vite 5, @vitejs/plugin-react, dev port 5173
│   ├── tailwind.config.js    ← custom tokens + keyframes (see §3.3)
│   ├── postcss.config.js     ← tailwindcss + autoprefixer only
│   ├── package.json
│   └── src/
│       ├── main.jsx          ← React root; applies react-spring reduced-motion skip
│       ├── App.jsx           ← top-level layout; FaultyTerminal + all sections
│       ├── index.css         ← global styles, HUD utilities (.hud-panel, .hud-corners)
│       ├── api/
│       │   └── client.js     ← fetch wrapper; submitFeedback + getFeedback
│       └── components/
│           ├── Navbar.jsx
│           ├── RadarHero.jsx
│           ├── About.jsx
│           ├── Timeline.jsx
│           ├── Gallery.jsx
│           ├── Facts.jsx
│           ├── FeedbackConsole.jsx
│           ├── Footer.jsx
│           ├── FaultyTerminal.jsx   ← raw WebGL2 CRT background
│           ├── ScanlineOverlay.jsx
│           ├── AnimatedContent.jsx  ← GSAP/ScrollTrigger scroll-reveal wrapper
│           ├── BriefingPanel.jsx    ← card wrapper (SpotlightCard + hud-corners)
│           ├── ClassifiedText.jsx   ← DecryptedText preset (animateOn="view")
│           ├── DecryptedText.jsx    ← React Bits: character-scramble text effect
│           ├── ClickSpark.jsx       ← React Bits: canvas particle burst on click
│           ├── CountUp.jsx          ← React Bits: odometer-style number roll
│           ├── Magnet.jsx           ← React Bits: magnetic pointer pull on elements
│           ├── SpotlightCard.jsx    ← React Bits: cursor-following radial light on cards
│           ├── AuthConsole.jsx      ← UNUSED leftover (never imported)
│           ├── Dashboard.jsx        ← UNUSED leftover (never imported)
│           └── Questionaire.jsx     ← UNUSED leftover (never imported)
└── backend/
    ├── server.js             ← Express app factory (also module.exports for Vercel)
    ├── vercel.json           ← rewrites all traffic to /api/index.js
    ├── package.json
    ├── api/
    │   └── index.js          ← thin re-export of server.js for Vercel Functions
    ├── config/
    │   └── db.js             ← Mongoose connect with global caching (serverless-safe)
    ├── models/
    │   └── Feedback.js       ← Mongoose schema: name, email, comment + timestamps
    ├── routes/
    │   └── feedback.js       ← POST / and GET / with express-validator rules
    ├── controllers/
    │   └── feedbackController.js
    └── middleware/
        └── validate.js       ← runs validationResult; returns 400 on failure
```

---

## 2. Tech stack at a glance

| Layer | Technology | Version |
|---|---|---|
| Build tool | Vite | 5.3.x |
| UI framework | React | 18.3.x |
| Styling | Tailwind CSS | 3.4.x |
| Animation — scroll reveal | GSAP + ScrollTrigger | 3.15.x |
| Animation — spring / transitions | @react-spring/web | 10.1.x |
| Animation — sonar pings | anime.js | 4.5.x |
| Animation — motion utilities | motion | 12.43.x (imported but not used directly in active components) |
| Toast notifications | sonner | 2.0.x (installed, not currently wired up) |
| Background | Raw WebGL2 (FaultyTerminal) | inline GLSL, no lib |
| Server | Express | 4.19.x |
| ODM | Mongoose | 8.5.x |
| Validation | express-validator | 7.2.x |
| Security | helmet, cors, express-mongo-sanitize, hpp, express-rate-limit | various |
| DB | MongoDB Atlas (via MONGO_URI) | — |
| Deployment (frontend) | Vercel / Vite static | — |
| Deployment (backend) | Vercel Functions or bare Node | — |

---

## 3. Frontend deep-dive

### 3.1 Page structure and sections

`App.jsx` composes the single page in this order:

| Order | Component | Section `id` | `scroll-mt` |
|---|---|---|---|
| — | `FaultyTerminal` | (fixed background, no id) | — |
| — | `ScanlineOverlay` | (fixed overlay, no id) | — |
| — | `Navbar` | (sticky header, no id) | — |
| 1 | `RadarHero` | (no id — hero above fold) | — |
| 2 | `About` | `about` | `scroll-mt-16` |
| 3 | `Timeline` | `timeline` | `scroll-mt-16` |
| 4 | `Gallery` | `gallery` | `scroll-mt-16` |
| 5 | `Facts` | `facts` | `scroll-mt-16` |
| 6 | `FeedbackConsole` | `access` | `scroll-mt-16` |
| — | `Footer` | (no id) | — |

The `scroll-mt-16` offset (64 px) compensates for the sticky 64 px navbar so that
`scrollIntoView` lands with the section heading visible below the header.

### 3.2 Navigation

Navigation is entirely scroll-based — there is no client-side router.

`App.jsx` defines a single `scrollTo(id)` helper (`document.getElementById(id)?.scrollIntoView(…)`)
and passes it down as `onNavigate` to `Navbar` and `RadarHero`.

`Navbar` exposes five links:

| Label | Target id |
|---|---|
| BRIEFING | `about` |
| TIMELINE | `timeline` |
| ARCHIVE | `gallery` |
| INTEL | `facts` |
| FEEDBACK | `access` |

On desktop (≥ md breakpoint) the links render inline. Below `md` a hamburger button
toggles a `@react-spring/web useTransition`-animated dropdown (`id="mobile-nav"`).
The "Leave Feedback" CTA button in the navbar also scrolls to `#access`.

### 3.3 Styling system

**Tailwind tokens** (defined in `tailwind.config.js`):

| Token | Value | Semantic role |
|---|---|---|
| `void` | `#030712` | Page base background |
| `panel` | `#0b1526` | Card / panel fill |
| `panel-raised` | `#101f38` | Elevated panel fill |
| `steel` | `#1c3a5e` | Borders, dividers |
| `steel-light` | `#28527f` | Lighter borders |
| `blue.mid` | `#2563a8` | Mid-tone blue |
| `blue.deep` | `#0e2a4d` | Deep blue accent |
| `cyan.glow` | `#5eead4` | CRT tint color |
| `cyan.bright` | `#67e8f9` | Highlight / glow |
| `cyan.sky` | `#38bdf8` | Secondary cyan |
| `radar` | `#34d399` | Active / success green |
| `amber` | `#fbbf24` | Warning / classified |
| `redalert` | `#f87171` | Error / danger |
| `ink.primary` | `#e6f1ff` | Body text |
| `ink.muted` | `#7fa0c4` | Secondary text |
| `ink.faint` | `#3d5a7d` | Tertiary / placeholder |

**Fonts** (loaded via Google Fonts in `index.html`):

| Token | Family | Weights |
|---|---|---|
| `font-display` | Orbitron | 500, 700, 900 |
| `font-body` | IBM Plex Sans | 400, 500, 600 |
| `font-mono` | IBM Plex Mono | 400, 500, 600 |

**Custom keyframe animations:**

| Name | Duration | Description |
|---|---|---|
| `radar-spin` | 4 s linear ∞ | Rotates the radar sweep cone |
| `blip-pulse` | 2.4 s ease-in-out ∞ | Scales+fades radar contact blips |
| `flicker` | 6 s linear ∞ | Subtle opacity flicker at 92–97 % |
| `scan` | 8 s linear ∞ | Scrolls scanline bg-position |
| `fade-up` | 0.7 s ease-out | One-shot entrance (hero, radar chart) |
| `marquee` | 22 s linear ∞ | Horizontal ticker scroll |

**Global CSS utilities** (defined in `src/index.css`):

- `.hud-panel` — `bg-panel/90 border border-steel`, no `backdrop-filter` (would force a
  repaint over the animated WebGL background on every frame).
- `.hud-corners` — four CSS pseudo-elements (2 on `.hud-corners` itself, 2 on injected
  `.corner-tl`/`.corner-br` child `<span>`s) that draw 14 × 14 px `border-top/left` and
  `border-bottom/right` targeting-reticle corner brackets in `cyan.bright`.
- `.text-glow` — `text-shadow: 0 0 12px currentColor`.
- `.eyebrow` — `font-mono text-xs tracking-[0.35em] uppercase text-cyan-bright/80`.
- `.stamp` — classified-document rubber-stamp appearance in `redalert`, rotated −6°.
- `.scanline-overlay` — repeating horizontal lines, `rgba(94,234,212,0.05)` per 1 px
  every 3 px, used both as a global fixed overlay and inside Gallery camera frames.
- `.grid-bg` — 42 × 42 px blue grid lines at 12 % opacity, applied to `RadarHero`.

**Reduced-motion global reset** (in `index.css`):

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 3.4 Animation and effects inventory

#### FaultyTerminal — raw WebGL2 CRT glyph field

File: `src/components/FaultyTerminal.jsx`

A two-pass WebGL2 renderer. Pass 1 (`CELL_FRAGMENT` shader) computes a cellular
noise field into a pair of ping-pong `RGBA8` framebuffer textures. Pass 2 (`MAIN_FRAGMENT`
shader) reads those textures and renders a full-screen quad with CRT post-processing
(curvature barrel distortion, chromatic aberration, scanlines, vignette, glow, dither,
glitch horizontal tears, degauss ripple waves).

The `glyphs` prop selects the glyph mode: `"blocks"` (rectangular brightness masks),
`"dots"` (circle dots), or `"characters"` (a baked 23-glyph bitmap font encoded as
25-bit integers in `FONT_BITS`).

**Key props used in `App.jsx`:**

| Prop | Value | Effect |
|---|---|---|
| `tint` | `"#5eead4"` | CRT phosphor color (cyan.glow) |
| `glyphs` | `"characters"` | Renders scrambled alphanumeric characters |
| `scale` | `1.4` | Zoom-out factor for the noise field |
| `brightness` | `0.55` | Overall luminance |
| `timeScale` | `0.4` | Animation speed |
| `scanlineIntensity` | `0.4` | CRT horizontal scanline strength |
| `curvature` | `0.12` | Barrel distortion amount |
| `mouseStrength` | `0.3` | Mouse-proximity ripple intensity |
| `vignette` | `0.5` | Edge darkening |
| `dpr` | `0.5` | Device-pixel-ratio override — renders at half resolution to halve GPU cost |
| `maxFps` | `30` (default) | Frame-rate cap; the rAF loop skips display frames until the 33 ms interval elapses |

**Local changes made to the React Bits source:**

1. `maxFps = 30` prop added. The render loop skips `requestAnimationFrame` callbacks
   until `1000 / maxFps - 1` ms have elapsed since the last drawn frame
   (comment: "Local change: frame-rate cap … Both shader passes run per frame, so
   30 fps halves the GPU work.").
2. `gl.loseContext()` call removed from the cleanup function
   (comment: "Local change: no loseContext() here. StrictMode remounts reuse this
   canvas, and getContext would hand back the lost context, leaving the background
   blank in dev.").

The component also detects `prefers-reduced-motion` inside the WebGL loop and sets
`glitchAmount` and `flickerAmount` uniforms to `0`, and stops incrementing `iTime`
so the field freezes.

#### ScanlineOverlay

File: `src/components/ScanlineOverlay.jsx`

A `position: fixed; inset: 0; z-index: 50` `<div>` applying `.scanline-overlay` CSS
at 40 % opacity. Pure CSS, no JS.

#### AnimatedContent — GSAP + ScrollTrigger scroll-reveal wrapper

File: `src/components/AnimatedContent.jsx` (React Bits)

Wraps any children in a GSAP context. When `stagger > 0` it targets `el.children`
individually; otherwise it animates the wrapper `<div>` as a whole.

Supports: translate (x/y), scale, opacity, blur, rotation, tilt (3-D `rotateX/Y`),
CSS mask-image wipe, scroll scrub, trigger-on-mount, disappear-after, loop.

**Usage in the codebase:**

- `About.jsx` — `distance={40} duration={0.7} stagger={0.1}` (cards fade up)
- `Gallery.jsx` — `distance={24} scale={0.96} blur={8} duration={0.8} stagger={0.12}`
  (camera feeds "power on" like CRT monitors)
- `Facts.jsx` — `distance={40} duration={0.7} stagger={0.1}` (FAQ panels)

Checks `prefers-reduced-motion` and skips all GSAP animation if set, calling
`onComplete` immediately.

#### Timeline — GSAP + ScrollTrigger

File: `src/components/Timeline.jsx`

Two GSAP animations inside a `useLayoutEffect` context:

1. A `scaleY: 0 → 1` tween on the timeline's glowing vertical line, scrubbed to
   scroll position (`trigger: trackRef.current, start: "top 70%", end: "bottom 70%",
   scrub: true`).
2. Per-`<li>` entrance: `opacity: 0, x: -24 → 0`, triggered once at `start: "top 85%"`.

Both are skipped when `prefers-reduced-motion` is set.

#### RadarHero — anime.js sonar pings

File: `src/components/RadarHero.jsx`

Uses anime.js `animate()` + `stagger()` to expand `[data-ping]` ring spans on each
radar blip from `scale: 1, opacity: 0.9` to `scale: 7, opacity: 0` on a 1800 ms loop
with a 450 ms stagger between blips and a 600 ms loop delay. Returns `pings.revert()`
on cleanup. Skipped on `prefers-reduced-motion`.

The radar sweep cone uses a CSS `conic-gradient` rotated by `animate-radar-spin`
(Tailwind keyframe, 4 s linear infinite). The four blips use `animate-blip-pulse`
(CSS, not JS).

#### Navbar — @react-spring/web mobile menu

File: `src/components/Navbar.jsx`

`useTransition(menuOpen, { from: { opacity: 0, y: -12 }, enter: { opacity: 1, y: 0 },
leave: { opacity: 0, y: -12 }, config: { tension: 320, friction: 26 } })` drives the
mobile dropdown. Uses `@react-spring/web`'s `animated.nav`.

Also uses `DecryptedText` on the "AREA 51" logo text (`animateOn="hover"`, cipher speed
45 ms, 8 iterations, uppercase alphanumeric charset).

#### FeedbackConsole — @react-spring/web list transitions

File: `src/components/FeedbackConsole.jsx`

`useTransition(entries, { keys: entry => entry._id, from: { opacity: 0, y: -10 },
enter: { opacity: 1, y: 0 }, leave: { opacity: 0, y: 0 }, trail: 45, config:
{ tension: 260, friction: 24 } })` animates the transmission log list — new entries
drop in from above; the initial page-load batch trails in top to bottom.

#### DecryptedText — character-scramble text

File: `src/components/DecryptedText.jsx` (React Bits)

**Local change:** the root element was originally `motion.span` from the `motion`
library with no motion props applied. It has been replaced with a plain `<span>`,
removing approximately 18 KB gzipped from the bundle.

Scrambles characters via `setInterval` ticks. Supports `animateOn="hover"`,
`"view"` (IntersectionObserver), `"click"`, `"inViewHover"`, sequential or parallel
reveal, multiple directions, flip / fade effects.

Used as `ClassifiedText` (`animateOn="view"`, `sequential`, `speed=40`, uppercase
alphanum + symbols).

#### ClickSpark — canvas particle burst

File: `src/components/ClickSpark.jsx` (React Bits)

Draws up to 32 concurrent particle bursts on a `<canvas>` via `requestAnimationFrame`.
Supports shapes: `line`, `streak`, `dot`, `star`. Exposed via `forwardRef` so
`FeedbackConsole` can call `sparkRef.current.spark()` after a successful form
submission. Props used: `sparkColor={["#67e8f9","#34d399"]} sparkCount={12}
sparkRadius={34} shape="streak" glow={0.6} ring`.

#### CountUp — odometer number roll

File: `src/components/CountUp.jsx` (React Bits)

Rolls numeric values like an odometer. Used in `Facts.jsx` for the four stats tiles
(mode `"roll"`, `duration={2.2}`). Non-numeric stat ("U.S. Air Force") uses
`ClassifiedText` instead.

#### Magnet — magnetic pointer pull

File: `src/components/Magnet.jsx` (React Bits)

`pointer events → translate(x,y)` spring pulling child elements toward the cursor
within a configurable `padding` radius. Used on the two CTA buttons in `RadarHero`
(`padding={60} magnetStrength={4}`).

#### SpotlightCard — cursor-following radial light

File: `src/components/SpotlightCard.jsx` (React Bits)

Tracks pointer position and renders a `radial-gradient` light layer behind the card
via `requestAnimationFrame`. Used inside `BriefingPanel`.

**Local change:** `rounded-3xl` and `p-8` class names removed from the `CARD` constant
so that `BriefingPanel`'s callers can apply their own HUD-styled radius and padding
(comment: "Local change: rounded-3xl/p-8 removed so callers (BriefingPanel) can set
the HUD's own radius and padding").

`BriefingPanel` passes `proximity={0}` so the spotlight only activates when the
pointer is directly on the card, not within the default 80 px proximity range.

### 3.5 API client contract

File: `src/api/client.js`

```
Base URL: import.meta.env.VITE_API_URL  ||  "http://localhost:5000/api"
Timeout:  AbortSignal.timeout(15000)   (15 s)
```

**Exported functions:**

| Function | Method | Path | Body |
|---|---|---|---|
| `submitFeedback({ name, email, comment })` | POST | `/feedback` | `{ name, email, comment }` |
| `getFeedback()` | GET | `/feedback` | — |

**Error handling:**

- Network failure / CORS / timeout — fetch throws; caught and re-thrown as
  `"Could not reach the server. Check your connection and try again."`.
- Non-2xx response — reads `data.errors?.[0]?.message` first, then `data.message`,
  then falls back to `"Something went wrong. Please try again."`.
- Non-JSON response body — `.json()` call has a `.catch(() => ({}))` fallback.

There is no authentication, no request retries, and no request-level caching.

### 3.6 Feedback form and live log

File: `src/components/FeedbackConsole.jsx`

**Form fields:**

| Field | Type | Constraints |
|---|---|---|
| Full Name | `text` | required, minLength 2, maxLength 60 |
| Email | `email` | required, maxLength 254 |
| Comment | `textarea` | required, minLength 3, maxLength 1000 |

A **client-side pre-flight** before the network call rejects any input containing `<`
or `>` with an inline error (`"Name and comment cannot contain < or > characters"`),
mirroring the backend rule so users get instant feedback instead of a round-trip.

On successful submission:
1. Form fields are cleared.
2. `ClickSpark.spark()` fires a particle burst on the submit button.
3. `loadEntries()` is called to refresh the transmission log.

The **live log** fetches `GET /api/feedback` on mount and re-fetches after every
successful submission. Error state shows the backend error message plus a "Retry"
button. Loading state animates with `animate-flicker`. Each log entry shows the
submitter's name and a `timeAgo()` relative timestamp (not the email — the backend
intentionally omits it from GET responses).

### 3.7 Reduced-motion handling

The project applies reduced-motion checks at four independent layers:

1. **CSS global reset** (`index.css`): collapses all durations to 0.001 ms via the
   `prefers-reduced-motion: reduce` media query.
2. **react-spring global** (`main.jsx`): `Globals.assign({ skipAnimation: … })` makes
   all `@react-spring/web` springs jump to their end state instantly.
3. **GSAP / ScrollTrigger** (`AnimatedContent.jsx`, `Timeline.jsx`): each `useLayoutEffect`
   checks `window.matchMedia("(prefers-reduced-motion: reduce)").matches` and returns
   early without registering any animations.
4. **anime.js** (`RadarHero.jsx`): same `matchMedia` check; returns before calling
   `animate()`.
5. **FaultyTerminal** (`FaultyTerminal.jsx`): the WebGL render loop reads `window
   .matchMedia(…).matches` once at startup; when set it zeroes out `glitchAmount` and
   `flickerAmount` uniforms and stops advancing `iTime` (field freezes in place).
6. **DecryptedText** (`DecryptedText.jsx`): `prefersReducedMotion()` helper called at
   the start of `startRun`; skips the ticker and immediately snaps to the target mask.

### 3.8 Build and dev commands

From the `frontend/` directory:

```bash
npm run dev       # Vite dev server on http://localhost:5173 (hot reload)
npm run build     # Production build → frontend/dist/
npm run preview   # Serve frontend/dist/ locally
```

---

## 4. Backend deep-dive

### 4.1 Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Health check — returns `{ status: "ok", service: "area51-feedback-backend" }` |
| `GET` | `/api/health` | DB health check — returns `{ status: "ok", dbConnected: bool }` |
| `POST` | `/api/feedback` | Submit a feedback entry |
| `GET` | `/api/feedback` | List feedback entries (most recent first, email omitted) |

**POST `/api/feedback`** — request body: `{ name, email, comment }`.
Successful response (201):

```json
{
  "message": "Feedback received — thank you",
  "feedback": { "id": "…", "name": "…", "comment": "…", "createdAt": "…" }
}
```

**GET `/api/feedback`** — optional query param `?limit=N` (1–50, default 50).
Successful response (200):

```json
{ "feedback": [{ "_id": "…", "name": "…", "comment": "…", "createdAt": "…" }] }
```

Validation error response (400):

```json
{
  "message": "Validation failed",
  "errors": [{ "field": "name", "message": "Name is required" }]
}
```

### 4.2 Security middleware stack

Applied in `server.js` in this order:

| Middleware | Purpose |
|---|---|
| `app.set("trust proxy", 1)` | Correct IP detection behind Vercel's proxy for rate-limiting |
| `helmet()` | Sets security-related HTTP headers |
| `express.json({ limit: "10kb" })` | Parses JSON bodies; rejects payloads over 10 KB |
| `express.urlencoded({ limit: "10kb" })` | Same limit for form-encoded bodies |
| `mongoSanitize()` | Strips `$` and `.` from keys to block MongoDB operator injection |
| `hpp()` | Removes duplicate query-string parameters (HTTP Parameter Pollution) |
| **CORS** | Dynamic origin allowlist (see below) |
| `readLimiter` | 100 requests / 15 min per IP for GET `/api/feedback` |
| `writeLimiter` | 8 requests / 15 min per IP for POST `/api/feedback` |

**CORS origin logic** (`server.js`):

- Static allowlist: `CLIENT_ORIGIN` env var (comma-separated), defaults to
  `http://localhost:5173`.
- Dynamic Vercel preview URLs: if `ALLOWED_VERCEL_PROJECT` is set, any URL matching
  `^https://<slug>-[a-z0-9]+-[a-z0-9-]+\.vercel\.app$` is also allowed.
- Server-to-server requests (no `Origin` header) are allowed through.

### 4.3 Validation layers

Input validation is applied at two independent layers to provide defence in depth:

**Layer 1 — express-validator** (`routes/feedback.js`):
Runs before the controller. Checks `name` (notEmpty, 2–60 chars, no `<>`), `email`
(isEmail, max 254, normalizeEmail), `comment` (3–1000 chars, no `<>`). The `validate`
middleware returns a 400 with an array of `{ field, message }` objects on failure.

**Layer 2 — Mongoose schema** (`models/Feedback.js`):
The `noHtmlTags` regex `[/^[^<>]*$/, "HTML tags are not allowed"]` is applied as a
`match` constraint on `name` and `comment`. Even if a request bypasses express-validator,
Mongoose refuses to persist anything containing `<` or `>`.

### 4.4 Database connection strategy

File: `backend/config/db.js`

Uses a `global._mongooseConn` cache (`{ conn, promise }`) so that serverless function
warm containers reuse an existing Mongoose connection instead of opening a new one on
every invocation. DNS resolution is forced through Google's public resolver
(`8.8.8.8`, `8.8.4.4`) to work around ISPs that mishandle MongoDB Atlas SRV records.

On connection failure the server logs the error but stays alive — routes remain
reachable and return clear error messages instead of the process silently dying.

### 4.5 Vercel deployment

`backend/vercel.json` rewrites all traffic to `backend/api/index.js`, which is a
one-line re-export of `server.js`. Vercel's Node runtime routes HTTP requests into
the exported Express app. `server.js` guards `app.listen()` with `if (require.main
=== module)` so it only binds a port when run directly as a Node process (not when
required as a Vercel Function).

From the `backend/` directory (for local development):

```bash
npm run dev    # nodemon server.js (auto-restarts on file changes)
npm start      # node server.js
```

---

## 5. Environment variables

No `.env.example` files exist in this repository. Create the following files manually.

**`backend/.env`**

| Variable | Required | Example | Purpose |
|---|---|---|---|
| `PORT` | No | `5000` | Express listen port (default 5000) |
| `NODE_ENV` | No | `production` | Hides internal error messages in production |
| `MONGO_URI` | Yes | `mongodb+srv://…` | MongoDB Atlas connection string |
| `CLIENT_ORIGIN` | No | `https://area51.vercel.app` | Comma-separated CORS allowlist (default: `http://localhost:5173`) |
| `ALLOWED_VERCEL_PROJECT` | No | `area51` | Slug prefix for Vercel preview-URL CORS wildcard |

**`frontend/.env`**

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `VITE_API_URL` | No | `http://localhost:5000/api` | Backend base URL used by `src/api/client.js` |

---

## 6. Unused / dead-code files

The following three components exist in `frontend/src/components/` but are never
imported anywhere in the active codebase. They reference modules that do not exist
and will cause compile errors if imported:

- `AuthConsole.jsx`
- `Dashboard.jsx`
- `Questionaire.jsx`

These are safe to delete if the project is cleaned up.

---

## 7. Known constraints and gotchas

- **No `.env.example` files.** Developers cloning the repo must create both `.env`
  files manually using the table in §5.
- **No automated tests.** Neither package has a test suite or a test script in
  `package.json`.
- **`backdrop-filter` intentionally absent** from `.hud-panel` — the comment in
  `index.css` explains that applying backdrop blur over the animated WebGL background
  would trigger a full repaint every frame.
- **`FaultyTerminal` at `dpr={0.5}`** renders at half the screen's native resolution
  to keep GPU usage low. This is a deliberate quality/performance trade-off.
- **`maxFps={30}` default** in `FaultyTerminal` halves GPU work by capping the shader
  pass to 30 fps regardless of the display's refresh rate.
- **`loseContext()` removed** from `FaultyTerminal`'s cleanup. In React StrictMode
  (development) the component mounts twice; calling `loseContext` on first unmount
  would leave the canvas permanently broken on the second mount.
- **React Bits components are local copies**, not npm packages. Changes are tracked by
  "Local change:" comments inside each file. Future upstream changes must be merged
  manually.
- **The `motion` package** (v12.43.x) and **`sonner`** are listed as dependencies but
  are not actively used in any component that is rendered in production. `motion` was
  the original root of `DecryptedText` but was replaced with a plain `<span>`.
- **CORS origin for Vercel previews** uses a regex built from `ALLOWED_VERCEL_PROJECT`.
  If this env var is not set, Vercel preview deployments of the frontend will receive
  CORS errors from the backend.
- **`getFeedback` response shape**: the client reads `data.feedback` (an array).
  If the backend ever changes this key the log will silently render empty.
