const VW = 800, VH = 480, GROUND_Y = 420, LEVEL_LEN = 3600, ARENA_W = 800;

// ---------- Save (per browser) ----------
const SAVE_KEY = 'dhruvkaat-save-v1';
function loadSave() {
  try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (s && Array.isArray(s.weapons)) return s; } catch (e) { }
  return { cleared: [], weapons: ['fists'] };
}
function writeSave(s) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch (e) { } }

function sfx(scene, code, cfg) { if (scene.cache.audio.exists(code)) scene.sound.play(code, cfg); }
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
    AUDIO.forEach(a => this.load.audio(a.code, `assets/audio/${a.code}.mp3`));
  }
  create() {
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
    this.add.text(VW / 2, 300, 'Press ENTER', TXT(20)).setOrigin(0.5);
    this.add.text(VW / 2, 380,
      'A/D move · W/Space jump (x2) · S duck · Shift dash\nJ attack · Q/E or 1-7 switch weapon · Esc map',
      TXT(13, '#ccc')).setOrigin(0.5).setAlign('center');
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('Map'));
  }
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
    this.unlocked = i => i < LEVELS.length && (i === 0 || save.cleared.includes(i - 1));
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

    const k = this.input.keyboard;
    k.on('keydown-RIGHT', () => this.step(1)); k.on('keydown-D', () => this.step(1));
    k.on('keydown-LEFT', () => this.step(-1)); k.on('keydown-A', () => this.step(-1));
    k.on('keydown-ENTER', () => this.enter()); k.on('keydown-SPACE', () => this.enter());
  }
  step(d) {
    const n = this.cursor + d;
    if (n >= 0 && n < LEVELS.length && this.unlocked(n)) this.moveTo(n);
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
}

// =====================================================================
class LevelScene extends Phaser.Scene {
  constructor() { super('Level'); }
  init(d) { this.levelIndex = d.level; this.L = LEVELS[d.level]; this.B = BOSSES[this.L.boss]; }

