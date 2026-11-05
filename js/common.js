/* Strykon: behaviour shared by every page (header, menu, reveals, WhatsApp and social links). */
(() => {
  'use strict';

  const cfg = window.STRYKON_CONFIG || {};
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const hasGSAP = typeof gsap !== 'undefined';
  const hasST = hasGSAP && typeof ScrollTrigger !== 'undefined';
  const animate = hasGSAP && !reduceMotion;
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  /* ---------- WhatsApp, phone and social links from the settings file ---------- */
  const waText = (topic) => (topic
    ? `Hello Strykon Sports & Infrastructure Pvt Ltd! We are planning a project and would like to know more about ${topic}. Can you book an appointment?`
    : cfg.whatsappMessage);
  const waLink = (text) => `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(text || cfg.whatsappMessage)}`;

  if (cfg.whatsapp) {
    $$('[data-wa]').forEach((a) => { a.href = waLink(waText(a.dataset.wa)); });
  }
  if (cfg.phone) $$('[data-tel]').forEach((a) => { a.href = `tel:${a.dataset.tel === '2' ? cfg.phone2 : cfg.phone}`; });
  ['instagram', 'facebook'].forEach((k) => {
    if (cfg[k]) $$(`[data-social="${k}"]`).forEach((a) => { a.href = cfg[k]; });
  });

  /* ---------- Header, menu and scroll progress ---------- */
  const header = $('#site-header');
  const menuBtn = $('#menu-btn');
  const nav = $('#site-nav');
  const progressBar = $('.scroll-progress i');
  const solidAfter = () => (document.body.dataset.page === 'home' ? 40 : 10);

  const setMenu = (open) => {
    menuBtn.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    root.classList.toggle('menu-open', open);
  };
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && root.classList.contains('menu-open')) { setMenu(false); menuBtn.focus(); }
    });
  }

  // The header stays on screen; once the page scrolls it gets a solid background
  let queued = false;
  function onScroll() {
    queued = false;
    const y = window.scrollY;
    header.classList.toggle('is-solid', y > solidAfter());
    const max = root.scrollHeight - window.innerHeight;
    if (progressBar) progressBar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
  }
  window.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- Scroll reveals ---------- */
  function splitWords(el) {
    const text = el.textContent.trim().replace(/\s+/g, ' ');
    el.setAttribute('aria-label', text);
    el.innerHTML = text.split(' ').map((w) => `<span class="w" aria-hidden="true"><span>${esc(w)}</span></span>`).join(' ');
    return $$('.w > span', el);
  }

  if (animate && hasST) {
    $$('[data-split]').forEach((el) => {
      const words = splitWords(el);
      gsap.set(words, { yPercent: 110 });
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: () => gsap.to(words, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.045 }),
      });
    });

    const reveals = $$('[data-reveal]');
    gsap.set(reveals, { opacity: 0, y: 40 });
    ScrollTrigger.batch(reveals, {
      start: 'top 90%',
      once: true,
      onEnter: (batch) => gsap.to(batch, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, overwrite: true, clearProps: 'transform',
      }),
    });

    $$('[data-parallax]').forEach((el) => {
      gsap.to(el, {
        y: Number(el.dataset.parallax) || -40,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });

    window.addEventListener('load', () => ScrollTrigger.refresh());
  }

  /* ---------- Magnetic buttons and tilting cards ---------- */
  function enhance(scope = document) {
    if (!(finePointer && animate)) return;
    $$('.btn-magnetic:not([data-mag])', scope).forEach((btn) => {
      btn.dataset.mag = '1';
      const xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
      const yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.25);
        yTo((e.clientY - r.top - r.height / 2) * 0.35);
      });
      btn.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
    $$('[data-tilt]:not([data-tilted])', scope).forEach((el) => {
      el.dataset.tilted = '1';
      const rx = gsap.quickTo(el, 'rotationX', { duration: 0.7, ease: 'power3.out' });
      const ry = gsap.quickTo(el, 'rotationY', { duration: 0.7, ease: 'power3.out' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        rx((0.5 - py) * 7);
        ry((px - 0.5) * 9);
        el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
        el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
      });
      el.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });
  }
  enhance();

  /* ---------- FAQ accordion ---------- */
  $$('.faq details').forEach((d) => {
    const summary = $('summary', d);
    summary.addEventListener('click', (e) => {
      if (reduceMotion || typeof d.animate !== 'function') return;
      e.preventDefault();
      if (d.dataset.busy) return;
      d.dataset.busy = '1';
      const start = d.offsetHeight;
      const easing = 'cubic-bezier(.16, 1, .3, 1)';
      if (d.open) {
        const anim = d.animate({ height: [`${start}px`, `${summary.offsetHeight}px`] }, { duration: 420, easing });
        anim.onfinish = () => { d.open = false; delete d.dataset.busy; };
      } else {
        d.open = true;
        const end = d.offsetHeight;
        const anim = d.animate({ height: [`${start}px`, `${end}px`] }, { duration: 520, easing });
        anim.onfinish = () => { delete d.dataset.busy; };
      }
    });
  });

  /* ---------- Projects and reviews: Google Sheet (when connected) plus data/*.js ---------- */
  // Sheet content is kept in the browser so repeat visits show it straight away, then refreshed.
  const CONTENT_KEY = 'strykon:content';
  let live = null;
  try { live = JSON.parse(localStorage.getItem(CONTENT_KEY) || 'null'); } catch (err) { live = null; }

  const content = {
    pending: Boolean(cfg.googleScriptUrl) && !live, // nothing to show from the sheet yet
    ready: Promise.resolve(false), // resolves true when newer projects or reviews arrived
  };
  if (cfg.googleScriptUrl && window.fetch) {
    const ctrl = window.AbortController ? new AbortController() : null;
    const timer = setTimeout(() => ctrl && ctrl.abort(), 12000);
    content.ready = fetch(`${cfg.googleScriptUrl}?action=content`, ctrl ? { signal: ctrl.signal } : {})
      .then((res) => res.json())
      .then((json) => {
        if (!json || !json.ok) return false;
        const next = { projects: json.projects || [], reviews: json.reviews || [] };
        const changed = JSON.stringify(next) !== JSON.stringify(live);
        live = next;
        try { localStorage.setItem(CONTENT_KEY, JSON.stringify(next)); } catch (err) { /* storage unavailable */ }
        return changed;
      })
      .catch(() => false)
      .then((changed) => { clearTimeout(timer); content.pending = false; return changed; });
  }

  // Sample entries show only on your computer or in a preview, and only until real entries exist
  const showSamples = (() => {
    if (cfg.showSampleEntries === true || cfg.showSampleEntries === false) return cfg.showSampleEntries;
    const h = location.hostname;
    return location.protocol === 'file:' || h === '' || h === 'localhost' || h === '127.0.0.1' || /claude/i.test(h);
  })();
  const dropSamples = (list) => {
    const real = list.filter((x) => !x.sample);
    return real.length || !showSamples ? real : list;
  };
  const visibleProjects = () => {
    const seen = new Set();
    const all = [...((live && live.projects) || []), ...(window.STRYKON_PROJECTS || [])]
      .filter((p) => p && p.id && p.title && !seen.has(p.id) && seen.add(p.id));
    return dropSamples(all).sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0));
  };
  const visibleReviews = () => dropSamples([...((live && live.reviews) || []), ...(window.STRYKON_REVIEWS || [])]
    .filter((r) => r && r.text));

  // Google Drive photos: if the thumbnail address fails, try Drive's other image address
  document.addEventListener('error', (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement)) return;
    const m = img.src.match(/drive\.google\.com\/thumbnail\?id=([\w-]+)&sz=w(\d+)/);
    if (m && !img.dataset.retried) {
      img.dataset.retried = '1';
      img.src = `https://lh3.googleusercontent.com/d/${m[1]}=w${m[2]}`;
    } else if (img.closest('.p-cover, .pm-media')) {
      img.hidden = true;
    }
  }, true);

  const CATEGORIES = {
    sports: 'Sports facilities',
    residential: 'Residential',
    commercial: 'Commercial',
    civil: 'Civil & site works',
    solar: 'Solar power',
    railway: 'Railway projects',
    interiors: 'Interiors', // older entries only; no longer offered
  };

  // Cover art for a project: first photo (small version when there is one), else a drawing for its category
  function projectCover(p) {
    if (p.photos && p.photos.length) {
      const src = (p.thumbs && p.thumbs[0]) || p.photos[0];
      return `<img src="${esc(src)}" alt="${esc(p.title)}" loading="lazy" decoding="async" referrerpolicy="no-referrer">`;
    }
    if (p.category === 'sports' && window.StrykonCourts) {
      const sp = window.StrykonCourts.byId[p.court] || window.StrykonCourts.byId.football;
      return `<div class="cover-art cover-court">${window.StrykonCourts.miniSVG(sp)}</div>`;
    }
    if (window.StrykonIso && window.StrykonIso.kinds.includes(p.category)) {
      return `<div class="cover-art">${window.StrykonIso.render(p.category)}</div>`;
    }
    return '<div class="cover-art"></div>';
  }

  /* ---------- Footer ---------- */
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  window.Strykon = {
    cfg, $, $$, esc, gsap, ScrollTrigger, hasST, animate, reduceMotion, finePointer,
    scrollBehavior: reduceMotion ? 'auto' : 'smooth',
    waLink, waText, enhance, showSamples, content, visibleProjects, visibleReviews, CATEGORIES, projectCover,
  };
})();
