// NEON CROSSHAIR CURSOR
const curH = document.getElementById('curH');
const curV = document.getElementById('curV');
const curDot = document.getElementById('curDot');
const curRing = document.getElementById('curRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  curH.style.left = mx + 'px'; curH.style.top = my + 'px';
  curV.style.left = mx + 'px'; curV.style.top = my + 'px';
  curDot.style.left = mx + 'px'; curDot.style.top = my + 'px';
});

(function lerpRing() {
  rx += (mx - rx) * .12; ry += (my - ry) * .12;
  curRing.style.left = rx + 'px'; curRing.style.top = ry + 'px';
  requestAnimationFrame(lerpRing);
})();

document.addEventListener('mousedown', () => {
  curDot.classList.add('click');
  setTimeout(() => curDot.classList.remove('click'), 200);
});

function initHoverEffects() {
  document.querySelectorAll('button, a, .feat-card, .dash-card, .testi-card, .subject-card, .progress-card, .task-chip, .diff-btn, .social-icon').forEach(el => {
    el.addEventListener('mouseenter', () => { curH.classList.add('hover'); curV.classList.add('hover'); curRing.classList.add('hover'); curDot.classList.add('hover'); });
    el.addEventListener('mouseleave', () => { curH.classList.remove('hover'); curV.classList.remove('hover'); curRing.classList.remove('hover'); curDot.classList.remove('hover'); });
  });
}
initHoverEffects();

// SCROLL TO
function scrollTo(id) { document.getElementById(id).scrollIntoView({ behavior: 'smooth' }); }

document.querySelectorAll('[data-scroll]').forEach(btn => {
  btn.addEventListener('click', () => {
    scrollTo(btn.dataset.scroll);
  });
});

// PARTICLES
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth; canvas.height = window.innerHeight;
window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });

const pts = Array.from({ length: 80 }, () => ({
  x: Math.random() * canvas.width, y: Math.random() * canvas.height,
  vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4,
  r: Math.random() * 1.5 + .5,
  c: `rgba(0,245,255,${Math.random() * .4 + .1})`
}));

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pts.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.c; ctx.fill();
  });
  pts.forEach((a, i) => pts.slice(i + 1).forEach(b => {
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    if (d < 120) {
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = `rgba(0,245,255,${.08 * (1 - d / 120)})`; ctx.lineWidth = .5; ctx.stroke();
    }
  }));
  requestAnimationFrame(drawParticles);
} drawParticles();

// REVEAL ON SCROLL
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: .1 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

// COUNT UP
function countUp(el, target, suffix = '') {
  let current = 0; const inc = Math.ceil(target / 60);
  const iv = setInterval(() => {
    current = Math.min(current + inc, target);
    el.textContent = current.toLocaleString() + (suffix || '');
    if (current >= target) clearInterval(iv);
  }, 30);
}
setTimeout(() => {
  document.querySelectorAll('[data-count]').forEach(el => {
    countUp(el, parseInt(el.dataset.count));
  });
}, 800);

// SUBJECT CARDS
const subjectColors = ['#00f5ff', '#9d00ff', '#ff00aa', '#00ff88', '#0066ff', '#ffaa00', '#ff4444', '#44ffdd', '#aa00ff', '#00aaff'];
const diffState = {};

