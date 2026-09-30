'use strict';

/* ==========================================================================
   Sharafath's Gym Progress & Performance Dashboard — Core Engine
   Features:
   - Theme Engine (Dark mode default with high-contrast Light mode)
   - Comprehensive Exercise Categorization & Split Logic
   - KPI Aggregation (Weekly, Monthly, All-time tonnage, Steps)
   - Interactive Calendar & Workout Timeline Inspector
   - Apple Health Sync Analytics & Dual-Axis Strength Curves
   - Categorized, Searchable Personal Records (PR) Cabinet
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
  viewM: null,
  activeExCategory: 'all',
  activePrCategory: 'all',
  prSearchQuery: '',
  volChart: null,
  progChart: null,
  stepsChart: null
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

function shortLabel(s) {
  const d = parseDate(s.date);
  const base = s.label.replace(/^Day \d+\s*(?:—|-)?\s*/i, '');
  return base + ' (' + (d.getMonth() + 1) + '/' + d.getDate() + ')';
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
    updateChartsTheme();
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const icon = $('themeIcon');
  if (theme === 'dark') {
    // Show Sun icon (to switch to light)
    icon.innerHTML = '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>';
  } else {
    // Show Moon icon (to switch to dark)
    icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
  }
}

function getChartThemeColors() {
  const isDark = state.theme === 'dark';
  return {
    textColor: isDark ? '#94a3b8' : '#64748b',
    gridColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.06)',
    cardBg: isDark ? '#0f172a' : '#ffffff',
    accentColor: isDark ? '#10b981' : '#059669',
    accentFill: isDark ? 'rgba(16, 185, 129, 0.25)' : 'rgba(5, 150, 105, 0.18)',
    barColor: isDark ? 'rgba(16, 185, 129, 0.75)' : 'rgba(5, 150, 105, 0.75)',
    barHover: isDark ? '#34d399' : '#047857',
    secondaryBar: isDark ? 'rgba(129, 140, 248, 0.45)' : 'rgba(99, 102, 241, 0.35)',
    stepsColor: isDark ? 'rgba(6, 182, 212, 0.8)' : 'rgba(8, 145, 178, 0.8)'
  };
}

function updateChartsTheme() {
  if (state.volChart) renderVolumeChart();
  if (state.progChart) renderProgressChart();
  if (state.stepsChart) renderStepsChart();
}

/* ==========================================================================
   Initialization & Data Loading
   ========================================================================== */

