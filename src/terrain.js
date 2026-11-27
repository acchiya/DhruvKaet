// ============================================================
//  Uneven terrain + parkour generator. Same seed = same level every time.
//  ground: [{x0, x1, top, sharp}] flat-ish pieces; gaps between them are pits.
//          sharp = vertical face on its left side (wall / pillar / cliff). Every other
//          height change becomes a smooth slope in the heightmap (buildHeightmap).
//  plats:  [{x0, x1, top}]   one-way ledges (jump up through, drop with Down+Jump)
//  movers: [{x, y, w, dx, dy, speed}] moving one-way platforms (shuttle dx/dy px from x,y)
//  Player reach (data.js): jump ≈123px, double jump ≈210px, wall-jump climbs any wall.
// ============================================================
const TILE = 32;
const HM_RES = 4;                                                // heightmap column width (px)

function genTerrain(seed, len, baseY) {
  const r = rng(seed * 7919 + 11);
  const ground = [], plats = [], movers = [];
  let x = 0, top = baseY;
  const lo = baseY - 6 * TILE, hi = baseY + TILE;              // allowed walkable height range
  const clamp = t => Math.max(lo, Math.min(hi, t));
  const pick = (a, b) => a + Math.floor(r() * (b - a + 1));
  const put = (w, t, sharp = false) => {
    const last = ground[ground.length - 1];
    if (last && last.x1 === x && last.top === t) last.x1 += w; else ground.push({ x0: x, x1: x + w, top: t, sharp });
    x += w; top = t;
  };
  const gap = w => { x += w; };
  const ledge = (cx, t, w = 80) => plats.push({ x0: cx - w / 2, x1: cx + w / 2, top: t });

  const features = [
    [24, () => {                                                 // rolling hills (smooth slopes)
      for (let i = pick(3, 6); i > 0; i--) { const dh = pick(1, 3) * TILE; put(Math.max(pick(3, 6) * TILE, dh * 2.2), clamp(top + (r() < 0.5 ? -1 : 1) * dh)); }
    }],
    [12, () => {                                                 // pit, sometimes a ledge above it
      const pw = pick(3, 5) * TILE;
      if (pw >= 5 * TILE || r() < 0.4) ledge(x + pw / 2, top - 72, 96);
      gap(pw); put(pick(4, 6) * TILE, clamp(top + pick(-2, 1) * TILE));
    }],
    [12, () => {                                                 // pillar hop: narrow columns over a pit
      put(3 * TILE, top);
      for (let i = pick(2, 4); i > 0; i--) { gap(pick(2, 3) * TILE); put(TILE * pick(1, 2), clamp(top - pick(-1, 2) * TILE), true); }
      gap(pick(2, 3) * TILE); put(pick(4, 6) * TILE, clamp(top + pick(-1, 1) * TILE));
    }],
    [12, () => {                                                 // moving platform across a wide pit
      put(3 * TILE, top);
      const pw = pick(9, 12) * TILE;
      movers.push({ x: x + 64, y: top - 8, w: 96, dx: pw - 128 - 96, dy: 0, speed: 90 + pick(0, 3) * 15 });
      gap(pw); put(pick(4, 6) * TILE, clamp(top + pick(-1, 1) * TILE));
    }],
    [12, () => {                                                 // climb wall (wall-jump) with optional ledge
      put(4 * TILE, top);
      const floor = top, wallX = x, wallH = pick(5, 8) * TILE;
      if (wallH <= 6 * TILE || r() < 0.4) ledge(wallX - 1.5 * TILE, floor - 3 * TILE, 3 * TILE - 16);
      put(pick(3, 4) * TILE, Math.max(baseY - 9 * TILE, floor - wallH), true);
      put(4 * TILE, clamp(top + pick(2, 3) * TILE));             // slope back down
      put(3 * TILE, clamp(top + pick(1, 3) * TILE));
    }],
    [8, () => {                                                  // elevator beside a tall cliff
      put(5 * TILE, top);
      const floor = top, cliff = Math.max(baseY - 9 * TILE, floor - pick(8, 9) * TILE);
      movers.push({ x: x - 56, y: floor - 8, w: 80, dx: 0, dy: cliff - floor, speed: 80 });
      put(pick(4, 6) * TILE, cliff, true);
      gap(pick(3, 4) * TILE); put(pick(4, 5) * TILE, clamp(cliff + pick(2, 4) * TILE));
    }],
    [10, () => {                                                 // ledge staircase over a pit up to a plateau
      if (top < baseY - 3 * TILE) { put(4 * TILE, top + 2 * TILE); return; }  // already high: slope down instead
      const steps = pick(3, 4), pw = steps * 3 * TILE;
      for (let i = 0; i < steps; i++) ledge(x + 48 + i * 3 * TILE, top - 60 - i * 44, 72);
      const want = top - steps * 44 - 20, plateau = baseY - Math.ceil((baseY - want) / TILE) * TILE;
      gap(pw); put(pick(4, 6) * TILE, Math.max(baseY - 9 * TILE, plateau));
      put(4 * TILE, clamp(top + 2 * TILE));
    }],
    [6, () => { put(pick(3, 6) * TILE, top); }],                 // short breather
  ];
  const total = features.reduce((a, f) => a + f[0], 0);

  put(16 * TILE, baseY);                                         // calm start
  while (x < len - 1200) {                                       // leave room to walk back down
    let roll = r() * total;
    for (const [w, fn] of features) { if ((roll -= w) < 0) { fn(); break; } }
  }
  // Walk back to base height before the boss gate
  while (top !== baseY) put(3 * TILE, top < baseY ? Math.min(baseY, top + TILE) : Math.max(baseY, top - TILE));
  put(Math.max(TILE, len - x), baseY);
  return { ground, plats, movers };
}

