// ============================================================
//  College themes: ground surface, foundation, ledges, props and backdrop per level.
//  All drawn in code. Dropping in D1.png / D5.png / D2.png replaces the ground in every level.
// ============================================================
const THEMES = [
  { id: 'library', top: 'paving', fill: 'block', plat: 'shelf', tufts: true, trees: 0.35, near: 'lamps',
    deco: ['bench', 'lamp', 'books', 'plant', 'board', 'bike', 'bin', 'books'] },
  { id: 'sports', top: 'track', fill: 'earth', plat: 'bleacher', tufts: true, trees: 0.1, near: 'floodlights',
    deco: ['cone', 'ball', 'hurdle', 'bench', 'bottle', 'cone', 'ball', 'lamp'] },
  { id: 'deltech', top: 'road', fill: 'concrete', plat: 'girder', tufts: false, trees: 0.15, near: 'poles',
    deco: ['cone', 'barrier', 'sign', 'lamp', 'bike', 'cone', 'bin'] },
  { id: 'design', top: 'floor', fill: 'slab', plat: 'desk', tufts: false, trees: 0, near: 'windows',
    deco: ['desk', 'chair', 'easel', 'box', 'paint', 'plant', 'chair', 'box'] },
  { id: 'hostel', top: 'pavers', fill: 'brick', plat: 'balcony', tufts: true, trees: 0.3, near: 'lamps',
    deco: ['plant', 'bench', 'lamp', 'bin', 'flower', 'cooler', 'plant', 'bike'] },
  { id: 'aryabhatta', top: 'concrete', fill: 'brick', plat: 'pipe', tufts: true, trees: 0.3, near: 'lamps',
    deco: ['bin', 'cooler', 'bike', 'stumps', 'chair', 'lamp', 'box', 'ball'] },
];

