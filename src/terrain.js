// ============================================================
//  Uneven terrain + parkour generator. Same seed = same level every time.
//  ground: [{x0, x1, top}]   solid columns (gaps between them are pits)
//  plats:  [{x0, x1, top}]   one-way ledges (jump up through, drop with Down+Jump)
//  movers: [{x, y, w, dx, dy, speed}] moving one-way platforms (shuttle dx/dy px from x,y)
//  Player reach (data.js): jump ≈123px, double jump ≈210px, wall-jump climbs any wall.
// ============================================================
const TILE = 32;

function genTerrain(seed, len, baseY) {
  const r = rng(seed * 7919 + 11);
  const ground = [], plats = [], movers = [];
  let x = 0, top = baseY;
  const lo = baseY - 6 * TILE, hi = baseY + TILE;              // allowed walkable height range
  const clamp = t => Math.max(lo, Math.min(hi, t));
  const pick = (a, b) => a + Math.floor(r() * (b - a + 1));
  const put = (w, t) => {
    const last = ground[ground.length - 1];
    if (last && last.x1 === x && last.top === t) last.x1 += w; else ground.push({ x0: x, x1: x + w, top: t });
    x += w; top = t;
  };
  const gap = w => { x += w; };
  const ledge = (cx, t, w = 80) => plats.push({ x0: cx - w / 2, x1: cx + w / 2, top: t });

  const features = [
    [22, () => {                                                 // bumpy ground: short steps up to 3 tiles
      for (let i = pick(3, 6); i > 0; i--) put(pick(2, 4) * TILE, clamp(top + (r() < 0.5 ? -1 : 1) * pick(1, 3) * TILE));
    }],
    [12, () => {                                                 // pit, sometimes a ledge above it
      const pw = pick(3, 5) * TILE;
      if (pw >= 5 * TILE || r() < 0.4) ledge(x + pw / 2, top - 72, 96);
      gap(pw); put(pick(3, 5) * TILE, clamp(top + pick(-2, 1) * TILE));
    }],
    [12, () => {                                                 // pillar hop: narrow columns over a pit
      put(2 * TILE, top);
      for (let i = pick(2, 4); i > 0; i--) { gap(pick(2, 3) * TILE); put(TILE * pick(1, 2), clamp(top - pick(-1, 2) * TILE)); }
      gap(pick(2, 3) * TILE); put(pick(3, 5) * TILE, clamp(top + pick(-1, 1) * TILE));
    }],
    [12, () => {                                                 // moving platform across a wide pit
      const pw = pick(9, 12) * TILE;
      movers.push({ x: x + 64, y: top - 8, w: 96, dx: pw - 128 - 96, dy: 0, speed: 90 + pick(0, 3) * 15 });
      gap(pw); put(pick(4, 6) * TILE, clamp(top + pick(-1, 1) * TILE));
    }],
    [12, () => {                                                 // climb wall (wall-jump) with optional ledge
      put(3 * TILE, top);
      const floor = top, wallX = x, wallH = pick(5, 8) * TILE;
      if (wallH <= 6 * TILE || r() < 0.4) ledge(wallX - 1.5 * TILE, floor - 3 * TILE, 3 * TILE - 16);
      put(pick(2, 3) * TILE, Math.max(baseY - 9 * TILE, floor - wallH));
      for (let i = 0; i < 2; i++) put(2 * TILE, clamp(top + pick(1, 3) * TILE));   // climb down in steps
    }],
    [8, () => {                                                  // elevator beside a tall cliff
      put(4 * TILE, top);
      const floor = top, cliff = Math.max(baseY - 9 * TILE, floor - pick(8, 9) * TILE);
      movers.push({ x: x - 56, y: floor - 8, w: 80, dx: 0, dy: cliff - floor, speed: 80 });
      put(pick(4, 6) * TILE, cliff);
      gap(pick(3, 4) * TILE); put(pick(3, 5) * TILE, clamp(cliff + pick(2, 4) * TILE));
    }],
    [10, () => {                                                 // ledge staircase over a pit up to a plateau
      if (top < baseY - 3 * TILE) { put(2 * TILE, top + 2 * TILE); return; }  // already high: step down instead
      const steps = pick(3, 4), pw = steps * 3 * TILE;
      for (let i = 0; i < steps; i++) ledge(x + 48 + i * 3 * TILE, top - 60 - i * 44, 72);
      const want = top - steps * 44 - 20, plateau = baseY - Math.ceil((baseY - want) / TILE) * TILE;
      gap(pw); put(pick(4, 6) * TILE, Math.max(baseY - 9 * TILE, plateau));
      put(2 * TILE, clamp(top + 2 * TILE));
    }],
    [6, () => { put(pick(2, 5) * TILE, top); }],                 // short breather
  ];
  const total = features.reduce((a, f) => a + f[0], 0);

  put(16 * TILE, baseY);                                         // calm start
  while (x < len - 1200) {                                       // leave room to walk back down
    let roll = r() * total;
    for (const [w, fn] of features) { if ((roll -= w) < 0) { fn(); break; } }
  }
  // Walk back to base height before the boss gate
  while (top !== baseY) put(2 * TILE, top < baseY ? Math.min(baseY, top + TILE) : Math.max(baseY, top - TILE));
  put(Math.max(TILE, len - x), baseY);
  return { ground, plats, movers };
}
