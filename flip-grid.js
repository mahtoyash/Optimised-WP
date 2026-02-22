(function () {

  const COLS  = 4;
  const ROWS  = 5;
  const TOTAL = COLS * ROWS;
  const WORD  = 'PROJECTS\u00A0\u00A0';

  const jpPhrases = [
    ['余白の美学', '静寂と光', '無限の可能性'],
    ['時間の流れ', '夢の断片', '影と形'],
    ['存在の証明', '記憶の痕跡', '永遠の瞬間'],
    ['空白の詩',   '風の記憶', '光の軌跡'],
    ['深夜の静寂', '星の言葉', '忘れられた夢'],
    ['時の彼方',   '幻の光',   '消えゆく影'],
    ['心の迷宮',   '無限の闇', '静かな嵐'],
    ['夜明けの詩', '失われた声', '遠い記憶'],
  ];

  const section = document.getElementById('projects');
  const grid    = document.getElementById('grid');
  const ruler   = document.getElementById('ruler');

  if (!section || !grid || !ruler) return;

  const inners    = [];
  const slices    = [];
  const cardLefts = [];  // relative to section left
  const cardTops  = [];  // relative to section top

  for (let i = 0; i < TOTAL; i++) {
    const jp   = jpPhrases[i % jpPhrases.length];
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-inner">
        <div class="face face-front">
          <div class="text-slice">${WORD + WORD}</div>
        </div>
        <div class="face face-back">
          ${jp.map(t => `<span class="jp-text">${t}</span>`).join('')}
        </div>
      </div>`;
    grid.appendChild(card);
    inners.push(card.querySelector('.card-inner'));
    slices.push(card.querySelector('.text-slice'));
  }

  // Measure relative to section — stable regardless of page scroll
  function measureCards() {
    cardLefts.length = 0;
    cardTops.length  = 0;
    const sRect = section.getBoundingClientRect();
    inners.forEach(inner => {
      const rect = inner.closest('.card').getBoundingClientRect();
      cardLefts.push(rect.left - sRect.left);
      cardTops.push(rect.top  - sRect.top);
    });
  }

  let wordWidth = 0;
  function measureWord() {
    ruler.textContent = WORD;
    wordWidth = ruler.getBoundingClientRect().width;
  }

  let scrollX = 0;

  function startScrollLoop() {
    function loop() {
      scrollX -= 1.2;
      if (wordWidth > 0 && Math.abs(scrollX) >= wordWidth) scrollX += wordWidth;

      // Center vertically using section's own height — no scroll dependency
      const sectionCenterY = section.offsetHeight / 2;

      slices.forEach((el, i) => {
        if (!el) return;
        el.style.left      = `${scrollX - cardLefts[i]}px`;
        el.style.top       = `${sectionCenterY - cardTops[i]}px`;
        el.style.transform = 'translateY(-50%)';
      });

      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  const state      = Array.from({ length: TOTAL }, () => ({ angle: 0, target: 0, raf: null }));
  const nudgeState = Array.from({ length: TOTAL }, () => ({ angle: 0, axis: 'X', raf: null }));

  function easeOutExpo(t)  { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

  function applyTransform(idx) {
    const s  = state[idx];
    const ns = nudgeState[idx];
    inners[idx].style.transform = ns.axis === 'X'
      ? `rotateX(${s.angle + (ns.angle || 0)}deg)`
      : `rotateX(${s.angle}deg) rotateY(${ns.angle || 0}deg)`;
  }

  function animateTo(idx, targetAngle, duration) {
    const s = state[idx];
    if (s.raf) cancelAnimationFrame(s.raf);
    const startAngle = s.angle;
    const delta      = targetAngle - startAngle;
    const start      = performance.now();
    const isIn       = targetAngle === 180;
    s.target = targetAngle;
    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      s.angle = startAngle + delta * (isIn ? easeOutExpo(t) : easeOutQuart(t));
      applyTransform(idx);
      if (t < 1) { s.raf = requestAnimationFrame(tick); }
      else       { s.angle = targetAngle; s.raf = null; }
    }
    s.raf = requestAnimationFrame(tick);
  }

  function nudge(idx) {
    const row = Math.floor(idx / COLS), col = idx % COLS;
    const neighbours = [];
    if (row > 0)        neighbours.push({ i: idx - COLS, axis: 'X', dir: -1 });
    if (row < ROWS - 1) neighbours.push({ i: idx + COLS, axis: 'X', dir:  1 });
    if (col > 0)        neighbours.push({ i: idx - 1,    axis: 'Y', dir:  1 });
    if (col < COLS - 1) neighbours.push({ i: idx + 1,    axis: 'Y', dir: -1 });
    neighbours.forEach(({ i: ni, axis, dir }) => {
      if (state[ni].target === 180) return;
      const ns = nudgeState[ni];
      if (ns.raf) cancelAnimationFrame(ns.raf);
      ns.axis = axis;
      const peak = 5 * dir, start = performance.now();
      function tick(now) {
        const t = Math.min((now - start) / 420, 1);
        ns.angle = peak * Math.sin(t * Math.PI);
        applyTransform(ni);
        if (t < 1) { ns.raf = requestAnimationFrame(tick); }
        else       { ns.angle = 0; applyTransform(ni); ns.raf = null; }
      }
      ns.raf = requestAnimationFrame(tick);
    });
  }

  function getIdx(clientX, clientY) {
    const rect = section.getBoundingClientRect();
    if (clientX < rect.left || clientX > rect.right ||
        clientY < rect.top  || clientY > rect.bottom) return -1;
    const col = Math.floor(((clientX - rect.left) / rect.width)  * COLS);
    const row = Math.floor(((clientY - rect.top)  / rect.height) * ROWS);
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return -1;
    return row * COLS + col;
  }

  let active = -1;
  section.addEventListener('mousemove', (e) => {
    const next = getIdx(e.clientX, e.clientY);
    if (next === active) return;
    if (active !== -1) animateTo(active, 0, 900);
    if (next !== -1)   { animateTo(next, 180, 220); nudge(next); }
    active = next;
  });
  section.addEventListener('mouseleave', () => {
    if (active !== -1) { animateTo(active, 0, 900); active = -1; }
  });

  document.fonts.ready.then(() => {
    measureCards();
    measureWord();
    startScrollLoop();
  });

  window.addEventListener('resize', () => { measureCards(); measureWord(); });

})();