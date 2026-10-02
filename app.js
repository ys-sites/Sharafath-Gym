'use strict';

/* ==========================================================================
   Gym Progress & Performance Dashboard — Core Engine
   Simple single-page layout:
   1. Today's Session — what you did most recently
   2. Calendar — month grid + previous sessions list (tap to inspect)
   3. Stats — this week / this month / all-time / steps
   ========================================================================== */

const $ = (id) => document.getElementById(id);
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// Complete classification for all exercises tracked
const EXERCISE_META = {
  // Chest
  'Machine chest press': { category: 'Chest', split: 'Push' },
  'Incline dumbbell press': { category: 'Chest', split: 'Push' },
  'Machine pec deck fly': { category: 'Chest', split: 'Push' },
  'Pec deck fly': { category: 'Chest', split: 'Push' },
  'Incline machine press': { category: 'Chest', split: 'Push' },
  'Supported dips': { category: 'Chest', split: 'Push' },

  // Back
  'Wide-grip lat pulldown': { category: 'Back', split: 'Pull' },
  'Close-grip lat pulldown': { category: 'Back', split: 'Pull' },
  'Seated cable row': { category: 'Back', split: 'Pull' },
  'Wide-grip row': { category: 'Back', split: 'Pull' },
  'Lat pullover machine': { category: 'Back', split: 'Pull' },
  'Pull-up or assisted pull-up': { category: 'Back', split: 'Pull' },
  'Assisted pull-up': { category: 'Back', split: 'Pull' },
  'Chest-supported row': { category: 'Back', split: 'Pull' },

  // Shoulders
  'Dumbbell lateral raise': { category: 'Shoulders', split: 'Push' },
  'Reverse pec deck': { category: 'Shoulders', split: 'Pull' },
  'Reverse pec fly': { category: 'Shoulders', split: 'Pull' },

  // Arms
  'Triceps pushdown': { category: 'Arms', split: 'Push' },
  'Overhead rope extension': { category: 'Arms', split: 'Push' },
  'Rope pushdown': { category: 'Arms', split: 'Push' },
  'Overhead cable extension': { category: 'Arms', split: 'Push' },
  'Preacher curl': { category: 'Arms', split: 'Pull' },
  'Incline dumbbell curl': { category: 'Arms', split: 'Pull' },
  'Hammer curl': { category: 'Arms', split: 'Pull' },
  'Cable curl': { category: 'Arms', split: 'Pull' },

  // Legs
  'Smith machine squat': { category: 'Legs', split: 'Legs' },
  'Walking lunge': { category: 'Legs', split: 'Legs' },
  'Leg extension': { category: 'Legs', split: 'Legs' },
  'Romanian deadlift': { category: 'Legs', split: 'Legs' },
  'Lying leg curl': { category: 'Legs', split: 'Legs' },
  'Hip thrust': { category: 'Legs', split: 'Legs' },
  'Standing calf raise': { category: 'Legs', split: 'Legs' },
  'Seated calf raise': { category: 'Legs', split: 'Legs' },
  'Hack squat': { category: 'Legs', split: 'Legs' },
  'Leg press': { category: 'Legs', split: 'Legs' },
  'Dumbbell RDL': { category: 'Legs', split: 'Legs' },
  'Seated leg curl': { category: 'Legs', split: 'Legs' },

  // Core
  'Cable crunch': { category: 'Core', split: 'Core' },
  'Plank': { category: 'Core', split: 'Core' },
  'Seated leg raise': { category: 'Core', split: 'Core' }
};

const state = {
  theme: 'dark',
  sessions: [],
  byDate: new Map(),
  steps: [],
  selectedId: null,
  viewY: null,
  viewM: null
};

