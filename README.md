# 📚 Smart Study Planner

**Author:** Rohit Badiger  

**Version:** v2.0 (Local Only – No Backend)

An advanced **study planner & productivity tool** with gamification, smart suggestions, analytics, heatmaps, Pomodoro timer, and PWA support.
Built with **modern web technologies** for a smooth and interactive experience.

This is a local-only enhanced version of the Smart Study Planner with unique features:
- Gamification: streaks & badges
- Spaced repetition suggestions
- Subject heatmap (last 30 days)
- Voice reminders (Web Speech API)
- Theme toggle (light/dark, saved in localStorage)
- Pomodoro timer
- PWA-ready (manifest + simple service worker)
- Export / Import JSON

## 🚀 Features

* ✅ **Task Management** – Add, edit, delete, and mark study tasks.
* ✅ **Spaced Repetition Suggestions** – Smart recommendations based on when you last studied each subject.
* ✅ **Gamification (Streaks & Badges)** – Tracks consecutive study days and rewards badges.
* ✅ **Subject Heatmap (Last 30 Days)** – Visual calendar showing your study intensity (fixed order).
* ✅ **Voice Reminders** – Uses Web Speech API to read out tasks and suggestions.
* ✅ **Pomodoro Timer** – Focus sessions with customizable lengths.
* ✅ **Analytics Dashboard** – Progress chart (done vs pending).
* ✅ **Theme Toggle (Dark/Light)** – Saves your preference in local storage.
* ✅ **PWA Support** – Works offline, installable as a native app.
* ✅ **Export / Import Data** – Backup and restore your study history with JSON.

---

## 🛠️ Technologies Used

* **HTML5, CSS3 (TailwindCSS)**
* **JavaScript (ES6+)**
* **GSAP (Animations)**
* **Chart.js (Progress Analytics)**
* **Web Speech API (Voice Reminders)**
* **LocalStorage (Data Persistence)**
* **PWA (Service Worker + Manifest)**

---

## 📂 Project Structure

```
smart-study-planner/
│── index.html
│── styles.css
│── app.js
│── manifest.json
│── service-worker.js
│── icons/
│    ├── icon-192.png
│    └── icon-512.png
│── README.md
```


## How to run
1. Unzip the folder.
2. Open `index.html` in a modern browser (Chrome/Edge/Firefox). For PWA or service worker features, serve via a local server:
   - Python: `python -m http.server 8080`       // for windows
   - Python: `python3 -m http.server 8080`     // for MAC 
   - Then open `http://localhost:8080`

## Files
- `index.html` — main UI
- `styles.css` — small extra styles (Tailwind used via CDN)
- `app.js` — main application logic (localStorage persistence)
- `manifest.json` — PWA manifest
- `service-worker.js` — simple offline cache
- `README.md` — this file

---

## Notes
- All data is saved in `localStorage`. No server required.
- If you want sync across devices, we can integrate Firebase in a follow-up.

## License
This project is for educational purposes only. Please contact the author for licensing queries.

Enjoy!
