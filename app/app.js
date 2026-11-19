// Vice City Trophy Guide — offline tracker.
// Progress lives only in localStorage; nothing leaves the browser.
const KEY = 'gta6-trophy-checklist-v2';
const DEMO = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 16, 19, 21, 33, 35, 42, 47, 48, 53, 54, 55];

const $ = (id) => document.getElementById(id);
const els = {
  ring: $('ring'), progressLine: $('progress-line'), gradeLine: $('grade-line'),
  timeLine: $('time-line'), nextTrophy: $('next-trophy'), count: $('count'),
  cards: $('cards'), roadmap: $('roadmap'), dashboard: $('dashboard'),
  trophyDetail: $('trophy-detail'),
  views: { checklist: $('view-checklist'), roadmap: $('view-roadmap'), dashboard: $('view-dashboard'), trophy: $('view-trophy') },
  tabs: { checklist: $('tab-checklist'), roadmap: $('tab-roadmap'), dashboard: $('tab-dashboard') },
  search: $('search'), grade: $('grade'), kind: $('kind'), chapter: $('chapter'),
  missable: $('missable'), hideEarned: $('hide-earned'), spoiler: $('spoiler'),
};

let trophies = [];
let roadmap = null;
let earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
let revealed = new Set(); // spoiler reveals, this session only

const params = new URLSearchParams(location.search);
if (params.get('demo') === '1' && earned.size === 0) {
  DEMO.forEach((id) => earned.add(id));
  save();
}

