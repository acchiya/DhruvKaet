const VW = 800, VH = 480, GROUND_Y = 420, LEVEL_LEN = 4800, ARENA_W = 800;

// ---------- Save (per browser) ----------
const SAVE_KEY = 'dhruvkaat-save-v1';
function loadSave() {
  try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (s && Array.isArray(s.weapons)) return s; } catch (e) { }
  return { cleared: [], weapons: ['fists'] };
}
function writeSave(s) { if (testMode()) return; try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch (e) { } }

// Test mode: every level open + every weapon, nothing is saved. Toggle with T on the map (or open ?test in the URL).
const TEST_KEY = 'dhruvkaat-test';
let TEST = /[?&]test\b/.test(location.search);
try { TEST = TEST || localStorage.getItem(TEST_KEY) === '1'; } catch (e) { }
function testMode() { return TEST; }
function setTestMode(on) { TEST = on; try { on ? localStorage.setItem(TEST_KEY, '1') : localStorage.removeItem(TEST_KEY); } catch (e) { } }

function sfx(scene, code, cfg) {
  const key = scene.cache.audio.exists(code) ? code : code + '_def';
  if (scene.cache.audio.exists(key)) scene.sound.play(key, { volume: 0.6, ...cfg });
}
function music(scene, code) {
  scene.sound.stopAll();
  if (scene.cache.audio.exists(code)) scene.sound.play(code, { loop: true, volume: 0.4 });
}
const TXT = (size, color = '#fff') => ({ fontFamily: 'monospace', fontSize: size, color, stroke: '#000', strokeThickness: 4 });

// =====================================================================
class Boot extends Phaser.Scene {
  constructor() { super('Boot'); }
  preload() {
    this.load.on('loaderror', () => { });
    IMAGES.forEach(a => {
      const url = `assets/images/${a.code}.${a.ext || 'png'}`;
      if (a.sheet) this.load.spritesheet(a.code, url, a.sheet); else this.load.image(a.code, url);
    });
    AUDIO.forEach(a => {
      this.load.audio(a.code, `assets/audio/${a.code}.mp3`);
      if (a.def) this.load.audio(a.code + '_def', `assets/audio/default/${a.code}.ogg`);
    });
  }
  create() {
    this.registry.set('loaded', new Set(IMAGES.filter(a => this.textures.exists(a.code)).map(a => a.code)));
    makeThemeTextures(this);
    const ph = new Set();
    IMAGES.forEach(a => { if (!this.textures.exists(a.code)) { makePlaceholder(this, a); if (!a.art) ph.add(a.code); } });
    this.registry.set('placeholders', ph);
    makeFxTextures(this);
    const k = 'A1';
    if (this.textures.get(k).frameTotal > 2) {
      const f = (s, e) => this.anims.generateFrameNumbers(k, { start: s, end: e });
      this.anims.create({ key: 'idle', frames: f(0, 2), frameRate: 3, repeat: -1 });
      this.anims.create({ key: 'run', frames: f(3, 6), frameRate: 10, repeat: -1 });
      this.anims.create({ key: 'jumpUp', frames: [{ key: k, frame: 8 }] });
      this.anims.create({ key: 'fall', frames: [{ key: k, frame: 9 }] });
      if (this.textures.get(k).frameTotal > 11) this.anims.create({ key: 'duck', frames: [{ key: k, frame: 10 }] });
    }
    this.registry.set('save', loadSave());
    this.scene.start('Title');
  }
}

// =====================================================================
class Title extends Phaser.Scene {
  constructor() { super('Title'); }
  create() {
    this.add.image(0, 0, 'L1').setOrigin(0).setDisplaySize(VW, VH);
    this.add.image(0, 0, 'fx_vignette').setOrigin(0).setDisplaySize(VW, VH);
    this.add.image(VW / 2, 120, 'F1').setDisplaySize(400, 100);
    this.add.text(VW / 2, 200, TEXT.title, TXT(36, '#ffd27a')).setOrigin(0.5);
    const go = this.add.text(VW / 2, 270, 'Press ENTER  /  A', TXT(20)).setOrigin(0.5);
    this.tweens.add({ targets: go, alpha: 0.4, yoyo: true, repeat: -1, duration: 700 });
    this.add.text(VW / 2, 385, CONTROLS_HELP, TXT(12, '#ccc')).setOrigin(0.5);
    this.ctl = new Controls(this);
  }
  update() { this.ctl.poll(); if (this.ctl.pressed('confirm')) this.scene.start('Map'); }
}

// =====================================================================
class MapScene extends Phaser.Scene {
  constructor() { super('Map'); }
  create() {
    music(this, 'S11');
    this.cameras.main.setBackgroundColor('#0d1a0d');
    const save = this.registry.get('save');
    const map = this.add.image(VW / 2, VH / 2, 'F2');
    const sc = Math.min(VW / map.width, (VH - 40) / map.height);
    map.setScale(sc).setY((VH - 40) / 2);
    const ox = VW / 2 - map.width * sc / 2, oy = (VH - 40) / 2 - map.height * sc / 2;
    const P = ([x, y]) => ({ x: ox + x * sc, y: oy + y * sc });
    const stops = [...LEVELS.map(l => P(l.map)), P(LEVEL7.map)];
    this.stops = stops;

    // Path: dark outline + dashed gold line
    const g = this.add.graphics();
    for (let i = 0; i < stops.length - 1; i++) {
      const pts = [stops[i], ...(MAP_ROUTE[i] || []).map(P), stops[i + 1]].map(q => new Phaser.Math.Vector2(q.x, q.y));
      const curve = new Phaser.Curves.Spline(pts);
      const n = Math.max(8, Math.floor(curve.getLength() / 6));
      const sp = curve.getSpacedPoints(n);
      g.lineStyle(7, 0x2b1a0a, 0.75);
      for (let j = 0; j < sp.length - 1; j++) g.lineBetween(sp[j].x, sp[j].y, sp[j + 1].x, sp[j + 1].y);
      g.lineStyle(3, save.cleared.includes(i) ? 0xffd27a : 0xdddddd, 1);
      for (let j = 0; j < sp.length - 1; j += 2) g.lineBetween(sp[j].x, sp[j].y, sp[j + 1].x, sp[j + 1].y);
    }
    // Stops
    this.unlocked = i => i < LEVELS.length && (testMode() || i === 0 || save.cleared.includes(i - 1));
    stops.forEach((s, i) => {
      const cleared = save.cleared.includes(i), open = this.unlocked(i);
      const col = cleared ? 0x2ecc71 : open ? 0xffd27a : 0x666666;
      this.add.circle(s.x, s.y, 11, 0x000000, 0.7);
      const c = this.add.circle(s.x, s.y, 8, col).setStrokeStyle(2, 0xffffff);
      if (open && !cleared) this.tweens.add({ targets: c, scale: 1.3, yoyo: true, repeat: -1, duration: 500 });
      this.add.text(s.x, s.y, i === 6 ? '?' : cleared ? '✓' : String(i + 1), TXT(11)).setOrigin(0.5);
    });

    let start = 0;
    for (let i = 0; i < LEVELS.length; i++) if (this.unlocked(i)) start = i;
    this.cursor = start;
    this.dhruv = this.add.sprite(0, 0, 'A1', 0).setDisplaySize(30, 40).setOrigin(0.5, 1);
    this.info = this.add.text(VW / 2, VH - 20, '', TXT(14)).setOrigin(0.5);
    this.moveTo(start, true);
    if (!testMode()) this.add.text(VW - 8, 8, 'T: test mode', TXT(11, '#bbb')).setOrigin(1, 0);
    if (testMode()) {
      this.add.rectangle(VW / 2, 14, VW, 26, 0x8b0000, 0.85);
      this.add.text(VW / 2, 14, 'TEST MODE · all levels + weapons · nothing saved · 1-6 jump to level · T to turn off', TXT(12, '#fff')).setOrigin(0.5);
    }

    this.ctl = new Controls(this);
    // T toggles test mode; 1-6 (top row or numpad) pick a level. Uses ev.key so Caps Lock / numpad work too.
    this.input.keyboard.on('keydown', ev => {
      const k = (ev.key || '').toLowerCase();
      if (k === 't') { setTestMode(!testMode()); this.scene.restart(); return; }
      const m = /^(?:Digit|Numpad)([1-6])$/.exec(ev.code || ''), n = m ? +m[1] - 1 : '123456'.indexOf(k);
      if (n < 0) return;
      if (this.unlocked(n)) { this.picked = n; this.moveTo(n); this.time.delayedCall(250, () => this.scene.start('Level', { level: n })); }
      else this.flash(`Level ${n + 1} is locked. Press T for test mode to open every level.`);
    });
  }
  update() {
    const c = this.ctl; c.poll();
    if (c.pressed('right')) this.step(1);
    if (c.pressed('left')) this.step(-1);
    if (c.pressed('confirm')) this.enter();
    if (c.pressed('back')) this.scene.start('Title');
  }
  step(d) {
    if (this.picked !== undefined) return;            // a level number was just pressed
    const n = this.cursor + d;
    if (n >= 0 && n < LEVELS.length && this.unlocked(n)) { this.moveTo(n); sfx(this, 'S13', { volume: 0.3 }); }
  }
  moveTo(i, instant) {
    this.cursor = i;
    const s = this.stops[i];
    if (instant) this.dhruv.setPosition(s.x, s.y - 8);
    else this.tweens.add({ targets: this.dhruv, x: s.x, y: s.y - 8, duration: 300 });
    const L = LEVELS[i], B = BOSSES[L.boss], save = this.registry.get('save');
    this.info.setText(`Level ${i + 1}: ${L.name}  ·  Boss: ${B.name}  ·  Reward: ${WEAPONS[L.reward].name}` +
      (save.cleared.includes(i) ? '  ✓' : '') + '   [ENTER]');
  }
  enter() { this.scene.start('Level', { level: this.cursor }); }
  flash(text) {
    if (this.note) this.note.destroy();
    this.note = this.add.text(VW / 2, VH - 48, text, TXT(13, '#ff9a9a')).setOrigin(0.5);
    this.tweens.add({ targets: this.note, alpha: 0, delay: 1800, duration: 400 });
  }
}

