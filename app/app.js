// Vice City Trophy Guide — Leonida Platinum Tracker logic.
// Static and offline: data comes from local JSON files, progress lives in
// localStorage, and nothing here touches the network beyond those files.
const STORAGE_KEY = 'gta6-trophy-checklist-v2';
const DEMO_IDS = [2, 3, 4, 8, 16, 20, 21, 23, 28, 31, 33, 35, 37, 38, 42, 44, 45, 47, 48, 51, 53, 54, 55];
const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];
const TYPE_LABELS = {
  story: 'Story',
  activity: 'Activity',
  collectible: 'Collectible',
  secret: 'Secret',
  completion: '100% completion',
  platinum: 'Platinum',
};

let trophies = [];
let roadmap = null;
let earned = new Set();
const revealed = new Set(); // spoiler reveals are session-only

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  return node;
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const ids = raw ? JSON.parse(raw) : [];
    earned = new Set(Array.isArray(ids) ? ids.filter((n) => Number.isInteger(n)) : []);
  } catch {
    earned = new Set();
  }
  const params = new URLSearchParams(location.search);
  if (params.get('demo') === '1' && earned.size === 0) {
    earned = new Set(DEMO_IDS);
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function chapterLabel(t) {
  return t.chapter == null ? 'After the story' : 'Chapter ' + t.chapter;
}

function gradeStats() {
  const stats = {};
  for (const g of GRADE_ORDER) stats[g] = { earned: 0, total: 0 };
  for (const t of trophies) {
    stats[t.grade].total += 1;
    if (earned.has(t.id)) stats[t.grade].earned += 1;
  }
  return stats;
}

function hoursLeft() {
  if (!roadmap || !Array.isArray(roadmap.stages)) {
    return trophies.filter((t) => !earned.has(t.id)).reduce((sum, t) => sum + (t.hours || 0), 0);
  }
  let total = 0;
  for (const stage of roadmap.stages) {
    const ids = stage.trophies || [];
    if (!ids.length) continue;
    const done = ids.filter((id) => earned.has(id)).length;
    total += Math.round((stage.hours || 0) * (1 - done / ids.length));
  }
  return total;
}

function easiestNext(list) {
  return [...list]
    .filter((t) => !earned.has(t.id))
    .sort((a, b) => a.difficulty - b.difficulty || a.hours - b.hours || a.id - b.id);
}

function firstSentence(text) {
  const match = text.match(/^[^.!?]+[.!?]/);
  return match ? match[0] : text;
}

function badgesFor(t) {
  const wrap = el('div', 'badges');
  wrap.append(el('span', 'badge grade-' + t.grade, t.grade));
  wrap.append(el('span', 'badge', TYPE_LABELS[t.kind] || t.kind));
  if (t.chapter != null) wrap.append(el('span', 'badge', chapterLabel(t)));
  if (t.missable) wrap.append(el('span', 'badge missable', 'Missable'));
  if (t.hidden) wrap.append(el('span', 'badge hidden-badge', 'Hidden'));
  return wrap;
}

function difficultyLine(t) {
  const line = el('p', 'meta');
  const dots = el('span', 'dots');
  for (let i = 1; i <= 5; i++) {
    dots.append(el('span', i <= t.difficulty ? '' : 'off', '●'));
  }
  line.append(dots, document.createTextNode('Difficulty ' + t.difficulty + '/5 · about ' + t.hours + 'h'));
  return line;
}

function sourcesLine(t) {
  const p = el('p', 'sources');
  p.append(document.createTextNode('Sources: '));
  (t.sources || []).forEach((s, i) => {
    if (i > 0) p.append(document.createTextNode(' · '));
    const a = el('a', null, s.label);
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    p.append(a);
  });
  return p;
}

function missableBox() {
  const box = el('div', 'warn');
  box.append(el('strong', null, 'Missable — '));
  box.append(document.createTextNode('do the balcony meditation at Jason’s house in Chapter 1 (after Down to Earth) before leaving the chapter. This is the only missable trophy in the game.'));
  return box;
}

function tickFor(t) {
  const label = el('label', 'tick');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id); else earned.delete(t.id);
    saveProgress();
    render();
  });
  label.append(box, document.createTextNode(box.checked ? 'Earned — ticked off' : 'Tick when you earn it'));
  return label;
}

function isSpoilerHidden(t) {
  const spoilerOn = document.getElementById('spoiler-safe').checked;
  return spoilerOn && t.kind === 'story' && !earned.has(t.id) && !revealed.has(t.id);
}