function save() {
  localStorage.setItem(KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function byId(id) { return trophies.find((t) => t.id === id); }
function gradeLabel(g) { return g[0].toUpperCase() + g.slice(1); }
function kindLabel(k) {
  return { story: 'Story', activity: 'Activity', collectible: 'Collectible', secret: 'Secret', completion: '100% completion', platinum: 'Platinum' }[k] ?? k;
}
function chapterLabel(t) {
  return t.chapter ? `Chapter ${t.chapter}` : 'After the story';
}
function difficultyStars(t) {
  return '●'.repeat(t.difficulty) + '○'.repeat(5 - t.difficulty);
}
function trophyLink(t) {
  const a = document.createElement('a');
  a.href = `#/trophy/${t.id}`;
  a.textContent = t.name;
  return a;
}

function stats() {
  const total = trophies.length;
  const perGrade = {};
  for (const g of ['platinum', 'gold', 'silver', 'bronze']) {
    perGrade[g] = trophies.filter((t) => t.grade === g && earned.has(t.id)).length
      + '/' + trophies.filter((t) => t.grade === g).length;
  }
  const remainingHours = roadmap
    ? Math.round(roadmap.stages.reduce((sum, stage) => {
        const total = stage.trophies.length;
        const left = stage.trophies.filter((id) => !earned.has(id)).length;
        return sum + (stage.hours * left) / total;
      }, 0))
    : trophies.filter((t) => !earned.has(t.id)).reduce((s, t) => s + (t.hours || 0), 0);
  const next = trophies.filter((t) => !earned.has(t.id))
    .sort((a, b) => (a.difficulty - b.difficulty) || ((a.hours || 0) - (b.hours || 0)) || (a.id - b.id))[0];
  return { total, perGrade, remainingHours, next };
}

function renderDash() {
  const s = stats();
  const pct = Math.round((earned.size / s.total) * 100);
  els.ring.style.setProperty('--p', pct);
  els.ring.textContent = pct + '%';
  els.progressLine.textContent = `${earned.size} of ${s.total} earned`;
  els.gradeLine.textContent = `Platinum ${s.perGrade.platinum} · Gold ${s.perGrade.gold} · Silver ${s.perGrade.silver} · Bronze ${s.perGrade.bronze}`;
  els.timeLine.textContent = earned.size === s.total
    ? 'Platinum earned — Vice City is yours.'
    : `About ${s.remainingHours} hours of trophies left (rough estimate, based on the per-trophy estimates in this guide).`;
  els.nextTrophy.replaceChildren();
  if (s.next) {
    els.nextTrophy.append(trophyLink(s.next));
    const span = document.createElement('span');
    span.className = 'muted';
    span.textContent = ` — ${gradeLabel(s.next.grade)}, difficulty ${s.next.difficulty}/5, about ${s.next.hours || 0}h`;
    els.nextTrophy.append(span);
  } else {
    els.nextTrophy.textContent = '—';
  }
}

function matchesFilters(t) {
  const q = els.search.value.trim().toLowerCase();
  if (q && !(t.name + ' ' + t.description + ' ' + t.guide + ' ' + kindLabel(t.kind) + ' ' + chapterLabel(t)).toLowerCase().includes(q)) return false;
  if (els.grade.value !== 'all' && t.grade !== els.grade.value) return false;
  if (els.kind.value !== 'all' && t.kind !== els.kind.value) return false;
  if (els.chapter.value === 'post' && t.chapter !== null) return false;
  if (els.chapter.value !== 'all' && els.chapter.value !== 'post' && t.chapter !== Number(els.chapter.value)) return false;
  if (els.missable.checked && !t.missable) return false;
  if (els.hideEarned.checked && earned.has(t.id)) return false;
  return true;
}

function sourceLinks(t) {
  const p = document.createElement('p');
  p.className = 'links';
  p.append(document.createTextNode('Sources: '));
  t.sources.forEach((s, i) => {
    if (i) p.append(document.createTextNode(' · '));
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.label;
    p.append(a);
  });
  return p;
}

function card(t) {
  const el = document.createElement('article');
  el.className = 'card' + (earned.has(t.id) ? ' earned' : '');
  const isStory = t.kind === 'story';
  const hidden = els.spoiler.checked && isStory && !revealed.has(t.id);

  const badges = document.createElement('div');
  badges.className = 'meta';
  const g = document.createElement('span');
  g.className = 'badge ' + t.grade;
  g.textContent = gradeLabel(t.grade);
  badges.append(g);
  const k = document.createElement('span');
  k.className = 'badge';
  k.textContent = kindLabel(t.kind);
  badges.append(k);
  if (t.chapter) {
    const c = document.createElement('span');
    c.className = 'badge';
    c.textContent = chapterLabel(t);
    badges.append(c);
  }
  if (t.missable) {
    const m = document.createElement('span');
    m.className = 'badge missable';
    m.textContent = 'MISSABLE';
    badges.append(m);
  }
  if (t.hidden) {
    const h = document.createElement('span');
    h.className = 'badge hidden-t';
    h.textContent = 'Hidden';
    badges.append(h);
  }
  el.append(badges);

  const h3 = document.createElement('h3');
  if (hidden) {
    const span = document.createElement('span');
    span.className = 'hideable';
    span.textContent = 'Hidden story trophy — spoiler-safe mode';
    h3.append(span);
  } else {
    h3.append(trophyLink(t));
  }
  el.append(h3);

  if (!hidden) {
    const desc = document.createElement('p');
    desc.className = 'desc';
    desc.textContent = t.description;
    el.append(desc);
    const guide = document.createElement('p');
    guide.className = 'guide';
    guide.textContent = t.guide.split('. ')[0] + '.';
    el.append(guide);
    const meta = document.createElement('p');
    meta.className = 'meta muted';
    const d = document.createElement('span');
    d.className = 'diff';
    d.textContent = difficultyStars(t);
    meta.append(d);
    const h = document.createElement('span');
    h.textContent = `Difficulty ${t.difficulty}/5 · about ${t.hours || 0}h`;
    meta.append(h);
    el.append(meta);
    el.append(sourceLinks(t));
  } else {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Reveal this trophy';
    btn.addEventListener('click', () => { revealed.add(t.id); render(); });
    el.append(btn);
  }

  if (t.missable) {
    const w = document.createElement('p');
    w.className = 'warn';
    const strong = document.createElement('strong');
    strong.textContent = 'Missable — ';
    w.append(strong, document.createTextNode('do the balcony meditation in Chapter 1 before you leave it. See the full guide.'));
    el.append(w);
  }

  const tick = document.createElement('label');
  tick.className = 'tick';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id); else earned.delete(t.id);
    save();
    render();
  });
  const lab = document.createElement('span');
  lab.textContent = earned.has(t.id) ? 'Earned — ticked off' : 'Tick when you earn it';
  tick.append(box, lab);
  el.append(tick);
  return el;
}