// ---------- 32x32 surface tiles (surface band on top of the fill) ----------
const FILLS = {
  block(c, r) {   // concrete foundation blocks
    c.fillStyle = '#2b2b31'; c.fillRect(0, 0, 32, 32);
    c.fillStyle = '#1d1d22'; for (let y = 0; y < 32; y += 8) { c.fillRect(0, y, 32, 1); c.fillRect(((y / 8) % 2) * 16, y, 1, 8); c.fillRect(((y / 8) % 2) * 16 + 16, y, 1, 8); }
    for (let i = 0; i < 14; i++) { c.fillStyle = r() < 0.5 ? '#34343b' : '#25252b'; c.fillRect(r() * 32 | 0, r() * 32 | 0, 1, 1); }
  },
  earth(c, r) {   // packed earth under the track
    c.fillStyle = '#2a1f1a'; c.fillRect(0, 0, 32, 32);
    for (let i = 0; i < 40; i++) { c.fillStyle = ['#33261f', '#211813', '#3b3430'][i % 3]; c.fillRect(r() * 32 | 0, r() * 32 | 0, 2, 2); }
  },
  concrete(c, r) {
    c.fillStyle = '#2a2a2e'; c.fillRect(0, 0, 32, 32);
    for (let i = 0; i < 50; i++) { c.fillStyle = ['#323237', '#222226', '#3a3a40'][i % 3]; c.fillRect(r() * 32 | 0, r() * 32 | 0, 1, 1); }
    c.fillStyle = '#1e1e22'; c.fillRect(0, 31, 32, 1);
  },
  slab(c, r) {    // building floor slab / wall under the classroom floor
    c.fillStyle = '#26282e'; c.fillRect(0, 0, 32, 32);
    c.fillStyle = '#2e3138'; c.fillRect(0, 0, 32, 3);
    for (let i = 0; i < 20; i++) { c.fillStyle = '#1f2126'; c.fillRect(r() * 32 | 0, r() * 32 | 0, 1, 1); }
  },
  brick(c) {
    c.fillStyle = '#231816'; c.fillRect(0, 0, 32, 32);
    for (let y = 0; y < 32; y += 8) for (let x = -(y / 8 % 2) * 8; x < 32; x += 16) {
      c.fillStyle = (x + y) % 3 ? '#4a2a24' : '#55302a'; c.fillRect(x + 1, y + 1, 14, 6);
    }
  },
};
const TOPS = {
  paving(c, r) {  // grey paving slabs with a stone curb
    c.fillStyle = '#5b5c63'; c.fillRect(0, 0, 32, 10);
    c.fillStyle = '#6d6e75'; c.fillRect(0, 0, 32, 2);
    c.fillStyle = '#44454b'; c.fillRect(0, 9, 32, 2); c.fillRect(15, 2, 1, 8); c.fillRect(31, 2, 1, 8);
    for (let i = 0; i < 8; i++) { c.fillStyle = '#53545a'; c.fillRect(r() * 32 | 0, 2 + r() * 7 | 0, 1, 1); }
  },
  track(c) {      // red running track with a white lane line
    c.fillStyle = '#6b2f27'; c.fillRect(0, 0, 32, 11);
    c.fillStyle = '#7d3a30'; c.fillRect(0, 0, 32, 2);
    c.fillStyle = '#d8d2c8'; c.fillRect(0, 5, 32, 1);
    c.fillStyle = '#4a201b'; c.fillRect(0, 10, 32, 2);
  },
  road(c, r) {    // asphalt, dashed yellow line, concrete curb
    c.fillStyle = '#26262b'; c.fillRect(0, 0, 32, 12);
    for (let i = 0; i < 14; i++) { c.fillStyle = r() < 0.5 ? '#303036' : '#1d1d21'; c.fillRect(r() * 32 | 0, 2 + r() * 9 | 0, 1, 1); }
    c.fillStyle = '#8a8a90'; c.fillRect(0, 0, 32, 2);
    c.fillStyle = '#c9a43a'; c.fillRect(4, 6, 14, 2);
    c.fillStyle = '#18181b'; c.fillRect(0, 11, 32, 2);
  },
  floor(c) {      // classroom wooden floor + skirting
    c.fillStyle = '#5a3f2b'; c.fillRect(0, 0, 32, 9);
    c.fillStyle = '#6b4c34'; c.fillRect(0, 0, 32, 2);
    c.fillStyle = '#44301f'; c.fillRect(10, 2, 1, 7); c.fillRect(26, 2, 1, 7); c.fillRect(0, 5, 32, 1);
    c.fillStyle = '#1b1d22'; c.fillRect(0, 9, 32, 3);
  },
  pavers(c) {     // interlocking hostel pavers
    c.fillStyle = '#3a2b2a'; c.fillRect(0, 0, 32, 10);
    for (let x = 0; x < 32; x += 8) { c.fillStyle = (x / 8) % 2 ? '#6b4642' : '#7a524c'; c.fillRect(x + 1, 1, 6, 4); c.fillStyle = (x / 8) % 2 ? '#7a524c' : '#6b4642'; c.fillRect(x + 1 + ((x / 8) % 2 ? -4 : 4), 6, 6, 3); }
    c.fillStyle = '#8a625b'; c.fillRect(0, 0, 32, 1);
  },
  concrete(c, r) {  // cracked hostel concrete with moss
    c.fillStyle = '#4a4b4f'; c.fillRect(0, 0, 32, 10);
    c.fillStyle = '#5a5b60'; c.fillRect(0, 0, 32, 2);
    c.fillStyle = '#2e2f33'; let x = r() * 32 | 0; for (let y = 2; y < 10; y++) { c.fillRect(x, y, 1, 1); x += r() < 0.5 ? 1 : -1; }
    c.fillStyle = '#3f5a37'; c.fillRect(r() * 26 | 0, 8, 6, 2);
  },
};
const PLATS = {
  shelf(c) { c.fillStyle = '#3a2619'; c.fillRect(0, 0, 32, 16); c.fillStyle = '#6b4a30'; c.fillRect(0, 0, 32, 5); c.fillStyle = '#7d5a3b'; c.fillRect(0, 0, 32, 1);
    [['#7a2f2f', 3], ['#2f4f7a', 9], ['#7a6a2f', 15], ['#2f6a4a', 21], ['#5a2f6a', 26]].forEach(([col, x]) => { c.fillStyle = col; c.fillRect(x, 6, 5, 9); }); },
  bleacher(c) { c.fillStyle = '#8f949c'; c.fillRect(0, 0, 32, 4); c.fillStyle = '#b4b9c0'; c.fillRect(0, 0, 32, 1); c.fillStyle = '#5c6068'; c.fillRect(0, 4, 32, 3); c.fillStyle = '#2a2c31'; c.fillRect(6, 7, 3, 9); c.fillRect(23, 7, 3, 9); },
  girder(c) { c.fillStyle = '#7a3e1f'; c.fillRect(0, 0, 32, 16); c.fillStyle = '#9a5228'; c.fillRect(0, 0, 32, 3); c.fillRect(0, 13, 32, 3); c.fillStyle = '#5a2c15'; c.fillRect(0, 3, 32, 10);
    c.fillStyle = '#7a3e1f'; c.beginPath(); c.moveTo(0, 13); c.lineTo(16, 3); c.lineTo(32, 13); c.lineTo(30, 13); c.lineTo(16, 5); c.lineTo(2, 13); c.fill(); c.fillStyle = '#c0703a'; c.fillRect(4, 1, 1, 1); c.fillRect(20, 1, 1, 1); },
  desk(c) { c.fillStyle = '#7a5a3a'; c.fillRect(0, 0, 32, 5); c.fillStyle = '#8f6c48'; c.fillRect(0, 0, 32, 1); c.fillStyle = '#3c2c1d'; c.fillRect(0, 5, 32, 2); c.fillStyle = '#2a2c31'; c.fillRect(3, 7, 2, 9); c.fillRect(27, 7, 2, 9); },
  balcony(c) { c.fillStyle = '#5a5b60'; c.fillRect(0, 0, 32, 6); c.fillStyle = '#6d6e75'; c.fillRect(0, 0, 32, 1); c.fillStyle = '#3a3b40'; c.fillRect(0, 6, 32, 2); c.fillStyle = '#8a5a7a'; c.fillRect(0, 8, 32, 2); c.fillStyle = '#2b2c31'; for (let x = 2; x < 32; x += 6) c.fillRect(x, 10, 2, 6); },
  pipe(c) { c.fillStyle = '#3d5566'; c.fillRect(0, 0, 32, 10); c.fillStyle = '#56788f'; c.fillRect(0, 1, 32, 2); c.fillStyle = '#26363f'; c.fillRect(0, 8, 32, 2); c.fillStyle = '#7f8a92'; c.fillRect(14, 0, 4, 10); c.fillStyle = '#26282d'; c.fillRect(15, 10, 2, 6); },
};

