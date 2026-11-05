/* Strykon hero scene: a floating site model built with Three.js (r149).
   Play: the turf pitch. Build: the layered base and the tower crane. Grow: the skyline rising behind. */
(() => {
  'use strict';

  const host = document.getElementById('hero-canvas');
  const hero = document.querySelector('.hero');
  if (!host || !hero) return;

  const fail = () => hero.classList.add('no-webgl');
  const THREE = window.THREE;
  if (typeof THREE === 'undefined') { fail(); return; }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (err) {
    fail();
    return;
  }

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isSmall = () => window.innerWidth < 900;
  const gsap = window.gsap;
  const animateIntro = !reduce && typeof gsap !== 'undefined';

  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = !isSmall();
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x032a50, 110, 230);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.5, 500);
  const target = new THREE.Vector3(0, 5, -3);

  /* ---------- Helpers ---------- */
  const mat = (color, opts = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.05, ...opts });
  const box = (w, h, d, material, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  };
  const canvasTex = (w, h, draw) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    t.anisotropy = 4;
    return t;
  };
  const repeatTex = (tex, rx, ry) => {
    const t = tex.clone();
    t.needsUpdate = true;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rx, ry);
    return t;
  };

  /* ---------- Textures ---------- */
  const noiseTex = (base, dots, count, rMax) => canvasTex(256, 64, (ctx, w, h) => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < count; i++) {
      ctx.fillStyle = dots[i % dots.length];
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, 0.6 + Math.random() * rMax, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  const stoneTex = repeatTex(noiseTex('#8b979c', ['#6c787d', '#a7b1b5', '#77848a'], 900, 2.4), 6, 1);
  const soilTex = repeatTex(noiseTex('#6e5b45', ['#5d4b37', '#806a52', '#4f3f2e'], 700, 1.8), 6, 1);

  // Turf: mowing stripes, with pitch lines revealed from the centre spot outwards
  const TW = 1024, TH = 576;
  const turfCanvas = document.createElement('canvas');
  turfCanvas.width = TW;
  turfCanvas.height = TH;
  const tctx = turfCanvas.getContext('2d');
  const linesCanvas = document.createElement('canvas');
  linesCanvas.width = TW;
  linesCanvas.height = TH;
  (() => {
    const ctx = linesCanvas.getContext('2d');
    const m = 36, cx = TW / 2, cy = TH / 2;
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.strokeRect(m, m, TW - 2 * m, TH - 2 * m);
    ctx.beginPath(); ctx.moveTo(cx, m); ctx.lineTo(cx, TH - m); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 72, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeRect(m, cy - 130, 128, 260);
    ctx.strokeRect(TW - m - 128, cy - 130, 128, 260);
    ctx.strokeRect(m, cy - 60, 48, 120);
    ctx.strokeRect(TW - m - 48, cy - 60, 48, 120);
    ctx.beginPath(); ctx.arc(m + 88, cy, 64, -0.9, 0.9); ctx.stroke();
    ctx.beginPath(); ctx.arc(TW - m - 88, cy, 64, Math.PI - 0.9, Math.PI + 0.9); ctx.stroke();
    [[cx, cy], [m + 88, cy], [TW - m - 88, cy]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill(); });
    [[m, m, 0, 0.5], [TW - m, m, 0.5, 1], [TW - m, TH - m, 1, 1.5], [m, TH - m, 1.5, 2]].forEach(([x, y, a, b]) => {
      ctx.beginPath(); ctx.arc(x, y, 14, a * Math.PI, b * Math.PI); ctx.stroke();
    });
  })();
  const turfTex = new THREE.CanvasTexture(turfCanvas);
  turfTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const paintTurf = (p) => {
    for (let i = 0; i < 14; i++) {
      tctx.fillStyle = i % 2 ? '#57a417' : '#4a9410';
      tctx.fillRect(Math.floor((i * TW) / 14), 0, Math.ceil(TW / 14) + 1, TH);
    }
    if (p > 0) {
      tctx.save();
      tctx.beginPath();
      tctx.arc(TW / 2, TH / 2, (p * Math.hypot(TW, TH)) / 2 + 1, 0, Math.PI * 2);
      tctx.clip();
      tctx.drawImage(linesCanvas, 0, 0);
      tctx.restore();
    }
    turfTex.needsUpdate = true;
  };

  // Building facades: windows in the map, lit windows in the emissive map
  const windowsTex = (facade, lit) => {
    const grid = (ctx, w, h, fill) => {
      for (let y = 6; y < h; y += 12) for (let x = 5; x < w - 4; x += 11) fill(ctx, x, y);
    };
    const map = canvasTex(64, 128, (ctx, w, h) => {
      ctx.fillStyle = facade; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255,255,255,0.10)';
      grid(ctx, w, h, (c, x, y) => c.fillRect(x, y, 7, 7));
    });
    const emissive = canvasTex(64, 128, (ctx, w, h) => {
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
      grid(ctx, w, h, (c, x, y) => {
        if (Math.random() < 0.45) { c.fillStyle = lit[Math.floor(Math.random() * lit.length)]; c.fillRect(x, y, 7, 7); }
      });
    });
    return { map, emissive };
  };
  const navyWin = windowsTex('#0b3566', ['#ffd9a0', '#e8f2ff', '#a6ec7a']);
  const greenWin = windowsTex('#2f8f17', ['#eaffd2', '#ffffff']);

  // Crane lattice (transparent between the braces)
  const latticeBase = canvasTex(64, 64, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 7;
    ctx.strokeRect(3, 3, w - 6, h - 6);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(4, 4); ctx.lineTo(w - 4, h - 4);
    ctx.moveTo(w - 4, 4); ctx.lineTo(4, h - 4);
    ctx.stroke();
  });
  const lattice = (rx, ry) => new THREE.MeshStandardMaterial({
    color: 0xe9eef3, map: repeatTex(latticeBase, rx, ry), transparent: true, alphaTest: 0.4,
    side: THREE.DoubleSide, roughness: 0.55, metalness: 0.35,
  });

  // Soft round sprite for the floating light particles
  const dotTex = canvasTex(64, 64, (ctx, w) => {
    const g = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.4, 'rgba(255,255,255,.5)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, w);
  });

  /* ---------- Lights ---------- */
  scene.add(new THREE.HemisphereLight(0xa8ccff, 0x0b2a14, 0.75));
  const sun = new THREE.DirectionalLight(0xffe2b8, 1.05);
  sun.position.set(-34, 52, 30);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -48, right: 48, top: 48, bottom: -48, near: 10, far: 170 });
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.02;
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0x7be03a, 0.4);
  rim.position.set(40, 22, -44);
  scene.add(rim);

  /* ---------- The site ---------- */
  const site = new THREE.Group();
  scene.add(site);

  const SW = 42, SD = 34, SZ = -4; // slab width (x), depth (z), centre z
  const soil = box(SW, 2.4, SD, new THREE.MeshStandardMaterial({ map: soilTex, roughness: 1 }), 0, -3.4, SZ);
  const stone = box(SW, 1.6, SD, new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 1 }), 0, -1.4, SZ);
  const slab = box(SW, 0.6, SD, mat(0xc9d0d6, { roughness: 0.9 }), 0, -0.3, SZ);
  slab.add(new THREE.LineSegments(
    new THREE.EdgesGeometry(slab.geometry),
    new THREE.LineBasicMaterial({ color: 0x7be03a, transparent: true, opacity: 0.35 }),
  ));
  const pad = box(37, 0.25, 21, mat(0x1b2a35), 0, 0.125, 1);
  const turfSide = mat(0x3a7a0a);
  const turf = new THREE.Mesh(
    new THREE.BoxGeometry(36, 0.32, 20),
    [turfSide, turfSide, new THREE.MeshStandardMaterial({ map: turfTex, roughness: 0.95 }), turfSide, turfSide, turfSide],
  );
  turf.position.set(0, 0.41, 1);
  turf.receiveShadow = true;
  site.add(soil, stone, slab, pad, turf);
  const layers = [
    { mesh: soil, y: soil.position.y, from: -30 },
    { mesh: stone, y: stone.position.y, from: -26 },
    { mesh: slab, y: slab.position.y, from: -22 },
    { mesh: pad, y: pad.position.y, from: 14 },
    { mesh: turf, y: turf.position.y, from: 18 },
  ];

  // Skyline (Grow)
  const panelGeo = new THREE.BoxGeometry(1.15, 0.06, 1.0);
  const panelMat = new THREE.MeshStandardMaterial({ color: 0x1c3f86, metalness: 0.6, roughness: 0.25, emissive: 0x0b2a5c, emissiveIntensity: 0.35 });
  const buildings = [];
  const windowMats = [];
  [
    [-15, -15.2, 4, 5, 9, 'n'], [-10.5, -16.2, 4, 5, 15, 'n'], [-6, -14.6, 3, 4, 11, 'g'],
    [-1.5, -16.4, 4.5, 5.5, 21, 'n'], [3, -15, 3, 4, 17, 'g'], [7.2, -16.6, 4, 4.5, 13, 'n'],
  ].forEach(([x, z, w, d, h, t], idx) => {
    const src = t === 'g' ? greenWin : navyWin;
    const rx = Math.max(1, w / 4), ry = h / 6;
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: repeatTex(src.map, rx, ry),
      emissive: 0xffffff,
      emissiveMap: repeatTex(src.emissive, rx, ry),
      emissiveIntensity: 1,
      roughness: t === 'g' ? 0.35 : 0.7,
      metalness: t === 'g' ? 0.35 : 0.1,
    });
    windowMats.push(material);
    const geo = new THREE.BoxGeometry(w, h, d);
    geo.translate(0, h / 2, 0);
    const b = new THREE.Mesh(geo, material);
    b.position.set(x, 0, z);
    b.castShadow = true;
    b.receiveShadow = true;
    const cap = box(w + 0.3, 0.4, d + 0.3, mat(t === 'g' ? 0x7be03a : 0x0d4a86, { roughness: 0.5 }), 0, h + 0.2, 0);
    b.add(cap);
    // Rooftop solar arrays (solar power projects)
    if (idx === 0 || idx === 5) {
      const cols = Math.max(1, Math.floor((w - 0.3) / 1.3));
      const rows = Math.max(1, Math.floor((d - 0.3) / 1.25));
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const p = new THREE.Mesh(panelGeo, panelMat);
          p.position.set(-w / 2 + 0.8 + c * 1.3, h + 0.72, -d / 2 + 0.75 + r * 1.25);
          p.rotation.x = 0.45;
          p.castShadow = true;
          b.add(p);
        }
      }
    }
    site.add(b);
    buildings.push(b);
  });

  // Building under construction (Build)
  const frame = new THREE.Group();
  frame.position.set(11.5, 0, -16.5);
  const concrete = mat(0xdfe4e8, { roughness: 0.8 });
  for (let f = 0; f < 4; f++) frame.add(box(5.4, 0.35, 5.4, concrete, 0, f * 3 + 0.18, 0));
  [[-2.4, -2.4], [2.4, -2.4], [-2.4, 2.4], [2.4, 2.4], [0, -2.4], [0, 2.4]].forEach(([x, z]) => frame.add(box(0.35, 10.5, 0.35, concrete, x, 5.25, z)));
  [[-2.4, -2.4], [2.4, -2.4], [-2.4, 2.4], [2.4, 2.4]].forEach(([x, z]) => frame.add(box(0.12, 3, 0.12, mat(0x4fbf1f), x, 12, z)));
  site.add(frame);

  // Tower crane (Build)
  const crane = new THREE.Group();
  crane.position.set(16, 0, -13);
  const MAST = 26;
  const mastGeo = new THREE.BoxGeometry(1.2, MAST, 1.2);
  mastGeo.translate(0, MAST / 2, 0);
  const mast = new THREE.Mesh(mastGeo, lattice(1, MAST / 1.2));
  crane.add(mast);
  const slew = new THREE.Group();
  slew.position.y = MAST;
  crane.add(slew);
  const JIB = 26;
  const jib = new THREE.Mesh(new THREE.BoxGeometry(JIB, 1, 1), lattice(JIB, 1));
  jib.position.set(-JIB / 2, 0.5, 0);
  const counterJib = new THREE.Mesh(new THREE.BoxGeometry(8, 0.8, 1), lattice(8, 1));
  counterJib.position.set(4.5, 0.4, 0);
  const apexGeo = new THREE.BoxGeometry(0.9, 6, 0.9);
  apexGeo.translate(0, 3, 0);
  const apex = new THREE.Mesh(apexGeo, lattice(1, 6));
  apex.position.y = 1;
  slew.add(jib, counterJib, apex);
  slew.add(box(2.2, 2, 1.6, mat(0x4fbf1f, { roughness: 0.5 }), 7.6, -0.6, 0));
  slew.add(box(1.8, 1.6, 1.8, mat(0xf2f5f8, { roughness: 0.4 }), 0.4, -0.9, 1.3));
  const tieMat = new THREE.LineBasicMaterial({ color: 0xcfd8e0, transparent: true, opacity: 0.8 });
  const tie = (a, b) => new THREE.Line(new THREE.BufferGeometry().setFromPoints([a, b]), tieMat);
  slew.add(tie(new THREE.Vector3(0, 7, 0), new THREE.Vector3(-JIB * 0.72, 1, 0)));
  slew.add(tie(new THREE.Vector3(0, 7, 0), new THREE.Vector3(8, 0.8, 0)));
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0x7be03a });
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 8), beaconMat);
  beacon.position.y = 7.3;
  slew.add(beacon);
  const trolley = new THREE.Group();
  trolley.position.set(-16, 0, 0);
  slew.add(trolley);
  trolley.add(box(1.4, 0.5, 1.4, mat(0x0d4a86), 0, -0.2, 0));
  const cableGeo = new THREE.BoxGeometry(0.08, 1, 0.08);
  cableGeo.translate(0, -0.5, 0);
  const cable = new THREE.Mesh(cableGeo, new THREE.MeshBasicMaterial({ color: 0xcfd8e0 }));
  trolley.add(cable);
  const hook = new THREE.Group();
  hook.add(box(0.7, 0.8, 0.7, mat(0xf2b300, { roughness: 0.5 })));
  hook.add(box(6, 0.5, 0.8, mat(0x4fbf1f, { roughness: 0.5 }), 0, -1.2, 0));
  trolley.add(hook);
  const setCable = (len) => { cable.scale.y = len; hook.position.y = -len - 0.4; };
  setCable(12);
  [mast, jib, counterJib, apex].forEach((m) => { m.castShadow = false; });
  site.add(crane);

  // Floodlights (Play after dark)
  const coneMat = new THREE.MeshBasicMaterial({
    color: 0xe6ffc4, transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending,
    depthWrite: false, side: THREE.DoubleSide, fog: false,
  });
  const headMat = new THREE.MeshStandardMaterial({ color: 0x223344, emissive: 0xf4ffe0, emissiveIntensity: 1.4 });
  const poleMat = mat(0xcfd8e0, { metalness: 0.6, roughness: 0.4 });
  [[-19, -10], [19, -10], [-19, 12], [19, 12]].forEach(([x, z]) => {
    site.add(box(0.35, 14, 0.35, poleMat, x, 7, z));
    const head = box(2.4, 1.2, 0.5, headMat, x, 14.4, z);
    head.lookAt(0, 0, 1);
    site.add(head);
    const from = new THREE.Vector3(x, 14, z);
    const to = new THREE.Vector3(x * 0.35, 0.5, 1 + (z - 1) * 0.3);
    const h = from.distanceTo(to);
    const geo = new THREE.ConeGeometry(h * 0.42, h, 32, 1, true);
    geo.translate(0, -h / 2, 0);
    const cone = new THREE.Mesh(geo, coneMat);
    cone.position.copy(from);
    cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), to.sub(from).normalize());
    site.add(cone);
  });
  const spotA = new THREE.SpotLight(0xeaffd0, 1.1, 90, 0.75, 0.6, 1);
  spotA.position.set(-19, 14, 12);
  spotA.target.position.set(2, 0, 0);
  const spotB = new THREE.SpotLight(0xeaffd0, 1.1, 90, 0.75, 0.6, 1);
  spotB.position.set(19, 14, -10);
  spotB.target.position.set(-2, 0, 2);
  site.add(spotA, spotA.target, spotB, spotB.target);

  // Ball in play
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.6, 24, 16), mat(0xffffff, { roughness: 0.4 }));
  ball.castShadow = true;
  ball.position.set(0, 1.2, 1);
  site.add(ball);

  // The green arc from the logo, orbiting under the site
  const arcMat = new THREE.MeshBasicMaterial({ color: 0x5fd12a, transparent: true, opacity: 0.95, fog: false });
  const arc2Mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, fog: false });
  const arcs = new THREE.Group();
  // Arcs are centred on the camera's side of the site (world angle = arc angle - group rotation)
  const ARC_LEN = Math.PI * 0.7;
  const arc = new THREE.Mesh(new THREE.TorusGeometry(30, 0.24, 8, 200, ARC_LEN), arcMat);
  arc.rotation.x = Math.PI / 2;
  arc.position.y = -7;
  const arc2 = new THREE.Mesh(new THREE.TorusGeometry(33, 0.09, 6, 200, Math.PI * 0.55), arc2Mat);
  arc2.rotation.x = Math.PI / 2;
  arc2.position.y = -5.5;
  arcs.add(arc, arc2);
  const ARC_BASE = ARC_LEN / 2 - 0.95;
  arcs.rotation.y = ARC_BASE;
  scene.add(arcs);

  // Light particles
  const N = isSmall() ? 120 : 260;
  const pPos = new Float32Array(N * 3);
  const pSpeed = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 90;
    pPos[i * 3 + 1] = Math.random() * 40 - 6;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 70;
    pSpeed[i] = 0.4 + Math.random();
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({
    color: 0xc4f58a, size: 0.55, map: dotTex, transparent: true, opacity: 0.75,
    depthWrite: false, blending: THREE.AdditiveBlending,
  });
  scene.add(new THREE.Points(pGeo, pMat));

  // Shadow catcher far below the floating site
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(260, 260), new THREE.ShadowMaterial({ opacity: 0.28 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -13;
  ground.receiveShadow = true;
  scene.add(ground);

  /* ---------- Camera and sizing ---------- */
  const cam = { az: 0.62, el: 0.5, r: 1 };
  const baseR = () => (isSmall() ? 124 : 136);
  const mouse = { x: 0, y: 0 };
  const eased = { x: 0, y: 0 };

  function placeCamera(t, p) {
    eased.x += (mouse.x - eased.x) * 0.05;
    eased.y += (mouse.y - eased.y) * 0.05;
    const drift = reduce ? 0 : Math.sin(t * 0.12) * 0.1;
    const az = cam.az + drift + eased.x * 0.14 + p * 0.4;
    const el = cam.el + eased.y * 0.06 + p * 0.14;
    const R = baseR() * cam.r * (1 - p * 0.16);
    camera.position.set(
      target.x + R * Math.cos(el) * Math.sin(az),
      target.y + R * Math.sin(el),
      target.z + R * Math.cos(el) * Math.cos(az),
    );
    camera.lookAt(target);
  }

  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, w > 1600 ? 1.5 : 1.75));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    if (isSmall()) camera.clearViewOffset();
    else camera.setViewOffset(w, h, -w * 0.22, h * 0.02, w, h);
    camera.updateProjectionMatrix();
    if (!running) renderOnce();
  }

  /* ---------- Animation ---------- */
  const clock = new THREE.Clock();
  let running = false;
  let inView = true;

  function heroProgress() {
    const r = hero.getBoundingClientRect();
    return Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)));
  }

  function step(t) {
    site.position.y = Math.sin(t * 0.5) * 0.35;
    slew.rotation.y = -0.35 + Math.sin(t * 0.16) * 0.55;
    trolley.position.x = -15 + Math.sin(t * 0.23) * 6;
    setCable(11 + Math.sin(t * 0.4) * 3);
    beaconMat.color.setHex((t % 1.6) < 0.8 ? 0x7be03a : 0x1d4a12);
    ball.position.set(Math.sin(t * 0.45) * 13, 1.15 + Math.abs(Math.sin(t * 2.6)) * 3.2, 1 + Math.sin(t * 0.9) * 5);
    ball.rotation.z = -t * 3;
    arcs.rotation.y = ARC_BASE + Math.sin(t * 0.18) * 0.18;
    arc2.rotation.z = Math.sin(t * 0.1) * 0.3;
    for (let i = 0; i < N; i++) {
      pPos[i * 3 + 1] += pSpeed[i] * 0.03;
      if (pPos[i * 3 + 1] > 36) pPos[i * 3 + 1] = -6;
    }
    pGeo.attributes.position.needsUpdate = true;
  }

  function renderOnce() {
    placeCamera(0, heroProgress());
    renderer.render(scene, camera);
  }

  function tick() {
    if (!running) return;
    const t = clock.getElapsedTime();
    step(t);
    placeCamera(t, heroProgress());
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  function updateLoop() {
    const should = inView && !document.hidden && !reduce;
    if (should && !running) { running = true; requestAnimationFrame(tick); }
    else if (!should) running = false;
  }

  /* ---------- Intro: the site assembles (Build), lines are painted (Play), the skyline rises (Grow) ---------- */
  const lineState = { p: animateIntro ? 0 : 1 };
  paintTurf(lineState.p);

  if (animateIntro) {
    layers.forEach((l) => { l.mesh.position.y = l.from; });
    buildings.forEach((b) => { b.scale.y = 0.001; });
    frame.scale.y = 0.001;
    mast.scale.y = 0.001;
    slew.scale.set(0.001, 1, 1);
    windowMats.forEach((m) => { m.emissiveIntensity = 0; });
    headMat.emissiveIntensity = 0;
    coneMat.opacity = 0;
    spotA.intensity = 0;
    spotB.intensity = 0;
    arcMat.opacity = 0;
    arc2Mat.opacity = 0;
    pMat.opacity = 0;
    ball.visible = false;
    Object.assign(cam, { az: 1.35, el: 0.92, r: 1.45 });
  }

  let introStarted = false;
  function intro() {
    if (introStarted || !animateIntro) return;
    introStarted = true;
    const tl = gsap.timeline();
    layers.forEach((l, i) => {
      tl.to(l.mesh.position, { y: l.y, duration: i < 3 ? 1.1 : 1, ease: i === 4 ? 'bounce.out' : 'power3.out' }, i < 3 ? i * 0.12 : 0.55 + (i - 3) * 0.12);
    });
    tl.to(cam, { az: 0.62, el: 0.5, r: 1, duration: 3.2, ease: 'power3.inOut' }, 0)
      .to(lineState, { p: 1, duration: 1.3, ease: 'power2.inOut', onUpdate: () => paintTurf(lineState.p) }, 1.3)
      .to(buildings.map((b) => b.scale), { y: 1, duration: 1.5, ease: 'expo.out', stagger: 0.09 }, 1.0)
      .to(frame.scale, { y: 1, duration: 1.6, ease: 'expo.out' }, 1.4)
      .to(mast.scale, { y: 1, duration: 1.2, ease: 'expo.out' }, 1.1)
      .to(slew.scale, { x: 1, duration: 1, ease: 'expo.out' }, 1.9)
      .to(windowMats, { emissiveIntensity: 1, duration: 1, stagger: 0.06 }, 2.1)
      .to(arcMat, { opacity: 0.95, duration: 1.2 }, 1.6)
      .to(arc2Mat, { opacity: 0.3, duration: 1.2 }, 1.8)
      .to(headMat, { emissiveIntensity: 1.8, duration: 0.08, repeat: 5, yoyo: true }, 2.4)
      .to(headMat, { emissiveIntensity: 1.4, duration: 0.3 }, 2.9)
      .to(coneMat, { opacity: 0.05, duration: 0.9 }, 2.9)
      .to([spotA, spotB], { intensity: 1.1, duration: 0.9 }, 2.9)
      .to(pMat, { opacity: 0.75, duration: 1.5 }, 2.6)
      .add(() => { ball.visible = true; }, 3.1);
  }

  if (animateIntro) {
    if (window.__strykonReady) intro();
    else window.addEventListener('strykon:ready', intro, { once: true });
    setTimeout(intro, 4500); // in case the page script never signals
  }

  /* ---------- Wiring ---------- */
  if (finePointer && !reduce) {
    window.addEventListener('pointermove', (e) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; updateLoop(); }).observe(hero);
  }
  document.addEventListener('visibilitychange', updateLoop);
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(host);
  else window.addEventListener('resize', resize);
  if (reduce) window.addEventListener('scroll', () => requestAnimationFrame(renderOnce), { passive: true });

  resize();
  updateLoop();
  hero.classList.add('has-webgl');
})();