function generateSubjectCards() {
  const n = Math.min(parseInt(document.getElementById('num-subjects').value) || 0, 10);
  if (!n) { showNotif('MISSING DATA', 'Enter number of subjects first.'); return; }
  const c = document.getElementById('subjects-container');
  c.innerHTML = '';
  for (let i = 0; i < n; i++) {
    const col = subjectColors[i % subjectColors.length];
    c.innerHTML += `
    <div class="subject-card" style="--col:${col}">
      <div class="subject-card-header">
        <div class="subject-num" style="border-color:${col};color:${col};">S${String(i + 1).padStart(2, '0')}</div>
        <input class="cyber-input" type="text" id="sub-name-${i}" placeholder="Subject name (e.g. Mathematics)" style="flex:1;border-color:${col}40;"/>
      </div>
      <div class="subject-grid">
        <div class="input-group" style="grid-column:1/-1">
          <label>Topics / Syllabus (comma separated)</label>
          <input class="cyber-input" type="text" id="sub-topics-${i}" placeholder="e.g. Algebra, Calculus, Trigonometry, Statistics"/>
        </div>
        <div class="input-group">
          <label>Difficulty</label>
          <div class="difficulty-btns">
            <button class="diff-btn" data-diff-idx="${i}" data-diff-level="easy" id="d-easy-${i}">Easy</button>
            <button class="diff-btn active-medium" data-diff-idx="${i}" data-diff-level="medium" id="d-med-${i}">Medium</button>
            <button class="diff-btn" data-diff-idx="${i}" data-diff-level="hard" id="d-hard-${i}">Hard</button>
          </div>
        </div>
      </div>
    </div>`;
  }
  
  document.querySelectorAll('.difficulty-btns .diff-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      setDiff(e.target, parseInt(btn.dataset.diffIdx), btn.dataset.diffLevel);
    });
  });

  initHoverEffects();
  showNotif('SUBJECTS LOADED', `${n} subject cards generated. Fill in details.`);
}

document.getElementById('btn-generate-cards').addEventListener('click', generateSubjectCards);

function setDiff(btn, idx, level) {
  diffState[idx] = level;
  ['easy', 'medium', 'hard'].forEach(l => {
    const b = document.getElementById(`d-${l.slice(0, 4)}-${idx}`) || document.getElementById(`d-${l === 'medium' ? 'med' : l}-${idx}`);
    if (b) b.className = 'diff-btn';
  });
  const map = { easy: 'active-easy', medium: 'active-medium', hard: 'active-hard' };
  btn.className = 'diff-btn ' + map[level];
}

// AI LOADER
function runLoader(onDone) {
  const loader = document.getElementById('ai-loader');
  const bar = document.getElementById('loader-bar');
  loader.classList.add('active');
  const steps = ['lstep-0', 'lstep-1', 'lstep-2', 'lstep-3', 'lstep-4'];
  const pcts = [15, 35, 58, 80, 100];
  let i = 0;
  steps.forEach(id => document.getElementById(id).className = 'loader-step');
  bar.style.width = '0%';
  function nextStep() {
    if (i > 0) document.getElementById(steps[i - 1]).className = 'loader-step done';
    if (i < steps.length) {
      document.getElementById(steps[i]).className = 'loader-step active';
      bar.style.width = pcts[i] + '%';
      i++;
      setTimeout(nextStep, 520);
    } else {
      setTimeout(() => { loader.classList.remove('active'); onDone(); }, 300);
    }
  }
  nextStep();
}

