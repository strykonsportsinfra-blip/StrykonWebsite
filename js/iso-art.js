/* Strykon isometric "blueprint" drawings for the infrastructure services.
   Each scene is built from simple 3D boxes and faces, projected isometrically and drawn back to front.
   Used by the Infrastructure section and as cover art for projects without photos. */
(() => {
  'use strict';

  const COS = Math.cos(Math.PI / 6);
  const proj = (x, y, z) => [(x - y) * COS, (x + y) * 0.5 - z];
  const f = (n) => +n.toFixed(2);

  function Scene() {
    const els = [];
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const track = (X, Y, r = 0) => {
      minX = Math.min(minX, X - r); maxX = Math.max(maxX, X + r);
      minY = Math.min(minY, Y - r); maxY = Math.max(maxY, Y + r);
    };
    const pt = (p) => { const [X, Y] = proj(p[0], p[1], p[2]); track(X, Y); return `${f(X)},${f(Y)}`; };

    const s = {
      poly(points, cls) { els.push(`<polygon points="${points.map(pt).join(' ')}" class="${cls}" pathLength="1"/>`); return s; },
      line(a, b, cls = 'i-ln') {
        const [x1, y1] = proj(a[0], a[1], a[2]);
        const [x2, y2] = proj(b[0], b[1], b[2]);
        track(x1, y1); track(x2, y2);
        els.push(`<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" class="${cls}" pathLength="1"/>`);
        return s;
      },
      polyline(points, cls = 'i-ln') { els.push(`<polyline points="${points.map(pt).join(' ')}" class="${cls}" pathLength="1"/>`); return s; },
      // Solid box: top, left face (y = y+d, facing the viewer's left) and right face (x = x+w)
      box(x, y, z, w, d, h, tone = '') {
        const x1 = x + w, y1 = y + d, z1 = z + h;
        s.poly([[x, y, z1], [x1, y, z1], [x1, y1, z1], [x, y1, z1]], `i-top ${tone}`);
        s.poly([[x1, y, z1], [x1, y1, z1], [x1, y1, z], [x1, y, z]], `i-right ${tone}`);
        s.poly([[x, y1, z1], [x1, y1, z1], [x1, y1, z], [x, y1, z]], `i-left ${tone}`);
        return s;
      },
      quad(points, tone = '') { return s.poly(points, `i-face ${tone}`); },
      // Rectangle on a plane of constant y (seen on the left) or constant x (seen on the right)
      faceL(y, x, z, w, h, tone) { return s.quad([[x, y, z], [x + w, y, z], [x + w, y, z + h], [x, y, z + h]], tone); },
      faceR(x, y, z, w, h, tone) { return s.quad([[x, y, z], [x, y + w, z], [x, y + w, z + h], [x, y, z + h]], tone); },
      ground(x, y, w, d) {
        els.push(`<polygon points="${[[x, y, 0], [x + w, y, 0], [x + w, y + d, 0], [x, y + d, 0]].map(pt).join(' ')}" class="i-ground"/>`);
        return s;
      },
      disc(x, y, z, r, tone = '', n = 28) {
        const pts = [];
        for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r, z]); }
        return s.poly(pts, `i-face ${tone}`);
      },
      dot(x, y, z, r, cls) {
        const [X, Y] = proj(x, y, z);
        track(X, Y, r);
        els.push(`<circle cx="${f(X)}" cy="${f(Y)}" r="${f(r)}" class="${cls}" pathLength="1"/>`);
        return s;
      },
      tree(x, y, h, r = 1.4) {
        s.line([x, y, 0], [x, y, h * 0.55], 'i-trunk');
        s.dot(x, y, h * 0.62, r, 'i-crown');
        return s.dot(x + 0.25, y + 0.2, h * 0.86, r * 0.75, 'i-crown i-crown-2');
      },
      sun(x, y, z, r) {
        const [X, Y] = proj(x, y, z);
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          const x1 = X + Math.cos(a) * r * 1.45, y1 = Y + Math.sin(a) * r * 1.45;
          const x2 = X + Math.cos(a) * r * 2.0, y2 = Y + Math.sin(a) * r * 2.0;
          track(x2, y2);
          els.push(`<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" class="i-ray" pathLength="1"/>`);
        }
        return s.dot(x, y, z, r, 'i-sun');
      },
      // Tilted solar panel on legs, rising towards the back (smaller y)
      panel(x, y, z, w, d, rise, legs = true) {
        if (legs) {
          s.line([x + 0.2, y, z], [x + 0.2, y, z + rise], 'i-ln2');
          s.line([x + w - 0.2, y, z], [x + w - 0.2, y, z + rise], 'i-ln2');
        }
        s.quad([[x, y, z + rise], [x + w, y, z + rise], [x + w, y + d, z], [x, y + d, z]], 'p');
        const cols = Math.max(2, Math.round(w / 0.8));
        for (let k = 1; k < cols; k++) s.line([x + (w * k) / cols, y, z + rise], [x + (w * k) / cols, y + d, z], 'i-cell');
        return s.line([x, y + d / 2, z + rise / 2], [x + w, y + d / 2, z + rise / 2], 'i-cell');
      },
      svg(className = '') {
        const pad = 1.4;
        const w = maxX - minX + pad * 2, h = maxY - minY + pad * 2;
        const body = els.map((e, i) => e.replace(/^<(\w+)/, `<$1 style="--i:${i}"`)).join('');
        return `<svg class="iso ${className}" viewBox="${f(minX - pad)} ${f(minY - pad)} ${f(w)} ${f(h)}" style="--sw:${f(w / 430)}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">${body}</svg>`;
      },
    };
    return s;
  }

  const SCENES = {
    solar(s) {
      s.ground(-3, -3, 30, 16);
      s.sun(21, -11, 15, 1.7);
      // Building with a rooftop array
      s.box(0, 0, 0, 10, 8, 6);
      [1.2, 4.2, 7.2].forEach((x) => s.faceL(8, x, 1.2, 1.8, 1.5, 'w').faceL(8, x, 3.7, 1.8, 1.4, 'w'));
      [1.4, 4.8].forEach((y) => s.faceR(10, y, 1.2, 1.7, 1.5, 'w').faceR(10, y, 3.7, 1.7, 1.4, 'w'));
      for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) s.panel(0.5 + c * 2.35, 0.5 + r * 2.5, 6, 2.1, 1.6, 0.8);
      // Inverter and cable run to the ground-mounted array
      s.polyline([[9.6, 7.2, 6], [10, 7.2, 6], [10, 7.2, 1.7], [10.9, 7.2, 1.7]], 'i-cable');
      s.box(10.3, 6.7, 0, 1, 0.8, 1.7, 'g');
      s.polyline([[11.3, 7.1, 0.3], [13.4, 7.1, 0.3], [13.4, 8.6, 0.3]], 'i-cable');
      for (let r = 0; r < 4; r++) s.panel(13.5, 0.4 + r * 2.6, 0.3, 11, 1.8, 1.1);
    },

    residential(s) {
      s.ground(-4, -3, 19, 16);
      s.quad([[6.4, 8, 0.01], [8.6, 8, 0.01], [8.6, 11, 0.01], [6.4, 11, 0.01]], 'pave');
      s.box(0, 0, 0, 10, 8, 3.2);
      s.faceL(8, 1, 0.9, 1.6, 1.5, 'w').faceL(8, 3.6, 0.9, 1.6, 1.5, 'w').faceL(8, 6.9, 0, 1.4, 2.4, 'door');
      s.faceR(10, 1.5, 0.9, 4.5, 1.6, 'w');
      s.box(-0.4, -0.4, 3.2, 10.8, 8.8, 0.35, 'slab');
      s.box(0, 0, 3.55, 7, 8, 3);
      s.faceL(8, 1, 4.3, 2, 1.6, 'w').faceL(8, 4.2, 4.3, 2.2, 1.6, 'w');
      s.faceR(7, 1.5, 4.3, 5, 1.7, 'w');
      // Terrace railing
      s.line([10.4, -0.4, 4.5], [10.4, 8.4, 4.5]).line([7, 8.4, 4.5], [10.4, 8.4, 4.5]);
      [0.8, 2.6, 4.4, 6.2, 8].forEach((y) => s.line([10.4, y, 3.55], [10.4, y, 4.5], 'i-ln2'));
      [8.1, 9.3].forEach((x) => s.line([x, 8.4, 3.55], [x, 8.4, 4.5], 'i-ln2'));
      s.box(-0.3, -0.3, 6.55, 7.6, 8.6, 0.35, 'slab');
      s.box(1, 1, 6.9, 1.6, 1.6, 1.3, 'g');
      s.tree(12, 0.5, 4.6, 1.3);
      s.box(14, -3, 0, 0.4, 14.4, 1.3, 'slab');
      s.tree(-2.2, 9, 4.8, 1.5);
      s.box(-4, 11, 0, 10, 0.4, 1.3, 'slab');
      s.box(5.9, 10.9, 0, 0.6, 0.6, 1.9, 'g');
      [6.9, 7.4, 7.9].forEach((x) => s.line([x, 11.2, 0], [x, 11.2, 1.4], 'i-ln2'));
      s.line([6.5, 11.2, 1.4], [8.4, 11.2, 1.4]);
      s.box(8.4, 10.9, 0, 0.6, 0.6, 1.9, 'g');
      s.box(9, 11, 0, 5.4, 0.4, 1.3, 'slab');
    },

    interiors(s) {
      s.box(0, 0, -0.4, 12, 10, 0.4, 'wood');
      for (let k = 1; k < 8; k++) s.line([0, k * 1.25, 0.005], [12, k * 1.25, 0.005], 'i-ln2');
      s.box(0, -0.4, 0, 12, 0.4, 6);
      s.box(-0.4, -0.4, 0, 0.4, 10.4, 6);
      // Window and TV on the back wall
      s.faceL(0, 8.2, 2, 3, 2.8, 'w');
      s.line([9.7, 0, 2], [9.7, 0, 4.8], 'i-ln2').line([8.2, 0, 3.4], [11.2, 0, 3.4], 'i-ln2');
      s.faceL(0, 3.2, 2.1, 3.4, 1.9, 'screen');
      s.box(2.8, 0, 0, 4.2, 0.9, 0.9, 'wood');
      // Shelves and art on the side wall
      s.box(0, 1.2, 3.4, 0.5, 2.6, 0.12, 'wood').box(0, 1.2, 4.5, 0.5, 2.6, 0.12, 'wood');
      s.box(0.05, 1.4, 3.52, 0.35, 0.35, 0.65, 'g').box(0.05, 1.9, 3.52, 0.35, 0.3, 0.5, 'light').box(0.05, 2.6, 4.62, 0.35, 0.4, 0.55, 'g');
      s.faceR(0, 6.2, 2.6, 2.4, 1.8, 'art');
      s.quad([[3.5, 3, 0.01], [9.2, 3, 0.01], [9.2, 8, 0.01], [3.5, 8, 0.01]], 'rug');
      // Sofa against the side wall
      s.box(0.3, 2.6, 0, 2.5, 0.4, 1.4, 'g');
      s.box(0.3, 3, 0, 0.7, 5, 2, 'g');
      s.box(1, 3, 0, 1.8, 5, 1, 'g');
      s.box(1.05, 3.5, 1, 0.5, 1.3, 0.8, 'light').box(1.05, 5.9, 1, 0.5, 1.3, 0.8, 'light');
      s.box(0.3, 8, 0, 2.5, 0.4, 1.4, 'g');
      s.box(4.8, 4.6, 0, 2.4, 1.8, 0.75, 'wood');
      s.line([6, 5.5, 6.6], [6, 5.5, 4.8], 'i-ln2');
      s.box(5.6, 5.1, 4.4, 0.8, 0.8, 0.4, 'lamp');
      s.box(8.5, 5, 0, 1.8, 1.8, 0.9, 'light');
      s.box(10.1, 5, 0, 0.4, 1.8, 1.8, 'light');
      s.line([1.3, 9.2, 0], [1.3, 9.2, 4], 'i-ln2');
      s.box(0.95, 8.85, 4, 0.7, 0.7, 0.7, 'lamp');
      s.box(10.4, 8.4, 0, 0.9, 0.9, 1, 'light');
      s.dot(10.85, 8.85, 2.1, 1, 'i-crown');
    },

    commercial(s) {
      s.ground(-4, -4, 24, 18);
      for (let k = 0; k < 5; k++) s.line([13 + k * 1.6, 8, 0.01], [13 + k * 1.6, 11, 0.01], 'i-ln2');
      s.box(-0.15, -0.15, 15.9, 7.3, 7.3, 0.3, 'g');
      s.box(0, 0, 0, 7, 7, 16, 'glass');
      for (let k = 1; k < 5; k++) s.line([k * 1.4, 7, 0], [k * 1.4, 7, 16], 'i-ln2').line([7, k * 1.4, 0], [7, k * 1.4, 16], 'i-ln2');
      for (let k = 1; k < 8; k++) s.line([0, 7, k * 2], [7, 7, k * 2], 'i-ln2').line([7, 0, k * 2], [7, 7, k * 2], 'i-ln2');
      s.box(2, 2, 16, 3, 3, 1.3, 'slab');
      s.box(7, -1, 0, 7, 8, 5, 'glass');
      for (let k = 1; k < 5; k++) s.line([7 + k * 1.4, 7, 0], [7 + k * 1.4, 7, 5], 'i-ln2').line([14, -1 + k * 1.6, 0], [14, -1 + k * 1.6, 5], 'i-ln2');
      s.line([7, 7, 2.5], [14, 7, 2.5], 'i-ln2').line([14, -1, 2.5], [14, 7, 2.5], 'i-ln2');
      s.quad([[8, 0, 5.01], [13, 0, 5.01], [13, 6, 5.01], [8, 6, 5.01]], 'lawn');
      s.line([1.7, 8.6, 0], [1.7, 8.6, 3.2]).line([5.3, 8.6, 0], [5.3, 8.6, 3.2]);
      s.box(1.5, 7, 3.2, 4, 1.8, 0.3, 'g');
      s.tree(0, 11, 3.6, 1.2).tree(4, 11.5, 3.2, 1.1).tree(8.5, 11, 3.4, 1.2);
    },

    civil(s) {
      s.ground(-4, -4, 30, 17);
      s.box(-3, -1.4, 0, 26, 0.4, 2.2);
      for (let x = -3; x <= 21; x += 4) s.box(x, -1.55, 0, 0.7, 0.7, 2.6, 'slab');
      s.box(-3, 1, -0.15, 26, 6, 0.15, 'road');
      for (let x = -2; x < 22; x += 3) s.line([x, 4, 0.01], [x + 1.6, 4, 0.01], 'i-dash');
      s.line([-3, 1.35, 0.01], [23, 1.35, 0.01], 'i-ln2').line([-3, 6.65, 0.01], [23, 6.65, 0.01], 'i-ln2');
      s.disc(6, 2.6, 0.01, 0.6, 'slab');
      s.box(13, 2.2, 0.5, 3.2, 2, 1.3, 'g');
      s.box(13.6, 2.6, 1.8, 1.6, 1.3, 1.2, 'glass');
      s.box(16.3, 2, 0, 1.4, 2.4, 1.4, 'dark');
      s.box(9.6, 5.2, 0, 0.5, 0.5, 0.9, 'cone').box(11.2, 5.5, 0, 0.5, 0.5, 0.9, 'cone');
      s.box(-3, 7, 0, 26, 1.2, 0.3, 'slab');
      s.box(-3, 8.2, -0.5, 26, 0.9, 0.5, 'dark');
      for (let x = -2.5; x < 23; x += 1.3) s.line([x, 8.2, 0.01], [x, 9.1, 0.01], 'i-ln2');
      [0, 9, 18].forEach((x) => {
        s.line([x, 7.6, 0.3], [x, 7.6, 6]).line([x, 7.6, 6], [x, 6.3, 6.3]);
        s.box(x - 0.3, 5.8, 6.05, 0.6, 0.8, 0.3, 'lamp');
      });
      s.box(-3, 9.1, 0, 26, 2.2, 0.2, 'pave');
    },

    railway(s) {
      s.ground(-4, -5, 31, 17);
      // Platform with a canopy, at the back
      s.box(-3, -4, 0, 26, 4.6, 1, 'slab');
      s.line([-3, 0.45, 1.01], [23, 0.45, 1.01], 'i-dash');
      [-1, 5, 11, 17].forEach((x) => s.line([x, -2, 1], [x, -2, 4.3], 'i-ln2'));
      s.box(-2.6, -3.6, 4.3, 22.4, 3.6, 0.3, 'g');
      // Overhead line masts behind the tracks
      [0, 8, 16].forEach((x) => s.line([x, 1.1, 0], [x, 1.1, 6.8]));
      // Ballast, sleepers and rails
      const track = (y) => {
        s.box(-3, y, 0, 26, 3.2, 0.25, 'pave');
        for (let x = -2.6; x < 23; x += 0.85) s.line([x, y + 0.35, 0.26], [x, y + 2.85, 0.26], 'i-sleeper');
        s.line([-3, y + 0.9, 0.34], [23, y + 0.9, 0.34], 'i-rail').line([-3, y + 2.3, 0.34], [23, y + 2.3, 0.34], 'i-rail');
      };
      track(1.6);
      // Train: two coaches and a locomotive with its pantograph up
      [1, 8.8].forEach((x) => {
        s.box(x, 1.85, 0.45, 7.4, 2.7, 3.1);
        for (let k = 0; k < 5; k++) s.faceL(4.55, x + 0.6 + k * 1.35, 1.9, 0.9, 0.9, 'w');
      });
      s.box(16.6, 1.85, 0.45, 5, 2.7, 3.3, 'g');
      s.faceR(21.6, 2.3, 2.1, 1.8, 1.1, 'w');
      s.faceL(4.55, 17.4, 2, 1.2, 1, 'w');
      s.polyline([[18.5, 3.2, 3.75], [19.3, 3.2, 5], [18.7, 3.2, 6.1]], 'i-ln2');
      track(5.6);
      // Mast arms and contact wires over both tracks
      [0, 8, 16].forEach((x) => s.line([x, 1.1, 6.4], [x, 8.6, 6.4], 'i-ln2'));
      s.line([-3, 3.2, 6.1], [23, 3.2, 6.1], 'i-wire').line([-3, 7.2, 6.1], [23, 7.2, 6.1], 'i-wire');
      // Signal at the front
      s.line([24, 9.6, 0], [24, 9.6, 4.2]);
      s.box(23.7, 9.4, 4.2, 0.6, 0.4, 1.4, 'dark');
      s.dot(24, 9.8, 5.2, 0.17, 'i-sig-r').dot(24, 9.8, 4.65, 0.17, 'i-sig-g');
      s.tree(-2.5, 10.6, 4.2, 1.3);
    },
  };

  const cache = {};
  function render(kind, className) {
    if (!SCENES[kind]) return '';
    if (!cache[kind]) {
      const s = Scene();
      SCENES[kind](s);
      cache[kind] = s;
    }
    return cache[kind].svg(className);
  }

  window.StrykonIso = { render, kinds: Object.keys(SCENES) };
})();
