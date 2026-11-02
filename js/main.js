/* =========================================================================
   FEDEMASSAGGI — interazioni e animazioni
   GSAP + ScrollTrigger + Lenis (self-hosted in js/vendor)
   ========================================================================= */
(() => {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  window.__fmReady = true;
  if (reduced || !hasGsap) root.classList.add('no-anim');
  const animate = !root.classList.contains('no-anim');
  const desktop = window.matchMedia('(min-width: 901px)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (animate && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- Menu mobile ---------- */
  const body = document.body;
  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');

  function setMenu(open) {
    body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    menu.setAttribute('aria-hidden', String(!open));
    if (lenis) open ? lenis.stop() : lenis.start();
  }
  burger.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Link interni ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = id === '#top' ? document.body : document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      setMenu(false);
      let offset = id === '#top' ? 0 : -60;
      if (target.classList.contains('treat__item')) offset = -window.innerHeight * 0.3;
      if (lenis) {
        lenis.scrollTo(target, { offset, duration: 1.5 });
      } else {
        const top = id === '#top' ? 0 : target.getBoundingClientRect().top + window.scrollY + offset;
        window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
      }
      history.replaceState(null, '', id === '#top' ? location.pathname : id);
    });
  });

  /* ---------- Header + barra contatti ---------- */
  const header = document.getElementById('header');
  const quickbar = document.getElementById('quickbar');
  let lastY = window.scrollY;
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    header.classList.toggle('is-hidden', y > lastY && y > 500 && !body.classList.contains('menu-open'));
    quickbar.classList.toggle('is-visible', y > window.innerHeight * 0.55);
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- Voce di menu attiva ---------- */
  const navLinks = [...document.querySelectorAll('.nav a')];
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((l) => l.classList.toggle('is-current', l.getAttribute('href') === '#' + entry.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  navLinks.forEach((l) => {
    const section = document.querySelector(l.getAttribute('href'));
    if (section) navObserver.observe(section);
  });

  /* ---------- Trattamenti: immagine che segue la voce attiva ---------- */
  const items = [...document.querySelectorAll('.treat__item')];
  const frames = [...document.querySelectorAll('.treat__frame img')];
  const treatNum = document.getElementById('treatNum');
  let current = 0;

  function setActive(i) {
    if (i === current || !items[i]) return;
    items[current].classList.remove('is-active');
    frames[current].classList.remove('is-active');
    current = i;
    items[i].classList.add('is-active');
    frames[i].classList.add('is-active');
    treatNum.textContent = String(i + 1).padStart(2, '0');
  }
  const treatObserver = new IntersectionObserver((entries) => {
    if (!desktop.matches) return;
    entries.forEach((entry) => { if (entry.isIntersecting) setActive(Number(entry.target.dataset.index)); });
  }, { rootMargin: '-42% 0px -42% 0px' });
  items.forEach((item) => {
    treatObserver.observe(item);
    item.addEventListener('mouseenter', () => { if (desktop.matches) setActive(Number(item.dataset.index)); });
  });

  /* ---------- FAQ con apertura morbida ---------- */
  document.querySelectorAll('.faq__item').forEach((d) => {
    const summary = d.querySelector('summary');
    const answer = d.querySelector('.faq__answer');
    summary.addEventListener('click', (e) => {
      if (!animate) return;
      e.preventDefault();
      if (d.open) {
        gsap.to(answer, { height: 0, duration: 0.5, ease: 'expo.out', onComplete: () => { d.open = false; answer.style.height = ''; ScrollTrigger.refresh(); } });
      } else {
        d.open = true;
        gsap.fromTo(answer, { height: 0 }, { height: answer.scrollHeight, duration: 0.7, ease: 'expo.out', onComplete: () => { answer.style.height = ''; ScrollTrigger.refresh(); } });
      }
    });
  });

  if (!animate) return;

  /* =======================================================================
     Animazioni
     ======================================================================= */

  // Divide un titolo in parole, mantenendo i tag interni (es. <em>)
  function splitWords(el, wrap = true) {
    const out = [];
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const inner = document.createElement('span');
            inner.textContent = part;
            if (wrap) {
              const w = document.createElement('span');
              w.className = 'w';
              w.appendChild(inner);
              frag.appendChild(w);
            } else {
              inner.className = 'mw';
              frag.appendChild(inner);
            }
            out.push(inner);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    walk(el);
    return out;
  }

  /* ---------- Hero ---------- */
  const heroTl = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.1 });
  heroTl
    .to('.hero__arch', { clipPath: 'inset(0% 0% 0% 0% round 999px 999px 26px 26px)', duration: 1.7, ease: 'expo.inOut' }, 0)
    .from('.hero__arch img', { scale: 1.35, duration: 2.4 }, 0.25)
    .to('.hero__title .line > span', { y: 0, duration: 1.4, stagger: 0.09 }, 0.35)
    .to('[data-hero]', { opacity: 1, y: 0, duration: 1.2, stagger: 0.1 }, 0.75)
    .to(['.hero__round', '.hero__seal'], { opacity: 1, scale: 1, duration: 1.3, stagger: 0.15, ease: 'back.out(1.5)' }, 1.15);

  // leggero parallax della foto principale mentre si scorre
  gsap.to('.hero__arch img', {
    yPercent: 8, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to('.hero__round', {
    yPercent: -40, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });

  /* ---------- Titoli parola per parola ---------- */
  document.querySelectorAll('[data-split]').forEach((el) => {
    const words = splitWords(el);
    el.classList.add('is-split');
    gsap.to(words, {
      y: 0, duration: 1.2, ease: 'expo.out', stagger: 0.06,
      scrollTrigger: { trigger: el, start: 'top 86%', once: true },
    });
  });

  /* ---------- Comparsa elementi ---------- */
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.09 }),
  });

  /* ---------- Foto che si svelano ---------- */
  document.querySelectorAll('[data-img-reveal]').forEach((fig) => {
    const st = { trigger: fig, start: 'top 82%', once: true };
    gsap.to(fig, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut', scrollTrigger: st });
    const img = fig.querySelector('img');
    if (img) gsap.from(img, { scale: 1.25, duration: 2.2, ease: 'expo.out', scrollTrigger: st });
  });

  /* ---------- Parallax ---------- */
  document.querySelectorAll('[data-parallax]').forEach((el) => {
    const amount = parseFloat(el.dataset.parallax) || 10;
    gsap.fromTo(el, { yPercent: -amount }, {
      yPercent: amount, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
  document.querySelectorAll('[data-bg-parallax]').forEach((el) => {
    gsap.fromTo(el, { yPercent: -7 }, {
      yPercent: 7, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  /* ---------- Motto: le parole si accendono scorrendo ---------- */
  const motto = document.querySelector('[data-words]');
  if (motto) {
    const words = splitWords(motto, false);
    gsap.to(words, {
      opacity: 1, ease: 'none', stagger: 0.12,
      scrollTrigger: { trigger: '.motto', start: 'top 60%', end: 'center 40%', scrub: 0.6 },
    });
    gsap.from('.motto__quote-mark', {
      y: 60, opacity: 0, duration: 1.4, ease: 'expo.out',
      scrollTrigger: { trigger: '.motto', start: 'top 65%', once: true },
    });
  }

  /* ---------- Striscia di foto orizzontale ---------- */
  const strip = document.querySelector('[data-strip]');
  if (strip) {
    gsap.to(strip, {
      x: () => -Math.max(0, strip.scrollWidth - window.innerWidth + 40),
      ease: 'none',
      scrollTrigger: { trigger: '.strip', start: 'top bottom', end: 'bottom top', scrub: 0.5, invalidateOnRefresh: true },
    });
  }

  /* ---------- Contatori ---------- */
  document.querySelectorAll('[data-count]').forEach((el) => {
    const target = parseInt(el.dataset.count, 10);
    const from = target > 1000 ? target - 30 : 0;
    const obj = { v: from };
    el.textContent = from;
    gsap.to(obj, {
      v: target, duration: 2, ease: 'power3.out',
      onUpdate: () => { el.textContent = Math.round(obj.v); },
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });

  /* ---------- Bottoni magnetici (solo mouse) ---------- */
  if (finePointer.matches) {
    document.querySelectorAll('[data-magnetic]').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        gsap.to(btn, { x: (e.clientX - r.left - r.width / 2) * 0.22, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.5, ease: 'power3.out' });
      });
      btn.addEventListener('mouseleave', () => gsap.to(btn, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' }));
    });
  }

  // ricalcola le posizioni quando font e immagini sono pronti
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
