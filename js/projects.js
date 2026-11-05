/* Strykon projects page: project grid with filters, project details, client reviews and the review form. */
(() => {
  'use strict';

  const S = window.Strykon;
  const { cfg, $, $$, esc, gsap, animate } = S;
  const root = document.documentElement;
  let projects = [];
  let reviews = [];

  // Decorative blueprint in the page hero
  const heroArt = $('#page-hero-art');
  if (heroArt && window.StrykonIso) heroArt.innerHTML = window.StrykonIso.render('commercial', S.reduceMotion ? '' : 'is-drawing');

  const openDialog = (d) => {
    if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
    root.classList.add('modal-open');
  };

  /* ---------- Projects ---------- */
  const grid = $('#p-list');
  const empty = $('#p-empty');
  const filtersEl = $('#p-filters');
  const label = (p) => S.CATEGORIES[p.category] || p.category;
  let current = 'all';

  const card = (p) => `
    <li>
      <button class="p-card" type="button" data-open="${esc(p.id)}" data-tilt aria-label="${esc(p.title)}: view details">
        <div class="p-cover">${S.projectCover(p)}${p.sample ? '<span class="p-sample">Sample entry</span>' : ''}${p.photos && p.photos.length > 1 ? `<span class="p-count mono">${p.photos.length} photos</span>` : ''}</div>
        <div class="p-body">
          <p class="p-cat mono">${esc(label(p))}</p>
          <h3>${esc(p.title)}</h3>
          <p class="p-meta">${esc([p.location, p.year].filter(Boolean).join(' · '))}</p>
          ${p.summary ? `<p class="p-summary">${esc(p.summary)}</p>` : ''}
          ${p.scope && p.scope.length ? `<ul class="specs">${p.scope.slice(0, 3).map((s) => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}
        </div>
      </button>
    </li>`;

  function renderFilters() {
    const cats = Object.keys(S.CATEGORIES).filter((k) => projects.some((p) => p.category === k));
    if (!cats.includes(current)) current = 'all';
    const chip = (key, text, count) =>
      `<button class="chip" type="button" data-cat="${key}" aria-pressed="${key === current}">${esc(text)} <span>${count}</span></button>`;
    filtersEl.innerHTML = [
      chip('all', 'All', projects.length),
      ...cats.map((k) => chip(k, S.CATEGORIES[k], projects.filter((p) => p.category === k).length)),
    ].join('');
    filtersEl.hidden = projects.length === 0;
  }

  function renderGrid() {
    const items = current === 'all' ? projects : projects.filter((p) => p.category === current);
    grid.innerHTML = items.map(card).join('');
    grid.removeAttribute('aria-busy');
    empty.hidden = projects.length > 0;
    S.enhance(grid);
    if (animate) gsap.from(grid.children, { opacity: 0, y: 30, duration: 0.7, ease: 'power3.out', stagger: 0.06, clearProps: 'all' });
  }

  // Placeholder cards while projects load from the Google Sheet
  function renderLoading() {
    grid.innerHTML = '<li class="p-skel"></li>'.repeat(3);
    grid.setAttribute('aria-busy', 'true');
    filtersEl.hidden = true;
    empty.hidden = true;
  }

  filtersEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cat]');
    if (!btn) return;
    current = btn.dataset.cat;
    $$('.chip', filtersEl).forEach((c) => c.setAttribute('aria-pressed', String(c === btn)));
    renderGrid();
  });

  /* ---------- Project details ---------- */
  const dlg = $('#p-modal');
  const media = $('#pm-media');
  const body = $('#pm-body');
  const SERVICE = {
    residential: 'Residential building', commercial: 'Commercial building', civil: 'Civil & site works',
    solar: 'Solar power project', railway: 'Indian railway project',
  };
  const serviceFor = (p) => {
    if (p.category === 'sports') {
      const sp = window.StrykonCourts && window.StrykonCourts.byId[p.court];
      return (sp && sp.option) || 'Not sure yet';
    }
    return SERVICE[p.category] || 'Not sure yet';
  };

  function showPhoto(p, i) {
    const photos = p.photos || [];
    const thumbs = p.thumbs || photos;
    media.innerHTML = photos.length
      ? `<img class="pm-photo" src="${esc(photos[i])}" alt="${esc(p.title)}, photo ${i + 1} of ${photos.length}" referrerpolicy="no-referrer">
         ${photos.length > 1 ? `<div class="pm-thumbs">${photos.map((src, k) => `<button type="button" data-photo="${k}" aria-label="Show photo ${k + 1}" aria-pressed="${k === i}"><img src="${esc(thumbs[k] || src)}" alt="" loading="lazy" referrerpolicy="no-referrer"></button>`).join('')}</div>` : ''}`
      : `<div class="pm-art">${S.projectCover(p)}</div>`;
  }

  function open(id, push = true) {
    const p = projects.find((x) => x.id === id);
    if (!p) return;
    showPhoto(p, 0);
    const facts = [
      ['Category', label(p)], ['Location', p.location], ['Year', p.year], ['Client', p.client], ['Size', p.size],
    ].filter(([, v]) => v);
    body.innerHTML = `
      ${p.sample ? '<span class="p-sample p-sample-inline">Sample entry</span>' : ''}
      <p class="p-cat mono">${esc(label(p))}</p>
      <h2 id="pm-title">${esc(p.title)}</h2>
      ${p.description ? `<p class="pm-desc">${esc(p.description)}</p>` : ''}
      <dl class="pm-facts">${facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      ${p.scope && p.scope.length ? `<p class="pm-label">Scope of work</p><ul class="specs">${p.scope.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}
      <div class="pm-actions">
        <a class="btn btn-primary" href="index.html#contact" data-plan="${esc(serviceFor(p))}">Plan a similar project</a>
        <a class="btn btn-outline" href="${esc(S.waLink(S.waText(`a project like your ${p.title.replace(/\s*\(sample\)/i, '')}`)))}" target="_blank" rel="noopener">Ask on WhatsApp</a>
      </div>`;
    openDialog(dlg);
    if (push) history.replaceState(null, '', `#p-${id}`);
    if (animate) gsap.from('.pm-inner', { opacity: 0, y: 30, scale: 0.98, duration: 0.5, ease: 'power3.out', clearProps: 'all' });
    dlg._project = p;
  }

  dlg.addEventListener('close', () => {
    root.classList.remove('modal-open');
    if (location.hash.startsWith('#p-')) history.replaceState(null, '', location.pathname + location.search);
  });
  $('#pm-close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg) { dlg.close(); return; }
    const thumb = e.target.closest('[data-photo]');
    if (thumb && dlg._project) showPhoto(dlg._project, Number(thumb.dataset.photo));
    const plan = e.target.closest('[data-plan]');
    if (plan) {
      try { localStorage.setItem('strykon:prefill', plan.dataset.plan); } catch (err) { /* storage unavailable */ }
    }
  });
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-open]');
    if (btn) open(btn.dataset.open);
  });
  const openFromLink = () => {
    if (location.hash.startsWith('#p-') && !dlg.open) open(location.hash.slice(3), false);
  };

  /* ---------- Reviews ---------- */
  const rList = $('#r-list');
  const rEmpty = $('#r-empty');
  const stars = (n) => {
    const r = Math.max(0, Math.min(5, Math.round(Number(n) || 0)));
    return `<span class="stars" role="img" aria-label="${r} out of 5 stars">${'<i class="on"></i>'.repeat(r)}${'<i></i>'.repeat(5 - r)}</span>`;
  };
  const month = (d) => {
    if (!d) return '';
    const dt = new Date(`${d}-01T00:00:00`);
    return Number.isNaN(dt.getTime()) ? String(d) : dt.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };

  function renderReviews() {
    rList.innerHTML = reviews.map((r) => `
      <li class="r-card">
        ${r.sample ? '<span class="p-sample p-sample-inline">Sample entry</span>' : ''}
        ${stars(r.rating)}
        <blockquote><p>${esc(r.text)}</p></blockquote>
        <div class="r-who">
          <span class="monogram" aria-hidden="true">${esc((r.name || '?').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase())}</span>
          <span><strong>${esc(r.name)}</strong><small>${esc([r.role, r.location].filter(Boolean).join(', '))}</small></span>
        </div>
        <p class="r-project mono">${esc([r.project, month(r.date)].filter(Boolean).join(' · '))}</p>
      </li>`).join('');
    rEmpty.hidden = reviews.length > 0 || S.content.pending;
    if (animate && window.ScrollTrigger) {
      const cards = $$('.r-card', rList);
      gsap.set(cards, { opacity: 0, y: 40 });
      window.ScrollTrigger.batch(cards, {
        start: 'top 92%',
        once: true,
        onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08, clearProps: 'transform' }),
      });
    }
  }

  /* ---------- Render now, and again when the Google Sheet answers ---------- */
  function refresh() {
    // While the sheet is loading, show placeholders rather than sample entries it may replace
    const loading = S.content.pending;
    const real = (list) => list.filter((x) => !x.sample);
    projects = S.visibleProjects();
    reviews = S.visibleReviews();
    if (loading) { projects = real(projects); reviews = real(reviews); }
    $('#sample-note').hidden = !(S.showSamples && (projects.some((p) => p.sample) || reviews.some((r) => r.sample)));
    if (loading && !projects.length) renderLoading();
    else { renderFilters(); renderGrid(); }
    renderReviews();
  }

  const waiting = S.content.pending;
  refresh();
  openFromLink();
  S.content.ready.then((changed) => {
    if (!changed && !waiting) return;
    refresh();
    openFromLink();
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  });

  /* ---------- Write a review ---------- */
  const rDlg = $('#r-modal');
  const rForm = $('#review-form');
  const rDone = $('#review-done');
  const rError = $('#rv-error');
  const rSubmit = $('#rv-submit');
  const rateEl = $('#rv-rating');
  const googleBtn = $('#review-google');

  if (cfg.googleReviewUrl) {
    googleBtn.href = cfg.googleReviewUrl;
    googleBtn.hidden = false;
  }

  $('#review-cta').addEventListener('click', () => {
    rForm.hidden = false;
    rDone.hidden = true;
    rError.hidden = true;
    openDialog(rDlg);
    if (animate) gsap.from('.rm-inner', { opacity: 0, y: 30, scale: 0.98, duration: 0.5, ease: 'power3.out', clearProps: 'all' });
  });
  $('#rm-close').addEventListener('click', () => rDlg.close());
  rDlg.addEventListener('click', (e) => { if (e.target === rDlg) rDlg.close(); });
  rDlg.addEventListener('close', () => root.classList.remove('modal-open'));

  // Stars light up to the one hovered or chosen
  const chosenRating = () => Number(rForm.elements.rating.value || 0);
  const paintStars = (n) => $$('label', rateEl).forEach((l, i) => l.classList.toggle('on', i < n));
  rateEl.addEventListener('change', () => { paintStars(chosenRating()); rError.hidden = true; });
  rateEl.addEventListener('pointerover', (e) => {
    const l = e.target.closest('label');
    if (l) paintStars(Number(l.dataset.n));
  });
  rateEl.addEventListener('pointerleave', () => paintStars(chosenRating()));

  const reviewText = (r) => [
    "Hi Strykon Sports & Infrastructure! Here's my review:",
    '',
    `${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)} (${r.rating}/5)`,
    r.text,
    '',
    `– ${[r.name, r.role, r.location].filter(Boolean).join(', ')}`,
    r.project ? `Project: ${r.project}` : null,
  ].filter((line) => line !== null).join('\n');

  const showError = (msg) => {
    rError.textContent = msg;
    rError.hidden = false;
  };

  function reviewDone(r, mode) {
    const text = reviewText(r);
    const first = r.name.split(/\s+/)[0];
    const sent = mode === 'sent';
    const handedOff = mode === 'whatsapp';
    rDone.innerHTML = `
      <span class="done-badge ${sent ? 'ok' : ''}" aria-hidden="true">${sent ? '✓' : '→'}</span>
      <h2 class="form-title" id="rv-done-title" tabindex="-1">${sent ? `Thank you, ${esc(first)}!` : handedOff ? 'Press Send in WhatsApp' : 'Send your review on WhatsApp'}</h2>
      <p class="form-note">${sent
        ? 'We have received your review. It will appear on this page once our team has checked it.'
        : handedOff
          ? 'WhatsApp has opened with your review. Press Send there to share it with us.'
          : 'We could not reach our server just now. You can send your review to us on WhatsApp instead.'}</p>
      ${cfg.googleReviewUrl ? '<p class="form-note">It would help us a lot if you also posted it on Google. We will copy your review so you can paste it there.</p>' : ''}
      <div class="done-actions">
        ${sent ? '' : `<a class="btn btn-primary" href="${esc(S.waLink(text))}" target="_blank" rel="noopener">${handedOff ? 'Open WhatsApp again' : 'Send on WhatsApp'}</a>`}
        ${cfg.googleReviewUrl ? `<a class="btn ${sent ? 'btn-primary' : 'btn-outline'}" href="${esc(cfg.googleReviewUrl)}" target="_blank" rel="noopener" id="rv-google">Post it on Google</a>` : ''}
        <button class="btn btn-outline" type="button" id="rv-close">Close</button>
      </div>`;
    rForm.hidden = true;
    rDone.hidden = false;
    $('#rv-done-title').focus();
    $('#rv-close').addEventListener('click', () => rDlg.close());
    const g = $('#rv-google');
    if (g && navigator.clipboard) g.addEventListener('click', () => { navigator.clipboard.writeText(r.text).catch(() => {}); });
    if (sent) { rForm.reset(); paintStars(0); }
  }

  rForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = new FormData(rForm);
    const get = (k) => String(d.get(k) || '').trim();
    const r = {
      rating: Number(get('rating')), name: get('name'), role: get('role'), location: get('location'),
      project: get('project'), text: get('text'), phone: get('phone'), website: get('website'),
    };
    if (r.website) return; // spam trap
    const problem = !r.rating ? 'Please choose a star rating.'
      : !r.name ? 'Please add your name.'
        : r.text.length < 10 ? 'Please write a few words about your project.' : '';
    if (problem) { showError(problem); return; }
    rError.hidden = true;

    if (!cfg.googleScriptUrl) {
      window.open(S.waLink(reviewText(r)), '_blank', 'noopener');
      reviewDone(r, 'whatsapp');
      return;
    }
    rSubmit.disabled = true;
    rSubmit.textContent = 'Sending…';
    try {
      const res = await fetch(cfg.googleScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ type: 'review', ...r }),
      });
      const json = await res.json();
      if (json.ok) reviewDone(r, 'sent');
      else showError(json.error || 'We could not send your review. Please try again.');
    } catch (err) {
      reviewDone(r, 'fallback');
    } finally {
      rSubmit.disabled = false;
      rSubmit.textContent = 'Send review';
    }
  });
})();
