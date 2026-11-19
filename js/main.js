(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isMobile = () => matchMedia('(max-width: 760px)').matches;
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const WA = '918184851169';

  $('#year').textContent = new Date().getFullYear();
  $$('.pulse path').forEach((p) => p.setAttribute('pathLength', '1'));

  /* ---------- reveal on scroll ---------- */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      revealIO.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal, .split').forEach((el) => revealIO.observe(el));
  requestAnimationFrame(() => $('.hero').classList.add('ready'));

  /* ---------- count-up numbers ---------- */
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      countIO.unobserve(e.target);
      const el = e.target, to = +el.dataset.count;
      if (reduce) return;
      const t0 = performance.now(), dur = 1500;
      const tick = (t) => {
        const k = clamp((t - t0) / dur, 0, 1);
        el.textContent = Math.round(to * (1 - Math.pow(2, -10 * k)));
        if (k < 1) requestAnimationFrame(tick); else el.textContent = to;
      };
      el.textContent = 0;
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => countIO.observe(el));

  /* ---------- hero video (skipped for reduced motion / data saver) ---------- */
  const hv = $('#heroVideo');
  if (hv && !reduce && !saveData) {
    hv.src = isMobile() ? hv.dataset.mobile : hv.dataset.desktop;
    hv.addEventListener('playing', () => hv.classList.add('on'), { once: true });
    hv.play().catch(() => {});
    new IntersectionObserver(([e]) => { e.isIntersecting ? hv.play().catch(() => {}) : hv.pause(); }, { threshold: 0.05 }).observe($('.hero'));
  }

  /* ---------- nav ---------- */
  const nav = $('#nav');
  const burger = $('#burger');
  const menu = $('#menu');
  let lastY = scrollY;
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (open) { menu.hidden = false; requestAnimationFrame(() => menu.classList.add('open')); nav.classList.remove('hide'); }
    else { menu.classList.remove('open'); setTimeout(() => { if (burger.getAttribute('aria-expanded') === 'false') menu.hidden = true; }, 400); }
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });

  const links = $$('.nav__links a');
  const secIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['training', 'coaches', 'tour', 'women', 'results', 'community', 'visit'].forEach((id) => { const s = document.getElementById(id); if (s) secIO.observe(s); });

  /* ---------- scroll effects (single rAF loop) ---------- */
  const bar = $('.progress span');
  const heroInner = $('.hero__inner');
  const hero = $('.hero');
  const parallaxEls = $$('[data-parallax]');
  const neonBg = $('[data-parallax-bg]');
  let ticking = false;
  const onScroll = () => {
    const y = scrollY, vh = innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle('solid', y > 40);
    if (burger.getAttribute('aria-expanded') !== 'true') nav.classList.toggle('hide', y > lastY && y > 420);
    lastY = y;
    if (!reduce) {
      if (y < vh * 1.2) {
        const k = clamp(y / vh, 0, 1);
        heroInner.style.transform = `translateY(${k * 70}px)`;
        heroInner.style.opacity = String(1 - k * 1.1);
        hero.querySelector('.hero__media').style.transform = `scale(${1 + k * 0.08})`;
      }
      parallaxEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const p = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.translate = `0 ${(p * +el.dataset.parallax).toFixed(1)}px`;
      });
      if (neonBg) {
        const r = neonBg.parentElement.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) neonBg.style.transform = `translateY(${(((r.top + r.height / 2 - vh / 2) / vh) * -90).toFixed(1)}px)`;
      }
    }
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- magnetic buttons ---------- */
  if (canHover && !reduce) {
    $$('.magnetic').forEach((b) => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        b.style.translate = `${((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1)}px ${((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1)}px`;
      });
      b.addEventListener('pointerleave', () => { b.style.translate = ''; });
    });
  }

  /* ---------- training panels ---------- */
  const panels = $$('.panel');
  panels.forEach((p) => {
    const n = $('.panel__n', p);
    p.prepend(n);
    const vt = document.createElement('span');
    vt.className = 'panel__vt';
    vt.setAttribute('aria-hidden', 'true');
    vt.textContent = $('h3', p).textContent;
    p.append(vt);
  });
  const activate = (p) => {
    if (p.classList.contains('is-active')) return;
    panels.forEach((x) => x.classList.toggle('is-active', x === p));
  };
  panels.forEach((p) => {
    p.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse' && !isMobile() && matchMedia('(min-width: 961px)').matches) activate(p); });
    p.addEventListener('click', () => activate(p));
    p.addEventListener('focus', () => activate(p));
  });

  /* ---------- lazy / viewport-driven video ---------- */
  const attach = (v) => { if (!v.src) { v.src = v.dataset.src; v.load(); } };

  /* tour player */
  const tv = $('#tourVideo');
  const chapters = $$('#chapters button');
  const times = chapters.map((b) => +b.dataset.t);
  const names = chapters.map((b) => $('span', b).textContent);
  const START = 1.2, END = 27.8;
  const tourBar = $('#tourBar'), tourChap = $('#tourChap'), tourToggle = $('#tourToggle');
  let userPaused = false, activeChap = -1;
  const setChap = (i) => {
    if (i === activeChap) return;
    activeChap = i;
    chapters.forEach((b, k) => { b.classList.toggle('active', k === i); if (k !== i) b.style.setProperty('--p', 0); });
    tourChap.textContent = names[i];
  };
  const tourFrame = () => {
    const t = tv.currentTime;
    if (t >= END) tv.currentTime = START;
    let i = 0;
    times.forEach((s, k) => { if (t >= s - 0.05) i = k; });
    setChap(i);
    const next = times[i + 1] ?? END;
    chapters[i].style.setProperty('--p', clamp((t - times[i]) / (next - times[i]), 0, 1).toFixed(3));
    tourBar.style.width = clamp(((t - START) / (END - START)) * 100, 0, 100) + '%';
    if (!tv.paused) requestAnimationFrame(tourFrame);
  };
  const setToggle = () => {
    const playing = !tv.paused;
    $('use', tourToggle).setAttribute('href', playing ? '#i-pause' : '#i-play');
    tourToggle.setAttribute('aria-label', playing ? 'Pause tour video' : 'Play tour video');
  };
  tv.addEventListener('play', () => { setToggle(); requestAnimationFrame(tourFrame); });
  tv.addEventListener('pause', setToggle);
  tv.addEventListener('loadedmetadata', () => { if (tv.currentTime < START) tv.currentTime = START; }, { once: true });
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { attach(tv); if (!userPaused && !reduce) tv.play().catch(() => {}); }
    else tv.pause();
  }, { threshold: 0.35 }).observe(tv);
  tourToggle.addEventListener('click', () => {
    attach(tv);
    if (tv.paused) { userPaused = false; tv.play().catch(() => {}); } else { userPaused = true; tv.pause(); }
  });
  chapters.forEach((b, i) => b.addEventListener('click', () => {
    attach(tv);
    const go = () => { tv.currentTime = times[i]; userPaused = false; tv.play().catch(() => {}); };
    tv.readyState >= 1 ? go() : tv.addEventListener('loadedmetadata', go, { once: true });
    if (isMobile() || innerWidth <= 960) tv.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
  }));
  setChap(0);

  /* anniversary clip */
  const av = $('#annivVideo');
  const sound = $('#annivSound');
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { attach(av); if (!reduce) av.play().catch(() => {}); } else av.pause();
  }, { threshold: 0.4 }).observe(av);
  sound.addEventListener('click', () => {
    av.muted = !av.muted;
    sound.setAttribute('aria-pressed', String(!av.muted));
    sound.setAttribute('aria-label', av.muted ? 'Turn sound on' : 'Turn sound off');
    $('span', sound).textContent = av.muted ? 'Sound off' : 'Sound on';
    $('use', sound).setAttribute('href', av.muted ? '#i-mute' : '#i-sound');
    if (av.paused) av.play().catch(() => {});
  });

  /* reels: tap to play */
  const reels = $$('.reel');
  reels.forEach((r) => {
    const v = $('video', r);
    r.addEventListener('click', () => {
      if (v.paused) {
        reels.forEach((o) => { if (o !== r) { $('video', o).pause(); o.classList.remove('playing'); } });
        attach(v);
        v.play().then(() => r.classList.add('playing')).catch(() => {});
      } else { v.pause(); r.classList.remove('playing'); }
    });
    new IntersectionObserver(([e]) => { if (!e.isIntersecting && !v.paused) { v.pause(); r.classList.remove('playing'); } }, { threshold: 0.1 }).observe(r);
    if (canHover) {
      r.addEventListener('pointerenter', () => { attach(v); });
    }
  });

  /* ---------- before / after sliders ---------- */
  $$('.ba').forEach((ba) => {
    const range = $('.ba__range', ba);
    const set = (v) => ba.style.setProperty('--pos', v + '%');
    let touched = false;
    range.addEventListener('input', () => { touched = true; set(range.value); });
    ba.addEventListener('pointerdown', () => { touched = true; });
    if (reduce) return;
    // a one-time wobble to show the slider is interactive
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (t) => {
        if (touched) return;
        const k = clamp((t - t0) / 1600, 0, 1);
        set((50 + Math.sin(k * Math.PI * 2) * 22 * (1 - k * 0.4)).toFixed(1));
        if (k < 1) requestAnimationFrame(step); else set(range.value);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.6 });
    io.observe(ba);
  });

  /* ---------- lightbox ---------- */
  const lb = $('#lightbox');
  const lbImg = $('img', lb);
  const items = $$('.wall__item img');
  let idx = 0;
  const show = (i) => {
    idx = (i + items.length) % items.length;
    lbImg.src = items[idx].src;
    lbImg.alt = items[idx].alt;
  };
  items.forEach((img, i) => img.closest('button').addEventListener('click', () => { show(i); lb.showModal(); }));
  $('.lightbox__close', lb).addEventListener('click', () => lb.close());
  $('.lightbox__prev', lb).addEventListener('click', () => show(idx - 1));
  $('.lightbox__next', lb).addEventListener('click', () => show(idx + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
  lb.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); lb.close(); }
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });

  /* ---------- join form -> WhatsApp ---------- */
  const form = $('#joinForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.elements.name;
    name.classList.toggle('err', !name.value.trim());
    if (!name.value.trim()) { name.focus(); return; }
    const phone = form.elements.phone.value.trim();
    const msg = `Hi Almighty Gym! I'm ${name.value.trim()}. My main goal: ${form.elements.goal.value}. Best time to visit: ${form.elements.time.value}.` +
      (phone ? ` My number: ${phone}.` : '') + ` I'd like to know about membership options.`;
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });
  form.elements.name.addEventListener('input', (e) => e.target.classList.remove('err'));
})();
