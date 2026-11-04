/* Portfolio runtime: vanilla JS, no animation libraries. Timings come from DESIGN-TOKENS.md. */
(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const root = document.documentElement;
  const QUIET = !!window.__quiet;
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TOUCH = matchMedia('(hover: none)').matches;
  const EMAIL = 'choudharylokesh26713@gmail.com';

  if ('scrollRestoration' in history && !location.hash) history.scrollRestoration = 'manual';

  /* ---------- Scroll bus ---------- */
  const scrollFns = [];
  let scrollQueued = false;
  function runScroll() {
    scrollQueued = false;
    const y = window.scrollY;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    scrollFns.forEach((f) => f(y, max));
  }
  function queueScroll() { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(runScroll); } }
  addEventListener('scroll', queueScroll, { passive: true });
  addEventListener('resize', queueScroll, { passive: true });

  const Site = {};

  /* ---------- Global chrome ---------- */
  const nav = $('.nav');
  const barFill = $('.progress i');
  const ringTop = $('.totop .r1');
  scrollFns.push((y, max) => {
    barFill.style.transform = `scaleX(${y / max})`;
    nav.classList.toggle('solid', y > 40);
    ringTop.style.strokeDashoffset = String(1 - y / max);
  });

  const navLinks = new Map($$('.nav nav a').map((a) => [a.getAttribute('href').slice(1), a]));
  const midIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const a = navLinks.get(e.target.id);
      if (a) { a.classList.toggle('on', e.isIntersecting); if (e.isIntersecting) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); }
    });
  }, { rootMargin: '-50% 0px -50% 0px' });
  $$('section[id]').forEach((s) => midIO.observe(s));

  /* ---------- Hero depth ---------- */
  (function heroDepth() {
    const layers = {
      word: { el: $('[data-depth=word]'), mx: -18, my: -9, sy: 150, fade: 0 },
      portrait: { el: $('[data-depth=portrait]'), mx: 14, my: 7, sy: 46, fade: 0 },
      text: { el: $('[data-depth=text]'), mx: -7, my: 0, sy: -90, fade: 1 },
      stats: { el: $('[data-depth=stats]'), mx: 0, my: 0, sy: -130, fade: 1 },
    };
    const hero = $('.hero');
    let px = 0, py = 0, cx = 0, cy = 0, running = false, heroVisible = true;
    const parallax = innerWidth > 900 && !REDUCED;
    const apply = () => {
      const sc = parallax ? clamp(window.scrollY / innerHeight, 0, 1) : 0;
      Object.values(layers).forEach((l) => {
        l.el.style.transform = `translate3d(${(cx * l.mx).toFixed(2)}px, ${(cy * l.my + sc * l.sy).toFixed(2)}px, 0)`;
        if (l.fade) l.el.style.opacity = String(1 - sc * 1.15 < 0 ? 0 : 1 - sc * 1.15);
      });
    };
    const loop = () => {
      cx += (px - cx) * .09; cy += (py - cy) * .09;
      apply();
      if (Math.abs(px - cx) > .001 || Math.abs(py - cy) > .001) requestAnimationFrame(loop);
      else running = false;
    };
    if (parallax) {
      scrollFns.push(() => { if (heroVisible) apply(); });
      new IntersectionObserver((es) => { heroVisible = es[0].isIntersecting; }).observe(hero);
      if (!TOUCH) addEventListener('pointermove', (e) => {
        if (!heroVisible) return;
        px = e.clientX / innerWidth - .5; py = e.clientY / innerHeight - .5;
        if (!running) { running = true; requestAnimationFrame(loop); }
      }, { passive: true });
    }
  })();

  /* ---------- Hero stats ---------- */
  Site.stats = (function () {
    const stats = $$('[data-stat]');
    const details = $$('[data-detail]');
    let idx = -1, touched = false, timer = 0, visible = true;
    const select = (i) => {
      if (i === idx) return;
      idx = i;
      stats.forEach((s, n) => { s.classList.toggle('on', n === i); s.setAttribute('aria-pressed', String(n === i)); });
      details.forEach((d, n) => d.classList.toggle('on', n === i));
    };
    const pick = (i) => { touched = true; clearInterval(timer); select(i); };
    stats.forEach((s, i) => {
      s.addEventListener('pointerenter', () => { if (!TOUCH) pick(i); });
      s.addEventListener('focus', () => pick(i));
      s.addEventListener('click', () => pick(i));
    });
    new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe($('.stats'));
    const cycle = () => {
      if (REDUCED) return;
      clearInterval(timer);
      timer = setInterval(() => { if (!touched && visible && !document.hidden) select((idx + 1) % stats.length); }, 3600);
    };
    const countUp = (el, delay) => {
      const to = +el.dataset.count, suf = el.dataset.suffix || '';
      const start = performance.now() + delay;
      const tick = (now) => {
        const t = clamp((now - start) / 650, 0, 1);
        el.textContent = Math.round(easeOut(t) * to) + suf;
        if (t < 1) requestAnimationFrame(tick);
      };
      el.textContent = '0' + suf;
      requestAnimationFrame(tick);
    };
    const play = () => {
      $$('.stat').forEach((s, i) => {
        s.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: i * 80, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
        countUp($('.num', s), i * 80);
      });
      $('.stat-rule i').animate([{ transform: 'scaleX(0)' }, { transform: 'none' }], { duration: 400, easing: 'cubic-bezier(.65,0,.35,1)' });
      setTimeout(() => { if (!touched) select(0); }, 600);
      cycle();
    };
    return { select, play, settle() { if (idx < 0) select(0); cycle(); } };
  })();

  /* ---------- Work cards ---------- */
  (function cards() {
    $$('.diagram').forEach((d) => {
      const inputs = d.dataset.in.split('|'), outs = d.dataset.out.split('|');
      const W = 640, H = 300, ys = (n) => Array.from({ length: n }, (_, i) => (H / (n + 1)) * (i + 1));
      const cW = Math.max(110, d.dataset.c.length * 10 + 30), cx = W / 2, cy = H / 2;
      const lines = [];
      ys(inputs.length).forEach((y) => lines.push(`M150 ${y} C ${cx - 90} ${y} ${cx - 90} ${cy} ${cx - cW / 2} ${cy}`));
      ys(outs.length).forEach((y) => lines.push(`M${cx + cW / 2} ${cy} C ${cx + 90} ${cy} ${cx + 90} ${y} 490 ${y}`));
      const esc = (s) => s.replace(/&/g, '&amp;');
      const svg = `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true">` +
        lines.map((p) => `<path class="d-ln" d="${p}"/>`).join('') +
        lines.map((p, i) => `<circle class="d-dot" r="3.500"><animateMotion dur="2.2s" begin="${(i * .35).toFixed(2)}s" repeatCount="indefinite" path="${p}"/></circle>`).join('') +
        ys(inputs.length).map((y, i) => `<text x="142" y="${y + 5}" text-anchor="end">${esc(inputs[i])}</text>`).join('') +
        ys(outs.length).map((y, i) => `<text x="498" y="${y + 5}">${esc(outs[i])}</text>`).join('') +
        `<rect class="d-c" x="${cx - cW / 2}" y="${cy - 22}" width="${cW}" height="44" rx="8"/><text class="c-t" x="${cx}" y="${cy + 5}" text-anchor="middle">${esc(d.dataset.c)}</text></svg>`;
      d.insertAdjacentHTML('afterbegin', svg);
      const el = d.querySelector('svg');
      el.pauseAnimations();
      const screen = d.parentElement;
      const on = () => { if (!REDUCED) el.unpauseAnimations(); };
      const off = () => el.pauseAnimations();
      screen.addEventListener('pointerenter', () => { if (!TOUCH) on(); });
      screen.addEventListener('pointerleave', () => { if (!TOUCH) off(); });
      const sys = $('.sys', screen.parentElement);
      sys.addEventListener('click', () => {
        const show = screen.classList.toggle('show');
        sys.setAttribute('aria-pressed', String(show));
        if (show) on(); else off();
      });
    });
    if (TOUCH || REDUCED) return;
    $$('.card').forEach((card) => {
      const glow = $('.glow', card);
      const accent = card.style.getPropertyValue('--accent');
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        glow.style.background = `radial-gradient(320px circle at ${x}px ${y}px, color-mix(in srgb, ${accent} 26%, transparent), transparent 70%)`;
        const rx = (y / r.height - .5) * -5, ry = (x / r.width - .5) * 6;
        card.style.transform = `perspective(1100px) translateY(-5px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
      }, { passive: true });
      card.addEventListener('pointerleave', () => {
        card.style.transition = 'transform .4s cubic-bezier(.2,.8,.2,1), border-color .25s';
        card.style.transform = '';
        setTimeout(() => { card.style.transition = ''; }, 420);
      });
    });
  })();

  /* ---------- Timeline ---------- */
  (function timeline() {
    const yearEl = $('.tl-year');
    const digits = yearEl.dataset.year.split('');
    yearEl.textContent = '';
    const cols = digits.map((d) => {
      const c = document.createElement('span');
      c.className = 'odo';
      c.innerHTML = '<span>' + Array.from({ length: 10 }, (_, i) => `<i>${i}</i>`).join('') + '</span>';
      yearEl.appendChild(c);
      const inner = c.firstChild;
      inner.style.transform = `translateY(${-d * 10}%)`;
      return inner;
    });
    const setYear = (y) => String(y).split('').forEach((d, i) => {
      cols[i].style.transitionDelay = `${i * 50}ms`;
      cols[i].style.transform = `translateY(${-d * 10}%)`;
    });
    const rows = $$('.tl-row'), wrap = $('.tl-rows');
    const fill = $('.rail i'), dot = $('.rail b'), rail = $('.rail');
    let current = -1;
    scrollFns.push(() => {
      const r = wrap.getBoundingClientRect();
      if (r.bottom < -100 || r.top > innerHeight + 100) return;
      const mid = innerHeight * .55;
      const t = clamp((mid - r.top) / r.height, 0, 1);
      fill.style.transform = `scaleY(${t})`;
      dot.style.transform = `translateY(${t * rail.offsetHeight}px)`;
      let best = 0, bestD = Infinity;
      rows.forEach((row, i) => {
        const b = row.getBoundingClientRect();
        const d = Math.abs((b.top + b.bottom) / 2 - mid);
        if (d < bestD) { bestD = d; best = i; }
      });
      if (best !== current) {
        current = best;
        rows.forEach((row, i) => row.classList.toggle('on', i === best));
        setYear(rows[best].dataset.y);
      }
    });
    rows[0].classList.add('on');
  })();

  /* ---------- Findings ---------- */
  Site.findings = (function () {
    const gridG = $('#adr-grid');
    let cells = '';
    for (let i = 0; i < 50; i++) {
      const col = i % 10, row = Math.floor(i / 10);
      cells += `<rect class="cell" style="--i:${i}" x="${80 + col * 50}" y="${6 + row * 46}" width="40" height="36" rx="5"/>`;
    }
    gridG.innerHTML = cells;
    const finds = $$('[data-find]'), panes = $$('[data-pane]');
    const marks = finds.map((f) => $('[data-mark]', f));
    const finals = marks.map((m) => m.textContent);
    const CH = 'ABCDEFGHKLMNPRSTUVXYZ0123456789';
    let idx = -1, hover = false, visible = false, started = false;
    const decode = (i) => {
      if (REDUCED) return;
      const m = marks[i], f = finals[i], start = performance.now();
      const tick = (now) => {
        const t = (now - start) / 850;
        if (t >= 1 || idx !== i) { m.textContent = f; return; }
        const lock = Math.floor(t * f.length * 1.2);
        m.textContent = f.split('').map((c, n) => (n < lock ? c : CH[Math.floor(Math.random() * CH.length)])).join('');
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const select = (i) => {
      if (i === idx) return;
      idx = i;
      finds.forEach((f, n) => { f.classList.toggle('on', n === i); f.setAttribute('aria-pressed', String(n === i)); });
      panes.forEach((p, n) => p.classList.toggle('on', n === i));
      const d = $('.draw', panes[i]);
      d.classList.remove('play');
      void d.getBoundingClientRect();
      d.classList.add('play');
      decode(i);
    };
    finds.forEach((f, i) => {
      f.addEventListener('pointerenter', () => { if (!TOUCH) select(i); });
      f.addEventListener('focus', () => select(i));
      f.addEventListener('click', () => select(i));
    });
    const bench = $('.bench');
    bench.addEventListener('pointerenter', () => { hover = true; });
    bench.addEventListener('pointerleave', () => { hover = false; });
    new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(bench);
    const start = () => {
      if (started) return;
      started = true;
      select(0);
      if (!REDUCED) setInterval(() => { if (visible && !hover && !document.hidden) select((idx + 1) % finds.length); }, 6500);
    };
    return { start };
  })();

  /* ---------- Accordion ---------- */
  (function accordion() {
    const rows = $$('.acc-row');
    const open = (row) => rows.forEach((r) => {
      const on = r === row;
      r.classList.toggle('open', on);
      $('.acc-btn', r).setAttribute('aria-expanded', String(on));
    });
    rows.forEach((r) => {
      const b = $('.acc-btn', r);
      b.addEventListener('click', () => open(r));
      b.addEventListener('focus', () => open(r));
      if (!TOUCH) r.addEventListener('pointerenter', () => open(r));
    });
    open(rows[0]);
  })();

  /* ---------- Magnetic button, pills, marquee, clock ---------- */
  (function pointerToys() {
    const round = $('[data-magnet]');
    const pills = $$('.pill');
    pills.forEach((p) => {
      const i = $('i', p);
      p.addEventListener('pointerenter', (e) => {
        const r = p.getBoundingClientRect();
        i.style.left = `${e.clientX - r.left}px`;
        i.style.top = `${e.clientY - r.top}px`;
      });
    });
    if (TOUCH || REDUCED) return;
    let hoverRound = false;
    round.addEventListener('pointerenter', () => { hoverRound = true; });
    round.addEventListener('pointerleave', () => { hoverRound = false; });
    addEventListener('pointermove', (e) => {
      const r = round.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = e.clientX - cx, dy = e.clientY - cy;
      const near = Math.hypot(dx, dy) < r.width * 1.1;
      if (near) round.style.transform = `translate(${dx * .28}px, ${dy * .28}px)${hoverRound ? ' scale(1.06) rotate(-4deg)' : ''}`;
      else if (round.style.transform) round.style.transform = '';
      pills.forEach((p) => {
        const b = p.getBoundingClientRect();
        if (b.bottom < 0 || b.top > innerHeight) return;
        const px = e.clientX - (b.left + b.width / 2), py = e.clientY - (b.top + b.height / 2);
        const d = Math.hypot(px, py);
        const within = d < 90 + b.width / 2;
        p.style.transform = within ? `translate(${px * .08}px, ${py * .12}px)` : '';
      });
    }, { passive: true });
  })();

  (function marquee() {
    const track = $('.m-track');
    const unit = () => track.firstElementChild.getBoundingClientRect().width;
    if (REDUCED) return;
    let x = 0, boost = 0, last = performance.now(), lastY = window.scrollY, on = false;
    const loop = (now) => {
      if (!on) return;
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      const y = window.scrollY;
      boost = boost * .92 + Math.abs(y - lastY) * .9; lastY = y;
      x -= (70 + boost * 6) * dt;
      const u = unit();
      if (u > 0 && -x >= u) x += u;
      track.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
      requestAnimationFrame(loop);
    };
    Site.marquee = (v) => {
      if (v === on) return;
      on = v;
      if (on) { last = performance.now(); requestAnimationFrame(loop); }
    };
  })();

  (function clock() {
    const el = $('#clock');
    const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const tick = () => { el.textContent = fmt.format(new Date()); };
    tick();
    setInterval(tick, 1000);
  })();

  /* ---------- Footer reveal ---------- */
  const page = $('.page'), foot = $('.foot'), footIn = $('.foot-in'), tools = $('.tools');
  let footGroup = null;
  scrollFns.push(() => {
    const pb = page.getBoundingClientRect().bottom;
    const h = foot.offsetHeight;
    const revealed = clamp((innerHeight - pb) / h, 0, 1);
    const curtain = getComputedStyle(foot).position === 'sticky';
    if (curtain && !REDUCED) footIn.style.transform = `translate3d(0, ${(-90 * (1 - revealed)).toFixed(1)}px, 0)`;
    else footIn.style.transform = '';
    if (Site.marquee) Site.marquee(revealed > 0);
    if (footGroup && revealed >= .18) footGroup.visible = true;
    tools.classList.toggle('away', revealed >= .45);
  });

  /* ---------- Contact window ---------- */
  const Modal = (function () {
    const wrap = $('.modal-wrap'), modal = $('.modal');
    const views = Object.fromEntries($$('[data-view]').map((v) => [v.dataset.view, v]));
    const inertTargets = [$('.stack'), nav, $('.tools')];
    let returnTo = null, lastMessage = '';
    const show = (name) => {
      Object.entries(views).forEach(([n, v]) => { v.hidden = n !== name; });
      modal.scrollTop = 0;
      const v = views[name];
      if (Site.engine) Site.engine.build(v);
      const first = v.querySelector('input, [data-go], a[href], button');
      requestAnimationFrame(() => (first && name !== 'status' ? first : modal).focus({ preventScroll: true }));
    };
    const open = (from) => {
      returnTo = from || document.activeElement;
      wrap.hidden = false;
      inertTargets.forEach((t) => { t.inert = true; });
      show('options');
    };
    const close = () => {
      if (wrap.hidden) return;
      wrap.hidden = true;
      inertTargets.forEach((t) => { t.inert = false; });
      if (returnTo && returnTo.focus) returnTo.focus({ preventScroll: true });
    };
    $$('[data-talk]').forEach((b) => b.addEventListener('click', () => open(b)));
    $('.m-x').addEventListener('click', close);
    $('.modal-dim').addEventListener('click', close);
    $('#m-done').addEventListener('click', close);
    $$('[data-go]').forEach((b) => b.addEventListener('click', () => show(b.dataset.go)));
    modal.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const f = $$('a[href], button, input, textarea', modal).filter((x) => x.offsetParent !== null);
      if (!f.length) return;
      const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === a || document.activeElement === modal)) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    });

    const form = views.form;
    const setErr = (field, on) => {
      const err = field.parentElement.querySelector('.err');
      err.hidden = !on;
      field.setAttribute('aria-invalid', String(on));
    };
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = form.elements;
      const name = f.name.value.trim(), mail = f.email.value.trim(), msg = f.message.value.trim();
      const bad = [[f.name, !name], [f.email, !/^\S+@\S+\.\S+$/.test(mail)], [f.message, !msg]];
      bad.forEach(([el, b]) => setErr(el, b));
      const firstBad = bad.find(([, b]) => b);
      if (firstBad) { firstBad[0].focus(); return; }
      lastMessage = `${msg}\n\n${name}\n${mail}`;
      show('status');
      const row = (k) => $(`[data-check=${k}]`);
      const set = (k, state, text) => {
        const st = $('.st', row(k));
        st.className = 'st ' + state;
        st.textContent = { ok: '✓', warn: '!', bad: '✕', busy: '' }[state];
        $('span', row(k)).textContent = text;
      };
      set('valid', 'busy', 'Checking.'); set('open', 'busy', 'Waiting.'); set('sent', 'busy', 'Waiting.');
      await sleep(350);
      set('valid', 'ok', 'Name, email and message are all there.');
      await sleep(350);
      const href = `mailto:${EMAIL}?subject=${encodeURIComponent('Portfolio message from ' + name)}&body=${encodeURIComponent(lastMessage)}`;
      location.href = href;
      set('open', 'warn', "Your browser was asked to open it, but browsers can't confirm that it did.");
      await sleep(300);
      set('sent', 'warn', `Not yet. This site has no server, so press send in your mail app, or copy the message to ${EMAIL}.`);
    });
    $('#m-copy').addEventListener('click', async (e) => {
      try {
        await navigator.clipboard.writeText(`To: ${EMAIL}\n\n${lastMessage}`);
        e.target.textContent = 'Copied';
      } catch (_) {
        e.target.textContent = 'Copy failed';
      }
    });
    return { close, isOpen: () => !wrap.hidden };
  })();

  /* ---------- Inspect and tools ---------- */
  const Inspect = (function () {
    const box = $('.inspect'), ibox = $('.ibox'), tag = $('.itag'), gx = $('.ig-x'), gy = $('.ig-y');
    const btn = $('#t-inspect');
    let on = false;
    const move = (e) => {
      const t = document.elementFromPoint(e.clientX, e.clientY);
      if (!t || t === document.documentElement) return;
      const r = t.getBoundingClientRect();
      ibox.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px`;
      gx.style.top = `${r.top}px`;
      gy.style.left = `${r.left}px`;
      tag.textContent = `${Math.round(r.width)} × ${Math.round(r.height)}`;
      tag.style.left = `${clamp(r.left, 4, innerWidth - 90)}px`;
      tag.style.top = `${clamp(r.top - 22, 4, innerHeight - 24)}px`;
    };
    const toggle = () => {
      if (TOUCH) return;
      on = !on;
      box.hidden = !on;
      btn.setAttribute('aria-pressed', String(on));
      if (on) addEventListener('pointermove', move, { passive: true });
      else removeEventListener('pointermove', move);
    };
    btn.addEventListener('click', toggle);
    return { toggle };
  })();

  const replay = () => {
    try { history.scrollRestoration = 'manual'; } catch (_) { /* no-op */ }
    scrollTo({ top: 0, behavior: 'instant' });
    if (location.hash) location.replace(location.pathname + location.search);
    else location.reload();
  };
  $('#t-replay').addEventListener('click', replay);

  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (Modal.isOpen()) { Modal.close(); return; }
      if (Site.engine) Site.engine.skip();
      return;
    }
    const t = e.target;
    if (t.matches && t.matches('input, textarea')) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'r' || e.key === 'R') replay();
    if (e.key === 'i' || e.key === 'I') Inspect.toggle();
  });

  /* ---------- Settled state, used by the quiet path and Skip ---------- */
  function settleAll() {
    Site.stats.settle();
    Site.findings.start();
    $('.tools').hidden = false;
    queueScroll();
  }

  if (QUIET || !root.classList.contains('building')) {
    window.__built = true;
    settleAll();
    runScroll();
    return;
  }

  /* =====================================================================
     Cursor engine: section 6, 7 and 8 of the spec
     ===================================================================== */
  Site.engine = (function engine() {
    const canvas = $('#cursors'), ctx = canvas.getContext('2d');
    let W = 0, H = 0, DPR = 1;
    const size = () => {
      DPR = Math.min(2, devicePixelRatio || 1);
      W = innerWidth; H = innerHeight;
      canvas.width = W * DPR; canvas.height = H * DPR;
      if (!raf) wake();
    };
    const ABORT = Symbol('abort');
    const PHONE = innerWidth < 620;
    const COLORS = ['#56e0ff', '#ffd24a', '#ff6bb0', '#9b7bff', '#ffffff'];
    const LABELS = ['React', 'API', 'Data', 'Agents', 'Mobile'];
    const cursors = COLORS.slice(0, PHONE ? 3 : 5).map((color, i) => ({
      i, color, label: LABELS[i], on: false, x: 0, y: 0, vx: 0, vy: 0, rot: 0,
      target: null, pin: null, arrive: null, topSpeed: 2100, gain: 8, busy: false, free: true, idleAt: 0,
      tool: 'arrow', toolAt: 0, icon: null, leaving: false, working: false,
    }));
    const overlays = new Set();
    let raf = 0, last = 0, stopped = false;

    function wake() { if (!raf && !stopped) { last = performance.now(); raf = requestAnimationFrame(frame); } }

    /* ---- Geometry ---- */
    const rectOf = (el) => {
      const r = el.getBoundingClientRect();
      return { left: r.left, top: r.top, w: r.width, h: r.height };
    };
    const rng = document.createRange();
    const textRect = (el) => {
      rng.selectNodeContents(el);
      const r = rng.getBoundingClientRect();
      return r.width ? { left: r.left, top: r.top, w: r.width, h: r.height } : rectOf(el);
    };
    const padded = (r, x, y) => ({ left: r.left - x, top: r.top - y, w: r.w + x * 2, h: r.h + y * 2 });
    const inView = (el) => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < H && r.right > 0 && r.left < W;
    };

    /* ---- Drawing ---- */
    const BLUE = '#2f9bff', FILL = 'rgba(47,155,255,.09)', TAGBG = '#1a86e8';
    function handles(r) {
      ctx.fillStyle = '#fff'; ctx.strokeStyle = BLUE; ctx.lineWidth = 1;
      [[r.left, r.top], [r.left + r.w, r.top], [r.left, r.top + r.h], [r.left + r.w, r.top + r.h]].forEach(([x, y]) => {
        ctx.fillRect(x - 3, y - 3, 6, 6); ctx.strokeRect(x - 3, y - 3, 6, 6);
      });
    }
    function sizeTag(r) {
      const s = `${Math.round(r.w)} × ${Math.round(r.h)}`;
      ctx.font = '600 10px "Inter Tight", sans-serif';
      const w = ctx.measureText(s).width + 10;
      const x = r.left + r.w / 2 - w / 2, y = r.top + r.h + 6;
      ctx.fillStyle = TAGBG;
      ctx.beginPath(); ctx.roundRect(x, y, w, 16, 3); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
      ctx.fillText(s, x + w / 2, y + 8.5);
      ctx.textAlign = 'left';
    }
    function ovBox(getRect, o = {}) {
      const ov = {
        p: 0, alpha: 1, tag: !!o.tag, fill: !!o.fill, handles: o.handles !== false, guides: !!o.guides, fadeAt: 0, fadeMs: 240,
        draw(now) {
          if (ov.fadeAt && now >= ov.fadeAt) {
            ov.alpha = 1 - (now - ov.fadeAt) / ov.fadeMs;
            if (ov.alpha <= 0) { ov.dead = true; return; }
          }
          const full = getRect();
          const r = { left: full.left, top: full.top, w: full.w * ov.p, h: full.h * ov.p };
          ctx.globalAlpha = ov.alpha;
          if (ov.guides) {
            ctx.strokeStyle = 'rgba(47,155,255,.4)'; ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, r.top + .5); ctx.lineTo(W, r.top + .5);
            ctx.moveTo(0, r.top + r.h + .5); ctx.lineTo(W, r.top + r.h + .5);
            ctx.stroke();
          }
          if (ov.fill) { ctx.fillStyle = FILL; ctx.fillRect(r.left, r.top, r.w, r.h); }
          ctx.strokeStyle = BLUE; ctx.lineWidth = 1;
          ctx.strokeRect(r.left + .5, r.top + .5, r.w, r.h);
          if (ov.handles) handles(r);
          if (ov.tag) sizeTag(r);
          ctx.globalAlpha = 1;
        },
        fade(after, ms) { ov.fadeMs = ms; ov.fadeAt = performance.now() + after; },
      };
      overlays.add(ov); wake();
      return ov;
    }
    const periPoint = (r, t) => {
      const per = 2 * (r.w + r.h);
      let d = t * per;
      if (d < r.w) return { x: r.left + d, y: r.top };
      d -= r.w;
      if (d < r.h) return { x: r.left + r.w, y: r.top + d };
      d -= r.h;
      if (d < r.w) return { x: r.left + r.w - d, y: r.top + r.h };
      d -= r.w;
      return { x: r.left, y: r.top + r.h - d };
    };
    function ovTrace(getRect, o = {}) {
      const ov = {
        p: 0, alpha: o.alpha || .9, base: o.alpha || .9, color: o.color || BLUE, fadeAt: 0, fadeMs: 240,
        draw(now) {
          if (ov.fadeAt && now >= ov.fadeAt) {
            ov.alpha = ov.base * (1 - (now - ov.fadeAt) / ov.fadeMs);
            if (ov.alpha <= 0) { ov.dead = true; return; }
          }
          const r = getRect();
          ctx.globalAlpha = ov.alpha;
          ctx.strokeStyle = ov.color; ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(r.left, r.top);
          const per = 2 * (r.w + r.h), d = ov.p * per;
          let run = 0;
          const pts = [[r.left + r.w, r.top, r.w], [r.left + r.w, r.top + r.h, r.h], [r.left, r.top + r.h, r.w], [r.left, r.top, r.h]];
          for (const [x, y, len] of pts) {
            if (run + len <= d) { ctx.lineTo(x, y); run += len; continue; }
            const q = periPoint(r, ov.p);
            ctx.lineTo(q.x, q.y);
            break;
          }
          ctx.stroke();
          ctx.globalAlpha = 1;
        },
        fade(after, ms) { ov.fadeMs = ms; ov.fadeAt = performance.now() + after; },
      };
      overlays.add(ov); wake();
      return ov;
    }
    function ovRipple(x, y, color) {
      const t0 = performance.now();
      const ov = {
        draw(now) {
          const t = (now - t0) / 360;
          if (t >= 1) { ov.dead = true; return; }
          ctx.globalAlpha = 1 - t;
          ctx.strokeStyle = color; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(x, y, 3 + easeOut(t) * 20, 0, Math.PI * 2); ctx.stroke();
          ctx.globalAlpha = 1;
        },
      };
      overlays.add(ov); wake();
    }
    function ovTape(el) {
      const ov = {
        p: 0, alpha: 1, fadeAt: 0, fadeMs: 220,
        draw(now) {
          if (ov.fadeAt && now >= ov.fadeAt) {
            ov.alpha = 1 - (now - ov.fadeAt) / ov.fadeMs;
            if (ov.alpha <= 0) { ov.dead = true; return; }
          }
          const r = rectOf(el);
          const w = r.w * ov.p, y = r.top + r.h + 2;
          ctx.globalAlpha = ov.alpha;
          ctx.fillStyle = '#ffd24a'; ctx.fillRect(r.left, y, w, 9);
          ctx.strokeStyle = '#16120a'; ctx.lineWidth = 1;
          ctx.beginPath();
          for (let x = 0; x <= w; x += 5) {
            const h = x % 25 === 0 ? 6 : 3;
            ctx.moveTo(r.left + x + .5, y); ctx.lineTo(r.left + x + .5, y + h);
          }
          ctx.stroke();
          const s = `${Math.round(w)} px`;
          ctx.font = '700 10px "Inter Tight", sans-serif';
          const tw = ctx.measureText(s).width + 8;
          ctx.fillStyle = '#ffd24a';
          ctx.beginPath(); ctx.roundRect(r.left + w - tw / 2, y + 12, tw, 14, 3); ctx.fill();
          ctx.fillStyle = '#16120a'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
          ctx.fillText(s, r.left + w, y + 19.5);
          ctx.textAlign = 'left';
          ctx.globalAlpha = 1;
        },
        fade(after, ms) { ov.fadeMs = ms; ov.fadeAt = performance.now() + after; },
      };
      overlays.add(ov); wake();
      return ov;
    }
    function ovSelect(getRect) {
      const ov = {
        p: 0, alpha: 1, fadeAt: 0,
        draw(now) {
          if (ov.fadeAt && now >= ov.fadeAt) {
            ov.alpha = 1 - (now - ov.fadeAt) / 200;
            if (ov.alpha <= 0) { ov.dead = true; return; }
          }
          const r = getRect();
          ctx.globalAlpha = ov.alpha;
          ctx.fillStyle = 'rgba(47,155,255,.42)';
          ctx.fillRect(r.left, r.top, r.w * ov.p, r.h);
          ctx.globalAlpha = 1;
        },
        fade(after) { ov.fadeAt = performance.now() + after; },
      };
      overlays.add(ov); wake();
      return ov;
    }
    function ovEdge(el) {
      const ov = {
        p: 0, draw() {
          const r = rectOf(el), x = r.left + r.w * ov.p;
          const g = ctx.createLinearGradient(x - 60, 0, x, 0);
          g.addColorStop(0, 'rgba(229,35,59,0)'); g.addColorStop(1, 'rgba(229,35,59,.35)');
          ctx.fillStyle = g; ctx.fillRect(x - 60, r.top, 60, r.h);
          ctx.fillStyle = '#e5233b'; ctx.fillRect(x - 1.500, r.top, 3, r.h);
        },
      };
      overlays.add(ov); wake();
      return ov;
    }
    const rulers = {
      alpha: 1, fadeAt: 0,
      draw(now) {
        if (rulers.fadeAt && now >= rulers.fadeAt) {
          rulers.alpha = 1 - (now - rulers.fadeAt) / 400;
          if (rulers.alpha <= 0) { rulers.dead = true; return; }
        }
        ctx.globalAlpha = rulers.alpha;
        ctx.fillStyle = 'rgba(13,15,21,.92)';
        ctx.fillRect(0, 0, W, 12); ctx.fillRect(0, 0, 12, H);
        ctx.strokeStyle = '#3a3f4c'; ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 50; x < W; x += 50) { ctx.moveTo(x + .5, 5); ctx.lineTo(x + .5, 12); }
        for (let y = 50; y < H; y += 50) { ctx.moveTo(5, y + .5); ctx.lineTo(12, y + .5); }
        ctx.stroke();
        ctx.globalAlpha = 1;
      },
    };
    const monogram = {
      draw(now) {
        const t = clamp((now - monogram.t0) / 180, 0, 1);
        const out = monogram.outAt ? clamp((now - monogram.outAt) / 180, 0, 1) : 0;
        if (out >= 1) { monogram.dead = true; return; }
        ctx.globalAlpha = t * (1 - out);
        ctx.font = '400 44px Anton, Impact, sans-serif';
        ctx.fillStyle = '#f2f3f5'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('LC', W / 2 - 4, H / 2);
        ctx.fillStyle = '#e5233b';
        ctx.fillText('.', W / 2 + 28, H / 2);
        ctx.textAlign = 'left';
        ctx.globalAlpha = 1;
      },
    };

    const ARROW = new Path2D('M0 0V13L3.400 10L5.600 15L7.600 14L5.400 9.200H10Z');
    const ICONS = {
      Move: 'M5 3v14l4-3.500 2.500 6 2.500-1-2.500-6H17Z',
      Frame: 'M4 4h16v16H4Z',
      Text: 'M5 6V4h14v2M12 4v16M9 20h6',
      Image: 'M4 5h16v14H4ZM4 16l5-5 4 4 2-2 5 5M15.500 9a1 1 0 1 0 0 .1',
      Shape: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z',
      Pen: 'M4 20l2-6L16 4l4 4-10 10ZM14 6l4 4',
      Ruler: 'M3 16 16 3l5 5L8 21ZM7 12l2 2M10 9l3 3M13 6l2 2',
      Comment: 'M4 5h16v11H9l-5 4Z',
    };
    const iconPaths = Object.fromEntries(Object.entries(ICONS).map(([k, d]) => [k, new Path2D(d)]));

    function drawCursor(c, now, dt) {
      const speed = Math.hypot(c.vx, c.vy);
      let want = 0;
      if (speed > 80 && c.tool === 'arrow') want = Math.atan2(c.vy, c.vx) + 2.094;
      let diff = want - c.rot;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      c.rot += diff * Math.min(1, dt * 10);
      const s = lerp(.5, 1, clamp((now - c.toolAt) / 110, 0, 1));
      ctx.save();
      ctx.translate(c.x, c.y);
      if (c.tool === 'arrow') {
        ctx.rotate(c.rot); ctx.scale(s, s);
        ctx.fillStyle = c.color; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.1; ctx.lineJoin = 'round';
        ctx.fill(ARROW); ctx.stroke(ARROW);
      } else if (c.tool === 'ibeam') {
        ctx.scale(s, s);
        const beam = () => {
          ctx.beginPath();
          ctx.moveTo(-4, -9); ctx.quadraticCurveTo(0, -9, 0, -6); ctx.quadraticCurveTo(0, -9, 4, -9);
          ctx.moveTo(0, -6); ctx.lineTo(0, 6);
          ctx.moveTo(-4, 9); ctx.quadraticCurveTo(0, 9, 0, 6); ctx.quadraticCurveTo(0, 9, 4, 9);
          ctx.stroke();
        };
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#0a0b0e'; ctx.lineWidth = 3.4; beam();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; beam();
      } else if (c.tool === 'tape') {
        ctx.scale(s, s);
        ctx.fillStyle = '#ffd24a'; ctx.strokeStyle = '#16120a'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.roundRect(-14, -13, 15, 15, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#16120a';
        ctx.beginPath(); ctx.arc(-6.5, -5.500, 2.4, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
      if (c.icon && iconPaths[c.icon]) {
        ctx.save();
        ctx.translate(c.x + 12, c.y - 22);
        ctx.fillStyle = TAGBG;
        ctx.beginPath(); ctx.roundRect(0, 0, 18, 18, 4); ctx.fill();
        ctx.translate(2.5, 2.5); ctx.scale(.54, .54);
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.stroke(iconPaths[c.icon]);
        ctx.restore();
      }
      if (c.working) {
        ctx.font = '700 10px "Inter Tight", sans-serif';
        const w = ctx.measureText(c.label).width + 10;
        const x = c.x + 10, y = c.y + 15;
        ctx.fillStyle = c.color;
        ctx.beginPath(); ctx.roundRect(x, y, w, 15, 4); ctx.fill();
        ctx.fillStyle = '#07080b'; ctx.textBaseline = 'middle';
        ctx.fillText(c.label, x + 5, y + 8);
      }
    }

    function stepCursor(c, dt) {
      if (c.pin) {
        const p = c.pin();
        if (dt > 0) {
          // Cap at top speed: a fast trace must not fling the cursor when the pin is released.
          const k = Math.min(1, c.topSpeed / (Math.hypot(p.x - c.x, p.y - c.y) / dt || 1));
          c.vx = ((p.x - c.x) / dt) * k; c.vy = ((p.y - c.y) / dt) * k;
        }
        c.x = p.x; c.y = p.y;
        return;
      }
      const t = c.target ? c.target() : null;
      if (!t) return;
      const dx = t.x - c.x, dy = t.y - c.y;
      let dvx = dx * c.gain, dvy = dy * c.gain;
      const sp = Math.hypot(dvx, dvy);
      if (sp > c.topSpeed) { dvx *= c.topSpeed / sp; dvy *= c.topSpeed / sp; }
      const k = Math.min(1, dt * 14);
      c.vx += (dvx - c.vx) * k; c.vy += (dvy - c.vy) * k;
      c.x += c.vx * dt; c.y += c.vy * dt;
      if (Math.hypot(t.x - c.x, t.y - c.y) < 22 && c.arrive) { const a = c.arrive; c.arrive = null; a(); }
      if (c.leaving && (c.x < -30 || c.y < -30 || c.x > W + 30 || c.y > H + 30)) {
        c.on = false; c.leaving = false; c.target = null; c.vx = c.vy = 0; c.icon = null;
      }
    }

    function frame(now) {
      raf = 0;
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);
      overlays.forEach((o) => { o.draw(now); if (o.dead) overlays.delete(o); });
      cursors.forEach((c) => { if (c.on) { stepCursor(c, dt); drawCursor(c, now, dt); } });
      if (overlays.size || cursors.some((c) => c.on)) raf = requestAnimationFrame(frame);
    }

    /* ---- Cursor actions ---- */
    const nearestEdge = (p) => {
      const opts = [[p.x, -24, p.y], [p.x, H + 24, H - p.y], [-24, p.y, p.x], [W + 24, p.y, W - p.x]];
      opts.sort((a, b) => a[2] - b[2]);
      return { x: opts[0][0], y: opts[0][1] };
    };
    function enter(c, p) {
      c.leaving = false;
      if (!c.on) { const e = nearestEdge(p); c.x = e.x; c.y = e.y; c.vx = c.vy = 0; c.on = true; c.rot = 0; wake(); }
    }
    function leave(c) {
      if (!c.on || c.leaving) return;
      const e = nearestEdge({ x: c.x, y: c.y });
      const out = { x: e.x + Math.sign(e.x - c.x) * 60, y: e.y + Math.sign(e.y - c.y) * 60 };
      c.leaving = true; c.pin = null; c.target = () => out; c.arrive = null;
      c.icon = null;
    }
    function fly(job, c, getPt, maxMs = 1100, top = 2100) {
      job.check();
      // The contact window builds faster than page blocks, so its hops are quicker too.
      c.pin = null; c.topSpeed = top; c.gain = job.speed > 2 ? 20 : 8; c.target = getPt; wake();
      return new Promise((res) => {
        let done = false;
        const fin = () => { if (done) return; done = true; c.arrive = null; res(); };
        c.arrive = fin;
        setTimeout(fin, maxMs);
        job.onAbort(fin);
      }).then(() => job.check());
    }
    function setTool(c, name) { if (c.tool !== name) { c.tool = name; c.toolAt = performance.now(); } }
    function tween(job, ms, fn) {
      job.check();
      return new Promise((res) => {
        const t0 = performance.now();
        let done = false;
        const tick = (now) => {
          if (done) return;
          const t = clamp((now - t0) / ms, 0, 1);
          fn(t);
          wake();
          if (t >= 1) { done = true; res(); return; }
          requestAnimationFrame(tick);
        };
        job.onAbort(() => { done = true; res(); });
        requestAnimationFrame(tick);
      }).then(() => job.check());
    }
    const wait = (job, ms) => {
      job.check();
      return new Promise((res) => { setTimeout(res, ms); job.onAbort(res); }).then(() => job.check());
    };

    /* ---- Text: split, type, restore ---- */
    function splitText(el) {
      if (el._orig != null) return;
      el._orig = el.innerHTML;
      if (/^H[1-6]$/.test(el.tagName) || el.classList.contains('close-h')) el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      const chars = [];
      nodes.forEach((n) => {
        const frag = document.createDocumentFragment();
        for (const ch of n.nodeValue) {
          if (/\s/.test(ch)) { frag.appendChild(document.createTextNode(ch)); continue; }
          const s = document.createElement('span');
          s.className = 'ch'; s.setAttribute('aria-hidden', 'true'); s.textContent = ch;
          frag.appendChild(s); chars.push(s);
        }
        n.parentNode.replaceChild(frag, n);
      });
      el._chars = chars;
    }
    function restoreText(el) {
      if (el._orig == null) return;
      el.innerHTML = el._orig;
      el._orig = null; el._chars = null;
      el.removeAttribute('aria-label');
    }
    function typeText(el, speed) {
      const chars = el._chars || [];
      if (!chars.length) { restoreText(el); return Promise.resolve(); }
      const large = parseFloat(getComputedStyle(el).fontSize) >= 36;
      const per = large ? 40 : 13;
      const total = clamp(chars.length * per, large ? 260 : 155, large ? 560 : 450) / speed;
      const step = total / chars.length;
      chars.forEach((s, i) => {
        s.style.animation = `chtype 1ms linear ${(i * step).toFixed(1)}ms forwards, typecaret ${Math.max(step, 30).toFixed(1)}ms linear ${(i * step).toFixed(1)}ms`;
      });
      return sleep(total + 40).then(() => restoreText(el));
    }

    /* ---- Steps ---- */
    async function stepText(job, c, el) {
      const hasAccent = !!el.querySelector('.accent');
      if (hasAccent) el.classList.add('accent-wait');
      splitText(el);
      el.classList.add('b-done');
      const tr = () => padded(textRect(el), 6, 3);
      await fly(job, c, () => { const r = tr(); return { x: r.left, y: r.top }; });
      setTool(c, 'ibeam');
      const r0 = tr();
      const dur = clamp(Math.sqrt(r0.w * r0.h) * 1.4, 170, 300) / job.speed;
      const box = ovBox(tr, { tag: true });
      job.track(box);
      c.pin = () => { const r = tr(); return { x: r.left + r.w * box.p, y: r.top + r.h * box.p }; };
      await tween(job, dur, (t) => { box.p = easeOut(t); });
      box.p = 1; box.tag = false;
      c.pin = null;
      ovRipple(c.x, c.y, c.color);
      const typed = typeText(el, job.speed).then(() => box.fade(160, 240));
      job.markPaint();
      await wait(job, 130);
      setTool(c, 'arrow');
      if (hasAccent) {
        await typed;
        job.check();
        const accent = el.querySelector('.accent');
        const ar = () => rectOf(accent);
        await fly(job, c, () => { const r = ar(); return { x: r.left, y: r.top + r.h / 2 }; }, 500);
        setTool(c, 'ibeam');
        const sel = ovSelect(ar);
        job.track(sel);
        c.pin = () => { const r = ar(); return { x: r.left + r.w * sel.p, y: r.top + r.h / 2 }; };
        await tween(job, 170, (t) => { sel.p = t; });
        c.pin = null;
        el.classList.remove('accent-wait');
        sel.fade(120);
        setTool(c, 'arrow');
      }
    }

    async function stepBtn(job, c, el) {
      if (job.tape >= 6) return selfWipe(el);
      job.tape++;
      el.style.clipPath = 'inset(-14px 100% -14px -2px)';
      el.classList.add('b-done');
      const pt = () => { const r = rectOf(el); return { x: r.left, y: r.top + r.h + 6 }; };
      await fly(job, c, pt);
      setTool(c, 'tape');
      const tape = ovTape(el);
      job.track(tape);
      const w = rectOf(el).w;
      const dur = clamp(w * 1.9, 240, 480) / job.speed;
      c.pin = () => { const r = rectOf(el); return { x: r.left + r.w * tape.p, y: r.top + r.h + 6 }; };
      job.markPaint();
      await tween(job, dur, (t) => {
        tape.p = t;
        el.style.clipPath = `inset(-14px ${(100 - t * 100).toFixed(1)}% -14px -2px)`;
      });
      el.style.clipPath = '';
      c.pin = null;
      tape.fade(0, 220);
      await wait(job, 90);
      setTool(c, 'arrow');
    }
    function selfWipe(el) {
      el.classList.add('b-done');
      el.animate([{ clipPath: 'inset(-14px 100% -14px -2px)' }, { clipPath: 'inset(-14px 0% -14px -2px)' }], { duration: 300, easing: 'cubic-bezier(.65,0,.35,1)' });
    }

    const WIPES = {
      diag: [{ clipPath: 'polygon(0 0, 0% 0, 0 0%)' }, { clipPath: 'polygon(0 0, 200% 0, 0 200%)' }],
      top: [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)' }],
      circle: [{ clipPath: 'circle(0% at 100% 100%)' }, { clipPath: 'circle(150% at 100% 100%)' }],
      left: [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }],
    };

    async function stepBox(job, c, el) {
      const r = rectOf(el);
      const area = r.w * r.h;
      if (area >= 70000 || el.dataset.wipe === 'circle') return boxLarge(job, c, el);
      if (area >= 6000) return boxMedium(job, c, el);
      return boxSmall(job, c, el);
    }
    async function boxLarge(job, c, el) {
      const get = () => rectOf(el);
      await fly(job, c, () => { const r = get(); return { x: r.left, y: r.top }; });
      const r0 = get();
      const box = ovBox(get, { tag: true, fill: true, guides: 'guides' in el.dataset });
      job.track(box);
      const dur = clamp(Math.sqrt(r0.w * r0.h) * .55, 240, 440) / job.speed;
      c.pin = () => { const r = get(); return { x: r.left + r.w * box.p, y: r.top + r.h * box.p }; };
      await tween(job, dur, (t) => { box.p = easeInOut(t); });
      box.p = 1; box.tag = false;
      c.pin = null;
      el.classList.add('b-done');
      job.markPaint();
      const kind = el.dataset.wipe || 'top';
      const wipeMs = 420 / job.speed;
      if (kind === 'left') {
        const edge = ovEdge(el);
        job.track(edge);
        const e0 = performance.now();
        const tick = (now) => { edge.p = clamp((now - e0) / wipeMs, 0, 1); if (edge.p < 1 && !edge.dead) requestAnimationFrame(tick); else edge.dead = true; };
        requestAnimationFrame(tick);
      }
      el.animate(WIPES[kind], { duration: wipeMs, easing: 'cubic-bezier(.65,0,.35,1)' });
      if (kind !== 'circle') el.animate([{ transform: 'scale(.985)' }, { transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.2,.9,.25,1)', composite: 'add' });
      box.fade(wipeMs * .7, 200);
      await wait(job, 90);
    }
    async function boxMedium(job, c, el) {
      const get = () => rectOf(el);
      await fly(job, c, () => { const r = get(); return { x: r.left, y: r.top }; });
      const tr = ovTrace(get);
      job.track(tr);
      c.pin = () => periPoint(get(), tr.p);
      await tween(job, 260 / job.speed, (t) => { tr.p = t; });
      c.pin = null;
      el.classList.add('b-done');
      job.markPaint();
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240 });
      tr.fade(120, 200);
    }
    async function boxSmall(job, c, el) {
      await fly(job, c, () => { const r = rectOf(el); return { x: r.left + r.w / 2, y: r.top + r.h / 2 }; });
      ovRipple(c.x, c.y, c.color);
      el.classList.add('b-done');
      job.markPaint();
      el.animate([{ transform: 'scale(.6)', opacity: 0 }, { transform: 'scale(1.08)', opacity: 1, offset: .7 }, { transform: 'none', opacity: 1 }], { duration: 280, easing: 'cubic-bezier(.2,.8,.2,1)' });
      await wait(job, 60);
    }
    async function stepTrace(job, c, el) {
      const get = () => padded(rectOf(el), 3, 2);
      await fly(job, c, () => { const r = get(); return { x: r.left, y: r.top }; });
      const tr = ovTrace(get, { alpha: .45 });
      job.track(tr);
      c.pin = () => periPoint(get(), tr.p);
      await tween(job, 130 / job.speed, (t) => { tr.p = t; });
      c.pin = null;
      el.classList.add('b-done');
      job.markPaint();
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180 });
      tr.fade(60, 160);
    }
    const POPS = {
      chip: [[{ transform: 'scale(.6)', opacity: 0 }, { transform: 'scale(1.08)', opacity: 1, offset: .7 }, { transform: 'none', opacity: 1 }], 420, 'cubic-bezier(.2,1.2,.3,1)'],
      tag: [[{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], 380, 'cubic-bezier(.65,0,.35,1)'],
      mark: [[{ transform: 'rotate(-14deg) scale(.7)', opacity: 0 }, { transform: 'none', opacity: 1 }], 500, 'cubic-bezier(.2,1.2,.3,1)'],
      navlink: [[{ transform: 'translateY(-10px)', opacity: 0 }, { transform: 'none', opacity: 1 }], 380, 'cubic-bezier(.2,.8,.2,1)'],
      land: [[{ transform: 'translateY(16px)', opacity: 0 }, { transform: 'translateY(-3px)', opacity: 1, offset: .75 }, { transform: 'none', opacity: 1 }], 480, 'cubic-bezier(.2,.8,.2,1)'],
    };
    function pop(el, i, stagger = 55) {
      const [kf, dur, easing] = POPS[el.dataset.pop] || POPS.chip;
      el.classList.add('b-done');
      el.animate(kf, { duration: dur, delay: i * stagger, easing, fill: 'backwards' });
    }
    async function stepCurtain(job, c, el) {
      await fly(job, c, () => { const r = rectOf(el); return { x: r.left, y: r.top + r.h }; }, 700);
      let prog = 0;
      c.pin = () => { const q = rectOf(el); return { x: q.left + q.w * prog, y: q.top + q.h * (1 - prog) }; };
      el.classList.add('b-done');
      job.markPaint();
      const dur = 460 / job.speed;
      el.animate([{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: dur, easing: 'cubic-bezier(.65,0,.35,1)' });
      await tween(job, dur, (t) => { prog = t; });
      c.pin = null;
    }
    async function stepStats(job, c, el) {
      const get = () => rectOf(el);
      await fly(job, c, () => { const r = get(); return { x: r.left, y: r.top }; });
      const tr = ovTrace(get);
      job.track(tr);
      c.pin = () => periPoint(get(), tr.p);
      await tween(job, 260 / job.speed, (t) => { tr.p = t; });
      c.pin = null;
      el.classList.add('b-done');
      job.markPaint();
      Site.stats.play();
      job.fxDone = true;
      tr.fade(80, 200);
    }
    async function stepSign(job, c, el) {
      const get = () => rectOf(el);
      el.classList.add('b-done');
      el.style.clipPath = 'inset(-20% 100% -20% 0)';
      await fly(job, c, () => { const r = get(); return { x: r.left, y: r.top + r.h * .6 }; }, 700);
      job.markPaint();
      let p = 0;
      c.pin = () => { const r = get(); return { x: r.left + r.w * p, y: r.top + r.h * .55 + Math.sin(p * 34) * r.h * .14 + Math.sin(p * 11) * 4 }; };
      await tween(job, 1500 / Math.min(job.speed, 1.25), (t) => {
        p = t;
        el.style.clipPath = `inset(-20% ${(100 - t * 100).toFixed(1)}% -20% 0)`;
      });
      el.style.clipPath = '';
      c.pin = null;
    }

    /* ---- Tool dock ---- */
    const dock = $('.dock');
    const dockSpans = {};
    let dockOn = !PHONE && innerWidth > 900;
    function buildDock() {
      if (!dockOn) return;
      Object.keys(ICONS).forEach((name) => {
        const s = document.createElement('span');
        s.innerHTML = `<svg viewBox="0 0 24 24"><path d="${ICONS[name]}"/></svg>${name}`;
        dock.appendChild(s);
        dockSpans[name] = s;
      });
      dock.hidden = false;
    }
    function dropDock() {
      if (!dockOn) return;
      dockOn = false;
      dock.classList.add('gone');
      setTimeout(() => { dock.hidden = true; }, 500);
    }
    async function pickTool(job, c, name) {
      if (!name || c.icon === name) return;
      if (!dockOn || !dockSpans[name]) { c.icon = dockOn ? name : null; return; }
      const span = dockSpans[name];
      await fly(job, c, () => { const r = span.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, 560, 2700);
      span.classList.add('on');
      setTimeout(() => span.classList.remove('on'), 260);
      c.icon = name;
    }

    /* ---- Groups and scheduler ---- */
    const groups = [];
    let heroLeft = 0, heroReady = false, roleStarted = false, partN = 1;
    const partEl = $('#build-n');
    const stepPart = () => { partN = Math.min(9, partN + 1); partEl.textContent = partN; };

    function revealStep(el) {
      if (el._orig != null) restoreText(el);
      el.classList.remove('accent-wait');
      el.style.clipPath = '';
      el.classList.add('b-done');
    }
    function makeGroup(el, o = {}) {
      const steps = $$('[data-b]', el);
      if (el.dataset.b) steps.unshift(el);
      const g = {
        el, steps, state: 'waiting', visible: false, seenAt: 0, claimedAt: 0, job: null,
        speed: o.speed || 1.7, hero: 'hero' in el.dataset, tool: el.dataset.tool || null,
        afterRole: 'afterRole' in el.dataset, fx: el.dataset.fx || null, painted: false, manual: !!o.manual,
      };
      groups.push(g);
      return g;
    }
    function finishGroup(g) {
      if (g.state === 'done') return;
      g.steps.forEach(revealStep);
      g.state = 'done';
      if (g.fx === 'stats') { if (!(g.job && g.job.fxDone)) Site.stats.settle(); }
      if (g.fx === 'findings') Site.findings.start();
      if (g.hero) {
        heroLeft--;
        if (heroLeft === 0) heroFinished();
      }
    }
    function makeJob(g) {
      const aborts = [], tracked = new Set();
      const job = {
        alive: true, speed: g.speed, tape: 0, fxDone: false,
        check() { if (!job.alive) throw ABORT; },
        onAbort(f) { aborts.push(f); },
        abort() {
          if (!job.alive) return;
          job.alive = false;
          aborts.splice(0).forEach((f) => f());
          tracked.forEach((o) => { if (o.fade) o.fade(0, 160); else o.dead = true; });
        },
        track(o) { tracked.add(o); },
        markPaint() { g.state = 'painting'; g.painted = true; },
      };
      return job;
    }
    async function runGroup(g, c) {
      c.free = false; c.working = true; c.leaving = false;
      const job = makeJob(g);
      g.job = job; g.state = 'claimed'; g.claimedAt = performance.now();
      const first = g.steps.find((s) => s.dataset.b !== 'pop') || g.el;
      const r0 = rectOf(first);
      enter(c, { x: r0.left, y: r0.top });
      try {
        let popI = 0, curTool = g.tool;
        await pickTool(job, c, g.tool);
        for (const el of g.steps) {
          job.check();
          const kind = el.dataset.b;
          if (kind === 'pop') { pop(el, popI++); continue; }
          popI = 0;
          if (!inView(el)) { revealStep(el); if ('part' in el.dataset) stepPart(); continue; }
          if (el.dataset.tool && el.dataset.tool !== curTool) { curTool = el.dataset.tool; await pickTool(job, c, curTool); }
          g.painted = true;
          if (g.state === 'claimed') g.state = 'painting';
          if ('roleLine' in el.dataset) roleStarted = true;
          if (kind === 'text') await stepText(job, c, el);
          else if (kind === 'btn') await stepBtn(job, c, el);
          else if (kind === 'box') await stepBox(job, c, el);
          else if (kind === 'trace') await stepTrace(job, c, el);
          else if (kind === 'curtain') await stepCurtain(job, c, el);
          else if (kind === 'stats') await stepStats(job, c, el);
          else if (kind === 'sign') await stepSign(job, c, el);
          if ('part' in el.dataset) stepPart();
        }
      } catch (e) {
        if (e !== ABORT) console.error(e);
      } finally {
        c.pin = null; c.target = null; setTool(c, 'arrow');
        c.working = false; c.free = true; c.idleAt = performance.now();
        c.icon = g.hero ? c.icon : null;
        finishGroup(g);
      }
    }

    const freeCursor = () => cursors.find((x) => x.free && x.on && !x.leaving) || cursors.find((x) => x.free);
    let ticker = 0;
    function tick() {
      const now = performance.now();
      for (const g of groups) {
        if (g.state === 'done') continue;
        if (g.hero && !heroReady) continue;
        if (g.afterRole && !roleStarted) continue;
        if (g.visible && !g.seenAt) g.seenAt = now;
        if (g.state === 'waiting') {
          if (!g.visible) continue;
          if (now - g.seenAt > 1800) { finishGroup(g); continue; }
          const c = freeCursor();
          if (c) runGroup(g, c);
        } else if (g.state === 'claimed') {
          if (!g.painted && now - g.claimedAt > 1300 + (g.hero ? 700 : 0)) g.job.abort();
          if (!g.visible && !g.manual) g.job.abort();
        } else if (g.state === 'painting') {
          if (!g.visible && !g.manual) g.job.abort();
        }
      }
      cursors.forEach((c) => {
        if (c.free && c.on && !c.leaving && now - c.idleAt > 180) leave(c);
      });
    }

    const groupIO = new IntersectionObserver((es) => {
      es.forEach((e) => {
        const g = e.target._g;
        if (g) g.visible = e.isIntersecting;
      });
    }, { rootMargin: '-4% 0px -8% 0px', threshold: 0 });

    /* ---- Rides ---- */
    const rideIO = new IntersectionObserver((es) => {
      const hits = es.filter((e) => e.isIntersecting).map((e) => e.target);
      let lastTop = null, delay = 0;
      hits.forEach((row, i) => {
        rideIO.unobserve(row);
        const top = row.getBoundingClientRect().top;
        if (i > 0) delay += lastTop !== null && Math.abs(top - lastTop) < 4 ? 70 : 130;
        lastTop = top;
        row.style.animationDelay = `${delay}ms`;
        row.classList.add('b-done', 'ride');
        const clean = () => { row.classList.remove('ride'); row.style.animationDelay = ''; };
        setTimeout(clean, 1700 + delay);
        rideTrace(row, delay);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });

    function rideTrace(row, delay) {
      const startBy = performance.now() + 500 + delay;
      const attempt = () => {
        if (stopped) return;
        const c = cursors.find((x) => x.free);
        if (!c || !inView(row)) {
          if (performance.now() < startBy) setTimeout(attempt, 120);
          return;
        }
        const job = makeJob({ speed: 1 });
        c.free = false; c.working = true; c.leaving = false;
        const get = () => padded(rectOf(row), 1, 0);
        const r0 = get();
        enter(c, { x: r0.left, y: r0.top });
        (async () => {
          await fly(job, c, () => { const r = get(); return { x: r.left, y: r.top }; }, 420);
          const tr = ovTrace(get, { alpha: .6 });
          c.pin = () => periPoint(get(), tr.p);
          await tween(job, 900, (t) => { tr.p = t; });
          tr.fade(0, 200);
        })().catch(() => {}).finally(() => {
          c.pin = null; c.target = null; c.working = false; c.free = true; c.idleAt = performance.now();
        });
      };
      setTimeout(attempt, delay);
    }

    /* ---- Page start ---- */
    const pillEl = $('.pill-build');
    let heroClosed = false;
    function heroFinished() {
      if (heroClosed) return;
      heroClosed = true;
      rulers.fadeAt = performance.now() + 120;
      setTimeout(() => { pillEl.hidden = true; }, 260);
      setTimeout(dropDock, 450);
      const g = $('.h-glow');
      g.classList.add('flash');
      setTimeout(() => g.classList.remove('flash'), 1600);
      $('.tools').hidden = false;
      queueScroll();
    }

    async function start() {
      window.__built = true;
      pillEl.hidden = false;
      buildDock();
      size();
      addEventListener('resize', size, { passive: true });

      $$('[data-group]').forEach((el) => {
        const g = makeGroup(el, { speed: 'hero' in el.dataset ? 1.25 : 1.7, manual: el.classList.contains('foot') });
        el._g = g;
        if (el.classList.contains('foot')) footGroup = g;
        else groupIO.observe(el);
      });
      heroLeft = groups.filter((g) => g.hero).length;
      $$('[data-ride]').forEach((r) => rideIO.observe(r));

      overlays.add(rulers);
      monogram.t0 = performance.now();
      overlays.add(monogram);
      const SCAN = PHONE ? 220 : 330;
      const cx = W / 2, cy = H / 2, t0 = performance.now();
      cursors.forEach((c, i) => {
        c.on = true;
        const a0 = (i / cursors.length) * Math.PI * 2;
        c.pin = () => {
          const a = a0 + ((performance.now() - t0) / 330) * Math.PI;
          return { x: cx + Math.cos(a) * 76, y: cy + Math.sin(a) * 58 };
        };
        const p = c.pin(); c.x = p.x; c.y = p.y;
      });
      wake();
      ticker = setInterval(tick, 80);
      tick();
      await sleep(SCAN);
      monogram.outAt = performance.now();
      cursors.forEach((c) => { c.pin = null; c.idleAt = performance.now(); c.free = true; });
      heroReady = true;
      // Hero parts can sit below the fold on phones, so the build chrome never waits on them.
      setTimeout(() => { roleStarted = true; }, 2200);
      setTimeout(heroFinished, 5500);
      tick();

      scrollFns.push((y) => { if (y > 40) dropDock(); });
      if (window.scrollY > 40) dropDock();

      // Watchdog: any on-screen block still hidden after the rules above simply appears.
      setInterval(() => {
        const now = performance.now();
        groups.forEach((g) => {
          if (g.state === 'done' || !g.seenAt) return;
          if (now - g.seenAt > 9000) { if (g.job) g.job.abort(); finishGroup(g); }
        });
      }, 1000);
    }

    /* ---- Modal builds ---- */
    function build(view) {
      if (!root.classList.contains('building')) return;
      const steps = $$('[data-b]', view);
      steps.forEach((s) => s.classList.remove('b-done'));
      const c = cursors.find((x) => x.free);
      if (!c) { steps.forEach(revealStep); return; }
      const g = { el: view, steps, state: 'waiting', visible: true, seenAt: performance.now(), claimedAt: 0, job: null, speed: 1.7 * 1.7, hero: false, tool: null, afterRole: false, fx: null, painted: false, manual: true };
      groups.push(g);
      runGroup(g, c);
    }

    /* ---- Skip ---- */
    function skip() {
      if (stopped) return;
      stopped = true;
      clearInterval(ticker);
      groups.forEach((g) => { if (g.job) g.job.abort(); });
      groups.forEach((g) => g.steps.forEach(revealStep));
      $$('[data-ride]').forEach((r) => r.classList.add('b-done'));
      rideIO.disconnect(); groupIO.disconnect();
      overlays.clear();
      cursors.forEach((c) => { c.on = false; });
      cancelAnimationFrame(raf); raf = 0;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);
      pillEl.hidden = true;
      dropDock();
      root.classList.remove('building');
      settleAll();
    }
    $('#build-skip').addEventListener('click', skip);

    // Fonts first, so measured boxes match the final text. Capped so slow fonts never block.
    Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), sleep(900)]).then(start).catch((e) => {
      console.error(e);
      skip();
      window.__built = true;
    });
    window.addEventListener('error', () => { if (!stopped) skip(); });

    return { skip, build };
  })();

  runScroll();
})();