async function init() {
  initTheme();
  initNavigationTabs();

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

    // Render Components
    renderKPIs();
    renderCalendar();
    renderQuickSessionList();
    renderExerciseFilterControls();
    renderVolumeChart();
    renderPRCabinet();

    // Select latest session initially
    selectSession(latest.id, false);

    // Apple Health Steps
    try {
      const sres = await fetch('data/steps.json');
      if (sres.ok) {
        state.steps = (await sres.json()).slice().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
        if (state.steps.length) renderStepsAnalytics();
        else $('stepsSection').classList.add('hidden');
      } else {
        $('stepsSection').classList.add('hidden');
      }
    } catch (e) {
      $('stepsSection').classList.add('hidden');
    }

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
   Navigation Tabs
   ========================================================================== */

function initNavigationTabs() {
  const tabs = document.querySelectorAll('.nav-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const targetId = tab.getAttribute('data-target');
      const targetEl = $(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Track active section on scroll
  const sections = document.querySelectorAll('.content-section');
  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 160;
    sections.forEach(sec => {
      if (scrollPos >= sec.offsetTop) {
        current = sec.getAttribute('id');
      }
    });
    if (current) {
      tabs.forEach(t => {
        t.classList.toggle('active', t.getAttribute('data-target') === current);
      });
    }
  }, { passive: true });
}

/* ==========================================================================
   KPIs & Overview
   ========================================================================== */

function renderKPIs() {
  const latest = parseDate(state.sessions[state.sessions.length - 1].date);
  
  // Weekly window (Sun - Sat around latest)
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

  // Weekly KPI
  $('weekVolume').innerHTML = fmtNum(weekList.reduce((t, s) => t + sessionVolume(s), 0)) + ' <span style="font-size:14px;color:var(--text-muted);font-weight:500;">kg</span>';
  $('weekSessions').textContent = weekList.length;
  $('weekSets').textContent = fmtNum(weekList.reduce((t, s) => t + sessionSets(s), 0));

  // Monthly KPI
  $('monthVolume').innerHTML = fmtNum(monthList.reduce((t, s) => t + sessionVolume(s), 0)) + ' <span style="font-size:14px;color:var(--text-muted);font-weight:500;">kg</span>';
  $('monthSessions').textContent = monthList.length;
  $('monthSets').textContent = fmtNum(monthList.reduce((t, s) => t + sessionSets(s), 0));

  // All-time Cumulative
  const totalVol = state.sessions.reduce((t, s) => t + sessionVolume(s), 0);
  const totalSetsCount = state.sessions.reduce((t, s) => t + sessionSets(s), 0);
  $('totalVolume').innerHTML = fmtNum(totalVol) + ' <span style="font-size:14px;color:var(--text-muted);font-weight:500;">kg</span>';
  $('totalSessions').textContent = state.sessions.length;
  $('totalSets').textContent = fmtNum(totalSetsCount);

  // Split Breakdown Counts
  let push = 0, pull = 0, legs = 0, upper = 0;
  state.sessions.forEach(s => {
    const sp = getSplitType(s.label);
    if (sp === 'Push') push++;
    else if (sp === 'Pull') pull++;
    else if (sp === 'Legs') legs++;
    else if (sp === 'Upper') upper++;
  });

  $('pushCount').textContent = push;
  $('pullCount').textContent = pull;
  $('legsCount').textContent = legs;
  $('upperCount').textContent = upper;
}

/* ==========================================================================
   Calendar & Workout Console
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

  // Previous month padded days
  for (let i = 0; i < startDay; i++) {
    const pad = document.createElement('div');
    pad.className = 'cal-day-cell other-month';
    grid.appendChild(pad);
  }

  // Active Month Days
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

  // Reverse chronological (newest first)
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

  // Session Stats
  $('detailVolume').textContent = fmtNum(sessionVolume(s)) + ' kg';
  $('detailSets').textContent = sessionSets(s);
  $('detailExCount').textContent = s.exercises.length;

  // Cardio Box
  const cardioBox = $('cardioBox');
  if (s.cardio) {
    cardioBox.classList.remove('hidden');
    $('cardioText').textContent = s.cardio;
  } else {
    cardioBox.classList.add('hidden');
  }

  // Notes Box
  const notesBox = $('notesBox');
  if (s.notes) {
    notesBox.classList.remove('hidden');
    $('notesText').textContent = s.notes;
  } else {
    notesBox.classList.add('hidden');
  }

  // Exercise Cards
  const list = $('exerciseCardsList');
  list.innerHTML = s.exercises.map(e => {
    const meta = EXERCISE_META[e.name] || { category: 'Other', split: 'General' };
    const skipped = e.skipped;
    const volStr = e.volume != null && e.volume > 0 ? fmtNum(e.volume) + ' kg vol' : '';

    // Sets pills markup
    let setsMarkup = '';
    if (skipped) {
      setsMarkup = '<span class="skipped-badge">Skipped for comfort / recovery</span>';
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
  }).join('');
}

/* ==========================================================================
   Analytics: Volume & Apple Health Charts
   ========================================================================== */

function renderVolumeChart() {
  if (!window.Chart) return;
  if (state.volChart) state.volChart.destroy();

  const themeColors = getChartThemeColors();
  const ctx = $('volumeChart').getContext('2d');

  state.volChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: state.sessions.map(shortLabel),
      datasets: [{
        label: 'Volume (kg)',
        data: state.sessions.map(sessionVolume),
        backgroundColor: themeColors.barColor,
        hoverBackgroundColor: themeColors.barHover,
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: themeColors.cardBg,
          titleColor: themeColors.textColor,
          bodyColor: themeColors.textColor,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          callbacks: {
            title: (items) => state.sessions[items[0].dataIndex].label,
            label: (item) => `Tonnage: ${fmtNum(item.raw)} kg \u2022 Click to view session`
          }
        }
      },
      onClick: (evt, els) => {
        if (els.length) {
          const s = state.sessions[els[0].index];
          selectSession(s.id, true);
        }
      },
      scales: {
        x: {
          ticks: { color: themeColors.textColor, maxRotation: 45, font: { family: "'JetBrains Mono', monospace", size: 11 } },
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          ticks: { color: themeColors.textColor, font: { family: "'JetBrains Mono', monospace", size: 11 } },
          grid: { color: themeColors.gridColor }
        }
      }
    }
  });
}

function renderStepsAnalytics() {
  const days = state.steps;
  const last7 = days.slice(-7);
  const total7 = last7.reduce((t, d) => t + d.steps, 0);
  const avg7 = Math.round(total7 / (last7.length || 1));

  $('stepsTotal').textContent = fmtNum(total7);
  $('stepsAvg').textContent = fmtNum(avg7);

  renderStepsChart();
}

