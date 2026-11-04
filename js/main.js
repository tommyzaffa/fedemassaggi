/* =========================================================================
   FEDEMASSAGGI — il respiro e il tempo
   GSAP + ScrollTrigger + Lenis (self-hosted in js/vendor)
   ========================================================================= */
(() => {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  window.__fmReady = true;
  if (reduced || !hasGsap) root.classList.add('no-anim');
  const animate = !root.classList.contains('no-anim');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isDesktop = () => window.innerWidth > 900;

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Testi giganti a tutta larghezza ---------- */
  const fits = [
    { el: $('.hero__word .fit'), ratio: 0.975 },
    { el: $('.contact__big .fit'), ratio: 0.9 },
  ];
  function fitAll() {
    fits.forEach(({ el, ratio }) => {
      if (!el) return;
      el.style.fontSize = '100px';
      const w = el.getBoundingClientRect().width;
      if (w) el.style.fontSize = (100 * el.parentElement.clientWidth * ratio) / w + 'px';
    });
  }
  fitAll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { fitAll(); if (animate) ScrollTrigger.refresh(); });

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (animate) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    ScrollTrigger.addEventListener('refreshInit', fitAll);
    if (window.Lenis) {
      lenis = new Lenis({ duration: 1.25, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  } else {
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(fitAll, 150); });
  }

  /* ---------- Menu ---------- */
  const menuBtn = $('#menuBtn');
  const menu = $('#menu');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    if (open) $('#hd').classList.remove('is-hidden');
    menuBtn.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    if (lenis) open ? lenis.stop() : lenis.start();
  }
  menuBtn.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Link interni ---------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const target = id === '#top' ? null : $(id);
      if (id !== '#top' && !target) return;
      e.preventDefault();
      setMenu(false);
      const offset = target && target.classList.contains('tr') ? -window.innerHeight * 0.35 : 0;
      if (lenis) lenis.scrollTo(target || 0, { offset, duration: 1.6 });
      else window.scrollTo({ top: target ? target.getBoundingClientRect().top + window.scrollY + offset : 0, behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Trattamenti: "cosa ti serve oggi?" ---------- */
  const rows = $$('.tr');
  const needs = $$('.needs button');
  needs.forEach((btn) => {
    btn.addEventListener('click', () => {
      const need = btn.dataset.need;
      needs.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      rows.forEach((r) => r.classList.toggle('is-off', need !== 'all' && !r.dataset.needs.split(' ').includes(need)));
    });
  });

  /* ---------- Header e "Prenota" mobile ---------- */
  const hd = $('#hd');
  const mcta = $('#mcta');
  const contact = $('#contatti');
  let contactVisible = false;
  let lastY = window.scrollY;
  let heroEnd = window.innerHeight;
  function onScroll() {
    const y = window.scrollY;
    hd.classList.toggle('is-hidden', y > heroEnd && y > lastY && !document.body.classList.contains('menu-open'));
    mcta.classList.toggle('is-visible', y > heroEnd + window.innerHeight * 0.6 && !contactVisible);
    lastY = y;
  }
  new IntersectionObserver(([entry]) => { contactVisible = entry.isIntersecting; onScroll(); }, { rootMargin: '0px 0px -20% 0px' }).observe(contact);
  window.addEventListener('scroll', onScroll, { passive: true });

  if (!animate) return;

  /* =======================================================================
     APERTURA: il cerchio che respira
     ======================================================================= */
  const stage = $('.hero__stage');
  const media = $('.hero__media');
  const heroImg = $('img', media);
  const ring = $('.hero__ring');
  const state = { intro: 0, p: 0 };
  const CYCLE = 10;   // 4 s inspira, 6 s espira
  const INHALE = 4;
  let phase = 'in';
  stage.dataset.phase = phase;

  // lettere del nome
  const word = $('.hero__word .fit');
  const letters = [...word.textContent.trim()];
  word.textContent = '';
  letters.forEach((c) => {
    const s = document.createElement('span');
    s.className = 'ch';
    s.textContent = c;
    word.appendChild(s);
  });
  word.classList.add('is-split');

  const heroY = () => parseFloat(getComputedStyle(root).getPropertyValue('--hero-y')) || 42;
  const baseR = () => {
    const w = window.innerWidth, h = window.innerHeight;
    return isDesktop() ? Math.min(h * 0.25, w * 0.17) : Math.min(h * 0.21, w * 0.41);
  };
  const hero = $('.hero');
  let hy = heroY();
  let br = baseR();
  let heroCover = hero.offsetHeight;
  const onResize = () => { hy = heroY(); br = baseR(); heroCover = hero.offsetHeight; stage.style.setProperty('--below', br + 30 + 'px'); };
  onResize();
  window.addEventListener('resize', onResize);

  function renderHero() {
    if (window.scrollY > heroCover) return; // coperta da "Chi sono": niente lavoro
    const w = window.innerWidth, h = window.innerHeight;
    const t = (performance.now() / 1000) % CYCLE;
    let b;
    if (t < INHALE) { b = easeInOutSine(t / INHALE); if (phase !== 'in') { phase = 'in'; stage.dataset.phase = 'in'; } }
    else { b = 1 - easeInOutSine((t - INHALE) / (CYCLE - INHALE)); if (phase !== 'out') { phase = 'out'; stage.dataset.phase = 'out'; } }

    const p = state.p;
    const yPct = lerp(hy, 50, p);
    const cy = (h * yPct) / 100;
    const maxR = Math.hypot(w / 2, Math.max(cy, h - cy)) + 4;
    const r0 = br * (0.9 + 0.1 * b) * state.intro;
    const r = lerp(r0, maxR, p);
    media.style.clipPath = `circle(${r.toFixed(1)}px at 50% ${yPct.toFixed(2)}%)`;
    // Nel cerchio la foto è rimpicciolita (si vede tutta la scena); torna a scala 1 appena il cerchio
    // tocca il bordo più vicino dello schermo, così non restano mai vuoti ai lati.
    const near = Math.min((h * hy) / 100, h - (h * hy) / 100, w / 2) * 0.92;
    const k = clamp((r - r0) / Math.max(1, near - r0));
    // il riquadro rimpicciolito deve restare più largo e più alto del cerchio
    const sMin = Math.max(isDesktop() ? 0.64 : 0.7, (2 * br + 12) / w, (2 * br + 12) / h);
    const scale = lerp(sMin, 1, k) + 0.025 * b * (1 - k);
    // su schermi verticali la foto non si può ritagliare in altezza: la alziamo finché è nel cerchio, così si vedono le mani
    const shift = w / h < 1 ? -0.1 * h * (1 - k) : 0;
    heroImg.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0) scale(${scale.toFixed(4)})`;
    ring.style.setProperty('--ring', ((r0 + 18 + 6 * b) * 2).toFixed(1) + 'px');
    ring.style.opacity = (clamp(1 - p * 5) * state.intro).toFixed(3);
  }
  gsap.ticker.add(renderHero);

  // ingresso
  gsap.to(state, { intro: 1, duration: 2.6, ease: 'expo.out', delay: 0.2 });
  gsap.to('.hero__word .ch', { opacity: 1, filter: 'blur(0px)', duration: 1.8, ease: 'power2.out', stagger: { each: 0.05, from: 'center' }, delay: 0.5, onComplete: () => gsap.set('.hero__word .ch', { filter: 'none' }) });
  gsap.to(['.hero__meta', '.hero__breath'], { opacity: 1, duration: 1.6, ease: 'power2.out', stagger: 0.15, delay: 1.3 });

  // scorrendo: il cerchio si allarga fino a riempire lo schermo, poi arriva il motto
  // (la prima schermata è sticky in CSS, qui solo animazioni legate allo scroll: nessun pin)
  gsap.set('.hero__motto p span', { y: 26, filter: 'blur(12px)' });
  const heroTl = gsap.timeline({
    scrollTrigger: {
      trigger: hero, start: 'top top', end: () => '+=' + window.innerHeight * 2,
      scrub: 1.2, invalidateOnRefresh: true,
      onRefresh: (self) => { heroEnd = self.end; },
    },
  });
  heroEnd = heroTl.scrollTrigger.end;
  heroTl
    .to(state, { p: 1, duration: 1, ease: 'power2.inOut' }, 0)
    .to('.hero__ui', { opacity: 0, duration: 0.25, ease: 'none' }, 0)
    .to('.hero__word', { yPercent: -14, duration: 1, ease: 'none' }, 0)
    .to('.hero__shade', { opacity: 1, duration: 0.5, ease: 'none' }, 0.6)
    .to('.hero__motto p span', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, stagger: 0.16, ease: 'power2.out' }, 0.85)
    .to('.hero__motto footer', { opacity: 1, duration: 0.3 }, 1.5)
    .to({}, { duration: 0.35 });

  // uscita a sipario: "Chi sono" sale sopra la foto, che intanto scorre più lenta e il motto si dissolve
  gsap.timeline({
    scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'top top', scrub: 1.2 },
  })
    .to('.hero__media', { yPercent: -18, ease: 'none' }, 0)
    .to('.hero__motto', { yPercent: -45, opacity: 0, ease: 'power1.in' }, 0);

  /* =======================================================================
     Comparse "a respiro": dal fuoco al nitido
     ======================================================================= */
  ScrollTrigger.batch('[data-blur]', {
    start: 'top 86%',
    once: true,
    // a fine comparsa il filtro viene tolto del tutto: un blur(0) lasciato attivo pesa sul rendering
    onEnter: (batch) => gsap.to(batch, { opacity: 1, filter: 'blur(0px)', duration: 1.7, ease: 'power2.out', stagger: 0.12, onComplete: () => gsap.set(batch, { filter: 'none' }) }),
  });

  // le foto dentro la frase si aprono da un puntino: lo spazio è già riservato, le parole restano ferme
  $$('.statement').forEach((st) => {
    $$('.inl', st).forEach((inl, i) => {
      const trig = { trigger: st, start: 'top 72%', once: true };
      gsap.fromTo(inl,
        { clipPath: 'inset(38% 46% 38% 46% round 999px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 999px)', duration: 1.6, ease: 'expo.inOut', delay: 0.6 + i * 0.25, scrollTrigger: trig, immediateRender: false });
      gsap.from($('img', inl), { scale: 1.6, duration: 2.4, ease: 'expo.out', delay: 0.8 + i * 0.25, scrollTrigger: trig });
    });
  });

  /* =======================================================================
     Trattamenti: immagine circolare che segue il cursore
     ======================================================================= */
  const float = $('#float');
  const floatImgs = $$('img', float);
  if (finePointer) {
    // carica le immagini solo quando la lista si avvicina
    const tlist = $('#tlist');
    new IntersectionObserver(([entry], obs) => {
      if (!entry.isIntersecting) return;
      floatImgs.forEach((img) => { img.src = img.dataset.src; });
      obs.disconnect();
    }, { rootMargin: '800px 0px' }).observe(tlist);

    let fx = 0, fy = 0, tx = 0, ty = 0, fs = 0, ts = 0, started = false, current = -1;
    const show = (i) => {
      if (i === current) return;
      if (floatImgs[current]) floatImgs[current].classList.remove('is-active');
      current = i;
      floatImgs[i].classList.add('is-active');
    };
    tlist.addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!started) { fx = tx; fy = ty; started = true; }
    });
    rows.forEach((row) => {
      row.addEventListener('mouseenter', () => {
        if (row.classList.contains('is-off')) { ts = 0; return; }
        ts = 1;
        show(Number(row.dataset.i));
      });
    });
    tlist.addEventListener('mouseleave', () => { ts = 0; });
    let floatIdle = false;
    gsap.ticker.add(() => {
      fx += (tx - fx) * 0.12;
      fy += (ty - fy) * 0.12;
      fs += (ts - fs) * 0.1;
      if (fs < 0.001 && ts === 0) {
        if (!floatIdle) { float.style.transform = 'translate3d(-50%, -50%, 0) scale(0)'; floatIdle = true; }
        return;
      }
      floatIdle = false;
      float.style.transform = `translate3d(${fx.toFixed(1)}px, ${fy.toFixed(1)}px, 0) translate(-50%, -50%) scale(${fs.toFixed(3)})`;
    });

    /* ---------- Cursore ---------- */
    const cursor = $('#cursor');
    root.classList.add('has-cursor');
    let cx = -100, cy2 = -100, mx = -100, my = -100;
    window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
    document.addEventListener('mouseover', (e) => {
      const t = e.target;
      cursor.classList.toggle('is-wa', !!t.closest('[data-cursor="whatsapp"]'));
      cursor.classList.toggle('is-hidden', !!t.closest('.tr') && !t.closest('.tr.is-off'));
      cursor.classList.toggle('is-link', !t.closest('[data-cursor]') && !!t.closest('a, button, summary'));
    });
    document.addEventListener('mouseleave', () => { mx = my = -100; });
    gsap.ticker.add(() => {
      const dx = mx - cx, dy = my - cy2;
      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) return; // fermo: nessun ridisegno
      cx += dx * 0.25;
      cy2 += dy * 0.25;
      cursor.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy2.toFixed(1)}px, 0) translate(-50%, -50%)`;
    });
  }

  /* =======================================================================
     Sessanta minuti: l'anello si disegna scorrendo
     ======================================================================= */
  const minutes = $('#minutes');
  const prog = $('.time__prog');
  const dot = $('.time__dot');
  const phases = $$('.ph');
  const marks = [0.14, 0.52, 0.86];
  const clock = { v: 0 };
  function drawClock() {
    const v = clamp(clock.v / 0.9);
    prog.style.strokeDashoffset = (1 - v).toFixed(4);
    dot.style.transform = `rotate(${(v * 360).toFixed(2)}deg)`;
    minutes.textContent = String(Math.round(v * 60)).padStart(2, '0');
    let last = -1;
    phases.forEach((ph, i) => {
      const on = v >= marks[i];
      ph.classList.toggle('is-on', on);
      if (on) last = i;
    });
    phases.forEach((ph, i) => ph.classList.toggle('is-current', i === last));
  }
  drawClock();
  // la scena è sticky in CSS: entrata e uscita sono scroll nativo, senza scatti
  gsap.to(clock, {
    v: 1, ease: 'none', onUpdate: drawClock,
    scrollTrigger: { trigger: '.time', start: 'top top', end: 'bottom bottom', scrub: 0.8 },
  });

  /* =======================================================================
     Lo studio: la foto si apre come una fessura
     ======================================================================= */
  const placeTrig = { trigger: '.place__img', start: 'top 92%', end: 'top 20%', scrub: 0.6 };
  gsap.to('.place__img', { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: placeTrig });
  gsap.fromTo('.place__img img', { scale: 1.3 }, { scale: 1, ease: 'none', scrollTrigger: placeTrig });

  /* ---------- Buoni regalo: parallax lento ---------- */
  gsap.fromTo('.gift__img img', { yPercent: -15 }, {
    yPercent: 0, ease: 'none',
    scrollTrigger: { trigger: '.gift__img', start: 'top bottom', end: 'bottom top', scrub: true },
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