// ---------- props (bottom-centre origin) ----------
const PROPS = {
  bench: [44, 22, c => { c.fillStyle = '#5a3f2b'; c.fillRect(2, 8, 40, 4); c.fillRect(2, 2, 40, 3); c.fillStyle = '#2b2c31'; c.fillRect(5, 5, 2, 17); c.fillRect(37, 5, 2, 17); c.fillRect(5, 12, 34, 2); }],
  lamp: [16, 92, c => { c.fillStyle = '#26282e'; c.fillRect(7, 8, 3, 84); c.fillRect(4, 88, 9, 4); c.fillRect(7, 6, 8, 3); c.fillStyle = '#ffe7a8'; c.fillRect(11, 9, 4, 3); }],
  books: [20, 14, c => { [['#7a2f2f', 14], ['#2f4f7a', 9], ['#7a6a2f', 4]].forEach(([col, y], i) => { c.fillStyle = col; c.fillRect(1 + i, y - 0, 17 - i * 2, 5); c.fillStyle = '#d8d2c8'; c.fillRect(2 + i, y + 1, 1, 3); }); }],
  plant: [20, 28, c => { c.fillStyle = '#7a4a35'; c.fillRect(5, 18, 10, 10); c.fillStyle = '#5a3527'; c.fillRect(4, 17, 12, 3); c.fillStyle = '#2f5a32'; [[10, 8, 7], [5, 12, 5], [15, 12, 5], [10, 3, 4]].forEach(([x, y, s]) => { c.beginPath(); c.arc(x, y, s, 0, 6.283); c.fill(); }); }],
  board: [36, 44, c => { c.fillStyle = '#2b2c31'; c.fillRect(4, 20, 3, 24); c.fillRect(29, 20, 3, 24); c.fillStyle = '#5a3f2b'; c.fillRect(1, 0, 34, 24); c.fillStyle = '#7a6047'; c.fillRect(3, 2, 30, 20);
    [['#e8e0c8', 5, 4], ['#f5d27a', 16, 5], ['#9ad0f5', 24, 3], ['#ff9ad0', 8, 13], ['#e8e0c8', 20, 13]].forEach(([col, x, y]) => { c.fillStyle = col; c.fillRect(x, y, 8, 7); }); }],
  bike: [42, 26, c => { c.strokeStyle = '#4a4f58'; c.lineWidth = 2; [[9, 17], [33, 17]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 8, 0, 6.283); c.stroke(); });
    c.strokeStyle = '#7a2f2f'; c.beginPath(); c.moveTo(9, 17); c.lineTo(18, 8); c.lineTo(30, 8); c.lineTo(33, 17); c.moveTo(18, 8); c.lineTo(21, 17); c.lineTo(30, 8); c.stroke(); c.fillStyle = '#26282e'; c.fillRect(15, 4, 7, 2); c.fillRect(29, 3, 2, 5); }],
  bin: [16, 22, c => { c.fillStyle = '#2f5a3a'; c.fillRect(2, 4, 12, 18); c.fillStyle = '#3d7049'; c.fillRect(1, 2, 14, 3); c.fillStyle = '#244a2e'; c.fillRect(5, 7, 1, 12); c.fillRect(10, 7, 1, 12); }],
  cone: [14, 18, c => { c.fillStyle = '#d0602a'; c.beginPath(); c.moveTo(7, 0); c.lineTo(12, 16); c.lineTo(2, 16); c.fill(); c.fillStyle = '#e8e0c8'; c.fillRect(4, 8, 6, 2); c.fillStyle = '#26282e'; c.fillRect(0, 16, 14, 2); }],
  ball: [12, 12, c => { c.fillStyle = '#e8e0c8'; c.beginPath(); c.arc(6, 6, 5.5, 0, 6.283); c.fill(); c.fillStyle = '#26282e'; c.fillRect(5, 4, 3, 3); c.fillRect(2, 7, 2, 2); c.fillRect(9, 7, 2, 2); }],
  hurdle: [36, 24, c => { c.fillStyle = '#e8e0c8'; c.fillRect(2, 2, 32, 5); c.fillStyle = '#26282e'; for (let x = 6; x < 32; x += 8) c.fillRect(x, 2, 4, 5); c.fillStyle = '#8f949c'; c.fillRect(4, 7, 2, 17); c.fillRect(30, 7, 2, 17); c.fillRect(0, 22, 10, 2); c.fillRect(26, 22, 10, 2); }],
  bottle: [8, 16, c => { c.fillStyle = '#4a8fd0'; c.fillRect(1, 4, 6, 12); c.fillRect(2, 1, 4, 3); c.fillStyle = '#e8e0c8'; c.fillRect(1, 8, 6, 3); }],
  barrier: [46, 24, c => { c.fillStyle = '#26282e'; c.fillRect(4, 10, 3, 14); c.fillRect(39, 10, 3, 14); for (let x = 0; x < 46; x += 8) { c.fillStyle = (x / 8) % 2 ? '#e8e0c8' : '#b03a2e'; c.fillRect(x, 2, 8, 8); } }],
  sign: [22, 44, c => { c.fillStyle = '#8f949c'; c.fillRect(10, 14, 2, 30); c.fillStyle = '#c9a43a'; c.beginPath(); c.moveTo(11, 0); c.lineTo(22, 11); c.lineTo(11, 22); c.lineTo(0, 11); c.fill(); c.fillStyle = '#26282e'; c.fillRect(10, 5, 2, 8); c.fillRect(10, 15, 2, 2); }],
  desk: [42, 26, c => { c.fillStyle = '#7a5a3a'; c.fillRect(0, 4, 42, 5); c.fillStyle = '#8f6c48'; c.fillRect(0, 4, 42, 1); c.fillStyle = '#2a2c31'; c.fillRect(3, 9, 2, 17); c.fillRect(37, 9, 2, 17); c.fillStyle = '#d8d2c8'; c.fillRect(8, 1, 10, 3); c.fillStyle = '#4a8fd0'; c.fillRect(26, 0, 6, 4); }],
  chair: [18, 28, c => { c.fillStyle = '#2f4f7a'; c.fillRect(2, 0, 3, 16); c.fillRect(2, 13, 14, 4); c.fillStyle = '#2a2c31'; c.fillRect(3, 17, 2, 11); c.fillRect(14, 17, 2, 11); }],
  easel: [26, 44, c => { c.strokeStyle = '#6b4a30'; c.lineWidth = 2; c.beginPath(); c.moveTo(13, 0); c.lineTo(3, 44); c.moveTo(13, 0); c.lineTo(23, 44); c.moveTo(13, 4); c.lineTo(13, 40); c.stroke();
    c.fillStyle = '#e8e0c8'; c.fillRect(3, 6, 20, 16); c.fillStyle = '#d0602a'; c.fillRect(6, 9, 6, 6); c.fillStyle = '#4a8fd0'; c.fillRect(12, 13, 8, 6); c.fillStyle = '#6b4a30'; c.fillRect(2, 22, 22, 2); }],
  box: [24, 20, c => { c.fillStyle = '#8a6a44'; c.fillRect(1, 2, 22, 18); c.fillStyle = '#a07c50'; c.fillRect(1, 2, 22, 3); c.fillStyle = '#6b5233'; c.fillRect(11, 2, 2, 18); }],
  paint: [14, 14, c => { c.fillStyle = '#8f949c'; c.fillRect(2, 3, 10, 11); c.fillStyle = '#d04a8a'; c.fillRect(2, 3, 10, 3); c.fillRect(3, 6, 2, 4); c.fillStyle = '#26282e'; c.fillRect(1, 2, 12, 1); }],
  flower: [12, 16, c => { c.fillStyle = '#34532f'; c.fillRect(5, 6, 1, 10); c.fillStyle = '#e8a6c8'; c.fillRect(3, 3, 5, 3); c.fillRect(4, 2, 3, 5); c.fillStyle = '#ffe08a'; c.fillRect(5, 4, 1, 1); }],
  cooler: [22, 36, c => { c.fillStyle = '#9aa0a8'; c.fillRect(2, 10, 18, 26); c.fillStyle = '#7f858d'; c.fillRect(2, 30, 18, 6); c.fillStyle = '#4a8fd0'; c.globalAlpha = 0.8; c.fillRect(6, 0, 10, 11); c.globalAlpha = 1; c.fillStyle = '#26282e'; c.fillRect(8, 18, 2, 3); c.fillRect(13, 18, 2, 3); }],
  stumps: [16, 30, c => { c.fillStyle = '#d8c8a0'; [2, 7, 12].forEach(x => c.fillRect(x, 4, 2, 26)); c.fillStyle = '#e8d8b0'; c.fillRect(2, 3, 6, 1); c.fillRect(8, 3, 6, 1); }],
  crack: [32, 8, c => { c.fillStyle = '#120e0d'; c.fillRect(4, 6, 24, 2); c.fillRect(8, 4, 3, 2); c.fillRect(17, 3, 2, 3); c.fillRect(22, 5, 4, 1); c.fillStyle = '#6a5a4e'; c.fillRect(3, 5, 2, 1); c.fillRect(27, 5, 3, 1); c.fillRect(14, 4, 2, 1); }],
};