function renderStepsChart() {
  if (!window.Chart || !state.steps.length) return;
  if (state.stepsChart) state.stepsChart.destroy();

  const themeColors = getChartThemeColors();
  const ctx = $('stepsChart').getContext('2d');
  const days = state.steps;

  state.stepsChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: days.map(d => {
        const dt = parseDate(d.date);
        return DAYS[dt.getDay()] + ' ' + (dt.getMonth() + 1) + '/' + dt.getDate();
      }),
      datasets: [
        {
          label: 'Steps',
          data: days.map(d => d.steps),
          backgroundColor: days.map(d => d.steps >= 10000 ? themeColors.accentColor : themeColors.stepsColor),
          hoverBackgroundColor: themeColors.barHover,
          borderRadius: 6,
          borderSkipped: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: themeColors.cardBg,
          titleColor: themeColors.textColor,
          bodyColor: themeColors.textColor,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: (item) => `${fmtNum(item.raw)} steps ${item.raw >= 10000 ? '\u2022 10k Goal Hit!' : ''}`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: themeColors.textColor, maxRotation: 45, font: { family: "'JetBrains Mono', monospace", size: 10.5 } },
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          ticks: { color: themeColors.textColor, font: { family: "'JetBrains Mono', monospace", size: 11 } },
          grid: { color: themeColors.gridColor }
        }
      }
    }
  });
}

/* ==========================================================================
   Exercise Progression Explorer
   ========================================================================== */

function renderExerciseFilterControls() {
  const bar = $('categoryFilterBar');
  const pills = bar.querySelectorAll('.filter-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.activeExCategory = pill.getAttribute('data-cat');
      populateExerciseDropdown();
      renderProgressChart();
    });
  });

  $('exerciseSelect').addEventListener('change', renderProgressChart);
  populateExerciseDropdown();
  renderProgressChart();
}

function populateExerciseDropdown() {
  const sel = $('exerciseSelect');
  sel.innerHTML = '';

  // Count occurrences
  const counts = new Map();
  state.sessions.forEach(s => s.exercises.forEach(e => {
    if (e.weight != null && !e.skipped) {
      counts.set(e.name, (counts.get(e.name) || 0) + 1);
    }
  }));

  const allNames = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(x => x[0]);
  
  // Filter by active category
  const filtered = allNames.filter(name => {
    if (state.activeExCategory === 'all') return true;
    const meta = EXERCISE_META[name];
    return meta && meta.category.toLowerCase() === state.activeExCategory.toLowerCase();
  });

  const listToRender = filtered.length > 0 ? filtered : allNames;

  listToRender.forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = `${name} (${counts.get(name)} sessions)`;
    sel.appendChild(opt);
  });
}

function renderProgressChart() {
  if (!window.Chart) return;
  if (state.progChart) state.progChart.destroy();

  const name = $('exerciseSelect').value;
  if (!name) return;

  const themeColors = getChartThemeColors();
  const pts = state.sessions
    .map(s => ({ s, e: s.exercises.find(e => e.name === name && e.weight != null && !e.skipped) }))
    .filter(p => p.e);

  if (!pts.length) return;

  const units = [...new Set(pts.map(p => p.e.unit || 'kg'))];
  const unitStr = units.length === 1 ? units[0] : 'mixed';

  // Compute Exercise KPIs
  const maxWeight = Math.max(...pts.map(p => p.e.weight));
  const totalVolume = pts.reduce((t, p) => t + (p.e.volume || 0), 0);

  $('exKpiPr').textContent = `${maxWeight} ${unitStr}`;
  $('exKpiSessions').textContent = pts.length;
  $('exKpiTotalVol').textContent = `${fmtNum(totalVolume)} kg`;

  const ctx = $('progressChart').getContext('2d');
  state.progChart = new Chart(ctx, {
    data: {
      labels: pts.map(p => shortLabel(p.s)),
      datasets: [
        {
          type: 'line',
          label: `Top Weight (${unitStr})`,
          data: pts.map(p => p.e.weight),
          borderColor: themeColors.accentColor,
          backgroundColor: themeColors.accentFill,
          borderWidth: 3,
          tension: 0.3,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointBackgroundColor: themeColors.accentColor,
          yAxisID: 'y',
          fill: true
        },
        {
          type: 'bar',
          label: 'Total Reps',
          data: pts.map(p => p.e.sets.reduce((a, b) => a + b, 0)),
          backgroundColor: themeColors.secondaryBar,
          borderRadius: 6,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: themeColors.textColor, font: { family: "'Plus Jakarta Sans', sans-serif" } }
        },
        tooltip: {
          backgroundColor: themeColors.cardBg,
          titleColor: themeColors.textColor,
          bodyColor: themeColors.textColor,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          padding: 12
        }
      },
      scales: {
        x: {
          ticks: { color: themeColors.textColor, maxRotation: 45, font: { family: "'JetBrains Mono', monospace", size: 10.5 } },
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          ticks: { color: themeColors.textColor, font: { family: "'JetBrains Mono', monospace", size: 11 } },
          grid: { color: themeColors.gridColor },
          title: { display: true, text: `Weight (${unitStr})`, color: themeColors.textColor }
        },
        y1: {
          beginAtZero: true,
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { color: themeColors.textColor, font: { family: "'JetBrains Mono', monospace", size: 11 } },
          title: { display: true, text: 'Reps', color: themeColors.textColor }
        }
      }
    }
  });
}