// Turn ground pieces into a smooth heightmap: h[i] = surface y of column i (NaN = pit).
// Non-sharp height changes become smoothstep slopes (max ~40°), long flats get a gentle wobble.
function buildHeightmap(ground, width, seed, flatFrom) {
  const n = Math.ceil(width / HM_RES), h = new Float32Array(n).fill(NaN), sharpAt = new Uint8Array(n);
  ground.forEach(g => { for (let i = Math.floor(g.x0 / HM_RES); i < Math.ceil(g.x1 / HM_RES) && i < n; i++) h[i] = g.top; });
  for (let k = 1; k < ground.length; k++) {
    const a = ground[k - 1], b = ground[k];
    if (a.x1 !== b.x0) continue;                                  // pit between them
    if (b.sharp || (ground[k + 1] && ground[k + 1].sharp && b.x1 - b.x0 <= 2 * TILE)) { sharpAt[Math.round(b.x0 / HM_RES)] = 1; continue; }
    const dh = b.top - a.top; if (!dh) continue;
    const room = Math.min(a.x1 - a.x0, b.x1 - b.x0) * 0.9;
    const R = Math.min(Math.max(Math.abs(dh) * 1.9, 40), room);     // ideally ~40°, steeper if short of room
    if (R < Math.abs(dh) * 1.4) { sharpAt[Math.round(b.x0 / HM_RES)] = 1; continue; } // would be steeper than ~47°: real wall
    const s = b.x0 - R / 2;
    for (let x = Math.max(a.x0, s); x < s + R; x += HM_RES) {
      const u = (x - s) / R, i = Math.floor(x / HM_RES);
      h[i] = a.top + dh * u * u * (3 - 2 * u);
    }
  }
  // gentle wobble on open ground, faded out near edges, walls and the boss arena
  const r = rng(seed * 131 + 5), p1 = r() * 6.28, p2 = r() * 6.28;
  const distToEdge = i => { let d = 0; while (d < 12 && i - d > 0 && i + d < n - 1 && !isNaN(h[i - d]) && !isNaN(h[i + d]) && !sharpAt[i - d] && !sharpAt[i + d + 1]) d++; return d; };
  for (let i = 0; i < n; i++) {
    const x = i * HM_RES;
    if (isNaN(h[i]) || x > flatFrom - 200 || x < 300) continue;
    const fade = Math.min(1, distToEdge(i) / 12);
    h[i] += (Math.sin(x / 97 + p1) * 4 + Math.sin(x / 41 + p2) * 2) * fade;
  }
  for (let i = 0; i < n; i++) if (!isNaN(h[i])) h[i] = Math.round(h[i]);
  return { h, res: HM_RES, sharpAt };
}
