// Upgraded Smart Study Planner - Local only (Fixed Heatmap + Enhancements)
const STORAGE_KEY = 'smart-study-v2';
class Store {
  constructor() { this.data = this.load(); }
  load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
        tasks: [],
        history: [],
        prefs: { theme: 'dark', lastStudy: {} }
      };
    } catch (e) {
      return { tasks: [], history: [], prefs: { theme: 'dark', lastStudy: {} } };
    }
  }
  save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data)); }
}
const store = new Store();

/* Utilities */
const qs = s => document.querySelector(s);
const qsa = s => document.querySelectorAll(s);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
function formatDateISO(d) { return new Date(d).toISOString(); }
function daysBetween(a, b) { return Math.floor((b - a) / (1000 * 60 * 60 * 24)); }

/* Spaced repetition suggestion */
function getSpacedSuggestion() {
  const tasks = store.data.tasks || [];
  if (!tasks.length) return 'No tasks yet.';
  const lastMap = {};
  (store.data.history || []).forEach(h => lastMap[h.id] = Math.max(lastMap[h.id] || 0, h.when));
  let best = null, bestScore = -1;
  tasks.forEach(t => {
    const last = lastMap[t.id] || t.createdAt || 0;
    const score = Math.max(0, daysBetween(last, Date.now()));
    if (score > bestScore) { bestScore = score; best = t; }
  });
  if (!best) return 'No strong suggestion.';
  return `Study "${best.title}" (subject: ${best.subject || '—'}) — not reviewed for ${bestScore} days.`;
}

/* Gamification */
function updateStreaks() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = new Set();
  (store.data.history || []).forEach(h => {
    const d = new Date(h.when); d.setHours(0, 0, 0, 0);
    days.add(+d);
  });
  let streak = 0, cur = +today;
  while (days.has(cur)) { streak++; cur -= 24 * 60 * 60 * 1000; }
  const badges = [];
  if (streak >= 3) badges.push('3-day streak');
  if (streak >= 7) badges.push('7-day streak');
  if (streak >= 30) badges.push('Monthly Master');
  return { streak, badges };
}

/* Heatmap Data Builder (Fixed ascending order) */
function buildHeatmap() {
  const last30 = [];
  for (let i = 29; i >= 0; i--) {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - i);
    last30.push({ date: +day, counts: {}, total: 0 });
  }
  (store.data.history || []).forEach(h => {
    const day = new Date(h.when);
    day.setHours(0, 0, 0, 0);
    const ts = +day;
    const idx = last30.findIndex(x => x.date === ts);
    if (idx >= 0) {
      last30[idx].total++;
      last30[idx].counts[h.subject] = (last30[idx].counts[h.subject] || 0) + 1;
    }
  });
  return last30; // oldest → newest
}

/* Rendering */
function renderTasks() {
  const container = qs('#tasksList');
  const tasks = store.data.tasks || [];
  if (!tasks.length) container.innerHTML = '<div class="text-slate-400">No tasks — add one above.</div>';
  else container.innerHTML = tasks.map(t => taskTpl(t)).join('');
  attachTaskHandlers();
  renderSuggestion();
  renderAnalytics();
  renderBadges();
  renderHeatmap();
  gsap.from('.task-card', { y: 8, opacity: 0, stagger: 0.05, duration: 0.35 });
}
function taskTpl(t) {
  return `<div class="task-card p-3 bg-slate-800 rounded flex items-start justify-between" data-id="${t.id}">
    <div>
      <div class="flex items-center gap-3">
        <input type="checkbox" class="toggleComplete" ${t.completed ? 'checked' : ''}/>
        <div>
          <div class="font-medium">${escapeHtml(t.title)}</div>
          <div class="text-xs text-slate-400">${t.subject || '—'} · ${t.duration ? t.duration + ' min' : '—'} · ${t.priority}</div>
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-2">
      <button class="editBtn px-2 py-1 rounded bg-slate-700 text-sm">Edit</button>
      <button class="deleteBtn px-2 py-1 rounded bg-rose-600 text-sm">Delete</button>
    </div>
  </div>`;
}
function escapeHtml(s = '') { return s.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m] || m)); }