/* ==========================================================================
   Personal Records (PR) Cabinet
   ========================================================================== */

function renderPRCabinet() {
  // Category Pills
  const pills = $('prCategoryFilters').querySelectorAll('.filter-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.activePrCategory = pill.getAttribute('data-pr-cat');
      filterAndRenderPRs();
    });
  });

  // Search Input
  $('prSearchInput').addEventListener('input', (e) => {
    state.prSearchQuery = e.target.value.toLowerCase().trim();
    filterAndRenderPRs();
  });

  filterAndRenderPRs();
}

function filterAndRenderPRs() {
  const best = new Map();
  state.sessions.forEach(s => {
    s.exercises.forEach(e => {
      if (e.weight == null || e.skipped) return;
      const key = e.name;
      const cur = best.get(key);
      if (!cur || e.weight > cur.weight) {
        best.set(key, {
          name: e.name,
          weight: e.weight,
          unit: e.unit || 'kg',
          date: s.date,
          sets: e.sets || []
        });
      }
    });
  });

  const allPRs = [...best.values()];

  // Filter by category & search query
  const filtered = allPRs.filter(item => {
    const meta = EXERCISE_META[item.name] || { category: 'Other' };
    const matchesCat = state.activePrCategory === 'all' || meta.category.toLowerCase() === state.activePrCategory.toLowerCase();
    const matchesSearch = !state.prSearchQuery || item.name.toLowerCase().includes(state.prSearchQuery);
    return matchesCat && matchesSearch;
  });

  // Sort by heaviest weight descending
  filtered.sort((a, b) => b.weight - a.weight);

  // Render Podium (Top 3)
  const podium = $('prPodiumGrid');
  if (filtered.length >= 3 && state.activePrCategory === 'all' && !state.prSearchQuery) {
    podium.classList.remove('hidden');
    const top3 = filtered.slice(0, 3);
    const medals = ['1st \u2022 Gold', '2nd \u2022 Silver', '3rd \u2022 Bronze'];
    podium.innerHTML = top3.map((item, idx) => `
      <div class="podium-card ${idx === 0 ? 'first' : ''}">
        <span class="podium-badge">${medals[idx]}</span>
        <div class="podium-name">${esc(item.name)}</div>
        <div class="podium-weight">${item.weight} ${esc(item.unit)}</div>
        <div class="podium-meta">${fmtDay(parseDate(item.date))} &bull; ${item.sets.join(', ')} reps</div>
      </div>
    `).join('');
  } else {
    podium.classList.add('hidden');
  }

  // Render Grid
  const grid = $('prGrid');
  if (filtered.length === 0) {
    grid.innerHTML = '<div style="color:var(--text-muted);padding:20px;grid-column:1/-1;text-align:center;">No personal records match your filter.</div>';
    return;
  }

  grid.innerHTML = filtered.map(item => {
    const meta = EXERCISE_META[item.name] || { category: 'Other' };
    const repsStr = item.sets.length ? item.sets.join(', ') + ' reps' : 'reps n/r';
    return `
      <div class="pr-tile">
        <div class="pr-tile-top">
          <span class="pr-tile-name">${esc(item.name)}</span>
          <span class="pr-tile-val">${item.weight} ${esc(item.unit)}</span>
        </div>
        <div class="pr-tile-meta">
          <span class="ex-muscle-tag">${meta.category}</span>
          <span>${fmtDay(parseDate(item.date))} &bull; ${esc(repsStr)}</span>
        </div>
      </div>
    `;
  }).join('');
}

// Kickoff
document.addEventListener('DOMContentLoaded', init);
