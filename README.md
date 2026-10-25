# Area 51 — Restricted Access Terminal

Area 51 is a scroll-based, classified-document briefing terminal themed around the Groom Lake
facility. Visitors scroll through six thematic sections — a radar hero, an about brief, a
declassified timeline, a gallery of surveillance footage, an intelligence fact wall, and a
live public feedback console — while a raw WebGL2 CRT glyph field plays behind everything.
The feedback console is the only interactive data endpoint: anyone can submit a name, email,
and comment; the live transmission log immediately shows all community entries (email is
never revealed). The project is a full-stack web app split into two independent npm packages:
`frontend/` (Vite 5 + React 18 + Tailwind CSS 3) and `backend/` (Express 4 + Mongoose 8,
deployable locally or as a Vercel serverless function).

---

## Table of Contents

1. [Features](#features)
2. [Tech stack](#tech-stack)
3. [Architecture](#architecture)
   - [System diagram](#system-diagram)
   - [Frontend](#frontend)
   - [Backend](#backend)
4. [Project structure](#project-structure)
5. [Getting started](#getting-started)
6. [Deployment notes](#deployment-notes)
7. [Troubleshooting](#troubleshooting)
8. [Security measures](#security-measures)
9. [Accessibility and performance](#accessibility-and-performance)

---

## Features

- Scroll-only single-page experience with no client-side router.
- Animated radar sweep (CSS), timeline (GSAP/ScrollTrigger scrub), gallery card entrance
  (GSAP), and sonar pings (anime.js).
- WebGL2 CRT glyph background with barrel distortion, chromatic aberration, scanlines,
  vignette, glitch tears, and degauss ripple — capped at 30 fps, rendered at half
  device-pixel-ratio by default.
- Public feedback wall: form with client-side and server-side validation, live animated log
  powered by `@react-spring/web` list transitions, and a `ClickSpark` canvas burst on
  successful submit.
- Backend hardened with Helmet, body-size limits (10 KB), mongo-sanitize, HPP, CORS
  allowlisting with Vercel preview-URL regex, and separate read/write rate limiters.
- Email stored in MongoDB but never returned to any caller.
- Full reduced-motion support at five independent layers (CSS, react-spring, GSAP, anime.js,
  WebGL uniforms).

---

## Tech stack

| Layer | Technology | Version |
|---|---|---|
| Build tool | Vite | 5.3.x |
| UI framework | React | 18.3.x |
| Styling | Tailwind CSS | 3.4.x |
| Scroll animations | GSAP + ScrollTrigger | 3.15.x |
| Spring transitions | @react-spring/web | 10.1.x |
| Radar pings | anime.js | 4.5.x |
| Motion (installed, not active) | motion | 12.43.x |
| Background | Raw WebGL2 (FaultyTerminal) | no external lib |
| Server | Express | 4.19.x |
| ODM | Mongoose | 8.5.x |
| Input validation | express-validator | 7.2.x |
| Security headers | helmet | — |
| Rate limiting | express-rate-limit | — |
| DB | MongoDB Atlas | — |

---

## Architecture

### System diagram

```mermaid
flowchart LR
    Browser["Browser\n(Vite SPA)"]
    SPA["React SPA\nfrontend/src"]
    API["Express API\nbackend/server.js"]
    DB["MongoDB Atlas\n(Feedback collection)"]

    Browser -->|HTTP / HTTPS| SPA
    SPA -->|POST /api/feedback\nGET /api/feedback| API
    API -->|mongoose.connect\n(MONGO_URI)| DB
    DB -->|documents| API
    API -->|JSON response| SPA
```

### Frontend

**Page sections** — rendered in order by `App.jsx`:

| Order | Component | Section id | scroll-mt |
|---|---|---|---|
| — | FaultyTerminal | (fixed WebGL background) | — |
| — | ScanlineOverlay | (fixed CSS overlay) | — |
| — | Navbar | (sticky 64 px header) | — |
| 1 | RadarHero | (no id — hero above fold) | — |
| 2 | About | `about` | `scroll-mt-16` |
| 3 | Timeline | `timeline` | `scroll-mt-16` |
| 4 | Gallery | `gallery` | `scroll-mt-16` |
| 5 | Facts | `facts` | `scroll-mt-16` |
| 6 | FeedbackConsole | `access` | `scroll-mt-16` |
| — | Footer | (no id) | — |

`scroll-mt-16` (64 px) offsets the sticky navbar so `scrollIntoView` lands with the section
heading below the header. Navigation is entirely scroll-based; there is no client-side router.
`App.jsx` defines a `scrollTo(id)` helper and passes it as `onNavigate` to `Navbar` and
`RadarHero`.

**Navbar links:**

| Label | Target id |
|---|---|
| BRIEFING | `about` |
| TIMELINE | `timeline` |
| ARCHIVE | `gallery` |
| INTEL | `facts` |
| FEEDBACK | `access` |

**Animation effects by library:**

| Library | Where used |
|---|---|
| GSAP + ScrollTrigger | `AnimatedContent.jsx` (scroll-reveal wrapper), `Timeline.jsx` (line scrub + li entrances) |
| @react-spring/web | `Navbar.jsx` (mobile menu), `FeedbackConsole.jsx` (log list transitions) |
| anime.js | `RadarHero.jsx` (sonar ping rings, 1800 ms loop with 450 ms stagger) |
| Raw WebGL2 | `FaultyTerminal.jsx` (two-pass cellular noise + CRT post-processing) |
| CSS keyframes (Tailwind) | `radar-spin`, `blip-pulse`, `flicker`, `scan`, `fade-up`, `marquee` |

**API client request pipeline** (`src/api/client.js`):

1. Read `import.meta.env.VITE_API_URL` (fallback: `http://localhost:5000/api`).
2. Attach `AbortSignal.timeout(15000)` to every fetch.
3. On network/CORS/timeout error, catch and re-throw as a human-readable string.
4. On non-2xx, read `data.errors?.[0]?.message` then `data.message`; fallback string if neither exists.
5. Non-JSON body is caught by `.json().catch(() => ({}))`.

**API reference:**

| Function | Method | Path | Request body | Success response |
|---|---|---|---|---|
| `submitFeedback` | POST | `/feedback` | `{ name, email, comment }` | 201 `{ message, feedback: { id, name, comment, createdAt } }` |
| `getFeedback` | GET | `/feedback?limit=N` | — | 200 `{ feedback: [{ _id, name, comment, createdAt }] }` |

Validation error (400): `{ message: "Validation failed", errors: [{ field, message }] }`.

**Feedback model:**

| Field | Type | Constraints |
|---|---|---|
| name | String | required, trim, minlength 2, maxlength 60, no `<>` |
| email | String | required, trim, lowercase, maxlength 254, email regex, never returned to callers |
| comment | String | required, trim, minlength 3, maxlength 1000, no `<>` |
| createdAt / updatedAt | Date | added automatically by `timestamps: true` |

### Backend

**Security middleware order** (`server.js`):

| Step | Middleware | Purpose |
|---|---|---|
| 1 | `app.set("trust proxy", 1)` | Correct IP behind Vercel's proxy for rate-limit accuracy |
| 2 | `helmet()` | Security-hardened HTTP headers |
| 3 | `express.json({ limit: "10kb" })` | JSON body parsing; rejects payloads > 10 KB |
| 4 | `express.urlencoded({ limit: "10kb" })` | Same limit for form-encoded bodies |
| 5 | `mongoSanitize()` | Strips `$` / `.` from keys to block MongoDB operator injection |
| 6 | `hpp()` | Removes duplicate query-string params (HTTP Parameter Pollution) |
| 7 | CORS | Dynamic allowlist (see below) |
| 8 | `readLimiter` | 100 req / 15 min per IP — GET `/api/feedback` only |
| 9 | `writeLimiter` | 8 req / 15 min per IP — all non-GET on `/api/feedback` |

**CORS allowlist logic:**

- `CLIENT_ORIGIN` env var (comma-separated) builds an exact-match list; defaults to
  `http://localhost:5173`.
- If `ALLOWED_VERCEL_PROJECT` is set, any origin matching
  `^https://<slug>-[a-z0-9]+-[a-z0-9-]+\.vercel\.app$` is also allowed.
- Requests with no `Origin` header (e.g., curl, server-to-server) pass through unconditionally.
- A blocked origin sends HTTP 403 `{ message: "Origin not allowed" }`.

**Validation layers** (defence in depth):

1. **express-validator** (`routes/feedback.js`) — runs before the controller; checks all
   three fields, returns 400 `{ errors: [{field, message}] }` on failure.
2. **Mongoose schema match** (`models/Feedback.js`) — the regex `/^[^<>]*$/` on `name` and
   `comment` rejects HTML angle brackets even if a request bypasses the route-level check.

**Database connection** (`config/db.js`):

- `global._mongooseConn = { conn, promise }` caches the Mongoose connection across serverless
  warm containers so a second invocation awaits the same promise rather than opening a new
  Atlas connection.
- `maxPoolSize: 10`.
- DNS forced to `8.8.8.8` / `8.8.4.4` to resolve Atlas SRV records through restrictive ISPs.
- On connection failure the server stays alive; all feedback endpoints return 500 until the DB
  recovers.

**Local vs Vercel entry points:**

- Local: `node server.js` / `nodemon server.js` — `app.listen()` fires because
  `require.main === module`.
- Vercel: `backend/vercel.json` rewrites all paths to `backend/api/index.js`, which is
  `module.exports = require('../server')`. The `listen()` guard suppresses port binding.

---

## Project structure

```
practice3.0/                        ← repo root (github.com/deyaayush2006-coder/Area-51)
├── .gitignore                      ← ignores node_modules, dist, .env, .env.*
├── frontend/
│   ├── index.html                  ← shell; loads Google Fonts (Orbitron, IBM Plex Sans/Mono)
│   ├── vite.config.js              ← Vite 5, @vitejs/plugin-react, dev port 5173
│   ├── tailwind.config.js          ← custom color tokens + keyframes
│   ├── postcss.config.js           ← tailwindcss + autoprefixer
│   ├── package.json
│   └── src/
│       ├── main.jsx                ← React root; react-spring reduced-motion global skip
│       ├── App.jsx                 ← page layout: FaultyTerminal + all six sections
│       ├── index.css               ← global styles, HUD utilities, reduced-motion reset
│       ├── api/
│       │   └── client.js           ← fetch wrapper; submitFeedback + getFeedback
│       └── components/
│           ├── Navbar.jsx
│           ├── RadarHero.jsx       ← anime.js sonar pings, CSS radar sweep
│           ├── About.jsx
│           ├── Timeline.jsx        ← GSAP scrubbed line + li entrances
│           ├── Gallery.jsx
│           ├── Facts.jsx
│           ├── FeedbackConsole.jsx ← form, live log, ClickSpark on submit
│           ├── Footer.jsx
│           ├── FaultyTerminal.jsx  ← raw WebGL2 two-pass CRT renderer
│           ├── ScanlineOverlay.jsx ← fixed CSS scanline overlay
│           ├── AnimatedContent.jsx ← GSAP/ScrollTrigger scroll-reveal wrapper
│           ├── BriefingPanel.jsx   ← card: SpotlightCard + .hud-corners
│           ├── ClassifiedText.jsx  ← DecryptedText preset (animateOn="view")
│           ├── DecryptedText.jsx   ← character-scramble effect (React Bits)
│           ├── ClickSpark.jsx      ← canvas particle burst on click (React Bits)
│           ├── CountUp.jsx         ← odometer number roll (React Bits)
│           ├── Magnet.jsx          ← magnetic pointer pull (React Bits)
│           ├── SpotlightCard.jsx   ← cursor-following radial light (React Bits)
│           ├── AuthConsole.jsx     ← UNUSED leftover; imports missing modules
│           ├── Dashboard.jsx       ← UNUSED leftover; imports missing modules
│           └── Questionaire.jsx    ← UNUSED leftover; imports missing modules
└── backend/
    ├── server.js                   ← Express app factory; module.exports for Vercel
    ├── vercel.json                 ← rewrites all traffic to api/index.js
    ├── package.json
    ├── api/
    │   └── index.js                ← one-line re-export of server.js for Vercel Functions
    ├── config/
    │   └── db.js                   ← Mongoose connect with global caching + DNS override
    ├── models/
    │   └── Feedback.js             ← Mongoose schema: name, email, comment + timestamps
    ├── routes/
    │   └── feedback.js             ← POST / GET with express-validator rules
    ├── controllers/
    │   └── feedbackController.js
    └── middleware/
        └── validate.js             ← runs validationResult; returns 400 on failure
```

The three `UNUSED` components (`AuthConsole.jsx`, `Dashboard.jsx`, `Questionaire.jsx`) are
never imported in `App.jsx` or anywhere else in the active tree. They reference modules that
do not exist and will crash the Vite build if imported. They are safe to delete.

---

## Getting started

### Prerequisites

- Node.js 18 or later
- npm 9 or later
- A MongoDB Atlas cluster with a database user and an IP allowlist entry for your machine (or
  `0.0.0.0/0` for development)

### Install

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Create environment files

No `.env.example` files are included in this repository (they are git-ignored and were not
created). Create both files by hand.

**`backend/.env`**

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
CLIENT_ORIGIN=http://localhost:5173
ALLOWED_VERCEL_PROJECT=
```

| Variable | Required | What it does |
|---|---|---|
| `PORT` | No (default 5000) | TCP port `server.js` listens on |
| `NODE_ENV` | No | Set to `production` to hide internal error messages from callers |
| `MONGO_URI` | Yes | Full Atlas connection string; URL-encode any special characters in the password |
| `CLIENT_ORIGIN` | No (default `http://localhost:5173`) | Comma-separated list of exact frontend origins allowed by CORS |
| `ALLOWED_VERCEL_PROJECT` | No | Vercel project slug; enables the preview-URL CORS regex (e.g. `area51`) |

**`frontend/.env`**

```
VITE_API_URL=http://localhost:5000/api
```

| Variable | Required | What it does |
|---|---|---|
| `VITE_API_URL` | No (default `http://localhost:5000/api`) | Backend base URL baked into the Vite build at build time |

### Run locally

Open two terminals:

```bash
# Terminal 1 — backend (http://localhost:5000)
cd backend
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd frontend
npm run dev
```

`CLIENT_ORIGIN` in `backend/.env` must include the exact frontend origin
(`http://localhost:5173` by default). Adding a trailing slash or a different port will
produce a CORS 403.

See `frontend/README.md` for additional frontend-specific notes.

---

## Deployment notes

**Backend on Vercel**

Deploy the `backend/` directory as its own Vercel project. `backend/vercel.json` already
rewrites all paths to `backend/api/index.js`.

Set these environment variables in the Vercel project dashboard:

- `NODE_ENV=production`
- `MONGO_URI` — your Atlas connection string
- `CLIENT_ORIGIN` — the production frontend URL (e.g. `https://your-frontend.vercel.app`)
- `ALLOWED_VERCEL_PROJECT` — your frontend Vercel project slug if you want preview
  deployments to reach the API

**Frontend on Vercel (or any static host)**

The frontend is a standard Vite static build. `VITE_API_URL` is read at build time by Vite
and baked into the bundle, so it must be set as a build environment variable, not a runtime
one:

```bash
cd frontend
VITE_API_URL=https://your-backend.vercel.app/api npm run build
# or set it in the Vercel project's Environment Variables panel
```

The output lands in `frontend/dist/`. The backend and frontend must be deployed as two
separate Vercel projects — the backend's `vercel.json` routes everything to its API handler
and cannot serve the static frontend files from the same project.

---

## Troubleshooting

**Atlas "bad auth" or authentication failed**
The database user's password in `MONGO_URI` is wrong. Reset it in Atlas → Database Access →
Edit User → Edit Password. URL-encode any special character in the new password before
pasting it into the connection string (e.g. `@` → `%40`, `#` → `%23`).

**`querySrv ENOTFOUND _mongodb._tcp…` / DNS resolution failures**
Your ISP or router is stripping MongoDB Atlas SRV records. `config/db.js` already forces
Node's DNS resolver to use `8.8.8.8` and `8.8.4.4`. If the error persists, verify the
Google DNS patch is present in `db.js` or manually switch your machine's DNS to `8.8.8.8`.

**Atlas IP not allowlisted**
Atlas rejects connections from IPs not in your cluster's Network Access allowlist. Add your
current IP in Atlas → Network Access → Add IP Address. For Vercel serverless functions, which
use dynamic IPs, allow `0.0.0.0/0` or use Atlas Private Endpoint.

**CORS "Origin not allowed" (HTTP 403)**
The frontend's origin is not in the backend's allowlist. Make sure `CLIENT_ORIGIN` in
`backend/.env` exactly matches the `Origin` header the browser sends (scheme, host, port — no
trailing slash). For Vercel preview URLs, set `ALLOWED_VERCEL_PROJECT` to the frontend
project's slug.

**Feedback console hangs for ~10 seconds then shows a 500 error**
The backend is reachable but cannot connect to MongoDB. MongoDB's default socket timeout is
~10 s; the controller then rejects with a 500. Check `MONGO_URI`, Atlas IP allowlist, and the
Vercel function logs.

---

## Security measures

- **Helmet** sets security-hardened HTTP headers on every response.
- **Body size limits** (10 KB JSON, 10 KB URL-encoded) prevent oversized payload attacks.
- **mongo-sanitize** strips `$` and `.` prefixes from all request body keys before Mongoose
  sees them, blocking MongoDB operator injection.
- **HPP** deduplicates query-string parameters.
- **Two-tier rate limiting**: reads are capped at 100 requests per 15 minutes per IP; writes
  at 8 per 15 minutes per IP.
- **CORS allowlisting** restricts cross-origin requests to known frontend origins.
- **express-validator + Mongoose `match` regex** provide two independent layers of HTML
  tag rejection (`<` and `>`), defending against stored XSS regardless of which layer a
  request reaches first.
- **Email is stored but never returned** — the GET endpoint's `select()` call explicitly
  excludes the `email` field from all responses.
- **Production error detail hiding** — when `NODE_ENV=production`, the global error handler
  replaces internal error messages with `"Internal server error"` before sending to the client.
- **No-Origin requests pass CORS** — server-to-server and curl calls are not blocked. This is
  intentional but means the CORS policy is not a substitute for authentication.

---

## Accessibility and performance

**Reduced motion** is respected at five independent layers so no animation library can
override the user's OS preference:

1. **CSS global reset** (`src/index.css`): collapses every `animation-duration`,
   `animation-iteration-count`, and `transition-duration` to `0.001ms` and sets
   `scroll-behavior: auto` under `@media (prefers-reduced-motion: reduce)`.
2. **react-spring global** (`main.jsx`): `Globals.assign({ skipAnimation: true })` makes all
   `@react-spring/web` springs jump instantly to their end state.
3. **GSAP / ScrollTrigger** (`AnimatedContent.jsx`, `Timeline.jsx`): each `useLayoutEffect`
   returns early without registering any tween when `prefers-reduced-motion` is set.
4. **anime.js** (`RadarHero.jsx`): same `matchMedia` guard; `animate()` is never called.
5. **FaultyTerminal WebGL** (`FaultyTerminal.jsx`): on reduced-motion the render loop zeroes
   the `glitchAmount` and `flickerAmount` uniforms and stops advancing `iTime`, freezing the
   CRT field in place without killing the canvas.

**Background performance** is deliberately limited to reduce GPU cost on lower-powered devices:

- `dpr={0.5}` renders the WebGL canvas at half the device's native pixel ratio, halving the
  number of pixels the two shader passes must process each frame.
- `maxFps={30}` caps the `requestAnimationFrame` loop to 30 fps — both shader passes run per
  frame, so this halves GPU work compared to a 60 fps cap.
- `.hud-panel` deliberately omits `backdrop-filter`. Adding backdrop blur over the animated
  WebGL layer would force the browser to composite and repaint on every frame, negating the
  fps cap.
