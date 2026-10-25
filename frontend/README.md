# Area 51 // Feedback Terminal (React + Tailwind)

A themed frontend for the Express/MongoDB feedback backend — a "classified intel
console" built around Area 51: a live radar-sweep hero, HUD-style corner-bracket
panels, a declassification timeline, a stylized surveillance-feed gallery, and a
working feedback form (name, email, comment) wired to your backend, with a live
"transmission log" of everyone's submitted comments.

## Stack
- React 18 + Vite
- Tailwind CSS (custom theme: deep blues, cyan HUD glow, radar green, amber/red accents)
- No UI library — all components are hand-built for this project
- Custom SVG illustrations for the gallery (not scraped photos — see note below)

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Point it at your backend**
   ```bash
   cp .env.example .env
   ```
   Set `VITE_API_URL` to wherever your Express backend is running, e.g.:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Run it**
   ```bash
   npm run dev
   ```
   Opens at `http://localhost:5173`. Make sure your backend's `CLIENT_ORIGIN` (in its
   own `.env`) includes `http://localhost:5173` so CORS allows the requests.

4. **Build for production**
   ```bash
   npm run build
   ```

## Project structure
```
src/
├── api/client.js              # fetch wrapper: submitFeedback / getFeedback
├── components/
│   ├── Navbar.jsx             # sticky HUD nav with live clock
│   ├── RadarHero.jsx          # animated radar-sweep hero (signature element)
│   ├── BriefingPanel.jsx      # reusable bordered panel w/ corner brackets
│   ├── About.jsx              # history/briefing cards
│   ├── Timeline.jsx           # declassification timeline
│   ├── Gallery.jsx            # custom SVG "surveillance feed" illustrations
│   ├── Facts.jsx              # stats + FAQ
│   ├── FeedbackConsole.jsx    # feedback form + live transmission log
│   ├── ScanlineOverlay.jsx    # ambient full-page scanline effect
│   └── Footer.jsx
├── App.jsx
├── main.jsx
└── index.css                  # fonts, theme tokens, HUD utility classes
```

## How feedback connects to the backend
- `FeedbackConsole` collects name/email/comment and calls `submitFeedback()`.
- On success, the form clears, a confirmation message shows, and the transmission
  log refreshes via `getFeedback()` to include the new entry.
- The transmission log loads on page mount and shows the 50 most recent entries,
  newest first. Email addresses are never shown publicly (the backend excludes them
  from the list response).
- Validation errors from the backend (missing name, bad email, too-short comment)
  are surfaced directly in the form.

## A note on the imagery
Real archival photos of Area 51 are scarce and tightly rights-controlled, and
hot-linking random web images into shipped code is unreliable. Instead, the gallery
uses original SVG illustrations styled as declassified "surveillance feed" panels —
which also fits the theme better than stock photography would.

## Customizing the theme
All color tokens, fonts, and keyframe animations live in `tailwind.config.js` and
`src/index.css`.