function renderChecklist() {
  const list = trophies.filter(matchesFilters);
  els.cards.replaceChildren(...list.map(card));
  const hiddenStory = els.spoiler.checked
    ? trophies.filter((t) => t.kind === 'story' && !revealed.has(t.id)).length
    : 0;
  els.count.textContent = `Showing ${list.length} of ${trophies.length} trophies`
    + (hiddenStory ? ` — ${hiddenStory} story trophies hidden by spoiler-safe mode` : '');
}

function renderRoadmap() {
  els.roadmap.replaceChildren();
  const head = document.createElement('p');
  head.className = 'muted';
  head.textContent = `Three stages, about ${roadmap.totalHours} hours in total (rough estimate). Stage 1 is the story; Stage 2 is the 100% checklist; Stage 3 is the clean-up. ${roadmap.note}`;
  els.roadmap.append(head);
  for (const stage of roadmap.stages) {
    const div = document.createElement('section');
    div.className = 'stage';
    const h2 = document.createElement('h2');
    h2.textContent = stage.title + ' ';
    const hrs = document.createElement('span');
    hrs.className = 'hours';
    hrs.textContent = `≈ ${stage.hours}h`;
    h2.append(hrs);
    div.append(h2);
    const p = document.createElement('p');
    p.textContent = stage.summary;
    div.append(p);
    for (const w of stage.warnings ?? []) {
      const warn = document.createElement('p');
      warn.className = 'warn';
      const strong = document.createElement('strong');
      strong.textContent = 'Point of no return — ';
      warn.append(strong, document.createTextNode(w.text));
      div.append(warn);
    }
    const chips = document.createElement('div');
    chips.className = 'chips';
    for (const id of stage.trophies) {
      const t = byId(id);
      if (!t) continue;
      const a = document.createElement('a');
      a.className = 'chip' + (earned.has(id) ? ' done' : '');
      a.href = `#/trophy/${id}`;
      a.textContent = `${earned.has(id) ? '✓ ' : ''}${t.name} (${gradeLabel(t.grade)})`;
      chips.append(a);
    }
    div.append(chips);
    els.roadmap.append(div);
  }
}

function renderDashboardView() {
  const s = stats();
  els.dashboard.replaceChildren();
  const grid = document.createElement('div');
  grid.className = 'stat-grid';
  const statsList = [
    [`${earned.size} / ${s.total}`, 'trophies earned'],
    [`${s.remainingHours}h`, 'rough time left to the platinum'],
    [`${trophies.filter((t) => t.missable && !earned.has(t.id)).length}`, 'missable trophies still to do'],
    [`${trophies.filter((t) => !t.sources?.length).length}`, 'trophies without a cited source (should be 0)'],
  ];
  for (const [num, lbl] of statsList) {
    const st = document.createElement('div');
    st.className = 'stat';
    const n = document.createElement('p');
    n.className = 'num';
    n.textContent = num;
    const l = document.createElement('p');
    l.className = 'lbl';
    l.textContent = lbl;
    st.append(n, l);
    grid.append(st);
  }
  els.dashboard.append(grid);
  const h = document.createElement('h2');
  h.textContent = 'Easiest trophies left';
  els.dashboard.append(h);
  const list = trophies.filter((t) => !earned.has(t.id))
    .sort((a, b) => (a.difficulty - b.difficulty) || ((a.hours || 0) - (b.hours || 0)) || (a.id - b.id))
    .slice(0, 8);
  const chips = document.createElement('div');
  chips.className = 'chips';
  for (const t of list) {
    const a = document.createElement('a');
    a.className = 'chip';
    a.href = `#/trophy/${t.id}`;
    a.textContent = `${t.name} — difficulty ${t.difficulty}/5, about ${t.hours || 0}h`;
    chips.append(a);
  }
  els.dashboard.append(chips);
  const warn = document.createElement('p');
  warn.className = 'warn';
  const strong = document.createElement('strong');
  strong.textContent = 'Before you start: ';
  warn.append(strong, document.createTextNode('Positive Mental Attitude is the only missable trophy. Do the balcony meditation in Chapter 1 before you leave it.'));
  els.dashboard.append(warn);
}