// =====================================================================
class LevelScene extends Phaser.Scene {
  constructor() { super('Level'); }
  init(d) { this.levelIndex = d.level; this.L = LEVELS[d.level]; this.B = BOSSES[this.L.boss]; }

  create() {
    const L = this.L, W = LEVEL_LEN + ARENA_W;
    this.save = this.registry.get('save');
    this.owned = testMode() ? [...WEAPON_ORDER] : [...this.save.weapons];
    this.weapon = this.owned[this.owned.length - 1];
    music(this, 'S7');

    this.gt = 0; this.paused = false;
    this.physics.world.setBounds(0, 0, W, VH, true, true, false, false); // no floor: pits are real
    this.add.image(0, 0, L.bg).setOrigin(0).setScrollFactor(0).setDisplaySize(VW, VH);
    const v = Math.min(this.levelIndex, PALETTES.length - 1);
    makeCampusParallax(this, v);
    this.pxMid = this.add.tileSprite(0, 0, VW, VH, 'px_mid_c' + v).setOrigin(0).setScrollFactor(0);
    this.pxNear = this.add.tileSprite(0, 0, VW, VH, 'px_near_c' + v).setOrigin(0).setScrollFactor(0).setAlpha(0.92);
    this.buildWorld(W);
    this.add.text(LEVEL_LEN - 60, GROUND_Y - 120, 'BOSS →', TXT(20, '#ff6b6b')).setDepth(3);

    // Player
    const p = this.player = this.physics.add.sprite(80, GROUND_Y - 40, 'A1');
    p.setCollideWorldBounds(true).setMaxVelocity(800, 1000).setDepth(5);
    this.facing = 1; this.hp = PLAYER.hp; this.jumps = 0; this.invulnUntil = 0; this.knockUntil = 0;
    this.dashUntil = 0; this.dashReady = 0; this.nextAttack = 0; this.ducking = false; this.dead = false;
    this.grabbedBy = null; this.pullX = 0; this.hammerOut = null;
    this.lastGround = 0; this.jumpBuf = 0; this.wallDir = 0; this.wallUntil = 0; this.dropUntil = 0; this.safeX = 80;
    this.setPlayerBody();
    const oneWay = (o, pl) => o.body.velocity.y >= 0 && o.body.prev.y + o.body.height <= pl.body.top + 4 && !(o === this.player && this.gt < this.dropUntil);
    this.physics.add.collider(p, this.solids);
    this.physics.add.collider(p, this.ledges, null, oneWay);
    // moving platforms: one-way, generous tolerance because they move under you
    this.physics.add.collider(p, this.movers, null, (o, m) => o.body.prev.y + o.body.height <= m.body.prev.y + 10 && o.body.velocity.y >= m.body.velocity.y - 5 && this.gt >= this.dropUntil);

    // Groups
    this.enemies = this.physics.add.group();
    this.enemyShots = this.physics.add.group({ allowGravity: false });
    this.physics.add.collider(this.enemies, this.solids);
    this.physics.add.collider(this.enemies, this.ledges, null, oneWay);
    this.physics.add.overlap(p, this.enemies, (pl, e) => this.touchEnemy(e));
    this.physics.add.overlap(p, this.enemyShots, (pl, s) => { if (s.active) { this.hurtPlayer(s.dmg, s); if (!s.wave) s.destroy(); } });

    // Spawn level content
    const lay = LEVEL_LAYOUT;
    this.placing = true;
    lay.mini.forEach(x => this.spawnBoss(x, false));
    lay.monkey.forEach(x => this.spawnEnemy('monkey', x));
    lay.gayansh.forEach(x => this.spawnEnemy('gayansh', x));
    lay.aunty.forEach((x, i) => { const a = this.spawnEnemy('aunty', x); a.line = TEXT.aunty[i % TEXT.aunty.length]; });
    lay.bobba.forEach(x => this.spawnEnemy('bobba', x));
    this.placing = false;

    // Camera + atmosphere
    this.cameras.main.setBounds(0, 0, LEVEL_LEN + ARENA_W, VH).startFollow(p, true, 0.12, 0.12);
    this.add.image(0, 0, 'fx_vignette').setOrigin(0).setScrollFactor(0).setDisplaySize(VW, VH).setDepth(90);
    this.cameras.main.fadeIn(300);

    // Input
    this.ctl = new Controls(this);
    this.input.on('pointerdown', () => !this.paused && this.attack());
    this.events.on('resume', () => { this.paused = false; this.ctl.sync(); this.sound.resumeAll(); });
    if (this.input.gamepad) this.input.gamepad.on('disconnected', () => this.openPause());

    this.makeHud();
    this.setWeapon(this.weapon);
    this.banner(`Level ${this.levelIndex + 1}: ${L.name}`);
  }

