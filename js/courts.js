/* Strykon court drawings: official playing dimensions drawn to scale (all coordinates in metres).
   Shared by the home page (gallery, planner, plot checker) and the projects page (cover art). */
(() => {
  'use strict';

  const FT_PER_M = 3.28084;
  const n3 = (v) => +v.toFixed(3);

  const rect = (x, y, w, h, c = 'ln') => `<rect x="${n3(x)}" y="${n3(y)}" width="${n3(w)}" height="${n3(h)}" class="${c}"/>`;
  const line = (x1, y1, x2, y2, c = 'ln') => `<line x1="${n3(x1)}" y1="${n3(y1)}" x2="${n3(x2)}" y2="${n3(y2)}" class="${c}"/>`;
  const circle = (cx, cy, r, c = 'ln') => `<circle cx="${n3(cx)}" cy="${n3(cy)}" r="${n3(r)}" class="${c}"/>`;
  const path = (d, c = 'ln') => `<path d="${d}" class="${c}"/>`;
  const stripes = (x, y, w, h, count, c) => {
    const sw = w / count;
    let out = '';
    for (let i = 1; i < count; i += 2) out += rect(x + i * sw, y, sw, h, c);
    return out;
  };
  const stadium = (cx1, cx2, cy, r) =>
    `M${n3(cx1)} ${n3(cy - r)} L${n3(cx2)} ${n3(cy - r)} A${n3(r)} ${n3(r)} 0 0 1 ${n3(cx2)} ${n3(cy + r)} ` +
    `L${n3(cx1)} ${n3(cy + r)} A${n3(r)} ${n3(r)} 0 0 1 ${n3(cx1)} ${n3(cy - r)} Z`;

  // L × W = playing area; FL × FW = space to plan for, centred on it.
  const SPORTS = [
    {
      id: 'football', tab: 'Football', name: 'Football turf', kicker: 'Five-a-side pitch',
      L: 40, W: 20, FL: 44, FW: 24,
      surface: 'Artificial turf, 40–60 mm pile, with silica sand and rubber infill',
      base: 'Laser-levelled stone base over compacted sub-grade, with perimeter drainage',
      note: 'Seven-a-side needs about 60 × 40 m. Full-size pitches are usually 105 × 68 m.',
      option: 'Football turf', enquire: 'a football turf',
      draw: () =>
        rect(-2, -2, 44, 24, 'sf-turf') + stripes(-2, -2, 44, 24, 11, 'sf-turf-2') +
        rect(0, 0, 40, 20) + line(20, 0, 20, 20) + circle(20, 10, 3) + circle(20, 10, 0.18, 'dot') +
        path('M0 2.5 A6 6 0 0 1 6 8.5 L6 11.5 A6 6 0 0 1 0 17.5') +
        path('M40 2.5 A6 6 0 0 0 34 8.5 L34 11.5 A6 6 0 0 0 40 17.5') +
        circle(6, 10, 0.15, 'dot') + circle(34, 10, 0.15, 'dot') +
        circle(10, 10, 0.15, 'dot') + circle(30, 10, 0.15, 'dot') +
        rect(-1, 8.5, 1, 3, 'goal') + rect(40, 8.5, 1, 3, 'goal'),
    },
    {
      id: 'boxcricket', tab: 'Box cricket', name: 'Box cricket arena', kicker: 'Netted arena',
      L: 30.5, W: 18.3, FL: 30.5, FW: 18.3,
      surface: 'Outfield turf, 25–35 mm pile, with a hard-wearing pitch strip',
      base: 'Concrete or compacted stone base with a slight fall for drainage',
      note: 'Arenas are sized to your plot, and 100 × 60 ft is a common size. Netting encloses the sides and roof, usually 6–9 m high.',
      option: 'Box cricket', enquire: 'a box cricket arena',
      draw: () => {
        const cx = 15.25, cy = 9.15, half = 10.06; // 20.12 m between the stumps
        return rect(0, 0, 30.5, 18.3, 'sf-turf') + stripes(0, 0, 30.5, 18.3, 10, 'sf-turf-2') +
          rect(cx - 11.6, cy - 1.525, 23.2, 3.05, 'sf-pitch') +
          line(cx - half, cy - 1.32, cx - half, cy + 1.32) + line(cx + half, cy - 1.32, cx + half, cy + 1.32) +
          line(cx - half + 1.22, cy - 1.525, cx - half + 1.22, cy + 1.525) +
          line(cx + half - 1.22, cy - 1.525, cx + half - 1.22, cy + 1.525) +
          circle(cx - half, cy, 0.16, 'dot') + circle(cx + half, cy, 0.16, 'dot') +
          rect(0, 0, 30.5, 18.3, 'wall');
      },
    },
    {
      id: 'pickleball', tab: 'Pickleball', name: 'Pickleball court', kicker: 'Singles and doubles',
      L: 13.41, W: 6.1, FL: 18.29, FW: 9.14,
      surface: 'Cushioned acrylic system, 5–8 coats, textured for grip',
      base: 'Concrete or bituminous base laid to about a 1% fall',
      note: 'The non-volley zone (the kitchen) runs 2.13 m (7 ft) either side of the net. Courts can sit side by side in banks of two or four.',
      option: 'Pickleball court', enquire: 'a pickleball court',
      draw: () =>
        rect(-2.44, -1.52, 18.29, 9.14, 'sf-green') + rect(0, 0, 13.41, 6.1, 'sf-blue') +
        rect(4.575, 0, 4.26, 6.1, 'sf-kitchen') +
        rect(0, 0, 13.41, 6.1) + line(4.575, 0, 4.575, 6.1) + line(8.835, 0, 8.835, 6.1) +
        line(0, 3.05, 4.575, 3.05) + line(8.835, 3.05, 13.41, 3.05) +
        line(6.705, -0.3, 6.705, 6.4, 'net') + circle(6.705, -0.3, 0.09, 'post') + circle(6.705, 6.4, 0.09, 'post'),
    },
    {
      id: 'padel', tab: 'Padel', name: 'Padel court', kicker: 'Glass-walled court',
      L: 20, W: 10, FL: 21, FW: 11,
      surface: 'Sand-dressed synthetic turf, 10–12 mm',
      base: 'Reinforced concrete slab, level enough to set the wall frame true',
      note: 'Toughened glass walls at each end and mesh fencing along the sides. Indoors, allow at least 6 m of clear height.',
      option: 'Padel court', enquire: 'a padel court',
      draw: () =>
        rect(-0.5, -0.5, 21, 11, 'sf-frame') + rect(0, 0, 20, 10, 'sf-padel') +
        line(3.05, 0, 3.05, 10) + line(16.95, 0, 16.95, 10) + line(3.05, 5, 16.95, 5) +
        line(10, -0.15, 10, 10.15, 'net') +
        line(4, 0, 16, 0, 'mesh') + line(4, 10, 16, 10, 'mesh') +
        path('M4 0 L0 0 L0 10 L4 10', 'glass') + path('M16 0 L20 0 L20 10 L16 10', 'glass'),
    },
    {
      id: 'tennis', tab: 'Tennis', name: 'Tennis court', kicker: 'Doubles court',
      L: 23.77, W: 10.97, FL: 36.57, FW: 18.29,
      surface: 'Acrylic hard court; synthetic clay or artificial grass on request',
      base: 'Bituminous or concrete base, laser-levelled to a 0.8–1% fall',
      note: 'Run the long axis north–south so the low sun stays out of players’ eyes.',
      option: 'Tennis court', enquire: 'a tennis court',
      draw: () =>
        rect(-6.4, -3.66, 36.57, 18.29, 'sf-green') + rect(0, 0, 23.77, 10.97, 'sf-blue') +
        rect(0, 0, 23.77, 10.97) + line(0, 1.37, 23.77, 1.37) + line(0, 9.6, 23.77, 9.6) +
        line(5.485, 1.37, 5.485, 9.6) + line(18.285, 1.37, 18.285, 9.6) + line(5.485, 5.485, 18.285, 5.485) +
        line(0, 5.485, 0.3, 5.485) + line(23.47, 5.485, 23.77, 5.485) +
        line(11.885, -0.914, 11.885, 11.884, 'net') +
        circle(11.885, -0.914, 0.1, 'post') + circle(11.885, 11.884, 0.1, 'post'),
    },
    {
      id: 'badminton', tab: 'Badminton', name: 'Badminton court', kicker: 'Indoor court',
      L: 13.4, W: 6.1, FL: 17.4, FW: 10.1,
      surface: 'PVC sports mat (4.5–7 mm) or maple wood flooring',
      base: 'Level concrete or a sprung wooden sub-floor',
      note: 'Allow 2 m of clear floor around each court and at least 8 m of clear height above it.',
      option: 'Badminton court', enquire: 'a badminton court',
      draw: () =>
        rect(-2, -2, 17.4, 10.1, 'sf-floor') + rect(0, 0, 13.4, 6.1, 'sf-pvc') +
        rect(0, 0, 13.4, 6.1) + line(0, 0.46, 13.4, 0.46) + line(0, 5.64, 13.4, 5.64) +
        line(4.72, 0, 4.72, 6.1) + line(8.68, 0, 8.68, 6.1) +
        line(0.76, 0, 0.76, 6.1) + line(12.64, 0, 12.64, 6.1) +
        line(0, 3.05, 4.72, 3.05) + line(8.68, 3.05, 13.4, 3.05) +
        line(6.7, -0.1, 6.7, 6.2, 'net'),
    },
    {
      id: 'basketball', tab: 'Basketball', name: 'Basketball court', kicker: 'FIBA full court',
      L: 28, W: 15, FL: 32, FW: 19,
      surface: 'Acrylic or PP interlocking tiles outdoors; PU or maple wood indoors',
      base: 'Concrete slab laid to a 1% fall outdoors',
      note: 'Volleyball (18 × 9 m) and throwball lines can share the surface, marked in a second colour.',
      option: 'Basketball / multi-sport court', enquire: 'a basketball court',
      draw: () =>
        rect(-2, -2, 32, 19, 'sf-green') + rect(0, 0, 28, 15, 'sf-blue') +
        rect(0, 5.05, 5.8, 4.9, 'sf-key') + rect(22.2, 5.05, 5.8, 4.9, 'sf-key') + circle(14, 7.5, 1.8, 'sf-key') +
        rect(0, 0, 28, 15) + line(14, 0, 14, 15) + circle(14, 7.5, 1.8) +
        rect(0, 5.05, 5.8, 4.9) + rect(22.2, 5.05, 5.8, 4.9) +
        circle(5.8, 7.5, 1.8) + circle(22.2, 7.5, 1.8) +
        path('M0 0.9 L2.99 0.9 A6.75 6.75 0 0 1 2.99 14.1 L0 14.1') +
        path('M28 0.9 L25.01 0.9 A6.75 6.75 0 0 0 25.01 14.1 L28 14.1') +
        line(1.2, 6.6, 1.2, 8.4, 'board') + line(26.8, 6.6, 26.8, 8.4, 'board') +
        circle(1.575, 7.5, 0.23) + circle(26.425, 7.5, 0.23),
    },
    {
      id: 'track', tab: 'Athletic track', name: 'Athletic track', kicker: '400 m standard track',
      L: 176.91, W: 92.52, FL: 176.91, FW: 92.52,
      area: '400 m loop, 8 lanes of 1.22 m',
      surface: 'PU or EPDM rubber, 13 mm, as a full-PU or sandwich system',
      base: 'Bituminous macadam over a compacted stone base',
      note: 'The infield takes a full-size football pitch. Schools often start with a 200 m or 4-lane track.',
      option: 'Athletic track', enquire: 'an athletic track',
      draw: () => {
        const R = 46.26, S = 84.39, x1 = R, x2 = R + S; // 36.5 m inner radius + 8 × 1.22 m lanes
        let out = path(stadium(x1, x2, R, R), 'sf-track') + path(stadium(x1, x2, R, 36.5), 'sf-turf');
        for (let i = 0; i <= 8; i++) out += path(stadium(x1, x2, R, 36.5 + 1.22 * i), 'ln-thin');
        out += rect(35.955, 12.26, 105, 68, 'ln-thin') + line(88.455, 12.26, 88.455, 80.26, 'ln-thin') +
          circle(88.455, 46.26, 9.15, 'ln-thin');
        return out;
      },
    },
  ];
  const byId = Object.fromEntries(SPORTS.map((s) => [s.id, s]));

  // EPDM play areas (gallery card art; not in the planner)
  byId.play = {
    id: 'play', L: 20, W: 10, FL: 20, FW: 10,
    draw: () =>
      rect(0, 0, 20, 10, 'sf-epdm') + circle(4, 3.6, 2.3, 'sf-epdm-2') + circle(15.6, 6.4, 2.6, 'sf-epdm-3') +
      rect(8.4, 4.2, 1.6, 1.6) + rect(10, 4.2, 1.6, 1.6) + rect(11.6, 4.2, 1.6, 1.6) +
      path('M0 8.4 C 4 6.6, 7 9.8, 11 8.4 S 17 1.6, 20 2.6', 'ln-thin'),
  };

  const fmtM = (v) => String(Math.round(v * 100) / 100);
  const fmtDims = (l, w) => `${fmtM(l)} × ${fmtM(w)} m`;
  const ftDims = (l, w) => `${Math.round(l * FT_PER_M)} × ${Math.round(w * FT_PER_M)} ft`;

  const miniSVG = (sp) => {
    const pad = Math.max(sp.FL, sp.FW) * 0.04;
    const vb = [-(sp.FL - sp.L) / 2 - pad, -(sp.FW - sp.W) / 2 - pad, sp.FL + pad * 2, sp.FW + pad * 2].map(n3).join(' ');
    return `<svg class="cv" viewBox="${vb}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">${sp.draw()}</svg>`;
  };

  window.StrykonCourts = { SPORTS, byId, miniSVG, fmtM, fmtDims, ftDims, FT_PER_M };
})();