// GENERATE PLAN
function generatePlan() {
  const days = parseInt(document.getElementById('num-days').value);
  const hours = parseFloat(document.getElementById('daily-hours').value);
  const n = parseInt(document.getElementById('num-subjects').value);
  if (!days || !hours || !n) { showNotif('MISSING DATA', 'Fill in subjects, days & hours first.'); return; }
  const subjects = [];
  for (let i = 0; i < n; i++) {
    const name = document.getElementById(`sub-name-${i}`)?.value || `Subject ${i + 1}`;
    const topicsRaw = document.getElementById(`sub-topics-${i}`)?.value || 'Topic 1,Topic 2,Topic 3';
    const topics = topicsRaw.split(',').map(t => t.trim()).filter(Boolean);
    const diff = diffState[i] || 'medium';
    const weight = diff === 'hard' ? 3 : diff === 'medium' ? 2 : 1;
    subjects.push({ name, topics, diff, weight, color: subjectColors[i % subjectColors.length] });
  }

  runLoader(() => {
    const totalWeight = subjects.reduce((s, sub) => s + sub.weight, 0);
    const plan = Array.from({ length: days }, () => []);

    subjects.forEach(sub => {
      const subHoursPerDay = parseFloat(((sub.weight / totalWeight) * hours).toFixed(2));
      const pool = [...sub.topics];
      const totalTopicsSub = pool.length;
      const chunkSize = Math.min(3, Math.max(1, Math.ceil(totalTopicsSub / days)));

      let dayIdx = 0;
      while (pool.length > 0) {
        const chunk = pool.splice(0, chunkSize);
        const d = dayIdx % days;
        const hrsPerTopic = parseFloat((subHoursPerDay / chunk.length).toFixed(2));
        const existing = plan[d].find(e => e.subject === sub.name);
        if (existing) {
          const newTopicCount = existing.topics.length + chunk.length;
          const newHrsPerTopic = parseFloat((subHoursPerDay / newTopicCount).toFixed(2));
          existing.topics.push(...chunk);
          existing.hrsPerTopic = newHrsPerTopic;
        } else {
          plan[d].push({ subject: sub.name, topics: chunk, color: sub.color, diff: sub.diff, subHrsPerDay: subHoursPerDay, hrsPerTopic });
        }
        dayIdx++;
      }
    });

    // SHOW DASHBOARD
    const ds = document.getElementById('dashboard-section');
    ds.style.display = 'block';
    document.getElementById('progress-section').style.display = 'block';
    const totalTopics = subjects.reduce((s, sub) => s + sub.topics.length, 0);
    document.getElementById('dash-grid').innerHTML = `
      <div class="dash-card"><div class="dash-icon">📅</div><div class="dash-val" data-anim="${days}">${days}</div><div class="dash-label">Study Days</div></div>
      <div class="dash-card"><div class="dash-icon">⏱️</div><div class="dash-val" data-anim="${days * hours}">${days * hours}</div><div class="dash-label">Total Hours</div></div>
      <div class="dash-card"><div class="dash-icon">📚</div><div class="dash-val" data-anim="${n}">${n}</div><div class="dash-label">Subjects</div></div>
      <div class="dash-card"><div class="dash-icon">🎯</div><div class="dash-val" data-anim="${totalTopics}">${totalTopics}</div><div class="dash-label">Total Topics</div></div>
      <div class="dash-card"><div class="dash-icon">⚡</div><div class="dash-val" data-anim="${hours}">${hours}</div><div class="dash-label">Hours/Day</div></div>
      <div class="dash-card"><div class="dash-icon">🔥</div><div class="dash-val">100%</div><div class="dash-label">Plan Coverage</div></div>
    `;
    window.topicDone = {};
    window.subjectTopicCount = {};
    subjects.forEach(sub => {
      topicDone[sub.name] = {};
      subjectTopicCount[sub.name] = sub.topics.length;
      sub.topics.forEach(t => topicDone[sub.name][t] = false);
    });

    const pc = document.getElementById('plan-container');
    pc.innerHTML = '<p class="section-title" style="margin:2rem 0 1rem;font-size:1.2rem;">📋 Daily <span class="accent">Roadmap</span> <span style="font-size:.8rem;color:var(--muted);font-family:Rajdhani,sans-serif;font-weight:400;">— click topics to mark done</span></p>';
    plan.forEach((dayTasks, i) => {
      if (!dayTasks.length) return;

      const actualDayHours = dayTasks.reduce((sum, t) => sum + t.subHrsPerDay, 0);
      const displayHours = parseFloat(actualDayHours.toFixed(1));

      const taskHtml = dayTasks.map(t =>
        t.topics.map(topic => {
          const tid = `topic-${t.subject.replace(/\s/g, '_')}-${topic.replace(/[\s[\]📋—]/g, '_')}`;
          return `<div class="task-chip" id="chip-${tid}" data-subject="${t.subject}" data-topic="${topic}" data-tid="${tid}" data-color="${t.color}" style="cursor:none;">
            <div class="task-dot" id="dot-${tid}" style="background:${t.color};box-shadow:0 0 4px ${t.color};transition:all .3s;"></div>
            <div style="flex:1;">
              <span style="color:${t.color};font-size:.75rem;letter-spacing:.05em;">${t.subject}</span><br/>
              <span id="lbl-${tid}" style="font-size:.95rem;">${topic}</span>
            </div>
            <span style="font-size:.7rem;color:var(--muted);font-family:'Orbitron',monospace;white-space:nowrap;margin-right:.3rem;">${formatMins(t.hrsPerTopic)}</span>
            <span id="chk-${tid}" style="font-size:1rem;opacity:0;transition:opacity .3s;">✅</span>
          </div>`;
        }).join('')
      ).join('');
      pc.innerHTML += `
        <div class="plan-day">
          <div class="plan-day-header">
            <div class="day-num">DAY ${i + 1}</div>
            <div style="color:var(--muted);font-size:.85rem;flex:1;margin-left:1rem;">${dayTasks.reduce((s, t) => s + t.topics.length, 0)} topics · ${formatMins(displayHours)}</div>
            <div class="day-bar-wrap"><div class="day-bar" style="width:0%" data-w="100%"></div></div>
          </div>
          <div class="plan-tasks">${taskHtml}</div>
        </div>`;
    });

    document.querySelectorAll('.plan-tasks .task-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        toggleTopic(chip.dataset.subject, chip.dataset.topic, chip.dataset.tid, chip.dataset.color);
      });
    });

    const pg = document.getElementById('progress-grid');
    pg.innerHTML = '';
    subjects.forEach(sub => {
      const key = sub.name.replace(/\s/g, '');
      pg.innerHTML += `
        <div class="progress-card reveal">
          <div class="prog-header">
            <span class="prog-name" style="color:${sub.color}">${sub.name}</span>
            <span class="prog-pct" id="prog-pct-${key}">0%</span>
          </div>
          <div class="prog-bar-wrap">
            <div class="prog-bar" id="prog-bar-${key}" style="width:0%;background:linear-gradient(90deg,${sub.color},${sub.color}88);box-shadow:0 0 8px ${sub.color}33;transition:width .6s ease;"></div>
          </div>
          <div class="prog-meta">
            <span id="prog-count-${key}">0 / ${sub.topics.length} topics done</span>
            <span style="color:${sub.diff === 'hard' ? 'var(--pink)' : sub.diff === 'medium' ? '#ffaa00' : 'var(--green)'}">${sub.diff.toUpperCase()}</span>
          </div>
        </div>`;
    });

    setTimeout(() => {
      document.querySelectorAll('.day-bar').forEach(b => b.style.width = b.dataset.w);
      document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    }, 100);
    ds.scrollIntoView({ behavior: 'smooth' });
    initHoverEffects();
    showNotif('PLAN GENERATED', `${days}-day plan ready! ${hours}h/day enforced.`);
  });
}