  create() {
    const L = this.L, W = LEVEL_LEN + ARENA_W;
    this.save = this.registry.get('save');
    this.owned = [...this.save.weapons];
    this.weapon = this.owned[this.owned.length - 1];
    music(this, 'S7');

    this.physics.world.setBounds(0, 0, W, VH);
    this.add.image(0, 0, L.bg).setOrigin(0).setScrollFactor(0).setDisplaySize(VW, VH);
    this.add.tileSprite(0, GROUND_Y, W, 32, 'D1').setOrigin(0);
    this.add.tileSprite(0, GROUND_Y + 32, W, VH - GROUND_Y - 32, 'D5').setOrigin(0);
    this.ground = this.add.zone(W / 2, GROUND_Y + 40, W, 80);
    this.physics.add.existing(this.ground, true);
    this.add.text(LEVEL_LEN - 60, GROUND_Y - 120, 'BOSS →', TXT(20, '#ff6b6b'));

    // Player
    const p = this.player = this.physics.add.sprite(80, GROUND_Y - 40, 'A1');
    p.setCollideWorldBounds(true).setMaxVelocity(800, 1000).setDepth(5);
    this.facing = 1; this.hp = PLAYER.hp; this.jumps = 0; this.invulnUntil = 0; this.knockUntil = 0;
    this.dashUntil = 0; this.dashReady = 0; this.nextAttack = 0; this.ducking = false; this.dead = false;
    this.grabbedBy = null; this.pullX = 0; this.hammerOut = null;
    this.setPlayerBody();
    this.physics.add.collider(p, this.ground);

    // Groups
    this.enemies = this.physics.add.group();
    this.enemyShots = this.physics.add.group({ allowGravity: false });
    this.physics.add.collider(this.enemies, this.ground);
    this.physics.add.overlap(p, this.enemies, (pl, e) => this.touchEnemy(e));
    this.physics.add.overlap(p, this.enemyShots, (pl, s) => { if (s.active) { this.hurtPlayer(s.dmg, s); if (!s.wave) s.destroy(); } });

    // Spawn level content
    const lay = LEVEL_LAYOUT;
    lay.mini.forEach(x => this.spawnBoss(x, false));
    lay.monkey.forEach(x => this.spawnEnemy('monkey', x));
    lay.gayansh.forEach(x => this.spawnEnemy('gayansh', x));
    lay.aunty.forEach((x, i) => { const a = this.spawnEnemy('aunty', x); a.line = TEXT.aunty[i % TEXT.aunty.length]; });
    lay.bobba.forEach(x => this.spawnEnemy('bobba', x));

    // Camera + atmosphere
    this.cameras.main.setBounds(0, 0, LEVEL_LEN + ARENA_W, VH).startFollow(p, true, 0.12, 0.12);
    this.add.image(0, 0, 'fx_vignette').setOrigin(0).setScrollFactor(0).setDisplaySize(VW, VH).setDepth(90);
    this.cameras.main.fadeIn(300);

    // Input
    this.keys = this.input.keyboard.addKeys('LEFT,RIGHT,UP,DOWN,SPACE,SHIFT,A,D,W,S,J,X,K,Q,E,ESC,ONE,TWO,THREE,FOUR,FIVE,SIX,SEVEN');
    this.input.on('pointerdown', () => this.attack());

    this.makeHud();
    this.setWeapon(this.weapon);
    this.banner(`Level ${this.levelIndex + 1}: ${L.name}`);
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
    if (c === 'cat') { this.companion = this.add.image(this.player.x, GROUND_Y - 12, 'W4').setDisplaySize(28, 28).setDepth(6); this.companion.nextBite = 0; }
    if (c === 'fairy') { this.companion = this.add.image(this.player.x, this.player.y - 50, 'W5').setDisplaySize(24, 24).setDepth(6); this.companion.nextHeal = this.time.now + 5000; }
    this.updateHud();
  }
  cycleWeapon(d) {
    const i = this.owned.indexOf(this.weapon);
    this.setWeapon(this.owned[(i + d + this.owned.length) % this.owned.length]);
  }

  attack() {
    const t = this.time.now, w = WEAPONS[this.weapon], p = this.player;
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
    const t = this.time.now;
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
    const e = this.enemies.create(x, d.fly ? GROUND_Y - 120 : GROUND_Y - d.h / 2 - 2, d.sprite);
    e.setDisplaySize(d.w, d.h); e.def = d; e.type = type;
    e.hp = e.maxHp = d.hp; e.state = 'idle'; e.until = 0; e.nextAttack = 0; e.stunUntil = 0; e.minions = [];
    e.facing = -1; e.baseX = x;
    if (d.fly) e.body.setAllowGravity(false);
    if (d.ai === 'aunty') { e.body.setImmovable(true); e.body.setAllowGravity(false); e.y = GROUND_Y - d.h / 2; }
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
    if (!e.isBoss && knock) { e.setVelocityX(knock); e.stunUntil = this.time.now + 180; }
    if (e.isBoss) this.updateBossBar();
    if (e.hp <= 0) return this.killEnemy(e);
    if (e.isBoss && e.phase === 1 && e.hp <= e.maxHp / 2) this.powerUp(e);
  }

  killEnemy(e) {
    if (e.carrying) { this.owned.push(e.carrying); this.owned.sort((a, b) => WEAPON_ORDER.indexOf(a) - WEAPON_ORDER.indexOf(b)); this.banner(`Got your ${WEAPONS[e.carrying].name} back!`); this.updateHud(); }
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
        e.escapeAt = this.time.now + 9000;
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
    this.player.setPosition(80, GROUND_Y - 60).setVelocity(0, 0);
    this.enemies.getChildren().filter(e => e.def.ai === 'bobba').forEach(e => e.destroy());
  }

  grab(e) {
    if (this.grabbedBy || this.time.now < e.stunUntil || this.time.now < this.invulnUntil) return;
    this.grabbedBy = e; this.mash = 0; this.nextHugDmg = this.time.now + 600;
    this.say(e, TEXT.hug, 1200, '#ff8ac6');
    this.banner('Mash J / ← → to break free!', 1200);
  }