function makeThemeTextures(scene) {
  const tile = (key, w, h, fn, seed) => { if (scene.textures.exists(key)) return; const t = scene.textures.createCanvas(key, w, h); fn(t.getContext(), rng(seed)); t.refresh(); };
  Object.entries(PROPS).forEach(([k, [w, h, fn]]) => tile('prop_' + k, w, h, c => fn(c), 1));
  THEMES.forEach((th, i) => {
    tile('gf_' + th.id, 32, 32, (c, r) => FILLS[th.fill](c, r), 11 + i);
    tile('gt_' + th.id, 32, 32, (c, r) => { FILLS[th.fill](c, rng(11 + i)); TOPS[th.top](c, r); }, 21 + i);
    tile('gp_' + th.id, 32, 16, c => PLATS[th.plat](c), 31 + i);
  });
}

// ---------- campus backdrop layers (tileable 800 wide) ----------
function building(c, x, base, w, h, body, win, r) {
  c.fillStyle = body; c.fillRect(x, base - h, w, h);
  c.fillRect(x + 4, base - h - 6, w - 8, 6);                                   // roof parapet
  if (r() < 0.4) { c.fillRect(x + w * 0.6, base - h - 22, 14, 16); c.fillRect(x + w * 0.6 - 2, base - h - 24, 18, 3); } // water tank
  for (let y = base - h + 10; y < base - 14; y += 14)
    for (let xx = x + 6; xx < x + w - 8; xx += 11)
      if (r() < 0.3) { c.fillStyle = win; c.globalAlpha = 0.35 + r() * 0.5; c.fillRect(xx, y, 5, 7); c.globalAlpha = 1; c.fillStyle = body; }
}
function makeCampusParallax(scene, v) {
  const key = 'px_mid_c' + v;
  if (scene.textures.exists(key)) return;
  const [, , far, near, glow] = PALETTES[v], th = THEMES[v], W = 800, H = 480;
  let t = scene.textures.createCanvas(key, W, H), c = t.getContext(), r = rng(301 + v * 19);
  for (let i = 0; i < 9; i++) {                                                // campus blocks
    const x = r() * W, w = 70 + r() * 110, h = 90 + r() * 120;
    wrapDraw(W, x, xx => building(c, xx, H * 0.86, w, h, near, glow, rng(i * 7 + v)));
  }
  for (let i = 0; i < 18; i++) { const x = r() * W; wrapDraw(W, x, xx => roundTree(c, xx, H * 0.88, 50 + r() * 40, shade(near, 0.8), rng(i))); }
  c.fillStyle = shade(near, 0.8); c.fillRect(0, H * 0.86, W, H * 0.14);
  const fog = c.createLinearGradient(0, H * 0.55, 0, H); fog.addColorStop(0, 'rgba(190,180,220,0)'); fog.addColorStop(1, 'rgba(190,180,220,0.10)');
  c.fillStyle = fog; c.fillRect(0, 0, W, H); t.refresh();

  t = scene.textures.createCanvas('px_near_c' + v, W, H); c = t.getContext(); r = rng(402 + v * 7);
  const dark = shade(near, 0.5);
  const lampGlow = (x, y, rad, a) => { const g = c.createRadialGradient(x, y, 0, x, y, rad); g.addColorStop(0, `rgba(255,231,168,${a})`); g.addColorStop(1, 'rgba(255,231,168,0)'); c.fillStyle = g; c.fillRect(x - rad, y - rad, rad * 2, rad * 2); };
  if (th.near === 'floodlights') {
    for (let i = 0; i < 3; i++) { const x = 120 + i * 270 + r() * 40; c.fillStyle = dark; c.fillRect(x - 3, 120, 6, H); c.fillRect(x - 22, 104, 44, 18); lampGlow(x, 112, 90, 0.35); c.fillStyle = '#fff3d0'; for (let k = -18; k < 18; k += 9) c.fillRect(x + k, 108, 6, 6); }
    c.fillStyle = dark; for (let s = 0; s < 6; s++) c.fillRect(0, H * 0.62 + s * 18, W, 10);  // stands
  } else if (th.near === 'poles') {
    const ps = [60, 330, 600]; c.strokeStyle = dark; c.lineWidth = 1;
    ps.forEach(x => { c.fillStyle = dark; c.fillRect(x - 3, 150, 6, H); c.fillRect(x - 24, 160, 48, 4); });
    [162, 172].forEach(y => { c.beginPath(); c.moveTo(-200, y); ps.concat([860]).forEach(x => c.quadraticCurveTo(x - 135, y + 22, x, y)); c.stroke(); });
    for (let i = 0; i < 8; i++) { const x = r() * W; wrapDraw(W, x, xx => roundTree(c, xx, H * 0.92, 90 + r() * 60, dark, rng(i + 3))); }
  } else if (th.near === 'windows') {                                         // inside the design studio
    c.fillStyle = dark; c.fillRect(0, 0, W, H);
    for (let x = 30; x < W; x += 200) { c.clearRect(x, 90, 140, 220); c.fillStyle = dark; c.fillRect(x + 68, 90, 4, 220); c.fillRect(x, 196, 140, 4); }
    c.fillStyle = shade(near, 0.65); c.fillRect(0, 330, W, 8);
  } else {                                                                     // lamps + trees
    for (let i = 0; i < 10; i++) { const x = r() * W; wrapDraw(W, x, xx => roundTree(c, xx, H * 0.92, 110 + r() * 80, dark, rng(i + 9))); }
    for (let x = 100; x < W; x += 260) { c.fillStyle = dark; c.fillRect(x - 2, 250, 4, H); c.fillRect(x - 2, 248, 14, 3); lampGlow(x + 10, 254, 50, 0.4); }
  }
  if (th.near !== 'windows') { c.fillStyle = dark; c.fillRect(0, H * 0.9, W, H * 0.1); }
  t.refresh();
}