document.getElementById('btn-generate-plan').addEventListener('click', generatePlan);

// TOGGLE TOPIC DONE
function toggleTopic(subject, topic, tid, color) {
  const done = topicDone[subject][topic] = !topicDone[subject][topic];
  const chip = document.getElementById('chip-' + tid);
  const dot = document.getElementById('dot-' + tid);
  const chk = document.getElementById('chk-' + tid);
  const lbl = document.getElementById('lbl-' + tid);
  if (done) {
    chip.style.opacity = '.6';
    chip.style.borderColor = 'rgba(0,255,136,.3)';
    dot.style.background = 'var(--green)';
    dot.style.boxShadow = '0 0 8px var(--green)';
    chk.style.opacity = '1';
    lbl.style.textDecoration = 'line-through';
    lbl.style.color = 'var(--muted)';
  } else {
    chip.style.opacity = '1';
    chip.style.borderColor = 'rgba(255,255,255,.08)';
    dot.style.background = color;
    dot.style.boxShadow = `0 0 6px ${color}`;
    chk.style.opacity = '0';
    lbl.style.textDecoration = 'none';
    lbl.style.color = 'var(--text)';
  }
  const total = subjectTopicCount[subject];
  const doneCount = Object.values(topicDone[subject]).filter(Boolean).length;
  const pct = Math.round(doneCount / total * 100);
  const key = subject.replace(/\s/g, '');
  const bar = document.getElementById('prog-bar-' + key);
  const pctEl = document.getElementById('prog-pct-' + key);
  const countEl = document.getElementById('prog-count-' + key);
  if (bar) bar.style.width = pct + '%';
  if (pctEl) pctEl.textContent = pct + '%';
  if (countEl) countEl.textContent = `${doneCount} / ${total} topics done`;
  if (pct === 100) showNotif('SUBJECT COMPLETE 🎉', `${subject} is 100% done!`);
  else if (done) showNotif('TOPIC DONE ✅', `"${topic}" marked complete.`);
}