  // Boss phase 2
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
      e.body.reset(e.x, GROUND_Y - e.displayHeight / 2 - 2); // grow upward, not into the floor
      e.nextSpecial = this.time.now + 1500;
      if (B.phase2.onPhase2 === 'mount') {
        e.mount = this.add.image(e.x, GROUND_Y - 40, 'M2').setDisplaySize(128, 80).setDepth(4);
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
      const f = this.spawnEnemy('fairy', e.x); f.owner = e; f.nextHeal = this.time.now + 2000; e.minions.push(f);
    }
  }
  arenaLeft() { return this.arenaOn ? LEVEL_LEN : 0; }
  arenaRight() { return this.arenaOn ? LEVEL_LEN + ARENA_W : LEVEL_LEN; }

  shockwaves(x, dmg) {
    [-1, 1].forEach(d => {
      const w = this.enemyShots.create(x, GROUND_Y - 12, 'fx_wave');
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
    if (e.mount) e.mount.setPosition(e.x, GROUND_Y - 40).setFlipX(e.flipX);
    if (e.icon) e.icon.setPosition(e.x, e.y - 26);
    if (e.powering || t < e.stunUntil) return;
    if (e.y > VH + 50) return e.destroy();

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
          e.setVelocityX(Math.sign(e.x - p.x || 1) * 230);
          if (t > e.escapeAt || e.x > LEVEL_LEN - 20 || e.x < 20) {
            const w = e.carrying; e.carrying = null;
            this.save.weapons = this.save.weapons.filter(x => x !== w); writeSave(this.save);
            this.banner(`The monkey escaped with your ${WEAPONS[w].name}! Beat that boss again to get it back.`, 3000);
            e.icon.destroy(); e.destroy();
          }
        } else if (dist < 400) e.setVelocityX(Math.sign(dx) * d.speed); else e.setVelocityX(0);
        break;
      case 'gayansh':
        if (this.grabbedBy === e) { e.setVelocityX(0); break; }
        if (t > e.stunUntil && dist < 280) { this.pullX = Math.sign(e.x - p.x) * 130; e.setVelocityX(Math.sign(dx) * d.speed); }
        else e.setVelocityX(0);
        break;
      case 'aunty':
        if (dist < 180 && t > (e.nextLine || 0)) { e.nextLine = t + 4000; this.say(e, e.line, 2000, '#9ff5e0'); }
        break;
    }
    if (d.ai !== 'aunty' && d.ai !== 'fairy' && !this.registry.get('placeholders').has(e.texture.key)) e.setFlipX(e.body.velocity.x > 0 || (e.state !== 'idle' && e.facing > 0));
  }

  // ---------------- Boss arena ----------------
  startBoss() {
    this.arenaOn = true;
    this.cameras.main.stopFollow();
    this.cameras.main.pan(LEVEL_LEN + ARENA_W / 2, VH / 2, 600);
    this.time.delayedCall(650, () => this.cameras.main.setBounds(LEVEL_LEN, 0, ARENA_W, VH));
    this.physics.world.setBounds(LEVEL_LEN, 0, ARENA_W, VH);
    this.enemies.getChildren().slice().forEach(e => { if (e.x < LEVEL_LEN) { if (e.label) e.label.destroy(); if (e.icon) e.icon.destroy(); e.destroy(); } });
    music(this, 'S8');
    this.boss = this.spawnBoss(LEVEL_LEN + ARENA_W - 160, true);
    this.boss.powering = true;
    this.banner(this.B.name, 1400);
    this.time.delayedCall(1200, () => { if (this.boss.active) this.boss.powering = false; });
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
      if (!this.save.cleared.includes(this.levelIndex)) this.save.cleared.push(this.levelIndex);
      if (!this.save.weapons.includes(reward)) this.save.weapons.push(reward);
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
  update(t) {
    if (this.dead) return;
    const p = this.player, k = this.keys, JD = Phaser.Input.Keyboard.JustDown;
    if (JD(k.ESC)) return this.scene.start('Map');

    // weapon switching
    if (JD(k.Q)) this.cycleWeapon(-1);
    if (JD(k.E)) this.cycleWeapon(1);
    ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN'].forEach((n, i) => { if (JD(k[n])) this.setWeapon(WEAPON_ORDER[i]); });

    const left = k.LEFT.isDown || k.A.isDown, right = k.RIGHT.isDown || k.D.isDown;
    const jumpPressed = JD(k.UP) || JD(k.SPACE) || JD(k.W);
    const attackPressed = JD(k.J) || JD(k.X) || JD(k.K);
    const onGround = p.body.blocked.down;
    if (onGround) this.jumps = 0;

    // grabbed by Gayansh: mash to escape
    if (this.grabbedBy) {
      const g = this.grabbedBy;
      if (!g.active) { this.grabbedBy = null; }
      else {
        p.setVelocity(0, 0); p.x = g.x - Math.sign(g.x - p.x || 1) * 18;
        if (attackPressed || JD(k.LEFT) || JD(k.RIGHT) || JD(k.A) || JD(k.D)) this.mash++;
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

    // duck
    const wantDuck = onGround && (k.DOWN.isDown || k.S.isDown);
    if (wantDuck !== this.ducking) { this.ducking = wantDuck; this.setPlayerBody(); }

    // move
    if (t < this.knockUntil || t < this.dashUntil) { /* keep velocity */ }
    else if (this.ducking) p.setVelocityX(0);
    else if (left) { p.setVelocityX(-PLAYER.speed + this.pullX); this.facing = -1; }
    else if (right) { p.setVelocityX(PLAYER.speed + this.pullX); this.facing = 1; }
    else p.setVelocityX(this.pullX);
    this.pullX = 0;
    p.setFlipX(this.facing < 0);

    if (JD(k.SHIFT) && t > this.dashReady && !this.ducking) {
      p.setVelocity(this.facing * PLAYER.dashSpeed, 0);
      this.dashUntil = t + PLAYER.dashMs; this.dashReady = t + PLAYER.dashCd;
      p.setAlpha(0.6); this.time.delayedCall(PLAYER.dashMs, () => p.setAlpha(1));
    }
    if (jumpPressed && !this.ducking) {
      if (onGround) { p.setVelocityY(-PLAYER.jump); this.jumps = 1; sfx(this, 'S1'); }
      else if (PLAYER.doubleJump && this.jumps < 2) { p.setVelocityY(-PLAYER.jump * 0.85); this.jumps = 2; sfx(this, 'S1'); }
    }
    if (!(k.UP.isDown || k.SPACE.isDown || k.W.isDown) && p.body.velocity.y < -160 && t > this.knockUntil) p.setVelocityY(-160);
    if (attackPressed) this.attack();

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
      if (!c.busy) c.setPosition(Phaser.Math.Linear(c.x, p.x - this.facing * 30, 0.15), GROUND_Y - 14).setFlipX(this.facing < 0);
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
class GameOver extends Phaser.Scene {
  constructor() { super('GameOver'); }
  init(d) { this.level = d.level; }
  create() {
    this.sound.stopAll();
    this.cameras.main.setBackgroundColor('#140808');
    this.add.text(VW / 2, 190, TEXT.gameOver, TXT(34, '#ff6b6b')).setOrigin(0.5);
    this.add.text(VW / 2, 260, 'ENTER retry   ·   ESC map', TXT(18)).setOrigin(0.5);
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('Level', { level: this.level }));
    this.input.keyboard.once('keydown-ESC', () => this.scene.start('Map'));
  }
}

window.game = new Phaser.Game({
  type: Phaser.AUTO,
  width: VW, height: VH,
  pixelArt: true,
  backgroundColor: '#000',
  physics: { default: 'arcade', arcade: { gravity: { y: 1100 }, debug: false } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [Boot, Title, MapScene, LevelScene, GameOver],
});
