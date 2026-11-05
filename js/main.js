/* Strykon home page: hero intro, sports gallery and planner, infrastructure tabs, projects preview, booking. */
(() => {
  'use strict';

  const S = window.Strykon;
  const C = window.StrykonCourts;
  const { cfg, $, $$, esc, gsap, ScrollTrigger, hasST, animate, reduceMotion, scrollBehavior } = S;
  const B = cfg.booking || {};
  const API = cfg.googleScriptUrl || '';

  /* ---------- Loader and hero intro ---------- */
  const loader = $('.loader');
  let started = false;

  function heroIntro() {
    if (!animate) return;
    const tl = gsap.timeline({ delay: 0.1 });
    tl.to('.hero-title .line > span', { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1 })
      .to('[data-hero]', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, clearProps: 'transform' }, '-=0.85')
      .addLabel('facts', '-=0.6');
    $$('[data-count]').forEach((el) => {
      const counter = { v: 0 };
      tl.to(counter, {
        v: Number(el.dataset.count),
        duration: 1.4,
        ease: 'power2.out',
        onUpdate: () => { el.textContent = String(Math.round(counter.v)); },
      }, 'facts');
    });
  }

  function startSite() {
    if (started) return;
    started = true;
    window.__strykonReady = true;
    window.dispatchEvent(new Event('strykon:ready'));
    heroIntro();
  }

  if (loader && animate) {
    gsap.set('.hero-title .line > span', { yPercent: 110 });
    gsap.set('[data-hero]', { opacity: 0, y: 26 });
    gsap.timeline({ onComplete: () => loader.remove() })
      .fromTo('.loader-logo', { opacity: 0, y: 18, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out' })
      .fromTo('.loader-bar i', { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'power2.inOut' }, '-=0.35')
      .to('.loader-logo, .loader-bar', { opacity: 0, y: -14, duration: 0.35, ease: 'power2.in' })
      .add(startSite)
      .fromTo(loader, { clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.95, ease: 'power4.inOut' }, '<');
    // Failsafe: if frames are starved (very slow device, background tab), show the content anyway
    setTimeout(() => {
      startSite();
      setTimeout(() => {
        if (loader.isConnected) loader.remove();
        gsap.set('.hero-title .line > span', { yPercent: 0 });
        gsap.set('[data-hero]', { opacity: 1, y: 0 });
      }, 2600);
    }, 4200);
  } else {
    if (loader) loader.remove();
    startSite();
  }

  if (animate && hasST) {
    gsap.matchMedia().add('(min-width: 901px)', () => {
      gsap.to('.hero-inner', {
        yPercent: -14,
        opacity: 0.15,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });
    });
  }

  /* ---------- Expertise ticker ---------- */
  const mTrack = $('.marquee-track');
  if (mTrack && animate) {
    mTrack.classList.add('is-gsap');
    const loop = gsap.to(mTrack, { xPercent: -50, duration: 52, ease: 'none', repeat: -1 });
    loop.totalTime(loop.duration() * 500); // room to run backwards when scrolling up
    if (hasST) {
      let target = 1;
      let dir = 1;
      ScrollTrigger.create({
        onUpdate: (self) => {
          const v = self.getVelocity();
          dir = v < 0 ? -1 : 1;
          target = dir * (1 + Math.min(Math.abs(v) / 260, 7));
        },
      });
      gsap.ticker.add(() => {
        const cur = loop.timeScale();
        loop.timeScale(cur + (target - cur) * 0.08);
        target += (dir - target) * 0.05;
      });
    }
  }

  /* ---------- Court drawings ---------- */
  $$('[data-mini]').forEach((el) => {
    const sp = C.byId[el.dataset.mini];
    if (sp) el.innerHTML = C.miniSVG(sp);
  });

  const cycler = $('#court-cycler');
  const cyclerLabel = $('#court-cycler-label');
  if (cycler) {
    const ids = ['tennis', 'pickleball', 'basketball', 'padel', 'badminton', 'football'];
    cycler.innerHTML = ids.map((id) => C.miniSVG(C.byId[id])).join('');
    const svgs = $$('svg', cycler);
    let i = 0;
    const show = () => {
      svgs.forEach((s, k) => s.classList.toggle('is-on', k === i));
      const sp = C.byId[ids[i]];
      cyclerLabel.textContent = `${sp.tab} · ${C.fmtDims(sp.L, sp.W)}`;
    };
    show();
    if (!reduceMotion) setInterval(() => { i = (i + 1) % ids.length; show(); }, 2800);
  }

  /* ---------- Sports surfaces gallery ---------- */
  const surfaces = $('#surfaces');
  const sTrack = $('#surfaces-track');
  const sBar = $('#surfaces-bar');
  const sCount = $('#surfaces-count');
  const sCards = $$('.s-card', sTrack);
  const setMeter = (p) => {
    const n = sCards.length;
    sBar.style.transform = `scaleX(${Math.max(1 / n, Math.min(1, p))})`;
    sCount.textContent = String(Math.min(n, Math.round(p * (n - 1)) + 1)).padStart(2, '0');
  };
  sTrack.addEventListener('scroll', () => {
    const max = sTrack.scrollWidth - sTrack.clientWidth;
    setMeter(max > 0 ? sTrack.scrollLeft / max : 0);
  }, { passive: true });

  if (animate && hasST) {
    gsap.matchMedia().add('(min-width: 1000px) and (min-height: 640px)', () => {
      surfaces.classList.add('is-pinned');
      const dist = () => Math.max(0, sTrack.scrollWidth - sTrack.clientWidth);
      gsap.to(sTrack, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: surfaces,
          start: 'top top',
          end: () => `+=${dist()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => setMeter(self.progress),
        },
      });
      return () => surfaces.classList.remove('is-pinned');
    });
  }

  /* ---------- Court planner ---------- */
  const tabsEl = $('#planner-tabs');
  const tabs = $$('.tab', tabsEl);
  const panel = $('#planner-panel');
  const stage = $('#stage');
  const stageInner = $('#stage-inner');
  const spec = $('#spec-panel');
  let current = C.byId.pickleball;

  function stageSVG(sp, cw) {
    const ch = Math.round(Math.min(460, Math.max(280, cw * 0.56)));
    const m = { t: 24, r: 86, b: 70, l: 24 };
    const aw = Math.max(40, cw - m.l - m.r);
    const ah = ch - m.t - m.b;
    const s = Math.min(aw / sp.FL, ah / sp.FW);
    const fw = sp.FL * s, fh = sp.FW * s;
    const fx = m.l + (aw - fw) / 2, fy = m.t + (ah - fh) / 2;
    const px = fx + ((sp.FL - sp.L) / 2) * s, py = fy + ((sp.FW - sp.W) / 2) * s;
    const lx2 = px + sp.L * s, ly2 = py + sp.W * s;
    const dy = fy + fh + 18, dx = fx + fw + 18;
    const bar = [1, 2, 5, 10, 20, 50, 100].find((v) => v * s >= 48) || 100;
    const barEnd = m.l + bar * s, by = ch - 16;
    const r = (v) => v.toFixed(1);

    return `<svg class="cv" viewBox="0 0 ${cw} ${ch}" width="${cw}" height="${ch}" role="img" aria-label="${sp.name} drawn to scale: ${sp.area || C.fmtDims(sp.L, sp.W)}">
      <g transform="translate(${r(px)} ${r(py)}) scale(${s.toFixed(4)})">${sp.draw()}</g>
      <g class="annot">
        <g class="dim">
          <line x1="${r(px)}" y1="${r(fy + fh + 6)}" x2="${r(px)}" y2="${r(dy + 6)}"/>
          <line x1="${r(lx2)}" y1="${r(fy + fh + 6)}" x2="${r(lx2)}" y2="${r(dy + 6)}"/>
          <line x1="${r(px)}" y1="${r(dy)}" x2="${r(lx2)}" y2="${r(dy)}"/>
          <line x1="${r(fx + fw + 6)}" y1="${r(py)}" x2="${r(dx + 6)}" y2="${r(py)}"/>
          <line x1="${r(fx + fw + 6)}" y1="${r(ly2)}" x2="${r(dx + 6)}" y2="${r(ly2)}"/>
          <line x1="${r(dx)}" y1="${r(py)}" x2="${r(dx)}" y2="${r(ly2)}"/>
        </g>
        <text class="dim-label" x="${r((px + lx2) / 2)}" y="${r(dy + 20)}" text-anchor="middle">${C.fmtM(sp.L)} m</text>
        <text class="dim-label" x="${r(dx + 10)}" y="${r((py + ly2) / 2 + 4)}">${C.fmtM(sp.W)} m</text>
        <g class="bar">
          <line x1="${m.l}" y1="${by}" x2="${r(barEnd)}" y2="${by}"/>
          <line x1="${m.l}" y1="${by - 5}" x2="${m.l}" y2="${by + 5}"/>
          <line x1="${r(barEnd)}" y1="${by - 5}" x2="${r(barEnd)}" y2="${by + 5}"/>
        </g>
        <text class="bar-label" x="${r(barEnd + 8)}" y="${by + 4}">${bar} m</text>
      </g>
    </svg>`;
  }

  function renderStage(withMotion) {
    const cw = Math.floor(stage.clientWidth);
    if (cw <= 0) return;
    stageInner.innerHTML = stageSVG(current, cw);
    if (withMotion && animate) {
      gsap.fromTo(stageInner.firstElementChild, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.7, ease: 'expo.out' });
    }
  }

  function renderSpec(sp, withMotion) {
    const area = sp.area
      ? sp.area
      : `<span class="mono">${C.fmtDims(sp.L, sp.W)}</span> <small>(${C.ftDims(sp.L, sp.W)})</small>`;
    spec.innerHTML = `
      <p class="spec-kicker">${sp.kicker}</p>
      <h3>${sp.name}</h3>
      <dl class="spec-list">
        <div><dt>Playing area</dt><dd>${area}</dd></div>
        <div><dt>Space to plan for</dt><dd><span class="mono">${C.fmtDims(sp.FL, sp.FW)}</span> <small>(${C.ftDims(sp.FL, sp.FW)})</small></dd></div>
        <div><dt>Surface</dt><dd>${sp.surface}</dd></div>
        <div><dt>Base</dt><dd>${sp.base}</dd></div>
      </dl>
      <p class="spec-note">${sp.note}</p>
      <a class="btn btn-primary btn-sm" href="#contact" data-option="${sp.option}">Book a site visit for ${sp.enquire}</a>`;
    if (withMotion && animate) {
      gsap.from(spec.children, { opacity: 0, y: 14, duration: 0.6, ease: 'power3.out', stagger: 0.05, clearProps: 'all' });
    }
  }

  function selectSport(id, withMotion = true) {
    const sp = C.byId[id];
    if (!sp || !sp.tab) return;
    current = sp;
    tabs.forEach((t) => {
      const on = t.dataset.sport === id;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', `tab-${id}`);
    renderStage(withMotion);
    renderSpec(sp, withMotion);
  }

  tabs.forEach((t) => t.addEventListener('click', () => selectSport(t.dataset.sport)));
  tabsEl.addEventListener('keydown', (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const keys = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const next = tabs[(keys[e.key] + tabs.length) % tabs.length];
    selectSport(next.dataset.sport);
    next.focus();
  });

  const view2d = $('#view-2d');
  const view3d = $('#view-3d');
  const setView = (is3d) => {
    stage.classList.toggle('is-3d', is3d);
    view2d.setAttribute('aria-pressed', String(!is3d));
    view3d.setAttribute('aria-pressed', String(is3d));
  };
  view2d.addEventListener('click', () => setView(false));
  view3d.addEventListener('click', () => setView(true));

  let resizeFrame = 0;
  const onResize = () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => renderStage(false));
  };
  if ('ResizeObserver' in window) new ResizeObserver(onResize).observe(stage);
  else window.addEventListener('resize', onResize);
  selectSport(current.id, false);

  /* ---------- Plot checker ---------- */
  const plotL = $('#plot-l');
  const plotW = $('#plot-w');
  const plotResults = $('#plot-results');
  const plotSummary = $('#plot-summary');
  let plotUnit = 'm';
  let plotEdited = false;

  const plotValues = () => {
    const l = parseFloat(plotL.value), w = parseFloat(plotW.value);
    return l > 0 && w > 0 ? { l, w } : null;
  };

  function renderPlot() {
    const v = plotValues();
    if (!v) {
      plotSummary.textContent = 'Enter both sides of your plot to see what fits.';
      plotResults.innerHTML = '';
      return;
    }
    const k = plotUnit === 'ft' ? 1 / C.FT_PER_M : 1;
    const a = Math.max(v.l, v.w) * k, b = Math.min(v.l, v.w) * k;
    const areaNum = Math.round(v.l * v.w).toLocaleString('en-IN');
    const area = plotUnit === 'ft' ? `${areaNum} sq ft` : `${areaNum} m²`;
    plotSummary.innerHTML = `${plotEdited ? 'Your plot' : 'Example plot'}: <strong>${C.fmtM(v.l)} × ${C.fmtM(v.w)} ${plotUnit}</strong> (${area}).${plotEdited ? '' : ' Replace it with your own measurements.'}`;

    plotResults.innerHTML = C.SPORTS.map((sp) => {
      const fits = Math.max(
        Math.floor(a / sp.FL) * Math.floor(b / sp.FW),
        Math.floor(a / sp.FW) * Math.floor(b / sp.FL),
      );
      const need = plotUnit === 'ft' ? C.ftDims(sp.FL, sp.FW) : C.fmtDims(sp.FL, sp.FW);
      const pill = fits > 0
        ? `<span class="fit-pill yes">Fits ${fits}</span>`
        : '<span class="fit-pill no">Too small</span>';
      return `<li><button class="fit-row" type="button" data-show="${sp.id}" aria-label="${sp.tab}: needs ${need}. ${fits > 0 ? `Fits ${fits}` : 'Too small'}. Show drawing.">
        <span class="fit-name">${sp.tab}</span><span class="fit-need">needs ${need}</span>${pill}</button></li>`;
    }).join('');
  }

  [plotL, plotW].forEach((el) => el.addEventListener('input', () => { plotEdited = true; renderPlot(); }));
  $$('input[name="plot-unit"]').forEach((radio) => radio.addEventListener('change', () => {
    const next = radio.value;
    if (next === plotUnit) return;
    [plotL, plotW].forEach((el) => {
      const v = parseFloat(el.value);
      if (v > 0) el.value = next === 'ft' ? Math.round(v * C.FT_PER_M) : Math.round((v / C.FT_PER_M) * 10) / 10;
    });
    plotUnit = next;
    renderPlot();
  }));
  renderPlot();

  /* ---------- Infrastructure tabs ---------- */
  const infraTabs = $$('.infra-tab');
  const infraPanels = $$('.infra-panel');
  function selectInfra(id, focus) {
    infraTabs.forEach((t) => {
      const on = t.dataset.infra === id;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    infraPanels.forEach((p) => {
      const on = p.id === `infra-${id}`;
      p.hidden = !on;
      if (!on) return;
      const art = $('.infra-art-svg', p);
      if (art && window.StrykonIso) {
        art.innerHTML = window.StrykonIso.render(id, reduceMotion ? '' : 'is-drawing');
      }
      if (animate) gsap.from($$('.infra-copy > *', p), { opacity: 0, y: 16, duration: 0.6, ease: 'power3.out', stagger: 0.05, clearProps: 'all' });
    });
  }
  infraTabs.forEach((t) => t.addEventListener('click', () => selectInfra(t.dataset.infra)));
  const infraList = $('.infra-tabs');
  if (infraList) {
    infraList.addEventListener('keydown', (e) => {
      const i = infraTabs.indexOf(document.activeElement);
      if (i < 0) return;
      const keys = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: infraTabs.length - 1 };
      if (!(e.key in keys)) return;
      e.preventDefault();
      selectInfra(infraTabs[(keys[e.key] + infraTabs.length) % infraTabs.length].dataset.infra, true);
    });
    // Draw the first blueprint when the section scrolls into view
    const first = infraTabs[0] && infraTabs[0].dataset.infra;
    if (first) {
      selectInfra(first);
      if (hasST && animate) {
        ScrollTrigger.create({ trigger: '#infrastructure', start: 'top 70%', once: true, onEnter: () => selectInfra(first) });
      }
    }
  }

  /* ---------- Recent projects (preview of projects.html) ---------- */
  const teaser = $('#projects');
  const teaserGrid = $('#projects-grid');
  function renderTeaser() {
    // While the sheet is loading, wait rather than flash sample entries it may replace
    const list = S.visibleProjects().filter((p) => !(S.content.pending && p.sample)).slice(0, 3);
    teaser.hidden = !list.length;
    teaserGrid.innerHTML = list.map((p) => `
      <li>
        <a class="p-card" href="projects.html#p-${esc(p.id)}" data-tilt>
          <div class="p-cover">${S.projectCover(p)}${p.sample ? '<span class="p-sample">Sample entry</span>' : ''}</div>
          <div class="p-body">
            <p class="p-cat mono">${esc(S.CATEGORIES[p.category] || p.category)}</p>
            <h3>${esc(p.title)}</h3>
            <p class="p-meta">${esc([p.location, p.year].filter(Boolean).join(' · '))}</p>
          </div>
        </a>
      </li>`).join('');
    S.enhance(teaserGrid);
  }
  if (teaser && teaserGrid) {
    const waiting = S.content.pending;
    renderTeaser();
    // Projects added from Google Forms arrive a moment after the page loads
    S.content.ready.then((changed) => {
      if (!changed && !waiting) return;
      renderTeaser();
      if (hasST) ScrollTrigger.refresh();
    });
  }

  /* ---------- Managing director profiles ---------- */
  $$('[data-profile]').forEach((btn) => {
    const dlg = document.getElementById(btn.dataset.profile);
    if (!dlg) return;
    btn.addEventListener('click', () => {
      if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
      document.documentElement.classList.add('modal-open');
      if (animate) gsap.from($('.pm-inner', dlg), { opacity: 0, y: 30, scale: 0.98, duration: 0.5, ease: 'power3.out', clearProps: 'all' });
    });
  });
  $$('.profile-modal').forEach((dlg) => {
    dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });
    dlg.addEventListener('close', () => document.documentElement.classList.remove('modal-open'));
  });

  /* ---------- Process timeline ---------- */
  const timeline = $('#timeline');
  const tSteps = $$('.t-step', timeline);
  if (animate && hasST) {
    timeline.classList.add('is-animated');
    gsap.fromTo('#timeline-fill', { scaleY: 0 }, {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: { trigger: timeline, start: 'top 65%', end: 'bottom 65%', scrub: 0.5 },
    });
    tSteps.forEach((s) => ScrollTrigger.create({
      trigger: s,
      start: 'top 68%',
      onEnter: () => s.classList.add('is-active'),
      onLeaveBack: () => s.classList.remove('is-active'),
    }));
  } else {
    tSteps.forEach((s) => s.classList.add('is-active'));
  }

  /* ---------- Site-visit booking ---------- */
  const form = $('#booking-form');
  const doneEl = $('#booking-done');
  const datesEl = $('#bk-dates');
  const slotsEl = $('#bk-slots');
  const slotNote = $('#bk-slot-note');
  const summaryEl = $('#bk-summary');
  const errorEl = $('#bk-error');
  const submitBtn = $('#bk-submit');
  const serviceSel = $('#bk-service');
  const SLOTS = B.slots || ['10:00', '11:30', '14:00', '15:30', '17:00'];
  const OPEN = B.openDays || [1, 2, 3, 4, 5, 6];

  const pad2 = (n) => String(n).padStart(2, '0');
  const isoDate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const timeLabel = (t) => {
    const [h, m] = t.split(':').map(Number);
    return `${((h + 11) % 12) + 1}:${pad2(m)} ${h < 12 ? 'AM' : 'PM'}`;
  };
  const dateLabel = (iso, opts = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', opts);

  // Date chips: the next open days, starting tomorrow
  const days = [];
  for (let d = new Date(), guard = 0; days.length < (B.daysAhead || 21) && guard < 90; guard++) {
    d.setDate(d.getDate() + 1);
    if (OPEN.includes(d.getDay())) days.push(new Date(d));
  }
  datesEl.innerHTML = days.map((d, i) => {
    const v = isoDate(d);
    return `<input type="radio" name="date" id="bk-d-${v}" value="${v}">
      <label for="bk-d-${v}" class="date-chip"><span class="dc-dow">${d.toLocaleDateString('en-IN', { weekday: 'short' })}</span><span class="dc-day">${d.getDate()}</span><span class="dc-mon">${d.toLocaleDateString('en-IN', { month: 'short' })}</span></label>`;
  }).join('');

  function renderSlots(taken = [], loading = false) {
    const chosen = form.elements.time ? form.elements.time.value : '';
    slotsEl.innerHTML = SLOTS.map((t, i) => {
      const off = taken.includes(t) || loading;
      return `<input type="radio" name="time" id="bk-t-${t.replace(':', '')}" value="${t}" ${off ? 'disabled' : ''} ${!off && t === chosen ? 'checked' : ''}>
        <label for="bk-t-${t.replace(':', '')}" class="slot-chip${taken.includes(t) ? ' is-taken' : ''}">${timeLabel(t)}</label>`;
    }).join('');
    slotsEl.classList.toggle('is-loading', loading);
    updateSummary();
  }

  function updateSummary() {
    const d = form.elements.date ? form.elements.date.value : '';
    const t = form.elements.time ? form.elements.time.value : '';
    summaryEl.textContent = d && t
      ? `Your slot: ${dateLabel(d, { weekday: 'long', day: 'numeric', month: 'long' })} at ${timeLabel(t)}`
      : d ? `${dateLabel(d, { weekday: 'long', day: 'numeric', month: 'long' })}: now pick a time` : 'Pick a date, then a time.';
    summaryEl.classList.toggle('is-ready', Boolean(d && t));
  }

  async function loadAvailability(date) {
    if (!API) { renderSlots(); return; }
    renderSlots([], true);
    slotNote.textContent = 'Checking availability…';
    try {
      const res = await fetch(`${API}?action=slots&date=${encodeURIComponent(date)}`);
      const json = await res.json();
      const taken = (json.slots || []).filter((s) => !s.available).map((s) => s.time);
      renderSlots(taken);
      slotNote.textContent = taken.length === SLOTS.length ? 'This day is fully booked. Please pick another date.' : 'Greyed-out times are already booked.';
    } catch (err) {
      renderSlots();
      slotNote.textContent = '';
    }
  }

  renderSlots();
  form.addEventListener('change', (e) => {
    if (e.target.name === 'date') loadAvailability(e.target.value);
    if (e.target.name === 'date' || e.target.name === 'time') { errorEl.hidden = true; updateSummary(); }
  });

  const bookingData = () => {
    const d = new FormData(form);
    const get = (k) => String(d.get(k) || '').trim();
    return {
      name: get('name'), phone: get('phone'), email: get('email'), service: get('service'),
      location: get('location'), size: get('size'), message: get('message'),
      date: get('date'), time: get('time'), website: get('website'),
    };
  };

  const bookingText = (b) => [
    'Hello Strykon Sports & Infrastructure Pvt Ltd! We are planning a project. Can you book an appointment for a site visit?',
    '',
    `Preferred slot: ${dateLabel(b.date)} at ${timeLabel(b.time)}`,
    `Name: ${b.name}`,
    `Phone: ${b.phone}`,
    b.email ? `Email: ${b.email}` : null,
    `Service: ${b.service}`,
    `Site location: ${b.location}`,
    b.size ? `Plot / project size: ${b.size}` : null,
    b.message ? `Notes: ${b.message}` : null,
  ].filter((r) => r !== null).join('\n');

  const gcalLink = (b) => {
    const start = new Date(`${b.date}T${b.time}:00+05:30`);
    const end = new Date(start.getTime() + (B.durationMinutes || 60) * 60000);
    const fmt = (d) => d.toISOString().replace(/[-:]|\.\d{3}/g, '');
    const q = new URLSearchParams({
      action: 'TEMPLATE',
      text: 'Site visit with Strykon Sports & Infrastructure',
      dates: `${fmt(start)}/${fmt(end)}`,
      details: `Service: ${b.service}\nQuestions? Call ${cfg.phoneDisplay} or WhatsApp us.`,
      location: b.location,
    });
    return `https://calendar.google.com/calendar/render?${q.toString()}`;
  };

  // mode 'confirmed': booked in our calendar (WhatsApp also opened). 'whatsapp': WhatsApp opened only.
  function showDone(b, mode) {
    const slot = `${dateLabel(b.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} at ${timeLabel(b.time)}`;
    const text = bookingText(b);
    const confirmed = mode === 'confirmed';
    doneEl.innerHTML = `
      <span class="done-badge ${confirmed ? 'ok' : ''}" aria-hidden="true">${confirmed ? '✓' : '→'}</span>
      <h3 class="form-title" id="done-title" tabindex="-1">${confirmed ? 'Thank you for contacting Strykon!' : 'Press Send in WhatsApp'}</h3>
      <p class="done-slot"><strong>${esc(slot)}</strong><br>${esc(b.service)} · ${esc(b.location)}</p>
      <p class="form-note">${confirmed
        ? `We have received your site visit booking request. Our team will review it and contact you shortly to confirm your preferred date and time.${b.email ? ` A confirmation is on its way to ${esc(b.email)}.` : ''}`
        : 'WhatsApp has opened with your booking details. Press Send there, and our team will contact you shortly to confirm your preferred date and time.'}</p>
      ${confirmed ? '<p class="form-note">WhatsApp has opened with your details too: press Send there to reach us directly.</p>' : ''}
      <div class="done-actions">
        <a class="btn btn-primary" href="${esc(S.waLink(text))}" target="_blank" rel="noopener">Open WhatsApp again</a>
        ${confirmed
          ? `<a class="btn btn-outline" href="${esc(gcalLink(b))}" target="_blank" rel="noopener">Add to Google Calendar</a>`
          : `<a class="btn btn-outline" href="mailto:${esc(cfg.email)}?subject=${encodeURIComponent(`Site visit request: ${b.name}`)}&amp;body=${encodeURIComponent(text)}">Email it instead</a>`}
      </div>
      <button class="text-link" type="button" id="edit-booking">${confirmed ? 'Book another visit' : 'Edit details'}</button>`;
    form.hidden = true;
    doneEl.hidden = false;
    if (animate) gsap.from(doneEl.children, { opacity: 0, y: 16, duration: 0.6, ease: 'power3.out', stagger: 0.06, clearProps: 'all' });
    $('#done-title').focus();
    $('#edit-booking').addEventListener('click', () => {
      doneEl.hidden = true;
      form.hidden = false;
      if (confirmed) { form.reset(); renderSlots(); }
      $('#bk-name').focus();
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const b = bookingData();
    if (b.website) return; // spam trap
    if (!b.date || !b.time) {
      errorEl.textContent = 'Please pick a date and a time for the visit.';
      errorEl.hidden = false;
      $('#bk-when').scrollIntoView({ behavior: scrollBehavior, block: 'center' });
      return;
    }
    // WhatsApp opens straight away with the details filled in (it must open during the click, or browsers
    // block it); the booking goes to the Google Calendar and the business inboxes at the same time.
    window.open(S.waLink(bookingText(b)), '_blank', 'noopener');
    if (!API) { showDone(b, 'whatsapp'); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Booking…';
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ ...b, page: location.href }),
        keepalive: true, // finish sending even if the phone switches to WhatsApp
      });
      const json = await res.json();
      if (json.ok) {
        showDone(b, 'confirmed');
      } else {
        errorEl.textContent = json.error || 'We could not book that slot. Please try another time.';
        errorEl.hidden = false;
        if (json.taken) loadAvailability(b.date);
      }
    } catch (err) {
      showDone(b, 'whatsapp');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Book site visit';
    }
  });

  /* ---------- Cross-links: drawings, services and the booking form ---------- */
  const focusName = () => setTimeout(() => $('#bk-name').focus({ preventScroll: true }), reduceMotion ? 0 : 700);
  const preselect = (service) => {
    if (!service) return;
    const opt = Array.from(serviceSel.options).find((o) => o.value === service || o.text === service);
    if (opt) serviceSel.value = opt.value;
    doneEl.hidden = true;
    form.hidden = false;
  };

  document.addEventListener('click', (e) => {
    const show = e.target.closest('[data-show]');
    if (show) {
      selectSport(show.dataset.show);
      if (show.tagName === 'BUTTON') tabsEl.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
      return;
    }
    const opt = e.target.closest('[data-option]');
    if (opt) { preselect(opt.dataset.option); focusName(); }
  });

  $('#plot-enquire').addEventListener('click', () => {
    const v = plotValues();
    preselect('Not sure yet');
    if (v) $('#bk-size').value = `${C.fmtM(v.l)} × ${C.fmtM(v.w)} ${plotUnit}`;
    focusName();
  });

  // Service chosen on the projects page ("Plan a similar project")
  try {
    const pre = localStorage.getItem('strykon:prefill');
    if (pre) { preselect(pre); localStorage.removeItem('strykon:prefill'); }
  } catch (err) { /* storage unavailable */ }
})();