function renderTrophy(id) {
  const t = byId(id);
  els.trophyDetail.replaceChildren();
  if (!t) {
    const p = document.createElement('p');
    p.textContent = 'Trophy not found.';
    els.trophyDetail.append(p);
    return;
  }
  const back = document.createElement('a');
  back.className = 'back';
  back.href = '#/';
  back.textContent = '← Back to the checklist';
  els.trophyDetail.append(back);
  const div = document.createElement('div');
  div.className = 'detail';
  const badges = document.createElement('div');
  badges.className = 'meta';
  for (const [cls, txt] of [[t.grade, gradeLabel(t.grade)], ['', kindLabel(t.kind)], ['', chapterLabel(t)]]) {
    const b = document.createElement('span');
    b.className = 'badge ' + cls;
    b.textContent = txt;
    badges.append(b);
  }
  if (t.missable) {
    const m = document.createElement('span');
    m.className = 'badge missable';
    m.textContent = 'MISSABLE';
    badges.append(m);
  }
  div.append(badges);
  const h2 = document.createElement('h2');
  h2.textContent = t.name;
  div.append(h2);
  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = t.description;
  div.append(desc);
  const meta = document.createElement('p');
  meta.className = 'muted';
  meta.textContent = `Difficulty ${t.difficulty}/5 · about ${t.hours || 0}h · ${t.hidden ? 'Hidden trophy' : 'Shown on the trophy list'}`;
  div.append(meta);
  if (t.missable) {
    const w = document.createElement('p');
    w.className = 'warn';
    const strong = document.createElement('strong');
    strong.textContent = 'Missable — ';
    w.append(strong, document.createTextNode('this trophy can be missed. Follow the first step before you leave Chapter 1.'));
    div.append(w);
  }
  const guide = document.createElement('p');
  guide.textContent = t.guide;
  div.append(guide);
  const ol = document.createElement('ol');
  for (const step of t.steps) {
    const li = document.createElement('li');
    li.textContent = step;
    ol.append(li);
  }
  div.append(ol);
  const src = document.createElement('div');
  src.className = 'sources';
  const sh = document.createElement('strong');
  sh.textContent = 'Sources';
  src.append(sh);
  const ul = document.createElement('ul');
  for (const s of t.sources) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.label;
    li.append(a);
    ul.append(li);
  }
  src.append(ul);
  div.append(src);
  const tick = document.createElement('label');
  tick.className = 'tick';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id); else earned.delete(t.id);
    save();
    render();
  });
  const lab = document.createElement('span');
  lab.textContent = earned.has(t.id) ? 'Earned — ticked off' : 'Tick when you earn it';
  tick.append(box, lab);
  div.append(tick);
  els.trophyDetail.append(div);
}

function route() {
  const hash = location.hash || '#/';
  const parts = hash.replace(/^#\/?/, '').split('/');
  const view = parts[0] || '';
  for (const [name, el] of Object.entries(els.views)) el.hidden = true;
  for (const tab of Object.values(els.tabs)) tab.classList.remove('active');
  if (view === 'roadmap') {
    els.views.roadmap.hidden = false;
    els.tabs.roadmap.classList.add('active');
    renderRoadmap();
  } else if (view === 'dashboard') {
    els.views.dashboard.hidden = false;
    els.tabs.dashboard.classList.add('active');
    renderDashboardView();
  } else if (view === 'trophy' && parts[1]) {
    els.views.trophy.hidden = false;
    renderTrophy(Number(parts[1]));
  } else {
    els.views.checklist.hidden = false;
    els.tabs.checklist.classList.add('active');
    renderChecklist();
  }
  window.scrollTo(0, 0);
}

function render() {
  renderDash();
  route();
}

for (const el of [els.search, els.grade, els.kind, els.chapter, els.missable, els.hideEarned, els.spoiler]) {
  el.addEventListener('input', renderChecklist);
  el.addEventListener('change', renderChecklist);
}

$('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify([...earned])], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
});
$('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const list = JSON.parse(await file.text());
    earned = new Set(list.filter((id) => Number.isInteger(id) && id >= 1 && id <= 55));
    save();
    render();
  } catch {
    alert('That file is not a valid progress export.');
  }
});
$('demo').addEventListener('click', () => {
  DEMO.forEach((id) => earned.add(id));
  save();
  render();
});
$('reset').addEventListener('click', () => {
  earned = new Set();
  save();
  render();
});
window.addEventListener('hashchange', route);

const [tDoc, rDoc] = await Promise.all([
  (await fetch('data/trophies.json')).json(),
  (await fetch('data/roadmap.json')).json(),
]);
trophies = tDoc.trophies;
roadmap = rDoc;
render();