function attachTaskHandlers() {
  qsa('.deleteBtn').forEach(b => b.onclick = e => {
    const id = e.target.closest('[data-id]').dataset.id;
    store.data.tasks = store.data.tasks.filter(t => t.id !== id);
    store.save(); renderTasks();
  });
  qsa('.editBtn').forEach(b => b.onclick = e => {
    const id = e.target.closest('[data-id]').dataset.id;
    const t = store.data.tasks.find(x => x.id === id);
    if (!t) return;
    qs('#title').value = t.title; qs('#subject').value = t.subject || '';
    qs('#due').value = t.due ? new Date(t.due).toISOString().slice(0, 16) : '';
    qs('#duration').value = t.duration || ''; qs('#priority').value = t.priority || 'medium';
    qs('#taskForm').dataset.editId = id; window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  qsa('.toggleComplete').forEach(cb => cb.onchange = e => {
    const id = e.target.closest('[data-id]').dataset.id; const checked = e.target.checked;
    const t = store.data.tasks.find(x => x.id === id);
    if (!t) return;
    t.completed = checked;
    if (checked) {
      store.data.history = store.data.history || [];
      store.data.history.push({ id: t.id, when: Date.now(), subject: t.subject || 'Unknown', title: t.title });
      store.data.prefs.lastStudy[t.id] = Date.now();
    }
    store.save(); renderTasks();
  });
}

function renderSuggestion() { qs('#suggestion').textContent = getSpacedSuggestion(); }

function renderAnalytics() {
  const total = store.data.tasks.length;
  const done = (store.data.tasks.filter(t => t.completed) || []).length;
  const pending = total - done;
  qs('#stats').innerHTML = `Total: ${total} · Done: ${done} · Pending: ${pending}`;
  const ctx = qs('#progressChart').getContext('2d');
  if (!window._chart) {
    window._chart = new Chart(ctx, {
      type: 'doughnut',
      data: { labels: ['Done', 'Pending'], datasets: [{ data: [done, pending] }] },
      options: { plugins: { legend: { labels: { color: '#cbd5e1' } } } }
    });
  } else {
    window._chart.data.datasets[0].data = [done, pending]; window._chart.update();
  }
}

function renderBadges() {
  const el = qs('#badges'); el.innerHTML = '';
  const s = updateStreaks();
  const tag = document.createElement('div'); tag.className = 'p-2 bg-slate-800 rounded text-sm'; tag.textContent = `Current streak: ${s.streak} days`; el.appendChild(tag);
  s.badges.forEach(b => {
    const d = document.createElement('div'); d.className = 'p-2 bg-amber-500 text-slate-900 rounded text-sm'; d.textContent = b; el.appendChild(d);
  });
}

function renderHeatmap() {
  const container = qs('#heatmap'); container.innerHTML = '';
  const data = buildHeatmap();
  data.forEach(d => {
    const el = document.createElement('div'); el.className = 'heatcell';
    const t = d.total;
    let bg = 'bg-slate-700';
    if (t >= 3) bg = 'bg-emerald-600';
    else if (t == 2) bg = 'bg-emerald-500';
    else if (t == 1) bg = 'bg-emerald-400';
    el.classList.add(...bg.split(' '));
    const dt = new Date(d.date);
    el.title = dt.toDateString() + ' (' + t + ' sessions)';
    el.textContent = dt.getDate(); // ✅ Now in ascending order
    container.appendChild(el);
  });
}

/* Form handling */
qs('#taskForm').onsubmit = e => {
  e.preventDefault();
  const title = qs('#title').value.trim(); if (!title) return alert('Add title');
  const task = {
    id: qs('#taskForm').dataset.editId || uid(),
    title,
    subject: qs('#subject').value.trim(),
    due: qs('#due').value ? new Date(qs('#due').value).toISOString() : null,
    duration: qs('#duration').value ? +qs('#duration').value : null,
    priority: qs('#priority').value || 'medium',
    createdAt: Date.now(),
    completed: false
  };
  if (qs('#taskForm').dataset.editId) {
    store.data.tasks = store.data.tasks.map(t => t.id === task.id ? { ...t, ...task } : t);
    delete qs('#taskForm').dataset.editId;
  } else {
    store.data.tasks = store.data.tasks || []; store.data.tasks.push(task);
  }
  qs('#taskForm').reset(); store.save(); renderTasks();
};

/* Clear all */
qs('#clearAll').onclick = () => {
  if (confirm('Clear all tasks and history?')) { store.data.tasks = []; store.data.history = []; store.save(); renderTasks(); }
};

/* Export / Import */
qs('#exportBtn').onclick = () => {
  const blob = new Blob([JSON.stringify(store.data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'study-data.json'; a.click();
};
qs('#importBtn').onclick = () => qs('#fileInput').click();
qs('#fileInput').onchange = e => {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader(); r.onload = () => {
    try { const obj = JSON.parse(r.result); store.data = obj; store.save(); renderTasks(); alert('Imported'); } catch (err) { alert('Invalid file'); }
  }; r.readAsText(f);
};

/* Voice read */
qs('#voiceRead').onclick = () => {
  const tasks = store.data.tasks || [];
  if (!tasks.length) return alert('No tasks');
  const synth = window.speechSynthesis;
  const ut = new SpeechSynthesisUtterance('You have ' + tasks.length + ' tasks. Suggestion: ' + getSpacedSuggestion());
  synth.cancel(); synth.speak(ut);
};

/* Pomodoro */
class Pomodoro {
  constructor() { this.interval = null; this.remaining = 25 * 60; this.running = false; this.load(); this.render(); }
  load() { this.remaining = (+qs('#pomodoroLen').value || 25) * 60; }
  tick() { if (this.remaining <= 0) { this.stop(); notify('Pomodoro finished'); return; } this.remaining--; this.render(); }
  start() { if (this.running) return; this.running = true; this.interval = setInterval(() => this.tick(), 1000); }
  pause() { this.running = false; clearInterval(this.interval); }
  stop() { this.pause(); this.load(); this.render(); }
  render() { const mm = String(Math.floor(this.remaining / 60)).padStart(2, '0'); const ss = String(this.remaining % 60).padStart(2, '0'); qs('#timerDisplay').textContent = mm + ':' + ss; }
}
const pom = new Pomodoro();
qs('#startTimer').onclick = () => pom.start();
qs('#pauseTimer').onclick = () => pom.pause();
qs('#resetTimer').onclick = () => pom.stop();
qs('#pomodoroLen').onchange = () => { pom.load(); pom.render(); };

/* Notifications */
function notify(text) {
  if ("Notification" in window && Notification.permission === 'granted') new Notification('Study Planner', { body: text });
  else console.log(text);
}
if ("Notification" in window && Notification.permission === 'default') Notification.requestPermission();

/* Theme */
function applyTheme() {
  const t = store.data.prefs.theme || 'dark';
  if (t === 'dark') document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
}
qs('#themeToggle').onclick = () => {
  store.data.prefs.theme = (store.data.prefs.theme === 'dark') ? 'light' : 'dark'; store.save(); applyTheme();
};
applyTheme();

/* Install prompt */
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; qs('#installBtn').style.display = 'inline-block'; });
qs('#installBtn').onclick = async () => {
  if (deferredPrompt) { deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; }
};

/* Service worker */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js').catch(() => console.log('sw fail'));
}

/* Init */
renderTasks();
setInterval(() => { renderAnalytics(); renderBadges(); renderHeatmap(); }, 10000);