function trophyCard(t) {
  const card = el('article', 'card' + (earned.has(t.id) ? ' earned' : ''));
  card.append(badgesFor(t));
  if (isSpoilerHidden(t)) {
    card.append(el('h3', null, 'Hidden story trophy — spoiler-safe mode'));
    card.append(el('p', 'spoiler-note', 'Name, description and guide are hidden until you earn it or reveal it.'));
    const btn = el('button', 'reveal-btn', 'Reveal this trophy');
    btn.type = 'button';
    btn.addEventListener('click', () => { revealed.add(t.id); render(); });
    card.append(btn, difficultyLine(t), tickFor(t));
    return card;
  }
  const h = el('h3');
  const link = el('a', null, t.name);
  link.href = '#/trophy/' + t.id;
  h.append(link);
  card.append(h, el('p', 'desc', t.description), el('p', 'guide-peek', firstSentence(t.guide)), difficultyLine(t));
  if (t.missable) card.append(missableBox());
  card.append(sourcesLine(t), tickFor(t));
  return card;
}

function currentFilters() {
  return {
    q: document.getElementById('search').value.trim().toLowerCase(),
    grade: document.getElementById('grade-filter').value,
    type: document.getElementById('type-filter').value,
    chapter: document.getElementById('chapter-filter').value,
    missableOnly: document.getElementById('missable-only').checked,
    hideEarned: document.getElementById('hide-earned').checked,
    spoilerSafe: document.getElementById('spoiler-safe').checked,
  };
}

function matchesFilters(t, f) {
  if (f.grade !== 'all' && t.grade !== f.grade) return false;
  if (f.type !== 'all' && t.kind !== f.type) return false;
  if (f.chapter === 'after' && t.chapter != null) return false;
  if (f.chapter !== 'all' && f.chapter !== 'after' && String(t.chapter) !== f.chapter) return false;
  if (f.missableOnly && !t.missable) return false;
  if (f.hideEarned && earned.has(t.id)) return false;
  if (f.q) {
    const hay = (t.name + ' ' + t.description + ' ' + t.guide + ' ' + (TYPE_LABELS[t.kind] || t.kind) + ' ' + chapterLabel(t)).toLowerCase();
    if (!hay.includes(f.q)) return false;
  }
  return true;
}

function renderStrip() {
  const total = trophies.length;
  const done = earned.size;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const ring = document.getElementById('ring');
  ring.style.background = 'conic-gradient(var(--pink) ' + pct + '%, var(--line) ' + pct + '%)';
  document.getElementById('ring-pct').textContent = pct + '%';
  document.getElementById('ring-label').textContent = done + ' of ' + total + ' earned';
  const stats = gradeStats();
  document.getElementById('grade-counts').textContent = GRADE_ORDER
    .map((g) => g[0].toUpperCase() + g.slice(1) + ' ' + stats[g].earned + '/' + stats[g].total)
    .join(' · ');
  document.getElementById('hours-left').textContent =
    'Roughly ' + hoursLeft() + ' hours to the platinum.';
  const next = easiestNext(trophies)[0];
  const link = document.getElementById('easiest-next');
  if (next) {
    link.textContent = next.name;
    link.href = '#/trophy/' + next.id;
  } else {
    link.textContent = 'all earned — platinum!';
    link.href = '#/';
  }
}

function renderChecklist() {
  const f = currentFilters();
  const shown = trophies.filter((t) => matchesFilters(t, f));
  const grid = document.getElementById('grid');
  grid.replaceChildren(...shown.map(trophyCard));
  let line = 'Showing ' + shown.length + ' of ' + trophies.length + ' trophies';
  if (f.spoilerSafe) {
    const hiddenCount = trophies.filter((t) => t.kind === 'story' && !earned.has(t.id)).length;
    line += ' · ' + hiddenCount + ' story trophies hidden by spoiler-safe mode';
  }
  document.getElementById('count-line').textContent = line;
}

function trophyChip(id) {
  const t = trophies.find((x) => x.id === id);
  if (!t) return el('span', 'chip', '#' + id);
  const chip = el('a', 'chip' + (earned.has(id) ? ' earned' : ''), (earned.has(id) ? '✓ ' : '') + t.name);
  chip.href = '#/trophy/' + id;
  return chip;
}

function renderRoadmap() {
  const view = document.getElementById('view-roadmap');
  view.replaceChildren();
  if (!roadmap) { view.append(el('p', null, 'Roadmap unavailable.')); return; }
  view.append(el('p', null, 'Three stages, about ' + roadmap.totalHours + ' hours in total. ' + roadmap.note));
  for (const stage of roadmap.stages) {
    const box = el('section', 'stage');
    const h = el('h2');
    h.append(document.createTextNode(stage.title + ' '), el('span', 'hours', '≈ ' + stage.hours + 'h'));
    box.append(h, el('p', null, stage.summary));
    for (const w of stage.warnings || []) {
      const warn = el('div', 'warn');
      warn.append(el('strong', null, 'Point of no return — '));
      warn.append(document.createTextNode(w.text));
      box.append(warn);
    }
    const chips = el('div', 'chips');
    for (const id of stage.trophies || []) chips.append(trophyChip(id));
    box.append(chips);
    view.append(box);
  }
}

