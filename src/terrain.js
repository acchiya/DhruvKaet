// ============================================================
//  Uneven terrain + parkour generator. Same seed = same level every time.
//  ground: [{x0, x1, top}] solid columns (gaps between them are pits)
//  plats:  [{x0, x1, top}] one-way ledges (jump up through, drop with Down+Jump)
// ============================================================
const TILE = 32;

function genTerrain(seed, len, baseY, spawns) {
  const r = rng(seed * 7919 + 11);
  const ground = [], plats = [];
  let x = 0, top = baseY;
  const lo = baseY - 4 * TILE, hi = baseY + TILE;              // allowed ground height range
  const clamp = t => Math.max(lo, Math.min(hi, t));
  const pick = (a, b) => a + Math.floor(r() * (b - a + 1));
  const put = (w, t) => {
    const last = ground[ground.length - 1];
    if (last && last.x1 === x && last.top === t) last.x1 += w; else ground.push({ x0: x, x1: x + w, top: t });
    x += w; top = t;
  };
  // Hazards (pit / wall span a..b) must not cover an enemy spawn point
  const clear = (a, b) => !spawns.some(s => s > a - 56 && s < b + 56);

  put(16 * TILE, baseY);                                         // calm start
  while (x < len - 12 * TILE) {
    const roll = r();
    if (roll < 0.3) {                                            // rolling hills
      for (let i = pick(2, 4); i > 0; i--) put(pick(3, 6) * TILE, clamp(top + (r() < 0.5 ? -1 : 1) * pick(1, 2) * TILE));
    } else if (roll < 0.5) {                                     // pit (sometimes with a ledge over it)
      const pw = pick(3, 5) * TILE;
      if (!clear(x, x + pw)) { put(TILE, top); continue; }       // slide forward and retry
      if (pw >= 5 * TILE || r() < 0.4) plats.push({ x0: x + pw / 2 - 48, x1: x + pw / 2 + 48, top: top - 72 });
      x += pw;
      put(pick(4, 6) * TILE, clamp(top + pick(-1, 1) * TILE));
    } else if (roll < 0.64) {                                    // stepping ledges over a wide pit
      const pw = pick(7, 9) * TILE;
      if (!clear(x, x + pw)) { put(TILE, top); continue; }
      for (let i = 0; i < 2; i++) {
        const cx = x + pw * (i + 1) / 3;
        plats.push({ x0: cx - 40, x1: cx + 40, top: top - 56 - i * 40 });
      }
      x += pw;
      put(pick(4, 6) * TILE, clamp(top - TILE));
    } else if (roll < 0.8) {                                     // climb wall: wall-jump or double jump
      const ww = pick(2, 3) * TILE;
      if (!clear(x + 3 * TILE, x + 3 * TILE + ww)) { put(TILE, top); continue; }
      put(3 * TILE, top);
      const floor = top, wallX = x, wallH = pick(5, 7) * TILE;   // 160-224px: above ~210 needs a wall-jump
      if (wallH < 7 * TILE || r() < 0.5) plats.push({ x0: wallX - 3 * TILE + 8, x1: wallX - 8, top: floor - 3 * TILE });
      put(ww, Math.max(baseY - 8 * TILE, floor - wallH));
      put(pick(4, 6) * TILE, clamp(top + pick(4, 6) * TILE));
    } else {                                                     // flat stretch
      put(pick(3, 7) * TILE, top);
    }
  }
  // Ease back to base height before the boss gate
  while (top !== baseY) put(3 * TILE, top < baseY ? Math.min(baseY, top + TILE) : Math.max(baseY, top - TILE));
  put(Math.max(TILE, len - x), baseY);
  return { ground, plats };
}
