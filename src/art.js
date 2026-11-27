// Built-in art + labeled placeholders. Used until a real file is dropped in.

function rng(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }

function makePlaceholder(scene, a) {
  const tex = scene.textures.createCanvas(a.code, a.w, a.h);
  const ctx = tex.getContext();
  if (a.art && ART[a.art]) { ART[a.art](ctx, a.w, a.h, a); tex.refresh(); return; }
  ctx.fillStyle = a.color; ctx.fillRect(0, 0, a.w, a.h);
  ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, a.w - 2, a.h - 2);
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const big = a.w >= 40 && a.h >= 40;
  const fs = Math.max(8, Math.min(a.w / 3, a.h / (big ? 4 : 2.2), 28));
  ctx.font = `bold ${fs}px monospace`;
  const y = big ? a.h / 2 - fs * 0.6 : a.h / 2;
  ctx.strokeText('#' + a.code, a.w / 2, y); ctx.fillText('#' + a.code, a.w / 2, y);
  if (big && a.name) {
    ctx.font = `bold ${Math.max(7, fs * 0.55)}px monospace`;
    ctx.strokeText(a.name, a.w / 2, y + fs * 1.1, a.w - 4); ctx.fillText(a.name, a.w / 2, y + fs * 1.1, a.w - 4);
  }
  tex.refresh();
}

// Semi-dark natural palettes per level: sky top, sky bottom, far ridge, near ridge, accent (glow)
const PALETTES = [
  ['#121733', '#3e3660', '#2a2c4c', '#1c1f36', '#f5d27a'], // Library: violet dusk
  ['#0f1e2e', '#4d4651', '#253445', '#18242f', '#ffd27a'], // Sports complex: cold dusk
  ['#1a1629', '#5e3d33', '#35283a', '#211a26', '#ffb35c'], // Deltech: ember dusk
  ['#0d2026', '#35545a', '#1f3a3f', '#13272b', '#9ff5e0'], // Design dept: teal
  ['#21132b', '#5c3352', '#3a2444', '#24162c', '#ff9ad0'], // Girls hostel: rose dusk
  ['#10161f', '#3d4237', '#252d33', '#161c21', '#ffe08a'], // Aryabhatta: night
];

function shade(hex, f) { // f<1 darker, f>1 lighter
  const n = parseInt(hex.slice(1), 16), c = v => Math.max(0, Math.min(255, Math.round(v * f)));
  return `rgb(${c(n >> 16)},${c((n >> 8) & 255)},${c(n & 255)})`;
}
// Periodic ridge (wraps seamlessly across width w)
function ridge(ctx, w, h, base, amp, r, color, harmonics = 5) {
  const hs = Array.from({ length: harmonics }, (_, i) => ({ k: i + 1 + Math.floor(r() * 2) * (i + 1), a: amp / (i + 1) * (0.6 + r() * 0.8), p: r() * 6.283 }));
  ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 2) {
    let y = base; hs.forEach(o => { y -= o.a * Math.sin(6.283 * o.k * x / w + o.p); });
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
}
function pine(ctx, x, base, hgt, color) {
  ctx.fillStyle = color; ctx.fillRect(x - 2, base - hgt * 0.25, 4, hgt * 0.25);
  for (let i = 0; i < 4; i++) {
    const y0 = base - hgt * 0.18 - i * hgt * 0.2, wid = hgt * (0.32 - i * 0.06);
    ctx.beginPath(); ctx.moveTo(x - wid, y0); ctx.lineTo(x, y0 - hgt * 0.32); ctx.lineTo(x + wid, y0); ctx.fill();
  }
}
function roundTree(ctx, x, base, hgt, color, r) {
  ctx.fillStyle = color; ctx.fillRect(x - 3, base - hgt * 0.45, 6, hgt * 0.45);
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.arc(x + (r() - 0.5) * hgt * 0.4, base - hgt * 0.55 - r() * hgt * 0.3, hgt * (0.14 + r() * 0.1), 0, 6.283); ctx.fill();
  }
}
function wrapDraw(w, x, fn) { fn(x); if (x < 80) fn(x + w); if (x > w - 80) fn(x - w); }

