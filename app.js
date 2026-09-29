'use strict';

/* Gym progress dashboard — reads data/workouts.json, no backend. */

const $ = (id) => document.getElementById(id);
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const state = {
  sessions: [],
  byDate: new Map(),
  selectedId: null,
  viewY: null,
  viewM: null,
  volChart: null,
  progChart: null,
};

function parseDate(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function dateKey(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function fmtNum(n) {
  return n == null ? '–' : Math.round(n).toLocaleString('en-US');
}
function fmtDay(d) {
  return DAYS[d.getDay()] + ', ' + MONTHS[d.getMonth()].slice(0, 3) + ' ' + d.getDate();
}
function sessionVolume(s) {
  return s.exercises.reduce((t, e) => t + (e.volume || 0), 0);
}
function sessionSets(s) {
  return s.exercises.reduce((t, e) => t + e.sets.length, 0);
}
function shortLabel(s) {
  const d = parseDate(s.date);
  const base = s.label.replace(/^Day \d+ — /, '');
  return base + ' ' + (d.getMonth() + 1) + '/' + d.getDate();
}
function fmtWeight(e) {
  if (e.weight == null) return e.unit === 'BW' ? 'BW' : '—';
  return e.unit ? e.weight + ' ' + e.unit : String(e.weight);
}
function fmtSets(e) {
  if (e.sets.length) return e.sets.join(', ');
  if (e.detail) return e.detail;
  return e.skipped ? 'Skipped' : '—';
}
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ---------- init ---------- */

async function init() {
  try {
    const res = await fetch('data/workouts.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    state.sessions = data.slice().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    state.byDate = new Map();
    state.sessions.forEach((s) => {
      if (!state.byDate.has(s.date)) state.byDate.set(s.date, []);
      state.byDate.get(s.date).push(s);
    });

    if (window.Chart) {
      Chart.defaults.color = '#8b96a8';
      Chart.defaults.borderColor = 'rgba(38,48,65,0.7)';
      Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
    }

    const latest = state.sessions[state.sessions.length - 1];
    const ld = parseDate(latest.date);
    state.viewY = ld.getFullYear();
    state.viewM = ld.getMonth();

    const first = parseDate(state.sessions[0].date);
    $('dataRange').textContent =
      state.sessions.length + ' sessions · ' + fmtDay(first) + ' – ' + fmtDay(ld) + ', ' + ld.getFullYear();

    renderStats();
    renderCalendar();
    renderExerciseOptions();
    renderVolumeChart();
    renderProgressChart();
    renderPRs();

    $('calPrev').addEventListener('click', () => shiftMonth(-1));
    $('calNext').addEventListener('click', () => shiftMonth(1));

    selectSession(latest.id, false);
  } catch (err) {
    const box = $('loadError');
    box.classList.remove('hidden');
    box.textContent = 'Could not load workout data (' + err.message + '). Serve this folder over HTTP (e.g. Vercel) — fetch() is blocked on file://.';
  }
}

function shiftMonth(delta) {
  let y = state.viewY, m = state.viewM + delta;
  if (m < 0) { m = 11; y--; }
  if (m > 11) { m = 0; y++; }
  state.viewY = y; state.viewM = m;
  renderCalendar();
}

/* ---------- stats ---------- */

function renderStats() {
  const latest = parseDate(state.sessions[state.sessions.length - 1].date);
  const ws = new Date(latest);
  ws.setDate(ws.getDate() - ws.getDay());
  const we = new Date(ws);
  we.setDate(we.getDate() + 6);
  const inWeek = (s) => { const d = parseDate(s.date); return d >= ws && d <= we; };
  const inMonth = (s) => { const d = parseDate(s.date); return d.getFullYear() === latest.getFullYear() && d.getMonth() === latest.getMonth(); };
  fillStats('week', state.sessions.filter(inWeek));
  fillStats('month', state.sessions.filter(inMonth));
  $('weekRange').textContent = (ws.getMonth() + 1) + '/' + ws.getDate() + ' – ' + (we.getMonth() + 1) + '/' + we.getDate();
  $('monthRange').textContent = MONTHS[latest.getMonth()].slice(0, 3) + ' ' + latest.getFullYear();
}
function fillStats(prefix, list) {
  $(prefix + 'Sessions').textContent = list.length;
  $(prefix + 'Volume').textContent = fmtNum(list.reduce((t, s) => t + sessionVolume(s), 0));
  $(prefix + 'Sets').textContent = list.reduce((t, s) => t + sessionSets(s), 0);
}

/* ---------- calendar ---------- */

function renderCalendar() {
  const y = state.viewY, m = state.viewM;
  $('calTitle').textContent = MONTHS[m] + ' ' + y;
  const grid = $('calGrid');
  grid.innerHTML = '';
  const startDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  for (let i = 0; i < startDay; i++) {
    const c = document.createElement('div');
    c.className = 'cal-day other';
    grid.appendChild(c);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const key = y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    const btn = document.createElement('button');
    btn.className = 'cal-day';
    btn.type = 'button';
    const list = state.byDate.get(key) || [];
    const num = document.createElement('span');
    num.textContent = d;
    btn.appendChild(num);
    if (list.length) {
      btn.classList.add('has');
      const dot = document.createElement('span');
      dot.className = 'dot';
      btn.appendChild(dot);
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = list.map((s) => s.label.replace(/^Day \d+ — /, '')).join(' · ');
      btn.appendChild(tag);
      if (list.some((s) => s.id === state.selectedId)) btn.classList.add('selected');
    }
    btn.addEventListener('click', () => selectDay(key));
    grid.appendChild(btn);
  }
}

function selectDay(key) {
  renderDaySessions(key);
  const list = state.byDate.get(key) || [];
  if (list.length) selectSession(list[0].id, false);
  else {
    state.selectedId = null;
    renderCalendar();
    $('detailTitle').textContent = 'No session logged';
    $('detailMeta').textContent = '';
    $('detailBody').innerHTML = '';
    $('detailTotals').textContent = '';
  }
}

function renderDaySessions(key) {
  const box = $('daySessions');
  box.innerHTML = '';
  const list = state.byDate.get(key) || [];
  list.forEach((s) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip' + (s.id === state.selectedId ? ' active' : '');
    chip.textContent = s.label;
    chip.addEventListener('click', () => selectSession(s.id, false));
    box.appendChild(chip);
  });
}

function selectSession(id, scroll) {
  state.selectedId = id;
  const s = state.sessions.find((x) => x.id === id);
  if (!s) return;
  const d = parseDate(s.date);
  state.viewY = d.getFullYear();
  state.viewM = d.getMonth();
  renderCalendar();
  renderDaySessions(s.date);
  renderDetail(s);
  if (scroll) $('sessionDetail').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---------- session detail ---------- */

function renderDetail(s) {
  $('detailTitle').innerHTML = esc(s.label) + (s.inProgress ? '<span class="badge">in progress</span>' : '');
  const meta = [fmtDay(parseDate(s.date)) + (s.cycle ? ' · cycle ' + s.cycle : '')];
  if (s.cardio) meta.push('Cardio: ' + s.cardio);
  if (s.notes) meta.push(s.notes);
  $('detailMeta').textContent = meta.join(' — ');
  $('detailBody').innerHTML = s.exercises.map((e) => {
    const skippedCls = e.skipped ? ' class="row-skipped"' : '';
    return '<tr' + skippedCls + '><td>' + esc(e.name) +
      (e.detail && !e.sets.length && !e.skipped ? ' <span style="color:var(--muted)">(' + esc(e.detail) + ')</span>' : '') +
      '</td><td class="w">' + esc(fmtWeight(e)) + '</td><td class="s">' + esc(fmtSets(e)) + '</td><td class="v">' +
      (e.volume != null ? fmtNum(e.volume) : '–') + '</td></tr>';
  }).join('');
  $('detailTotals').innerHTML = 'Total volume <strong>' + fmtNum(sessionVolume(s)) + '</strong> · ' +
    sessionSets(s) + ' sets logged';
}

/* ---------- charts ---------- */

function renderVolumeChart() {
  if (!window.Chart) return;
  if (state.volChart) state.volChart.destroy();
  const ctx = $('volumeChart').getContext('2d');
  state.volChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: state.sessions.map(shortLabel),
      datasets: [{
        data: state.sessions.map(sessionVolume),
        backgroundColor: 'rgba(184,241,74,0.75)',
        hoverBackgroundColor: 'rgba(184,241,74,1)',
        borderRadius: 6,
        borderSkipped: false,
      }],
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      onClick: (evt, els) => {
        if (els.length) selectSession(state.sessions[els[0].index].id, true);
      },
      scales: {
        x: { ticks: { maxRotation: 45, minRotation: 0 } },
        y: { beginAtZero: true, title: { display: true, text: 'Volume' } },
      },
    },
  });
}