// Utilities
function parseDate(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function fmtNum(n) {
  return n == null ? '0' : Math.round(n).toLocaleString('en-US');
}

function fmtDay(d) {
  return DAYS[d.getDay()] + ', ' + MONTHS[d.getMonth()].slice(0, 3) + ' ' + d.getDate();
}

function sessionVolume(s) {
  return s.exercises.reduce((t, e) => t + (e.volume || 0), 0);
}

function sessionSets(s) {
  return s.exercises.reduce((t, e) => t + (e.sets ? e.sets.length : 0), 0);
}

function getSplitType(label) {
  const l = (label || '').toLowerCase();
  if (l.includes('push')) return 'Push';
  if (l.includes('pull')) return 'Pull';
  if (l.includes('leg') || l.includes('lower')) return 'Legs';
  if (l.includes('upper')) return 'Upper';
  return 'General';
}

function getSplitClass(split) {
  const s = split.toLowerCase();
  if (s.includes('push')) return 'push';
  if (s.includes('pull')) return 'pull';
  if (s.includes('leg') || s.includes('lower')) return 'legs';
  if (s.includes('upper')) return 'upper';
  return 'push';
}

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ==========================================================================
   Theme Management
   ========================================================================== */

function initTheme() {
  const saved = localStorage.getItem('sharafath-gym-theme');
  state.theme = saved || 'dark';
  applyTheme(state.theme);

  $('themeToggleBtn').addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('sharafath-gym-theme', state.theme);
    applyTheme(state.theme);
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const icon = $('themeIcon');
  if (theme === 'dark') {
    icon.innerHTML = '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>';
  } else {
    icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
  }
}

/* ==========================================================================
   Initialization & Data Loading
   ========================================================================== */

async function init() {
  initTheme();

  try {
    const res = await fetch('data/workouts.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();

    // Sort sessions chronologically
    state.sessions = data.slice().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    state.byDate = new Map();
    state.sessions.forEach((s) => {
      if (!state.byDate.has(s.date)) state.byDate.set(s.date, []);
      state.byDate.get(s.date).push(s);
    });

    const latest = state.sessions[state.sessions.length - 1];
    const ld = parseDate(latest.date);
    state.viewY = ld.getFullYear();
    state.viewM = ld.getMonth();

    const first = parseDate(state.sessions[0].date);
    $('dataRange').textContent = `${state.sessions.length} Sessions \u2022 ${fmtDay(first)} \u2013 ${fmtDay(ld)}, ${ld.getFullYear()}`;
    $('sessionCountBadge').textContent = state.sessions.length;

    // Render sections: today's session, calendar + previous sessions, stats
    renderTodaySession();
    renderKPIs();
    renderCalendar();
    renderQuickSessionList();

    // Select latest session initially in the inspector
    selectSession(latest.id, false);

    // Apple Health Steps (KPI only)
    try {
      const sres = await fetch('data/steps.json');
      if (sres.ok) {
        state.steps = (await sres.json()).slice().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
        renderStepsKPI();
      }
    } catch (e) { /* steps optional */ }

    // Event Listeners
    $('calPrev').addEventListener('click', () => shiftMonth(-1));
    $('calNext').addEventListener('click', () => shiftMonth(1));
    $('jumpLatestBtn').addEventListener('click', () => {
      const last = state.sessions[state.sessions.length - 1];
      selectSession(last.id, true);
    });

  } catch (err) {
    const box = $('loadError');
    box.classList.remove('hidden');
    box.textContent = 'Could not load workout data (' + err.message + '). Ensure data/workouts.json is accessible over HTTP.';
  }
}

/* ==========================================================================
   Shared exercise-card markup
   ========================================================================== */

function exerciseCardHTML(e) {
  const meta = EXERCISE_META[e.name] || { category: 'Other', split: 'General' };
  const skipped = e.skipped;
  const volStr = e.volume != null && e.volume > 0 ? fmtNum(e.volume) + ' kg vol' : '';

  let setsMarkup = '';
  if (skipped) {
    setsMarkup = '<span class="skipped-badge">Skipped</span>';
  } else if (e.sets && e.sets.length > 0) {
    setsMarkup = e.sets.map((reps, idx) => {
      const wt = e.weight != null ? `${e.weight} ${e.unit || 'kg'}` : (e.unit === 'BW' ? 'BW' : '');
      return `
        <div class="set-pill">
          <span class="set-idx">S${idx + 1}</span>
          <span class="set-reps">${reps} reps</span>
          ${wt ? `<span class="set-wt">@ ${wt}</span>` : ''}
        </div>
      `;
    }).join('');
  } else if (e.detail) {
    setsMarkup = `<span class="set-pill">${esc(e.detail)}</span>`;
  }

  return `
    <div class="exercise-item-card ${skipped ? 'is-skipped' : ''}">
      <div class="exercise-card-header">
        <div class="ex-name-group">
          <h4>${esc(e.name)}</h4>
          <span class="ex-muscle-tag">${meta.category}</span>
          ${e.detail && !skipped ? `<span class="ex-prescription">${esc(e.detail)}</span>` : ''}
        </div>
        ${volStr ? `<span class="ex-volume-badge">${volStr}</span>` : ''}
      </div>
      <div class="sets-pills-row">
        ${setsMarkup}
      </div>
    </div>
  `;
}

/* ==========================================================================
   Today's Session (top of page)
   ========================================================================== */

function todayKey() {
  const n = new Date();
  return n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-' + String(n.getDate()).padStart(2, '0');
}

function renderTodaySession() {
  const key = todayKey();
  const todays = state.byDate.get(key) || [];
  const latest = state.sessions[state.sessions.length - 1];
  const s = todays.length ? todays[todays.length - 1] : latest;

  const isToday = s.date === key;
  $('todayTitle').textContent = isToday ? "Today's Session" : 'Latest Session';
  $('todaySubtitle').textContent = isToday
    ? 'What you did today'
    : 'No session logged today yet — showing your most recent workout';

  $('todayLabel').textContent = s.label;
  const split = getSplitType(s.label);
  const splitBadge = $('todaySplitBadge');
  splitBadge.className = 'split-pill ' + getSplitClass(split);
  splitBadge.textContent = split;

  const dt = parseDate(s.date);
  $('todayDate').textContent = `${fmtDay(dt)}, ${dt.getFullYear()}` + (s.cycle ? ` \u2022 Cycle ${s.cycle}` : '');

  $('todayVolume').textContent = fmtNum(sessionVolume(s)) + ' kg';
  $('todaySets').textContent = sessionSets(s);
  $('todayExCount').textContent = s.exercises.length;

  const cardioBox = $('todayCardioBox');
  if (s.cardio) {
    cardioBox.classList.remove('hidden');
    $('todayCardioText').textContent = s.cardio;
  } else {
    cardioBox.classList.add('hidden');
  }

  const notesBox = $('todayNotesBox');
  if (s.notes) {
    notesBox.classList.remove('hidden');
    $('todayNotesText').textContent = s.notes;
  } else {
    notesBox.classList.add('hidden');
  }

  $('todayExercises').innerHTML = s.exercises.map(exerciseCardHTML).join('');
}

/* ==========================================================================
   KPIs (bottom stats)
   ========================================================================== */

function renderKPIs() {
  const latest = parseDate(state.sessions[state.sessions.length - 1].date);

  const ws = new Date(latest);
  ws.setDate(ws.getDate() - ws.getDay());
  ws.setHours(0, 0, 0, 0);
  const we = new Date(ws);
  we.setDate(we.getDate() + 6);
  we.setHours(23, 59, 59, 999);

  const inWeek = (s) => {
    const d = parseDate(s.date);
    return d >= ws && d <= we;
  };

  const inMonth = (s) => {
    const d = parseDate(s.date);
    return d.getFullYear() === latest.getFullYear() && d.getMonth() === latest.getMonth();
  };

  const weekList = state.sessions.filter(inWeek);
  const monthList = state.sessions.filter(inMonth);

  $('weekVolume').innerHTML = fmtNum(weekList.reduce((t, s) => t + sessionVolume(s), 0)) + ' <span style="font-size:14px;color:var(--text-muted);font-weight:500;">kg</span>';
  $('weekSessions').textContent = weekList.length;
  $('weekSets').textContent = fmtNum(weekList.reduce((t, s) => t + sessionSets(s), 0));

  $('monthVolume').innerHTML = fmtNum(monthList.reduce((t, s) => t + sessionVolume(s), 0)) + ' <span style="font-size:14px;color:var(--text-muted);font-weight:500;">kg</span>';
  $('monthSessions').textContent = monthList.length;
  $('monthSets').textContent = fmtNum(monthList.reduce((t, s) => t + sessionSets(s), 0));

  const totalVol = state.sessions.reduce((t, s) => t + sessionVolume(s), 0);
  const totalSetsCount = state.sessions.reduce((t, s) => t + sessionSets(s), 0);
  $('totalVolume').innerHTML = fmtNum(totalVol) + ' <span style="font-size:14px;color:var(--text-muted);font-weight:500;">kg</span>';
  $('totalSessions').textContent = state.sessions.length;
  $('totalSets').textContent = fmtNum(totalSetsCount);
}

function renderStepsKPI() {
  const days = state.steps;
  const last7 = days.slice(-7);
  const total7 = last7.reduce((t, d) => t + d.steps, 0);
  const avg7 = Math.round(total7 / (last7.length || 1));
  $('stepsTotal').textContent = fmtNum(total7);
  $('stepsAvg').textContent = fmtNum(avg7);
}

/* ==========================================================================
   Calendar & Previous Sessions
   ========================================================================== */

function shiftMonth(delta) {
  let y = state.viewY, m = state.viewM + delta;
  if (m < 0) { m = 11; y--; }
  if (m > 11) { m = 0; y++; }
  state.viewY = y;
  state.viewM = m;
  renderCalendar();
}

function renderCalendar() {
  const y = state.viewY, m = state.viewM;
  $('calTitle').textContent = MONTHS[m] + ' ' + y;
  const grid = $('calGrid');
  grid.innerHTML = '';

  const startDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  for (let i = 0; i < startDay; i++) {
    const pad = document.createElement('div');
    pad.className = 'cal-day-cell other-month';
    grid.appendChild(pad);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const key = y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    const cell = document.createElement('div');
    cell.className = 'cal-day-cell';
    cell.setAttribute('role', 'button');
    cell.setAttribute('tabindex', '0');

    const num = document.createElement('span');
    num.className = 'day-num';
    num.textContent = d;
    cell.appendChild(num);

    const daySessions = state.byDate.get(key) || [];
    if (daySessions.length) {
      cell.classList.add('has-workout');
      const dot = document.createElement('span');
      dot.className = 'split-indicator-dot';
      const primarySplit = getSplitClass(getSplitType(daySessions[0].label));
      dot.classList.add(primarySplit);
      cell.appendChild(dot);

      if (daySessions.some(s => s.id === state.selectedId)) {
        cell.classList.add('active-selected');
      }
    }

    cell.addEventListener('click', () => {
      if (daySessions.length) {
        selectSession(daySessions[0].id, false);
      }
    });

    grid.appendChild(cell);
  }
}

function renderQuickSessionList() {
  const container = $('quickSessionList');
  container.innerHTML = '';

  const reversed = state.sessions.slice().reverse();
  reversed.forEach(s => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'quick-session-item' + (s.id === state.selectedId ? ' active' : '');
    const split = getSplitType(s.label);
    const splitCls = getSplitClass(split);

    item.innerHTML = `
      <div>
        <div class="quick-session-title">${esc(s.label)}</div>
        <div class="quick-session-date">${fmtDay(parseDate(s.date))}</div>
      </div>
      <span class="split-pill ${splitCls}" style="font-size:10.5px;padding:2px 8px;">${split}</span>
    `;

    item.addEventListener('click', () => {
      selectSession(s.id, false);
    });

    container.appendChild(item);
  });
}

function selectSession(id, shouldScroll) {
  state.selectedId = id;
  const s = state.sessions.find(x => x.id === id);
  if (!s) return;

  const d = parseDate(s.date);
  state.viewY = d.getFullYear();
  state.viewM = d.getMonth();

  renderCalendar();
  renderQuickSessionList();
  renderSessionInspector(s);

  if (shouldScroll) {
    $('sessionDetail').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/* ==========================================================================
   Session Inspector Detail
   ========================================================================== */

function renderSessionInspector(s) {
  $('detailTitle').textContent = s.label;
  const split = getSplitType(s.label);
  const splitBadge = $('detailSplitBadge');
  splitBadge.className = 'split-pill ' + getSplitClass(split);
  splitBadge.textContent = split;

  const dt = parseDate(s.date);
  $('detailDate').textContent = `${fmtDay(dt)}, ${dt.getFullYear()}` + (s.cycle ? ` \u2022 Cycle ${s.cycle}` : '');

  $('detailVolume').textContent = fmtNum(sessionVolume(s)) + ' kg';
  $('detailSets').textContent = sessionSets(s);
  $('detailExCount').textContent = s.exercises.length;

  const cardioBox = $('cardioBox');
  if (s.cardio) {
    cardioBox.classList.remove('hidden');
    $('cardioText').textContent = s.cardio;
  } else {
    cardioBox.classList.add('hidden');
  }

  const notesBox = $('notesBox');
  if (s.notes) {
    notesBox.classList.remove('hidden');
    $('notesText').textContent = s.notes;
  } else {
    notesBox.classList.add('hidden');
  }

  $('exerciseCardsList').innerHTML = s.exercises.map(exerciseCardHTML).join('');
}

// Kickoff
document.addEventListener('DOMContentLoaded', init);