const ART = {
  // Static sky + far mountains (the L# slot; a dropped-in L#.png replaces it)
  dusk(ctx, w, h, a) {
    const [top, bot, far, near, glow] = PALETTES[a.variant || 0];
    const r = rng(31 + (a.variant || 0) * 17);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, top); g.addColorStop(1, bot);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.15 + r() * 0.55})`;
      ctx.fillRect(Math.floor(r() * w), Math.floor(r() * h * 0.55), 1, 1);
    }
    ctx.fillStyle = 'rgba(255,240,210,0.07)';
    ctx.beginPath(); ctx.arc(w * 0.74, h * 0.2, 70, 0, 6.283); ctx.fill();
    ctx.fillStyle = 'rgba(255,240,210,0.85)';
    ctx.beginPath(); ctx.arc(w * 0.74, h * 0.2, 24, 0, 6.283); ctx.fill();
    const cityGlow = ctx.createLinearGradient(0, h * 0.45, 0, h * 0.75);        // warm city light on the horizon
    cityGlow.addColorStop(0, 'rgba(255,190,120,0)'); cityGlow.addColorStop(1, 'rgba(255,190,120,0.16)');
    ctx.fillStyle = cityGlow; ctx.fillRect(0, 0, w, h);
    let x = 0;                                                                  // far skyline + towers
    while (x < w) {
      const bw = 30 + r() * 70, bh = 50 + r() * 110;
      ctx.fillStyle = shade(far, 1.1); ctx.fillRect(x, h * 0.7 - bh, bw, bh + h * 0.3);
      if (r() < 0.15) { ctx.fillRect(x + bw / 2 - 2, h * 0.7 - bh - 40, 4, 40); ctx.fillStyle = '#ff5a4a'; ctx.fillRect(x + bw / 2 - 1, h * 0.7 - bh - 42, 2, 2); }
      for (let wy = h * 0.7 - bh + 8; wy < h * 0.7; wy += 12) for (let wx = x + 4; wx < x + bw - 4; wx += 9)
        if (r() < 0.12) { ctx.fillStyle = glow; ctx.globalAlpha = 0.25 + r() * 0.3; ctx.fillRect(wx, wy, 3, 4); ctx.globalAlpha = 1; }
      x += bw + r() * 12;
    }
    ridge(ctx, w, h, h * 0.74, 14, r, far, 5);                                  // treeline
  },
  groundFill(ctx, w, h) { // dark soil with pebbles and roots, seamless
    ctx.fillStyle = '#211a18'; ctx.fillRect(0, 0, w, h);
    const r = rng(13);
    for (let i = 0; i < 40; i++) { ctx.fillStyle = ['#2a221f', '#1a1412', '#2e2624'][i % 3]; ctx.fillRect(Math.floor(r() * w), Math.floor(r() * h), 2, 2); }
    for (let i = 0; i < 3; i++) { ctx.fillStyle = '#3a3534'; const x = Math.floor(r() * (w - 4)), y = Math.floor(r() * (h - 3)); ctx.fillRect(x, y, 4, 3); ctx.fillStyle = '#4a4442'; ctx.fillRect(x, y, 3, 1); }
    ctx.fillStyle = '#33241a'; let x = Math.floor(r() * w), y = 0;
    for (let i = 0; i < 14; i++) { ctx.fillRect(x % w, y, 1, 1); x += r() < 0.5 ? 1 : 0; y += 1; if (y >= h) break; }
  },
  groundTop(ctx, w, h) { // soil + mossy grass cap with ragged edge
    ART.groundFill(ctx, w, h);
    const r = rng(7);
    for (let x = 0; x < w; x++) {
      const d = 6 + Math.floor(Math.sin(x * 6.283 / w * 2) * 1.5 + r() * 3);
      ctx.fillStyle = '#263d25'; ctx.fillRect(x, 0, 1, d + 1);
      ctx.fillStyle = '#34532f'; ctx.fillRect(x, 0, 1, d - 1);
      if (r() < 0.12) { ctx.fillStyle = '#263d25'; ctx.fillRect(x, d, 1, 2 + Math.floor(r() * 3)); }
    }
    ctx.fillStyle = '#4e7444'; ctx.fillRect(0, 0, w, 2);
    ctx.fillStyle = '#6a9459'; for (let x = 0; x < w; x += 3 + Math.floor(r() * 4)) ctx.fillRect(x, 0, 2, 1);
  },
  plat(ctx, w, h) { // mossy log ledge
    ctx.fillStyle = '#2b1d15'; ctx.fillRect(0, 2, w, h - 4);
    ctx.fillStyle = '#4a3426'; ctx.fillRect(0, 3, w, h - 7);
    ctx.fillStyle = '#5c4232'; for (let x = 0; x < w; x += 5) ctx.fillRect(x, 5 + (x % 3), 3, 1);
    ctx.fillStyle = '#34532f'; ctx.fillRect(0, 0, w, 4);
    ctx.fillStyle = '#4e7444'; ctx.fillRect(0, 0, w, 1);
    ctx.fillStyle = '#263d25'; [3, 11, 19, 26].forEach(x => ctx.fillRect(x, 4, 2, 2 + (x % 3)));
  },
  heart(ctx, w, h) {
    const px = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];
    const s = Math.floor(w / 8);
    ctx.fillStyle = '#e74c3c';
    px.forEach((row, y) => [...row].forEach((c, x) => { if (c === 'X') ctx.fillRect(1 + x * s, 2 + y * s, s, s); }));
  },
};

// Scrolling parallax forest layers for one level palette (built once, tileable)
function makeParallax(scene, v) {
  if (scene.textures.exists('px_mid_' + v)) return;
  const [, , far, near] = PALETTES[v];
  const W = 800, H = 480;
  let t = scene.textures.createCanvas('px_mid_' + v, W, H), c = t.getContext(), r = rng(101 + v * 13);
  ridge(c, W, H, H * 0.74, 34, r, near, 4);                       // forest hills
  for (let i = 0; i < 70; i++) { const x = r() * W, b = H * 0.74 + 10 - r() * 30; wrapDraw(W, x, xx => pine(c, xx, b + 30, 40 + r() * 40, near)); }
  const fog = c.createLinearGradient(0, H * 0.6, 0, H); fog.addColorStop(0, 'rgba(190,180,220,0)'); fog.addColorStop(1, 'rgba(190,180,220,0.10)');
  c.fillStyle = fog; c.fillRect(0, 0, W, H); t.refresh();

  t = scene.textures.createCanvas('px_near_' + v, W, H); c = t.getContext(); r = rng(202 + v * 7);
  const dark = shade(near.startsWith('#') ? near : '#151a22', 0.55);
  for (let i = 0; i < 16; i++) {
    const x = r() * W, b = H * 0.9, hgt = 120 + r() * 120;
    wrapDraw(W, x, xx => (r() < 0.5 ? pine(c, xx, b, hgt, dark) : roundTree(c, xx, b, hgt, dark, rng(i + 5))));
  }
  c.fillStyle = dark; c.fillRect(0, H * 0.88, W, H * 0.12); t.refresh();
}

// Effects textures (not personalizable)
function makeFxTextures(scene) {
  let t = scene.textures.createCanvas('fx_slash', 64, 64), c = t.getContext();
  c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 6;
  c.beginPath(); c.arc(8, 32, 44, -Math.PI / 3, Math.PI / 3); c.stroke();
  c.strokeStyle = 'rgba(200,220,255,0.5)'; c.lineWidth = 12;
  c.beginPath(); c.arc(4, 32, 40, -Math.PI / 4, Math.PI / 4); c.stroke(); t.refresh();

  t = scene.textures.createCanvas('fx_wave', 40, 24); c = t.getContext();
  const g = c.createLinearGradient(0, 0, 0, 24); g.addColorStop(0, 'rgba(255,200,120,0)'); g.addColorStop(1, 'rgba(255,140,60,0.95)');
  c.fillStyle = g; c.beginPath(); c.moveTo(0, 24); c.quadraticCurveTo(20, -10, 40, 24); c.fill(); t.refresh();

  t = scene.textures.createCanvas('fx_vignette', 400, 240); c = t.getContext();
  const v = c.createRadialGradient(200, 120, 60, 200, 120, 240);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,10,0.65)');
  c.fillStyle = v; c.fillRect(0, 0, 400, 240); t.refresh();

  t = scene.textures.createCanvas('fx_dot', 8, 8); c = t.getContext();
  c.fillStyle = '#fff'; c.beginPath(); c.arc(4, 4, 4, 0, Math.PI * 2); c.fill(); t.refresh();

  t = scene.textures.createCanvas('fx_glow', 32, 32); c = t.getContext();
  const gl = c.createRadialGradient(16, 16, 0, 16, 16, 16); gl.addColorStop(0, 'rgba(255,255,255,0.9)'); gl.addColorStop(0.25, 'rgba(255,255,255,0.35)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = gl; c.fillRect(0, 0, 32, 32); t.refresh();

  t = scene.textures.createCanvas('fx_pit', 32, 120); c = t.getContext();
  const pg = c.createLinearGradient(0, 0, 0, 120); pg.addColorStop(0, 'rgba(0,0,0,0)'); pg.addColorStop(1, 'rgba(0,0,0,0.95)');
  c.fillStyle = pg; c.fillRect(0, 0, 32, 120); t.refresh();

  makeDecoTextures(scene);
}

// Natural decorations scattered on the terrain (not personalizable)
function makeDecoTextures(scene) {
  const mk = (key, w, h, fn) => { const t = scene.textures.createCanvas(key, w, h); fn(t.getContext(), w, h, rng(key.length * 97 + w)); t.refresh(); };
  mk('deco_grass', 64, 14, (c, w, h, r) => {           // tileable grass blades
    for (let x = 0; x < w; x += 1 + Math.floor(r() * 2)) {
      const bh = 3 + Math.floor(r() * (h - 3)); c.fillStyle = ['#2c4629', '#34532f', '#3f6138', '#4e7444'][Math.floor(r() * 4)];
      c.fillRect(x, h - bh, 1, bh); if (r() < 0.3) c.fillRect(x + (r() < 0.5 ? -1 : 1), h - bh, 1, 1);
    }
  });
  mk('deco_rock', 30, 18, (c, w, h) => {
    c.fillStyle = '#26232a'; c.beginPath(); c.ellipse(15, 13, 14, 9, 0, Math.PI, 0); c.fill(); c.fillRect(1, 12, 28, 6);
    c.fillStyle = '#3b3842'; c.beginPath(); c.ellipse(13, 11, 10, 6, 0, Math.PI, 0); c.fill();
    c.fillStyle = '#34532f'; c.fillRect(8, 4, 9, 2); c.fillRect(6, 6, 4, 1);
  });
  mk('deco_rock2', 18, 11, (c) => {
    c.fillStyle = '#2a272e'; c.beginPath(); c.ellipse(9, 9, 8, 6, 0, Math.PI, 0); c.fill(); c.fillRect(1, 8, 16, 3);
    c.fillStyle = '#423e48'; c.fillRect(5, 4, 6, 2);
  });
  mk('deco_bush', 52, 30, (c, w, h, r) => {
    for (let i = 0; i < 9; i++) { c.fillStyle = ['#1d2f1d', '#243a23', '#2c4629'][i % 3]; c.beginPath(); c.arc(8 + r() * 36, 16 + r() * 8, 7 + r() * 6, 0, 6.283); c.fill(); }
    c.fillStyle = '#3f6138'; for (let i = 0; i < 8; i++) c.fillRect(8 + r() * 36, 8 + r() * 10, 2, 2);
  });
  mk('deco_fern', 28, 24, (c, w, h, r) => {
    c.strokeStyle = '#34532f'; c.lineWidth = 2;
    for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.35; c.beginPath(); c.moveTo(14, 24); c.quadraticCurveTo(14 + Math.cos(a) * 8, 24 + Math.sin(a) * 14, 14 + Math.cos(a) * 13, 24 + Math.sin(a) * 20 + 6); c.stroke(); }
  });
  mk('deco_mush', 14, 14, (c) => {
    c.fillStyle = '#cfd6c4'; c.fillRect(3, 8, 2, 6); c.fillRect(10, 9, 2, 5);
    c.fillStyle = '#7ff0d8'; c.beginPath(); c.ellipse(4, 8, 4, 3, 0, Math.PI, 0); c.fill(); c.beginPath(); c.ellipse(11, 9, 3, 2.5, 0, Math.PI, 0); c.fill();
  });
  mk('deco_flower', 12, 16, (c) => {
    c.fillStyle = '#34532f'; c.fillRect(5, 6, 1, 10); c.fillRect(6, 10, 2, 1);
    c.fillStyle = '#e8a6c8'; c.fillRect(3, 3, 5, 3); c.fillRect(4, 2, 3, 5); c.fillStyle = '#ffe08a'; c.fillRect(5, 4, 1, 1);
  });
  mk('deco_log', 64, 18, (c) => {
    c.fillStyle = '#2b1d15'; c.fillRect(4, 6, 56, 12); c.fillStyle = '#4a3426'; c.fillRect(4, 7, 56, 8);
    c.fillStyle = '#6b4a34'; c.beginPath(); c.ellipse(60, 12, 4, 6, 0, 0, 6.283); c.fill(); c.fillStyle = '#4a3426'; c.fillRect(59, 11, 2, 2);
    c.fillStyle = '#34532f'; c.fillRect(10, 5, 22, 3); c.fillRect(36, 5, 10, 2);
  });
  mk('deco_tree', 120, 230, (c, w, h, r) => {
    c.fillStyle = '#1b1411'; c.beginPath(); c.moveTo(52, h); c.lineTo(56, 90); c.lineTo(64, 90); c.lineTo(70, h); c.fill();
    c.fillRect(40, h - 6, 42, 6); c.fillStyle = '#261c17'; c.fillRect(58, 100, 3, h - 110);
    for (let i = 0; i < 16; i++) { c.fillStyle = ['#132013', '#182918', '#1d311c'][i % 3]; c.beginPath(); c.arc(20 + r() * 80, 30 + r() * 80, 16 + r() * 14, 0, 6.283); c.fill(); }
  });
  mk('deco_vine', 8, 44, (c, w, h, r) => {
    c.fillStyle = '#263d25'; let x = 4;
    for (let y = 0; y < h - Math.floor(r() * 10); y++) { c.fillRect(x, y, 1, 1); if (y % 5 === 0) { c.fillStyle = '#34532f'; c.fillRect(x - 1, y, 3, 2); c.fillStyle = '#263d25'; } if (r() < 0.2) x += r() < 0.5 ? -1 : 1; x = Math.max(1, Math.min(6, x)); }
  });
}