function renderExerciseOptions() {
  const sel = $('exerciseSelect');
  sel.innerHTML = '';
  const counts = new Map();
  state.sessions.forEach((s) => s.exercises.forEach((e) => {
    if (e.weight != null && !e.skipped) counts.set(e.name, (counts.get(e.name) || 0) + 1);
  }));
  const names = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map((x) => x[0]);
  names.forEach((n) => {
    const o = document.createElement('option');
    o.value = n;
    o.textContent = n;
    sel.appendChild(o);
  });
  sel.addEventListener('change', renderProgressChart);
}

function renderProgressChart() {
  if (!window.Chart) return;
  if (state.progChart) state.progChart.destroy();
  const name = $('exerciseSelect').value;
  if (!name) return;
  const pts = state.sessions
    .map((s) => ({ s, e: s.exercises.find((e) => e.name === name && e.weight != null && !e.skipped) }))
    .filter((p) => p.e);
  const units = [...new Set(pts.map((p) => p.e.unit || 'unitless'))];
  const ctx = $('progressChart').getContext('2d');
  state.progChart = new Chart(ctx, {
    data: {
      labels: pts.map((p) => shortLabel(p.s)),
      datasets: [
        {
          type: 'line',
          label: 'Top weight' + (units.length === 1 ? ' (' + units[0] + ')' : ' (mixed units)'),
          data: pts.map((p) => p.e.weight),
          borderColor: '#b8f14a',
          backgroundColor: '#b8f14a',
          tension: 0.25,
          pointRadius: 4,
          yAxisID: 'y',
        },
        {
          type: 'bar',
          label: 'Total reps',
          data: pts.map((p) => p.e.sets.reduce((a, b) => a + b, 0)),
          backgroundColor: 'rgba(139,150,168,0.35)',
          borderRadius: 4,
          yAxisID: 'y1',
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Weight' } },
        y1: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Reps' } },
      },
    },
  });
}

/* ---------- PRs ---------- */

function renderPRs() {
  const best = new Map();
  state.sessions.forEach((s) => {
    s.exercises.forEach((e) => {
      if (e.weight == null || e.skipped) return;
      const key = e.name + '|' + (e.unit || '');
      const cur = best.get(key);
      if (!cur || e.weight > cur.weight) {
        best.set(key, { name: e.name, weight: e.weight, unit: e.unit, date: s.date, sets: e.sets });
      }
    });
  });
  const items = [...best.values()].sort((a, b) => a.name.localeCompare(b.name));
  $('prList').innerHTML = items.map((p) => {
    const reps = p.sets.length ? p.sets.join(', ') + ' reps' : 'reps n/r';
    return '<li><span class="pr-name">' + esc(p.name) +
      '<span class="pr-date">' + fmtDay(parseDate(p.date)) + ' · ' + esc(reps) + '</span></span>' +
      '<span class="pr-val">' + p.weight + (p.unit ? ' ' + esc(p.unit) : '') + '</span></li>';
  }).join('');
}

document.addEventListener('DOMContentLoaded', init);