// TIMER SETUP
let timerInterval = null, timerSecs = 25 * 60, timerRunning = false;
let focusSessions = 0, totalFocusMins = 0, isBreak = false;
const FULL_DASH = 754;

function updateTimerDisplay() {
  const m = Math.floor(timerSecs / 60), s = timerSecs % 60;
  document.getElementById('timer-display').textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  const total = isBreak ? 5 * 60 : 25 * 60;
  const prog = timerSecs / total;
  document.getElementById('timer-ring').style.strokeDashoffset = FULL_DASH * (1 - prog);
}

function timerStart() {
  if (timerRunning) return;
  timerRunning = true;
  document.getElementById('timer-start').style.display = 'none';
  document.getElementById('timer-pause').style.display = 'block';
  timerInterval = setInterval(() => {
    timerSecs--;
    updateTimerDisplay();
    if (timerSecs <= 0) {
      clearInterval(timerInterval); timerRunning = false;
      if (!isBreak) { focusSessions++; totalFocusMins += 25; isBreak = true; timerSecs = 5 * 60; document.getElementById('timer-mode').textContent = 'BREAK'; }
      else { isBreak = false; timerSecs = 25 * 60; document.getElementById('timer-mode').textContent = 'FOCUS'; }
      document.getElementById('sessions-done').textContent = focusSessions;
      document.getElementById('focus-mins').textContent = totalFocusMins;
      document.getElementById('prod-score').textContent = Math.min(100, focusSessions * 20);
      document.getElementById('timer-start').style.display = 'block';
      document.getElementById('timer-pause').style.display = 'none';
      showNotif('SESSION COMPLETE', isBreak ? 'Break time! Rest for 5 minutes.' : 'Focus session done! Great work.');
    }
  }, 1000);
}

function timerPause() {
  clearInterval(timerInterval); timerRunning = false;
  document.getElementById('timer-start').style.display = 'block';
  document.getElementById('timer-pause').style.display = 'none';
}

function timerReset() {
  timerPause(); isBreak = false; timerSecs = 25 * 60;
  document.getElementById('timer-mode').textContent = 'FOCUS';
  updateTimerDisplay();
}

document.getElementById('timer-start').addEventListener('click', timerStart);
document.getElementById('timer-pause').addEventListener('click', timerPause);
document.getElementById('timer-reset').addEventListener('click', timerReset);
updateTimerDisplay();

// NOTIFICATION SYSTEM
function showNotif(title, msg) {
  const n = document.getElementById('notif');
  document.getElementById('notif-title').textContent = title;
  document.getElementById('notif-msg').textContent = msg;
  n.classList.add('show');
  setTimeout(() => n.classList.remove('show'), 4000);
}

// FORMAT MINUTES HELPER
function formatMins(hrs) {
  const total = Math.round(hrs * 60);
  if (total <= 0) return '0m';
  if (total < 60) return `${total}m`;
  const h = Math.floor(total / 60), m = total % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

// GENERATE INITIAL CARDS
generateSubjectCards();

// INPUT VALIDATION FILTER
document.querySelectorAll('input[type=number]').forEach(inp => {
  inp.addEventListener('keydown', e => {
    if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
  });
  inp.addEventListener('input', () => {
    if (inp.value < 1) inp.value = '';
  });
});