function renderDashboard() {
  const view = document.getElementById('view-dashboard');
  view.replaceChildren();
  const stats = el('div', 'stats');
  const missableLeft = trophies.filter((t) => t.missable && !earned.has(t.id)).length;
  const uncited = trophies.filter((t) => !(t.sources || []).length).length;
  const cards = [
    [earned.size + ' / ' + trophies.length, 'trophies earned'],
    [String(hoursLeft()) + 'h', 'rough hours left'],
    [String(missableLeft), 'missable still to do'],
    [String(uncited), 'trophies without a cited source'],
  ];
  for (const [num, lbl] of cards) {
    const card = el('div', 'stat');
    card.append(el('div', 'num', num), el('div', 'lbl', lbl));
    stats.append(card);
  }
  view.append(stats, el('h2', null, 'Easiest trophies left'));
  const chips = el('div', 'chips');
  for (const t of easiestNext(trophies).slice(0, 8)) chips.append(trophyChip(t.id));
  view.append(chips);
  if (missableLeft > 0) view.append(missableBox());
}

function renderDetail(id) {
  const view = document.getElementById('view-trophy');
  view.replaceChildren();
  const t = trophies.find((x) => x.id === id);
  if (!t) { view.append(el('p', null, 'Trophy not found.')); return; }
  const back = el('a', 'back', '← Back to checklist');
  back.href = '#/';
  const box = el('article', 'detail');
  box.append(badgesFor(t), el('h2', null, t.name), el('p', 'desc', t.description));
  box.append(el('p', 'meta', 'Difficulty ' + t.difficulty + '/5 · about ' + t.hours + 'h · ' + (t.hidden ? 'Hidden trophy' : 'Shown trophy') + ' · ' + chapterLabel(t)));
  if (t.missable) box.append(missableBox());
  box.append(el('p', null, t.guide));
  const steps = el('ol');
  for (const s of t.steps || []) steps.append(el('li', null, s));
  box.append(steps);
  const srcTitle = el('p', 'sources', 'Sources');
  const srcList = el('ul');
  for (const s of t.sources || []) {
    const li = el('li');
    const a = el('a', null, s.label);
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    li.append(a);
    srcList.append(li);
  }
  box.append(srcTitle, srcList, tickFor(t));
  view.append(back, box);
}

const VIEWS = ['checklist', 'roadmap', 'dashboard', 'trophy'];

function route() {
  const hash = location.hash || '#/';
  let view = 'checklist';
  let trophyId = null;
  if (hash.startsWith('#/roadmap')) view = 'roadmap';
  else if (hash.startsWith('#/dashboard')) view = 'dashboard';
  else if (hash.startsWith('#/trophy/')) {
    view = 'trophy';
    trophyId = Number(hash.slice('#/trophy/'.length));
  }
  for (const v of VIEWS) {
    document.getElementById('view-' + v).hidden = v !== view;
  }
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.route === view);
  });
  document.getElementById('count-line').hidden = view !== 'checklist';
  if (view === 'trophy') renderDetail(trophyId);
  window.scrollTo(0, 0);
}

function render() {
  renderStrip();
  renderChecklist();
  renderRoadmap();
  renderDashboard();
  route();
}

function exportProgress() {
  const blob = new Blob([JSON.stringify([...earned].sort((a, b) => a - b), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(url);
}

async function importProgress(file) {
  try {
    const ids = JSON.parse(await file.text());
    if (!Array.isArray(ids) || !ids.every((n) => Number.isInteger(n) && n >= 1 && n <= 55)) {
      throw new Error('invalid');
    }
    earned = new Set(ids);
    saveProgress();
    render();
  } catch {
    alert('That file is not a valid progress export (expected a list of trophy numbers 1–55).');
  }
}

function wireControls() {
  for (const id of ['search', 'grade-filter', 'type-filter', 'chapter-filter', 'missable-only', 'hide-earned', 'spoiler-safe']) {
    document.getElementById(id).addEventListener('input', renderChecklist);
    document.getElementById(id).addEventListener('change', renderChecklist);
  }
  document.getElementById('export-btn').addEventListener('click', exportProgress);
  document.getElementById('import-file').addEventListener('change', (e) => {
    if (e.target.files[0]) importProgress(e.target.files[0]);
    e.target.value = '';
  });
  document.getElementById('demo-btn').addEventListener('click', () => {
    earned = new Set(DEMO_IDS);
    saveProgress();
    render();
  });
  document.getElementById('reset-btn').addEventListener('click', () => {
    earned = new Set();
    saveProgress();
    render();
  });
  window.addEventListener('hashchange', route);
}

async function init() {
  loadProgress();
  try {
    const [tRes, rRes] = await Promise.all([fetch('data/trophies.json'), fetch('data/roadmap.json')]);
    const tData = await tRes.json();
    trophies = Array.isArray(tData) ? tData : tData.trophies || [];
    roadmap = await rRes.json();
  } catch (err) {
    document.getElementById('count-line').textContent = 'Could not load the trophy data files.';
    console.error(err);
    return;
  }
  wireControls();
  render();
}

init();