  // ---------------- World ----------------
  buildWorld(W) {
    const T = genTerrain(this.levelIndex + 1, LEVEL_LEN, GROUND_Y);
    this.usedX = [];
    T.ground.push({ x0: LEVEL_LEN, x1: W, top: GROUND_Y });           // flat boss arena
    this.segs = T.ground;
    this.solids = this.physics.add.staticGroup();
    this.ledges = this.physics.add.staticGroup();
    const th = this.theme = THEMES[Math.min(this.levelIndex, THEMES.length - 1)];
    const own = this.registry.get('loaded'), tex = (code, k) => own.has(code) ? code : k + th.id;
    const tTop = tex('D1', 'gt_'), tFill = tex('D5', 'gf_'), tPlat = tex('D2', 'gp_');
    const r = rng(this.levelIndex * 31 + 7);
    const bottom = VH + 64;
    this.segs.forEach((g, i) => {
      const w = g.x1 - g.x0;
      const z = this.add.zone(g.x0 + w / 2, (g.top + bottom) / 2, w, bottom - g.top);
      this.physics.add.existing(z, true); this.solids.add(z);
      this.add.tileSprite(g.x0, g.top + 32, w, bottom - g.top - 32, tFill).setOrigin(0).setTilePosition(g.x0, g.top - GROUND_Y).setDepth(2);
      this.add.tileSprite(g.x0, g.top, w, 32, tTop).setOrigin(0).setTilePosition(g.x0, 0).setDepth(2);
      if (th.tufts && r() < 0.5) this.add.tileSprite(g.x0 + 4, g.top - 8, Math.min(w - 8, 32 + r() * 64), 10, 'deco_grass').setOrigin(0).setDepth(3).setAlpha(0.8);
      // exposed side faces get a dark edge
      const prev = this.segs[i - 1], next = this.segs[i + 1];
      const lTop = prev && prev.x1 === g.x0 ? prev.top : bottom, rTop = next && next.x0 === g.x1 ? next.top : bottom;
      if (lTop > g.top) this.add.rectangle(g.x0, g.top + 2, 3, lTop - g.top, 0x0c0b0d, 0.75).setOrigin(0).setDepth(2);
      if (rTop > g.top) this.add.rectangle(g.x1 - 3, g.top + 2, 3, rTop - g.top, 0x0c0b0d, 0.75).setOrigin(0).setDepth(2);
      if (next && next.x0 > g.x1) this.add.tileSprite(g.x1, VH - 120, next.x0 - g.x1, 120, 'fx_pit').setOrigin(0).setDepth(2);
      // props
      if (w >= 160 && g.x0 < LEVEL_LEN && r() < th.trees) this.add.image(g.x0 + 40 + r() * (w - 80), g.top + 6, 'deco_tree').setOrigin(0.5, 1).setScale(0.7 + r() * 0.4).setDepth(1).setFlipX(r() < 0.5);
      if (w < 64) return;
      for (let x = g.x0 + 22; x < g.x1 - 22; x += 50 + r() * 70) {
        if (r() < 0.4) continue;
        const k = th.deco[Math.floor(r() * th.deco.length)];
        const d = this.add.image(x, g.top + 2, 'prop_' + k).setOrigin(0.5, 1).setDepth(r() < 0.12 ? 6 : 3).setFlipX(r() < 0.5);
        if (d.depth === 6) d.setAlpha(0.85);
        if (k === 'lamp') { d.setDepth(1).setFlipX(false); this.add.image(x + 5, g.top - 82, 'fx_glow').setScale(3).setTint(0xffe7a8).setAlpha(0.35).setBlendMode(Phaser.BlendModes.ADD).setDepth(1); }
      }
    });
    T.plats.forEach(pl => {
      const w = pl.x1 - pl.x0;
      const z = this.add.zone(pl.x0 + w / 2, pl.top + 7, w, 14);
      this.physics.add.existing(z, true); this.ledges.add(z);
      this.add.tileSprite(pl.x0, pl.top, w, 16, tPlat).setOrigin(0).setDepth(3);
    });
    // moving platforms (shuttle smoothly between start and start + dx/dy)
    this.movers = this.physics.add.group({ allowGravity: false, immovable: true });
    T.movers.forEach(m => {
      const pl = this.add.tileSprite(m.x + m.w / 2, m.y + 8, m.w, 16, tPlat).setDepth(3);
      this.physics.add.existing(pl); this.movers.add(pl);
      pl.body.setAllowGravity(false).setImmovable(true);
      pl.home = { x: pl.x, y: pl.y }; pl.m = m; pl.period = 2 * Math.hypot(m.dx, m.dy) / m.speed * 1000;
      pl.arrow = this.add.text(pl.x, pl.y + 14, m.dy ? '⇅' : '⇆', TXT(10, '#ffd27a')).setOrigin(0.5, 0).setDepth(3).setAlpha(0.6);
    });
    // fireflies / dust motes in the lamplight
    for (let i = 0; i < 30; i++) {
      const x = r() * W, y = 120 + r() * 260;
      const f = this.add.image(x, y, 'fx_glow').setScale(0.3).setTint(0xffe7a8).setBlendMode(Phaser.BlendModes.ADD).setDepth(4);
      this.tweens.add({ targets: f, x: x + (r() - 0.5) * 120, y: y + (r() - 0.5) * 60, duration: 3000 + r() * 3000, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.tweens.add({ targets: f, alpha: 0.15, duration: 600 + r() * 900, yoyo: true, repeat: -1 });
    }
  }
  updateMovers(dt) {
    this.movers.getChildren().forEach(pl => {
      const ph = (1 - Math.cos(2 * Math.PI * this.gt / pl.period)) / 2;
      const tx = pl.home.x + pl.m.dx * ph, ty = pl.home.y + pl.m.dy * ph;
      // carry Dhruv (and anything standing on it) sideways with the platform
      const p = this.player, pb = p.body;
      if (pl.m.dx && Math.abs(pb.bottom - pl.body.top) < 6 && pb.right > pl.body.left && pb.left < pl.body.right && pb.velocity.y >= -1) p.x += tx - pl.x;
      pl.body.setVelocity((tx - pl.x) * 1000 / dt, (ty - pl.y) * 1000 / dt);
      pl.arrow.setPosition(pl.x, pl.y + 10);
    });
  }
  dust(x, y) {
    for (let i = 0; i < 10; i++) {
      const d = this.add.image(x + (Math.random() - 0.5) * 30, y - 4, 'fx_dot').setTint(0x8a7f74).setScale(0.5 + Math.random() * 0.6).setDepth(7);
      this.tweens.add({ targets: d, x: d.x + (Math.random() - 0.5) * 70, y: y - 20 - Math.random() * 30, alpha: 0, duration: 450 + Math.random() * 250, onComplete: () => d.destroy() });
    }
  }
  // Ground height under x (null = pit). Ledges are not counted.
  topAt(x) { const g = this.segs.find(s => x >= s.x0 && x < s.x1); return g ? g.top : null; }
  groundY(x) { const t = this.topAt(x); return t === null ? GROUND_Y : t; }
  // Nearest x to the wanted spot that stands on a wide, low-enough piece of ground (no pits / wall tops)
  standX(x, tries = 6) {
    this.usedX = this.usedX || [];
    let best = x, bestD = Infinity;
    this.segs.forEach(g => {
      if (g.x1 - g.x0 < 96 || g.top < GROUND_Y - 4 * 32) return;
      const cx = Phaser.Math.Clamp(x, g.x0 + 40, g.x1 - 40), d = Math.abs(cx - x);
      if (d < bestD) { bestD = d; best = cx; }
    });
    if (tries > 0 && this.usedX.some(u => Math.abs(u - best) < 100)) return this.standX(best + 110, tries - 1);  // don't stack enemies
    if (this.placing) this.usedX.push(best);
    return best;
  }

  openPause() {
    if (this.paused || this.dead || !this.scene.isActive()) return;
    this.paused = true;
    this.tweens.killTweensOf(this.msg); this.msg.setAlpha(0);
    this.sound.pauseAll();
    this.scene.launch('Pause', { level: this.levelIndex });
    this.scene.pause();
  }

  // ---------------- HUD ----------------
  makeHud() {
    this.hearts = [];
    for (let i = 0; i < PLAYER.hp; i++)
      this.hearts.push(this.add.image(14 + i * 20, 16, 'F3').setOrigin(0).setScrollFactor(0).setDepth(100).setDisplaySize(16, 16));
    this.weaponIcon = this.add.image(VW - 150, 24, 'W0').setScrollFactor(0).setDepth(100).setDisplaySize(28, 28);
    this.weaponText = this.add.text(VW - 130, 14, '', TXT(13)).setScrollFactor(0).setDepth(100);
    this.msg = this.add.text(VW / 2, 70, '', TXT(18, '#ffd27a')).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    this.updateHud();
  }
  updateHud() {
    this.hearts.forEach((h, i) => h.setAlpha(i < this.hp ? 1 : 0.15));
    const w = WEAPONS[this.weapon];
    this.weaponIcon.setTexture(w.icon).setDisplaySize(28, 28);
    this.weaponText.setText(`${w.name}\n${this.owned.length > 1 ? 'Q/E switch' : ''}`);
  }
  banner(text, ms = 2000) {
    this.msg.setText(text).setAlpha(1);
    this.tweens.killTweensOf(this.msg);
    this.tweens.add({ targets: this.msg, alpha: 0, delay: ms, duration: 400 });
  }
  say(target, text, ms = 1800, color = '#fff') {
    const t = this.add.text(target.x, target.y - target.displayHeight / 2 - 18, text, TXT(13, color)).setOrigin(0.5).setDepth(60);
    this.tweens.add({ targets: t, y: t.y - 20, alpha: 0, delay: ms - 400, duration: 400, onComplete: () => t.destroy() });
    return t;
  }

  // ---------------- Player ----------------
  setPlayerBody() {
    const p = this.player;
    p.setDisplaySize(48, 64);
    const fw = p.frame.realWidth, fh = p.frame.realHeight, top = this.ducking ? 0.45 : 0.08;
    p.body.setSize(fw * 0.5, fh * (1 - top)).setOffset(fw * 0.25, fh * top);
  }

  setWeapon(id) {
    if (!this.owned.includes(id)) return;
    this.weapon = id;
    if (this.companion) { this.companion.destroy(); this.companion = null; }
    const c = WEAPONS[id].companion;
    if (c === 'cat') { this.companion = this.add.image(this.player.x, this.player.y + 18, 'W4').setDisplaySize(28, 28).setDepth(6); this.companion.nextBite = 0; }
    if (c === 'fairy') { this.companion = this.add.image(this.player.x, this.player.y - 50, 'W5').setDisplaySize(24, 24).setDepth(6); this.companion.nextHeal = this.gt + 5000; }
    this.updateHud();
  }
  cycleWeapon(d) {
    const i = this.owned.indexOf(this.weapon);
    this.setWeapon(this.owned[(i + d + this.owned.length) % this.owned.length]);
  }

  attack() {
    const t = this.gt, w = WEAPONS[this.weapon], p = this.player;
    if (this.dead || this.grabbedBy || t < this.nextAttack || this.ducking) return;
    if (w.kind === 'throw') {
      if (this.hammerOut) return;
      const h = this.hammerOut = this.physics.add.image(p.x + this.facing * 20, p.y - 6, w.icon).setDisplaySize(26, 26).setDepth(6);
      h.body.setAllowGravity(false); h.setVelocityX(this.facing * 560); h.returnAt = t + 380; h.hit = new Set();
      this.tweens.add({ targets: h, angle: 360 * this.facing, duration: 250, repeat: -1 });
      sfx(this, 'S2');
      return;
    }
    this.nextAttack = t + w.cd;
    sfx(this, 'S2');
    const reach = w.range + 22;
    const rect = new Phaser.Geom.Rectangle(this.facing > 0 ? p.x : p.x - reach, p.y - 44, reach, 76);
    const fx = this.add.image(p.x + this.facing * (reach / 2), p.y - 4, 'fx_slash').setDepth(7)
      .setDisplaySize(Math.max(40, reach), 64).setFlipX(this.facing < 0);
    this.tweens.add({ targets: fx, alpha: 0, duration: 140, onComplete: () => fx.destroy() });
    const icon = this.add.image(p.x + this.facing * 26, p.y - 4, w.icon).setDisplaySize(22, 22).setDepth(7);
    this.tweens.add({ targets: icon, x: p.x + this.facing * (reach - 8), alpha: 0, duration: 140, onComplete: () => icon.destroy() });
    this.enemies.getChildren().slice().forEach(e => {
      if (e.active && Phaser.Geom.Intersects.RectangleToRectangle(rect, e.getBounds()))
        this.damageEnemy(e, w.dmg, this.facing * (w.knock || 200));
    });
  }

  hurtPlayer(dmg, src) {
    const t = this.gt;
    if (!dmg || this.dead || t < this.invulnUntil || t < this.dashUntil) return;
    this.hp = Math.max(0, this.hp - dmg);
    sfx(this, 'S4');
    this.updateHud();
    this.cameras.main.shake(120, 0.006);
    if (this.hp <= 0) return this.die();
    this.invulnUntil = t + 900; this.knockUntil = t + 220;
    const dir = Math.sign(this.player.x - src.x) || -this.facing;
    this.player.setVelocity(dir * 320, -220);
    this.tweens.add({ targets: this.player, alpha: 0.3, yoyo: true, repeat: 4, duration: 90, onComplete: () => this.player.setAlpha(1) });
  }

  die() {
    this.dead = true; sfx(this, 'S5');
    this.player.setTint(0x884444).setVelocity(0, -200);
    this.player.body.checkCollision.none = true;
    this.time.delayedCall(1200, () => this.scene.start('GameOver', { level: this.levelIndex }));
  }

  // ---------------- Enemies ----------------
  spawnEnemy(type, x, opts = {}) {
    const d = { ...ENEMIES[type], ...opts };
    if (!d.fly && !this.arenaOn) x = this.standX(x, this.placing ? 6 : 0);
    const gy = this.groundY(x);
    const e = this.enemies.create(x, d.fly ? gy - 120 : gy - d.h / 2 - 2, d.sprite);
    e.setDisplaySize(d.w, d.h); e.def = d; e.type = type;
    e.hp = e.maxHp = d.hp; e.state = 'idle'; e.until = 0; e.nextAttack = 0; e.stunUntil = 0; e.minions = [];
    e.facing = -1; e.baseX = x;
    if (d.fly) e.body.setAllowGravity(false);
    if (d.ai === 'aunty') {                       // hides underground until Dhruv comes close
      e.body.setImmovable(true); e.body.setAllowGravity(false);
      e.top = gy; e.hidden = true; e.y = gy + d.h / 2 + 6; e.body.enable = false; e.setDepth(1);
      e.crack = this.add.image(x, gy + 1, 'prop_crack').setOrigin(0.5, 1).setDepth(3);
    }
    return e;
  }

  spawnBoss(x, isBoss) {
    const B = this.B, s = isBoss ? B.boss : B.mini;
    const big = isBoss ? 1 : 0.62;
    const e = this.spawnEnemy('warrior', x, {
      name: B.name, sprite: B.sprite, w: 96 * big, h: 128 * big, ai: B.ai, speed: B.speed, range: B.range,
      windup: B.windup, cd: B.cd, minion: B.minion, maxMinions: B.maxMinions, dmg: s.dmg, hp: s.hp, contact: 1,
    });
    e.isBoss = isBoss; e.phase = 1;
    e.label = this.add.text(x, e.y - e.displayHeight / 2 - 12, B.name, TXT(11, isBoss ? '#ff6b6b' : '#ffb3b3')).setOrigin(0.5).setDepth(8);
    return e;
  }

  damageEnemy(e, dmg, knock) {
    if (!e.active) return;
    if (e.def.invulnerable || e.powering) { this.say(e, 'clink', 400, '#aaa'); return; }
    e.hp -= dmg; sfx(this, 'S3');
    e.setTintFill(0xffffff);
    this.time.delayedCall(70, () => { if (e.active) { e.clearTint(); if (e.phase === 2) e.setTint(0xff9999); } });
    if (!e.isBoss && knock) { e.setVelocityX(knock); e.stunUntil = this.gt + 180; }
    if (e.isBoss) this.updateBossBar();
    if (e.hp <= 0) return this.killEnemy(e);
  }

  killEnemy(e) {
    if (e.timer) e.timer.destroy();
    if (e.crack) e.crack.destroy();
    if (e.carrying) { if (e.icon) e.icon.destroy(); this.owned.push(e.carrying); this.owned.sort((a, b) => WEAPON_ORDER.indexOf(a) - WEAPON_ORDER.indexOf(b)); this.banner(`Got your ${WEAPONS[e.carrying].name} back!`); this.updateHud(); }
    if (e.label) e.label.destroy();
    if (e.mount) e.mount.destroy();
    e.minions.forEach(m => m.active && this.killEnemy(m));
    const ghost = this.add.image(e.x, e.y, e.texture.key).setDisplaySize(e.displayWidth, e.displayHeight).setTint(0x000000);
    this.tweens.add({ targets: ghost, alpha: 0, y: e.y - 20, duration: 400, onComplete: () => ghost.destroy() });
    e.destroy();
    if (e.isBoss) this.bossDefeated();
  }

  touchEnemy(e) {
    if (!e.active || this.dead) return;
    const ai = e.def.ai;
    if (ai === 'bobba') return this.bobbaTouch();
    if (ai === 'gayansh') return this.grab(e);
    if (ai === 'monkey' && !e.carrying) {
      this.hurtPlayer(e.def.contact, e);
      if (this.weapon !== 'fists' && !e.carrying) {
        const w = this.weapon;
        e.carrying = w; this.owned = this.owned.filter(x => x !== w);
        this.setWeapon('fists');
        e.icon = this.add.image(e.x, e.y - 26, WEAPONS[w].icon).setDisplaySize(18, 18).setDepth(8);
        e.escapeAt = this.gt + 9000; e.runDir = undefined;
        e.timer = this.add.text(e.x, e.y - 44, '9', TXT(12, '#ff6b6b')).setOrigin(0.5).setDepth(8);
        this.banner(`Monkey stole your ${WEAPONS[w].name}! Kill it!`);
      }
      return;
    }
    if (e.def.contact) this.hurtPlayer(e.def.contact, e);
  }

  bobbaTouch() {
    if (this.bobbaUsed) return;
    this.bobbaUsed = true;
    this.banner(TEXT.bobba);
    this.cameras.main.flash(300, 255, 255, 255);
    this.teleportTo = 80; this.safeX = 80; this.grabbedBy = null;   // applied in update(): moving the body inside a physics callback gets undone
    this.enemies.getChildren().filter(e => e.def.ai === 'bobba').forEach(e => e.destroy());
  }

  grab(e) {
    if (this.grabbedBy || this.gt < e.stunUntil || this.gt < this.invulnUntil) return;
    this.grabbedBy = e; this.mash = 0; this.nextHugDmg = this.gt + 600;
    this.say(e, TEXT.hug, 1200, '#ff8ac6');
    this.banner('Mash J / ← → to break free!', 1200);
  }

  // Boss power-up (plays at the start of the boss fight)
  powerUp(e) {
    const B = this.B;
    e.powering = true; e.setVelocity(0, 0); sfx(this, 'S6');
    const prop = this.add.image(e.x, e.y - e.displayHeight / 2 - 30, B.prop).setDisplaySize(40, 40).setDepth(9);
    this.tweens.add({ targets: prop, y: prop.y - 10, yoyo: true, repeat: 5, duration: 180 });
    this.say(e, B.powerText, 2200, '#ffd27a');
    this.banner(`${B.name} is powering up!`, 1800);
    this.time.delayedCall(2200, () => {
      prop.destroy();
      if (!e.active) return;
      this.cameras.main.shake(300, 0.01);
      e.powering = false; e.phase = 2;
      Object.assign(e.def, B.phase2);
      e.setDisplaySize(e.displayWidth * 1.15, e.displayHeight * 1.15).setTint(0xff9999);
      e.body.reset(e.x, this.groundY(e.x) - e.displayHeight / 2 - 2); // grow upward, not into the floor
      e.nextSpecial = this.gt + 1500;
      if (B.phase2.onPhase2 === 'mount') {
        e.mount = this.add.image(e.x, this.groundY(e.x) - 40, 'M2').setDisplaySize(128, 80).setDepth(4);
        this.swarm(e, 4);
      }
      if (B.phase2.onPhase2 === 'squad') this.squad(e);
    });
  }

  swarm(e, n) {
    e.minions = e.minions.filter(m => m.active);
    n = Math.min(n, (e.def.maxMinions || 6) - e.minions.length);
    for (let i = 0; i < n; i++) {
      const c = this.spawnEnemy('cat', Phaser.Math.Clamp(e.x + (i % 2 ? 1 : -1) * (40 + i * 30), this.arenaLeft() + 20, this.arenaRight() - 20));
      e.minions.push(c);
    }
  }
  squad(e) {
    const L = this.arenaLeft(), R = this.arenaRight();
    e.minions.push(this.spawnEnemy('warrior', L + 40), this.spawnEnemy('warrior', R - 40));
    if (!e.minions.some(m => m.active && m.type === 'fairy')) {
      const f = this.spawnEnemy('fairy', e.x); f.owner = e; f.nextHeal = this.gt + 2000; e.minions.push(f);
    }
  }
  arenaLeft() { return this.arenaOn ? LEVEL_LEN : 0; }
  arenaRight() { return this.arenaOn ? LEVEL_LEN + ARENA_W : LEVEL_LEN; }

  shockwaves(x, dmg) {
    [-1, 1].forEach(d => {
      const w = this.enemyShots.create(x, this.groundY(x) - 12, 'fx_wave');
      w.dmg = dmg; w.wave = true; w.setVelocityX(d * 330);
      this.time.delayedCall(2200, () => w.active && w.destroy());
    });
    this.cameras.main.shake(150, 0.008);
  }

  throwHammer(e) {
    const p = this.player, T = 0.9, g = this.physics.world.gravity.y;
    const h = this.physics.add.image(e.x, e.y - 20, 'M5').setDisplaySize(24, 24).setDepth(6);
    this.enemyShots.add(h); h.body.setAllowGravity(true);
    h.dmg = e.def.dmg;
    h.setVelocity((p.x - e.x) / T, (p.y - (e.y - 20)) / T - 0.5 * g * T);
    h.setAngularVelocity(600);
    this.time.delayedCall(2500, () => h.active && h.destroy());
  }

  lightning(e) {
    const x = this.player.x;
    const warn = this.add.rectangle(x, VH / 2, 44, VH, 0xff3030, 0.25).setDepth(3);
    this.time.delayedCall(700, () => {
      warn.destroy();
      if (!e.active) return;
      const bolt = this.add.rectangle(x, VH / 2, 34, VH, 0xcfe8ff, 0.95).setDepth(20);
      this.tweens.add({ targets: bolt, alpha: 0, duration: 250, onComplete: () => bolt.destroy() });
      this.cameras.main.shake(100, 0.006);
      if (Math.abs(this.player.x - x) < 32) this.hurtPlayer(e.def.dmg, { x });
    });
  }

  updateEnemy(e, t) {
    const p = this.player, d = e.def, dx = p.x - e.x, dist = Math.abs(dx);
    if (e.label) e.label.setPosition(e.x, e.y - e.displayHeight / 2 - 12);
    if (e.mount) e.mount.setPosition(e.x, e.y + e.displayHeight / 2 - 40).setFlipX(e.flipX);
    if (e.icon) e.icon.setPosition(e.x, e.y - 26);
    if (e.powering || t < e.stunUntil) return;
    if (e.y > VH + 50) return this.killEnemy(e); // fell in a pit (a stolen weapon comes back)

    // Boss specials
    if (e.isBoss && e.phase === 2 && d.special && t > e.nextSpecial && e.state !== 'leap') {
      e.nextSpecial = t + d.specialCd;
      if (d.special === 'slam' && e.body.blocked.down) {
        e.state = 'leap'; e.wasAir = false;
        e.setVelocity(Phaser.Math.Clamp(dx, -400, 400), -560);
        return;
      }
      if (d.special === 'lightning') this.lightning(e);
      if (d.special === 'swarm') this.swarm(e, 4);
      if (d.special === 'squad' && !e.minions.some(m => m.active && m.type === 'warrior')) this.squad(e);
    }
    if (e.state === 'leap') {
      if (!e.body.blocked.down) e.wasAir = true;
      else if (e.wasAir) { e.setVelocityX(0); this.shockwaves(e.x, d.dmg); e.state = 'recover'; e.until = t + 600; }
      return;
    }

    switch (d.ai) {
      case 'melee': {
        if (e.state === 'windup') {
          if (t > e.until) {
            if (dist <= d.range + 20 && Math.sign(dx) === e.facing && Math.abs(p.y - e.y) < 80) this.hurtPlayer(d.dmg, e);
            const fx = this.add.image(e.x + e.facing * d.range / 2, e.y, 'fx_slash').setTint(0xff6060).setFlipX(e.facing < 0)
              .setDisplaySize(Math.max(40, d.range), 70).setDepth(7);
            this.tweens.add({ targets: fx, alpha: 0, duration: 160, onComplete: () => fx.destroy() });
            e.clearTint(); if (e.phase === 2) e.setTint(0xff9999);
            e.state = 'recover'; e.until = t + 450;
          }
          return;
        }
        if (e.state === 'recover') { e.setVelocityX(0); if (t > e.until) e.state = 'idle'; return; }
        if (dist < d.range && t > e.nextAttack) {
          e.state = 'windup'; e.facing = Math.sign(dx) || 1; e.until = t + d.windup; e.nextAttack = t + d.cd;
          e.setVelocityX(0); e.setTint(0xffaa44);
          return;
        }
        e.setVelocityX(dist < (e.isBoss ? 900 : 450) ? Math.sign(dx) * d.speed : 0);
        break;
      }
      case 'summon': {
        e.minions = e.minions.filter(m => m.active);
        if (dist < 200) e.setVelocityX(-Math.sign(dx) * d.speed);
        else if (dist > 330 && dist < 600) e.setVelocityX(Math.sign(dx) * d.speed);
        else e.setVelocityX(0);
        if (e.x < this.arenaLeft() + 40 || e.x > this.arenaRight() - 40) e.setVelocityX(Math.sign(dx) * d.speed);
        if (dist < 600 && t > e.nextAttack && e.minions.length < (d.maxMinions || 2)) {
          e.nextAttack = t + d.cd;
          e.minions.push(this.spawnEnemy(d.minion, e.x + Math.sign(dx) * 40));
        }
        break;
      }
      case 'throw': {
        if (dist < 240) e.setVelocityX(-Math.sign(dx) * d.speed); else if (dist > 360 && dist < 650) e.setVelocityX(Math.sign(dx) * d.speed); else e.setVelocityX(0);
        if (e.x < this.arenaLeft() + 40 || e.x > this.arenaRight() - 40) e.setVelocityX(Math.sign(dx) * d.speed);
        if (dist < 600 && t > e.nextAttack) { e.nextAttack = t + d.cd; this.throwHammer(e); }
        break;
      }
      case 'chaser': e.setVelocityX(Math.sign(dx) * d.speed); break;
      case 'fairy': {
        const o = e.owner;
        if (!o || !o.active) { e.setVelocity(0, 0); break; }
        e.x = o.x + Math.sin(t / 500) * 50; e.y = o.y - o.displayHeight / 2 - 40 + Math.sin(t / 300) * 10;
        if (t > e.nextHeal && o.hp < o.maxHp) {
          e.nextHeal = t + 2000; o.hp = Math.min(o.maxHp, o.hp + 1); this.updateBossBar(); this.say(o, '+1', 600, '#7dff9a');
        }
        break;
      }
      case 'bobba':
        if (t > e.until) { e.until = t + 2000; e.facing *= -1; }
        e.setVelocityX(e.facing * d.speed);
        break;
      case 'monkey':
        if (e.carrying) {
          // flees but never leaves the screen: turns at the screen edge and jumps over Dhruv
          const v = this.cameras.main.worldView, ground = e.body.blocked.down;
          if (e.runDir === undefined) e.runDir = Math.sign(e.x - p.x) || 1;
          if ((e.runDir > 0 && e.x > v.right - 50) || (e.runDir < 0 && e.x < v.left + 50)) {
            e.runDir *= -1; if (ground) e.setVelocityY(-620);                 // leap back over Dhruv
          } else if (ground && t > (e.nextHop || 0)) { e.nextHop = t + 700 + Math.random() * 800; e.setVelocityY(-380); }
          e.setVelocityX(e.runDir * 230);
          e.x = Phaser.Math.Clamp(e.x, v.left + 16, v.right - 16);
          const left = Math.ceil((e.escapeAt - t) / 1000);
          if (e.timer) e.timer.setText(left).setPosition(e.x, e.y - 44);
          if (t > e.escapeAt) {
            const w = e.carrying; e.carrying = null;
            if (!testMode()) { this.save.weapons = this.save.weapons.filter(x => x !== w); writeSave(this.save); }
            this.banner(`The monkey escaped with your ${WEAPONS[w].name}! Beat that boss again to get it back.`, 3000);
            e.body.enable = false; e.timer.destroy();
            this.tweens.add({ targets: [e, e.icon], y: '-=420', duration: 700, ease: 'Quad.in', onComplete: () => { e.icon.destroy(); e.destroy(); } });
          }
        } else if (dist < 400) e.setVelocityX(Math.sign(dx) * d.speed); else e.setVelocityX(0);
        break;
      case 'gayansh':
        if (this.grabbedBy === e) { e.setVelocityX(0); break; }
        if (t > e.stunUntil && dist < 280) { this.pullX = Math.sign(e.x - p.x) * 130; e.setVelocityX(Math.sign(dx) * d.speed); }
        else e.setVelocityX(0);
        break;
      case 'aunty':
        if (e.moving) break;
        if (e.hidden && dist < 190 && t > (e.nextRise || 0)) {                 // burst out of the ground
          e.moving = true; e.crack.setVisible(false);
          this.cameras.main.shake(140, 0.005); this.dust(e.x, e.top);
          this.tweens.add({ targets: e, y: e.top - d.h / 2, duration: 380, ease: 'Back.out', onComplete: () => {
            e.moving = false; e.hidden = false; e.setDepth(4); e.body.enable = true; e.body.reset(e.x, e.y);
            e.nextLine = t + 4000; this.say(e, e.line, 2000, '#9ff5e0');
          } });
        } else if (!e.hidden && dist > 420) {                                  // sink back down
          e.moving = true; e.body.enable = false; e.setDepth(1); this.dust(e.x, e.top);
          this.tweens.add({ targets: e, y: e.top + d.h / 2 + 6, duration: 500, onComplete: () => { e.moving = false; e.hidden = true; e.crack.setVisible(true); e.nextRise = this.gt + 1200; } });
        } else if (!e.hidden && dist < 180 && t > e.nextLine) { e.nextLine = t + 4000; this.say(e, e.line, 2000, '#9ff5e0'); }
        break;
    }
    if (!d.fly && d.ai !== 'aunty' && e.body.blocked.down && e.state !== 'leap') {
      const vx = e.body.velocity.x;
      if (vx && ((vx < 0 && e.body.blocked.left) || (vx > 0 && e.body.blocked.right))) e.setVelocityY(-430);   // hop a step
      else if (vx && this.topAt(e.x + Math.sign(vx) * (e.displayWidth / 2 + 4)) === null) {                    // pit ahead
        if (d.ai === 'monkey' && e.carrying) { e.runDir = -Math.sign(vx); e.setVelocity(e.runDir * 230, -300); } // monkey turns back at pits
        else { e.setVelocityX(0); if (d.ai === 'bobba') { e.facing *= -1; e.until = t + 2000; } }
      }
    }
    if (d.ai !== 'aunty' && d.ai !== 'fairy' && !this.registry.get('placeholders').has(e.texture.key)) e.setFlipX(e.body.velocity.x > 0 || (e.state !== 'idle' && e.facing > 0));
  }

  // ---------------- Boss arena ----------------
  startBoss() {
    this.arenaOn = true;
    this.cameras.main.stopFollow();
    this.cameras.main.pan(LEVEL_LEN + ARENA_W / 2, VH / 2, 600);
    this.time.delayedCall(650, () => this.cameras.main.setBounds(LEVEL_LEN, 0, ARENA_W, VH));
    this.physics.world.setBounds(LEVEL_LEN, 0, ARENA_W, VH, true, true, false, false);
    this.enemies.getChildren().slice().forEach(e => { if (e.x < LEVEL_LEN) { if (e.label) e.label.destroy(); if (e.icon) e.icon.destroy(); e.destroy(); } });
    music(this, 'S8');
    this.boss = this.spawnBoss(LEVEL_LEN + ARENA_W - 160, true);
    this.boss.powering = true;
    this.banner(this.B.name, 1400);
    this.time.delayedCall(900, () => { if (this.boss.active) this.powerUp(this.boss); });   // fight opens with the power-up
    this.bossBarBg = this.add.rectangle(VW / 2, VH - 24, 504, 18, 0x000000, 0.8).setScrollFactor(0).setDepth(100);
    this.bossBar = this.add.rectangle(VW / 2 - 250, VH - 24, 500, 12, 0xc0392b).setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);
    this.bossName = this.add.text(VW / 2, VH - 46, this.B.name, TXT(14, '#ff6b6b')).setOrigin(0.5).setScrollFactor(0).setDepth(101);
  }
  updateBossBar() { if (this.bossBar && this.boss) this.bossBar.width = 500 * Math.max(0, this.boss.hp) / this.boss.maxHp; }

  bossDefeated() {
    sfx(this, 'S9');
    this.enemies.getChildren().slice().forEach(e => e.destroy());
    this.enemyShots.clear(true, true);
    const reward = this.L.reward, w = WEAPONS[reward];
    this.time.delayedCall(800, () => {
      sfx(this, 'S10');
      if (!testMode()) {
        if (!this.save.cleared.includes(this.levelIndex)) this.save.cleared.push(this.levelIndex);
        if (!this.save.weapons.includes(reward)) this.save.weapons.push(reward);
      }
      writeSave(this.save);
      const cx = VW / 2, cy = VH / 2;
      this.add.rectangle(cx, cy, VW, 160, 0x000000, 0.7).setScrollFactor(0).setDepth(110);
      const ic = this.add.image(cx, cy - 25, w.icon).setScrollFactor(0).setDepth(111).setDisplaySize(56, 56);
      this.tweens.add({ targets: ic, angle: 360, duration: 800 });
      this.add.text(cx, cy + 30, `${this.B.name} defeated!\nDhruv got the ${w.name}!`, TXT(20, '#ffd27a')).setOrigin(0.5).setAlign('center').setScrollFactor(0).setDepth(111);
      this.time.delayedCall(3000, () => this.scene.start('Map'));
    });
  }

  // ---------------- Main loop ----------------
  update(_time, dt) {
    if (this.dead || this.paused) return;
    this.gt += Math.min(dt, 50);                    // own clock: stops while paused
    const t = this.gt, p = this.player, c = this.ctl;
    this.updateMovers(Math.min(dt, 50));
    if (this.teleportTo !== undefined) { p.body.reset(this.teleportTo, this.groundY(this.teleportTo) - 60); this.teleportTo = undefined; }
    c.poll();
    if (c.pressed('pause')) return this.openPause();
    const cam = this.cameras.main;
    this.pxMid.tilePositionX = cam.scrollX * 0.15; this.pxNear.tilePositionX = cam.scrollX * 0.4;

    // weapon switching
    if (c.pressed('prevWeapon')) this.cycleWeapon(-1);
    if (c.pressed('nextWeapon')) this.cycleWeapon(1);
    for (let i = 0; i < 7; i++) if (c.pressed('slot' + i)) this.setWeapon(WEAPON_ORDER[i]);

    const left = c.held('left'), right = c.held('right');
    const attackPressed = c.pressed('attack');
    const onGround = p.body.blocked.down || p.body.touching.down;
    if (c.pressed('jump')) this.jumpBuf = t + 130;
    if (onGround) { this.jumps = 0; this.lastGround = t; }

    // grabbed by Gayansh: mash to escape
    if (this.grabbedBy) {
      const g = this.grabbedBy;
      if (!g.active) { this.grabbedBy = null; }
      else {
        p.setVelocity(0, 0); p.x = g.x - Math.sign(g.x - p.x || 1) * 18;
        if (attackPressed || c.pressed('left') || c.pressed('right') || c.pressed('jump')) this.mash++;
        if (t > this.nextHugDmg) { this.nextHugDmg = t + 900; this.invulnUntil = 0; this.hurtPlayer(1, g); p.setVelocity(0, 0); }
        if (this.mash >= 6) {
          this.grabbedBy = null; g.stunUntil = t + 2500; this.invulnUntil = t + 800;
          p.setVelocity(-Math.sign(g.x - p.x || 1) * 350, -250);
          this.say(g, '!', 600);
        }
        this.tickEnemies(t);
        return;
      }
    }

    // duck (+ jump = drop through a ledge)
    const wantDuck = onGround && c.held('down');
    if (wantDuck !== this.ducking) { this.ducking = wantDuck; this.setPlayerBody(); }
    const top = this.topAt(p.x), onSolid = onGround && top !== null && Math.abs(p.body.bottom - top) < 3;
    if (this.ducking && c.pressed('jump') && !onSolid) {
      this.dropUntil = t + 250; this.jumpBuf = 0; this.ducking = false; this.setPlayerBody(); p.y += 4;
    }

    // move
    if (t < this.knockUntil || t < this.dashUntil) { /* keep velocity */ }
    else if (this.ducking) p.setVelocityX(0);
    else if (left) { p.setVelocityX(-PLAYER.speed + this.pullX); this.facing = -1; }
    else if (right) { p.setVelocityX(PLAYER.speed + this.pullX); this.facing = 1; }
    else p.setVelocityX(this.pullX);
    this.pullX = 0;

    // wall slide: airborne, pushing into a wall
    const wall = p.body.blocked.left && left ? -1 : p.body.blocked.right && right ? 1 : 0;
    if (!onGround && wall) {
      this.wallDir = wall; this.wallUntil = t + 120;
      if (p.body.velocity.y > 100) p.setVelocityY(100);
    }
    p.setFlipX(this.facing < 0);

    if (c.pressed('dash') && t > this.dashReady && !this.ducking) {
      p.setVelocity(this.facing * PLAYER.dashSpeed, 0);
      this.dashUntil = t + PLAYER.dashMs; this.dashReady = t + PLAYER.dashCd;
      p.setAlpha(0.6); this.time.delayedCall(PLAYER.dashMs, () => p.setAlpha(1));
    }
    if (!this.ducking && t < this.jumpBuf) {
      if (onGround || (this.jumps === 0 && t - this.lastGround < 110)) {          // ground / coyote jump
        p.setVelocityY(-PLAYER.jump); this.jumps = 1; this.jumpBuf = 0; sfx(this, 'S1');
      } else if (t < this.wallUntil) {                                            // wall jump
        p.setVelocity(-this.wallDir * 300, -PLAYER.jump * 0.92); this.facing = -this.wallDir;
        this.knockUntil = t + 150; this.jumps = 1; this.wallUntil = 0; this.jumpBuf = 0; sfx(this, 'S1');
      } else if (c.pressed('jump') && PLAYER.doubleJump && this.jumps < 2) {      // double jump
        p.setVelocityY(-PLAYER.jump * 0.85); this.jumps = 2; this.jumpBuf = 0; sfx(this, 'S1');
      }
    }
    if (!c.held('jump') && p.body.velocity.y < -160 && t > this.knockUntil) p.setVelocityY(-160);
    if (attackPressed) this.attack();

    // fell into a pit: lose a heart, back to the last safe ground
    if (onSolid && this.topAt(p.x - 48) === top && this.topAt(p.x + 48) === top) this.safeX = p.x;
    if (p.y > VH + 40) {
      this.invulnUntil = 0; this.hurtPlayer(1, p);
      if (!this.dead) { p.setPosition(this.safeX, this.groundY(this.safeX) - 40).setVelocity(0, 0); this.knockUntil = 0; }
    }

    // animation
    if (this.anims.exists('idle')) {
      if (this.ducking && this.anims.exists('duck')) p.anims.play('duck', true);
      else if (!onGround) p.anims.play(p.body.velocity.y < 0 ? 'jumpUp' : 'fall', true);
      else if (Math.abs(p.body.velocity.x) > 10) p.anims.play('run', true);
      else p.anims.play('idle', true);
    }

    this.updateHammer(t);
    this.updateCompanion(t);
    this.tickEnemies(t);

    if (!this.arenaOn && p.x > LEVEL_LEN + 80) this.startBoss();
  }

  tickEnemies(t) { this.enemies.getChildren().slice().forEach(e => e.active && this.updateEnemy(e, t)); }

  updateHammer(t) {
    const h = this.hammerOut; if (!h) return;
    const p = this.player;
    if (t > h.returnAt) {
      if (!h.returning) { h.returning = true; h.hit.clear(); }
      this.physics.moveToObject(h, p, 620);
      if (Phaser.Math.Distance.Between(h.x, h.y, p.x, p.y) < 26) { h.destroy(); this.hammerOut = null; return; }
    }
    this.enemies.getChildren().slice().forEach(e => {
      if (e.active && !h.hit.has(e) && Phaser.Geom.Intersects.RectangleToRectangle(h.getBounds(), e.getBounds())) {
        h.hit.add(e); this.damageEnemy(e, WEAPONS.hammer.dmg, Math.sign(h.body.velocity.x) * 200);
      }
    });
  }

  updateCompanion(t) {
    const c = this.companion; if (!c) return;
    const p = this.player;
    if (this.weapon === 'cat') {
      if (!c.busy) { const nx = Phaser.Math.Linear(c.x, p.x - this.facing * 30, 0.15), top = this.topAt(nx); c.setPosition(nx, top === null ? p.y + 18 : Math.min(top, p.y + 32) - 14).setFlipX(this.facing < 0); }
      if (t > c.nextBite && !c.busy) {
        const target = this.enemies.getChildren().filter(e => e.active && !e.def.invulnerable && Math.abs(e.x - p.x) < 260)
          .sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x))[0];
        if (target) {
          c.busy = true; c.nextBite = t + 900;
          this.tweens.add({
            targets: c, x: target.x, y: target.y, duration: 160, yoyo: true,
            onYoyo: () => target.active && this.damageEnemy(target, 1, 0), onComplete: () => { c.busy = false; },
          });
        }
      }
    } else if (this.weapon === 'healer') {
      c.setPosition(p.x - this.facing * 22, p.y - 44 + Math.sin(t / 250) * 4);
      if (t > c.nextHeal) {
        c.nextHeal = t + 5000;
        if (this.hp < PLAYER.hp) { this.hp++; this.updateHud(); this.say(p, '+1', 600, '#7dff9a'); }
      }
    }
  }
}

