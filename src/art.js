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

// Semi-dark palettes per level: sky top, sky bottom, far buildings, near buildings, window light
const PALETTES = [
  ['#151a33', '#4b3b63', '#262645', '#1a1a30', '#f5d27a'], // Library: violet dusk
  ['#132233', '#5c4a52', '#22313f', '#16202a', '#ffd27a'], // Sports complex
  ['#1d1a2e', '#6b4636', '#2e2530', '#1c171f', '#ffb35c'], // Deltech: orange dusk
  ['#11242b', '#3e5c5c', '#1d3338', '#122226', '#9ff5e0'], // Design dept: teal
  ['#24152e', '#6b3a57', '#33223f', '#1f1427', '#ff9ad0'], // Girls hostel: pink dusk
  ['#141a29', '#4b4a3a', '#232a35', '#141920', '#ffe08a'], // Aryabhatta: night
];

const ART = {
  dusk(ctx, w, h, a) {
    const [top, bot, far, near, win] = PALETTES[a.variant || 0];
    const r = rng(31 + (a.variant || 0) * 17);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, top); g.addColorStop(1, bot);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) { // stars
      ctx.fillStyle = `rgba(255,255,255,${0.2 + r() * 0.5})`;
      ctx.fillRect(Math.floor(r() * w), Math.floor(r() * h * 0.5), 1, 1);
    }
    ctx.fillStyle = 'rgba(255,240,210,0.85)'; // moon
    ctx.beginPath(); ctx.arc(w * 0.78, h * 0.18, 26, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,240,210,0.08)';
    ctx.beginPath(); ctx.arc(w * 0.78, h * 0.18, 60, 0, Math.PI * 2); ctx.fill();
    const skyline = (color, minH, maxH, lit) => {
      let x = 0;
      while (x < w) {
        const bw = 40 + Math.floor(r() * 90), bh = minH + Math.floor(r() * (maxH - minH));
        ctx.fillStyle = color; ctx.fillRect(x, h - bh, bw, bh);
        if (lit) for (let wy = h - bh + 10; wy < h - 20; wy += 16)
          for (let wx = x + 6; wx < x + bw - 8; wx += 12)
            if (r() < 0.22) { ctx.fillStyle = win; ctx.globalAlpha = 0.5 + r() * 0.5; ctx.fillRect(wx, wy, 4, 6); ctx.globalAlpha = 1; }
        x += bw + Math.floor(r() * 20);
      }
    };
    skyline(far, 120, 260, false);
    skyline(near, 70, 170, true);
    const fog = ctx.createLinearGradient(0, h * 0.6, 0, h);
    fog.addColorStop(0, 'rgba(160,150,190,0)'); fog.addColorStop(1, 'rgba(160,150,190,0.18)');
    ctx.fillStyle = fog; ctx.fillRect(0, 0, w, h);
  },
  groundTop(ctx, w, h) {
    ART.groundFill(ctx, w, h);
    ctx.fillStyle = '#4f6b45'; ctx.fillRect(0, 0, w, 6);      // dim moss
    ctx.fillStyle = '#6f8f5f'; ctx.fillRect(0, 0, w, 2);
    ctx.fillStyle = '#4f6b45'; for (const x of [4, 13, 22]) ctx.fillRect(x, 6, 3, 3);
  },
  groundFill(ctx, w, h) {
    ctx.fillStyle = '#1c1b24'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#34323f'; ctx.fillRect(1, 1, w - 2, h - 2);
    ctx.fillStyle = '#403e4d'; ctx.fillRect(1, 1, w - 2, 2); ctx.fillRect(1, 1, 2, h - 2);
    ctx.fillStyle = '#262531'; ctx.fillRect(1, h - 3, w - 2, 2); ctx.fillRect(w - 3, 1, 2, h - 2);
    const r = rng(13);
    for (let i = 0; i < 8; i++) { ctx.fillStyle = r() < 0.5 ? '#2a2935' : '#46445a'; ctx.fillRect(4 + Math.floor(r() * 12) * 2, 4 + Math.floor(r() * 12) * 2, 2, 2); }
  },
  heart(ctx, w, h) {
    const px = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];
    const s = Math.floor(w / 8);
    ctx.fillStyle = '#e74c3c';
    px.forEach((row, y) => [...row].forEach((c, x) => { if (c === 'X') ctx.fillRect(1 + x * s, 2 + y * s, s, s); }));
  },
};

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
}
