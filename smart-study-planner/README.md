# Smart Study Planner — Upgraded (Local)

This is a local-only enhanced version of the Smart Study Planner with unique features:
- Gamification: streaks & badges
- Spaced repetition suggestions
- Subject heatmap (last 30 days)
- Voice reminders (Web Speech API)
- Theme toggle (light/dark, saved in localStorage)
- Pomodoro timer
- PWA-ready (manifest + simple service worker)
- Export / Import JSON

## How to run
1. Unzip the folder.
2. Open `index.html` in a modern browser (Chrome/Edge/Firefox). For PWA or service worker features, serve via a local server:
   - Python: `python3 -m http.server 8080`
   - Then open `http://localhost:8080`

## Files
- `index.html` — main UI
- `styles.css` — small extra styles (Tailwind used via CDN)
- `app.js` — main application logic (localStorage persistence)
- `manifest.json` — PWA manifest
- `service-worker.js` — simple offline cache
- `README.md` — this file

## Notes
- All data is saved in `localStorage`. No server required.
- If you want sync across devices, we can integrate Firebase in a follow-up.

Enjoy!