// =====================================================================
class Pause extends Phaser.Scene {
  constructor() { super('Pause'); }
  init(d) { this.level = d.level; }
  create() {
    this.add.rectangle(0, 0, VW, VH, 0x000000, 0.72).setOrigin(0);
    this.add.text(VW / 2, 60, 'PAUSED', TXT(34, '#ffd27a')).setOrigin(0.5);
    this.items = [['Resume', () => this.resume()], ['Restart level', () => this.go('Level', { level: this.level })], ['Quit to map', () => this.go('Map')]];
    this.texts = this.items.map(([label, fn], i) => {
      const tx = this.add.text(VW / 2, 130 + i * 38, label, TXT(20)).setOrigin(0.5).setInteractive({ useHandCursor: true });
      tx.on('pointerover', () => this.select(i)); tx.on('pointerdown', fn);
      return tx;
    });
    this.add.text(VW / 2, 345, CONTROLS_HELP, TXT(12, '#bbb')).setOrigin(0.5);
    this.ctl = new Controls(this);
    this.select(0);
  }
  select(i) { this.sel = i; this.texts.forEach((t, j) => t.setColor(j === i ? '#ffd27a' : '#fff').setText((j === i ? '▶ ' : '') + this.items[j][0])); }
  resume() { this.scene.resume('Level'); this.scene.stop(); }
  go(key, data) { this.scene.stop('Level'); this.scene.start(key, data); }
  update() {
    const c = this.ctl; c.poll();
    if (c.pressed('pause') || c.pressed('back')) return this.resume();
    if (c.pressed('up') || c.pressed('down')) { this.select((this.sel + (c.pressed('up') ? -1 : 1) + this.items.length) % this.items.length); sfx(this, 'S13', { volume: 0.3 }); }
    if (c.pressed('confirm') || c.pressed('attack')) this.items[this.sel][1]();
  }
}

// =====================================================================
class GameOver extends Phaser.Scene {
  constructor() { super('GameOver'); }
  init(d) { this.level = d.level; }
  create() {
    this.sound.stopAll();
    this.cameras.main.setBackgroundColor('#140808');
    this.add.text(VW / 2, 190, TEXT.gameOver, TXT(34, '#ff6b6b')).setOrigin(0.5);
    this.add.text(VW / 2, 260, 'ENTER / A  retry   ·   ESC / B  map', TXT(18)).setOrigin(0.5);
    this.ctl = new Controls(this);
  }
  update() {
    const c = this.ctl; c.poll();
    if (c.pressed('confirm')) this.scene.start('Level', { level: this.level });
    else if (c.pressed('back')) this.scene.start('Map');
  }
}

window.game = new Phaser.Game({
  type: Phaser.AUTO,
  width: VW, height: VH,
  pixelArt: true,
  backgroundColor: '#000',
  physics: { default: 'arcade', arcade: { gravity: { y: 1100 }, debug: false } },
  input: { gamepad: true },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [Boot, Title, MapScene, LevelScene, Pause, GameOver],
});
