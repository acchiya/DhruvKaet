const TILE = 32, VIEW_W = 800, VIEW_H = 480;

// ---------- Boot: load real assets, make placeholders for missing ones ----------
class Boot extends Phaser.Scene {
  constructor() { super('Boot'); }
  preload() {
    this.load.on('loaderror', () => {}); // missing files are expected
    IMAGES.forEach(a => a.sheet
      ? this.load.spritesheet(a.code, `assets/images/${a.code}.png`, a.sheet)
      : this.load.image(a.code, `assets/images/${a.code}.png`));
    AUDIO.forEach(a => this.load.audio(a.code, `assets/audio/${a.code}.mp3`));
  }
  create() {
    IMAGES.forEach(a => { if (!this.textures.exists(a.code)) makePlaceholder(this, a); });
    this.registry.set('lives', 3);
    this.scene.start('Select');
  }
}

function makePlaceholder(scene, a) {
  const tex = scene.textures.createCanvas(a.code, a.w, a.h);
  const ctx = tex.getContext();
  if (a.art && ART[a.art]) { ART[a.art](ctx, a.w, a.h); tex.refresh(); return; }
  ctx.fillStyle = a.color; ctx.fillRect(0, 0, a.w, a.h);
  ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, a.w - 2, a.h - 2);
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${Math.max(8, Math.min(a.w / 2.6, a.h / 2, 40))}px monospace`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('#' + a.code, a.w / 2, a.h / 2);
  tex.refresh();
}

// Built-in default art (used until you drop in your own PNG for that code)
function rng(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }
const ART = {
  grass(ctx, w, h) {
    ART.dirt(ctx, w, h);
    ctx.fillStyle = '#2e7d32'; ctx.fillRect(0, 0, w, 11);   // grass cap
    ctx.fillStyle = '#4caf50'; ctx.fillRect(1, 1, w - 2, 8);
    ctx.fillStyle = '#81d46a'; ctx.fillRect(1, 1, w - 2, 3);
    ctx.fillStyle = '#4caf50';                              // drips over the edge
    for (const x of [3, 11, 19, 26]) ctx.fillRect(x, 9, 4, 4);
    ctx.fillStyle = '#2e7d32';
    for (const x of [3, 11, 19, 26]) ctx.fillRect(x, 13, 4, 1);
  },
  dirt(ctx, w, h) {
    // clear tile: dark outline, light top-left bevel, dark bottom-right bevel
    ctx.fillStyle = '#4a2c12'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#8b5a2b'; ctx.fillRect(1, 1, w - 2, h - 2);
    ctx.fillStyle = '#a8743f'; ctx.fillRect(1, 1, w - 2, 2); ctx.fillRect(1, 1, 2, h - 2);
    ctx.fillStyle = '#6b4220'; ctx.fillRect(1, h - 3, w - 2, 2); ctx.fillRect(w - 3, 1, 2, h - 2);
    const r = rng(13);
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = r() < 0.5 ? '#6b4220' : '#a8743f';
      ctx.fillRect(4 + Math.floor(r() * 12) * 2, 4 + Math.floor(r() * 12) * 2, 2, 2);
    }
  },
  sky(ctx, w, h) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#4a9fe8'); g.addColorStop(1, '#bfe6ff');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#9fd0a8'; // distant hills
    for (const [cx, rad] of [[120, 160], [420, 220], [700, 170]]) {
      ctx.beginPath(); ctx.arc(cx, h + 60, rad, Math.PI, 0); ctx.fill();
    }
  },
  clouds(ctx, w, h) {
    ctx.fillStyle = '#ffffff';
    for (const [x, y, s] of [[80, 60, 1], [330, 110, 0.8], [560, 50, 1.2], [720, 150, 0.7]]) {
      for (const [dx, dy, rad] of [[0, 0, 22], [24, -10, 28], [52, 0, 22], [26, 8, 20]]) {
        ctx.beginPath(); ctx.arc(x + dx * s, y + dy * s, rad * s, 0, Math.PI * 2); ctx.fill();
      }
    }
  },
};

function sfx(scene, code, cfg) { if (scene.cache.audio.exists(code)) scene.sound.play(code, cfg); }

// ---------- Character select ----------
class Select extends Phaser.Scene {
  constructor() { super('Select'); }
  create() {
    if (CHARACTERS.length === 1) {
      this.scene.start('Game', { char: CHARACTERS[0], level: 0 });
      return;
    }
    this.cameras.main.setBackgroundColor('#1b1b2f');
    this.add.image(VIEW_W / 2, 70, 'F1').setDisplaySize(400, 100);
    this.add.text(VIEW_W / 2, 140, 'Choose your player  (← → / click, ENTER to start)',
      { fontFamily: 'monospace', fontSize: 16, color: '#fff' }).setOrigin(0.5);
    this.index = 0;
    this.cards = CHARACTERS.map((c, i) => {
      const x = 130 + i * 180, y = 280;
      const box = this.add.rectangle(x, y, 150, 220, 0x2c2c54).setStrokeStyle(3, 0x555577).setInteractive();
      this.add.image(x, y - 40, c.sprite).setDisplaySize(64, 96);
      this.add.text(x, y + 30, c.name, { fontFamily: 'monospace', fontSize: 14, color: '#fff', align: 'center', wordWrap: { width: 140 } }).setOrigin(0.5, 0);
      this.add.text(x, y + 70, c.tagline, { fontFamily: 'monospace', fontSize: 11, color: '#aaa', align: 'center', wordWrap: { width: 140 } }).setOrigin(0.5, 0);
      box.on('pointerdown', () => { this.index = i; this.start(); });
      return box;
    });
    const k = this.input.keyboard;
    k.on('keydown-LEFT', () => this.move(-1));
    k.on('keydown-RIGHT', () => this.move(1));
    k.on('keydown-ENTER', () => this.start());
    k.on('keydown-SPACE', () => this.start());
    this.move(0);
  }
  move(d) {
    this.index = (this.index + d + CHARACTERS.length) % CHARACTERS.length;
    this.cards.forEach((c, i) => c.setStrokeStyle(3, i === this.index ? 0xffd700 : 0x555577));
  }
  start() { this.scene.start('Game', { char: CHARACTERS[this.index], level: 0 }); }
}

// ---------- Gameplay ----------
class Game extends Phaser.Scene {
  constructor() { super('Game'); }
  init(data) { this.char = data.char; this.levelIndex = data.level; }

  create() {
    const map = LEVELS[this.levelIndex];
    const W = map[0].length * TILE, H = map.length * TILE;
    this.add.image(0, 0, 'E1').setOrigin(0).setScrollFactor(0).setDisplaySize(VIEW_W, VIEW_H);
    this.clouds = this.add.tileSprite(0, 0, VIEW_W, 240, 'E2').setOrigin(0).setScrollFactor(0);

    this.physics.world.setBounds(0, 0, W, H + 200);
    this.physics.world.setBoundsCollision(true, true, true, false);
    this.solids = this.physics.add.staticGroup();
    this.coins = this.physics.add.staticGroup();
    this.enemies = this.physics.add.group();
    this.powerups = this.physics.add.group();
    let start = { x: 64, y: 300 };

    map.forEach((row, ty) => [...row].forEach((c, tx) => {
      const x = tx * TILE + TILE / 2, y = ty * TILE + TILE / 2;
      if (c === '#') this.tile(x, y, ty > 0 && map[ty - 1][tx] === '#' ? 'D5' : 'D1', 'ground');
      else if (c === 'B') this.tile(x, y, 'D2', 'brick');
      else if (c === '?') this.tile(x, y, 'D3', 'coinBlock');
      else if (c === 'P') this.tile(x, y, 'D3', 'powerBlock');
      else if (c === 'o') this.coins.create(x, y, 'C1').setDisplaySize(20, 20).refreshBody();
      else if (c === 'e') this.spawnWalker(x, y);
      else if (c === 'f') this.spawnFlyer(x, y);
      else if (c === 'S') start = { x, y: y - 16 };
      else if (c === 'G') this.goal = this.physics.add.staticImage(x, y, 'C3').setDisplaySize(32, 96).refreshBody();
    }));

    // Player
    this.player = this.physics.add.sprite(start.x, start.y, this.char.sprite);
    this.player.setCollideWorldBounds(true).setMaxVelocity(700, 900);
    this.setPlayerSize(false);
    this.animated = this.textures.get(this.char.sprite).frameTotal > 2;
    if (this.animated && !this.anims.exists('idle')) {
      const k = this.char.sprite;
      this.anims.create({ key: 'idle', frames: this.anims.generateFrameNumbers(k, { start: 0, end: 2 }), frameRate: 3, repeat: -1 });
      this.anims.create({ key: 'run', frames: this.anims.generateFrameNumbers(k, { start: 3, end: 6 }), frameRate: 10, repeat: -1 });
      this.anims.create({ key: 'jumpUp', frames: [{ key: k, frame: 8 }] });
      this.anims.create({ key: 'fall', frames: [{ key: k, frame: 9 }] });
      if (this.textures.get(k).frameTotal > 11) this.anims.create({ key: 'duck', frames: [{ key: k, frame: 10 }] });
    }
    this.big = false; this.ducking = false; this.invulnUntil = 0; this.jumps = 0; this.dashUntil = 0; this.dashReady = 0; this.done = false;

    this.physics.add.collider(this.player, this.solids, (p, b) => this.hitBlock(b));
    this.physics.add.collider(this.enemies, this.solids);
    this.physics.add.collider(this.powerups, this.solids);
    this.physics.add.overlap(this.player, this.coins, (p, c) => { c.destroy(); this.addCoin(); });
    this.physics.add.overlap(this.player, this.powerups, (p, u) => { u.destroy(); this.grow(); });
    this.physics.add.overlap(this.player, this.enemies, (p, e) => this.touchEnemy(e));
    if (this.goal) this.physics.add.overlap(this.player, this.goal, () => this.win());

    this.cameras.main.setBounds(0, 0, W, H).startFollow(this.player, true, 0.15, 0.15);

    const k = this.input.keyboard;
    this.keys = k.addKeys('LEFT,RIGHT,UP,DOWN,SPACE,SHIFT,A,D,W,S');

    this.coinCount = this.registry.get('coins') || 0;
    this.hud = this.add.text(10, 10, '', { fontFamily: 'monospace', fontSize: 18, color: '#fff', stroke: '#000', strokeThickness: 4 }).setScrollFactor(0).setDepth(10);
    this.updateHud();

    if (this.cache.audio.exists('S7') && !this.sound.get('S7')) this.sound.play('S7', { loop: true, volume: 0.4 });
  }

  setPlayerSize(big) {
    // display size in game pixels; hitbox narrower than the big hair
    const [w, h] = big ? [60, 80] : [48, 64];
    const p = this.player;
    p.setDisplaySize(w, h);
    const fw = p.frame.realWidth, fh = p.frame.realHeight;
    const top = this.ducking ? 0.45 : 0.08;  // ducking = shorter hitbox
    p.body.setSize(fw * 0.5, fh * (1 - top)).setOffset(fw * 0.25, fh * top);
  }

  tile(x, y, key, type) {
    const t = this.solids.create(x, y, key).setDisplaySize(TILE, TILE).refreshBody();
    t.setData('type', type);
    return t;
  }

  spawnWalker(x, y) {
    const e = this.enemies.create(x, y, 'B1').setDisplaySize(32, 32);
    e.setVelocityX(-70); e.setData('kind', 'walker'); e.setCollideWorldBounds(true);
  }
  spawnFlyer(x, y) {
    const e = this.enemies.create(x, y, 'B2').setDisplaySize(32, 32);
    e.body.setAllowGravity(false); e.setData('kind', 'flyer'); e.setData('baseY', y);
  }

  hitBlock(b) {
    // Only react when hitting from below
    if (!(this.player.body.blocked.up && b.y < this.player.y)) return;
    const type = b.getData('type');
    if (type === 'coinBlock' || type === 'powerBlock') {
      b.setData('type', 'used'); b.setTexture('D4').setDisplaySize(TILE, TILE);
      this.tweens.add({ targets: b, y: b.y - 8, yoyo: true, duration: 80 });
      if (type === 'coinBlock') {
        this.addCoin();
        const c = this.add.image(b.x, b.y - TILE, 'C1').setDisplaySize(20, 20);
        this.tweens.add({ targets: c, y: c.y - 40, alpha: 0, duration: 400, onComplete: () => c.destroy() });
      } else {
        const u = this.powerups.create(b.x, b.y - TILE, 'C2').setDisplaySize(28, 28);
        u.setVelocity(90, -150); u.setBounceX(1);
      }
    } else if (type === 'brick' && this.big) {
      b.destroy();
    }
  }

  addCoin() {
    this.coinCount++; sfx(this, 'S2');
    if (this.coinCount % 100 === 0) this.registry.inc('lives', 1);
    this.updateHud();
  }

  grow() {
    sfx(this, 'S3');
    if (this.big) return;
    this.big = true; this.player.y -= 16; this.setPlayerSize(true);
  }

  touchEnemy(e) {
    if (this.done || !e.active) return;
    const p = this.player;
    if (p.body.velocity.y > 0 && p.body.bottom <= e.body.top + 14) {
      sfx(this, 'S4'); e.destroy(); p.setVelocityY(-320);
    } else this.hurt();
  }

  hurt() {
    if (this.time.now < this.invulnUntil) return;
    if (this.big) {
      sfx(this, 'S5'); this.big = false; this.setPlayerSize(false);
      this.invulnUntil = this.time.now + 1500;
      this.tweens.add({ targets: this.player, alpha: 0.3, yoyo: true, repeat: 7, duration: 90, onComplete: () => this.player.setAlpha(1) });
    } else this.die();
  }

  die() {
    if (this.done) return;
    this.done = true; sfx(this, 'S5');
    this.registry.inc('lives', -1);
    this.registry.set('coins', this.coinCount);
    this.physics.pause(); this.player.setTint(0xff0000);
    this.time.delayedCall(1000, () => {
      if (this.registry.get('lives') <= 0) this.scene.start('End', { win: false });
      else this.scene.restart();
    });
  }

  win() {
    if (this.done) return;
    this.done = true; sfx(this, 'S6');
    this.registry.set('coins', this.coinCount);
    this.physics.pause();
    this.time.delayedCall(800, () => {
      const next = this.levelIndex + 1;
      if (next < LEVELS.length) this.scene.start('Game', { char: this.char, level: next });
      else this.scene.start('End', { win: true });
    });
  }

  updateHud() {
    this.hud.setText(`${this.char.name}   Lives: ${this.registry.get('lives')}   Coins: ${this.coinCount}   Level: ${this.levelIndex + 1}`);
  }

  update(time) {
    this.clouds.tilePositionX = this.cameras.main.scrollX * 0.2 + time * 0.005;
    if (this.done) return;
    const p = this.player, k = this.keys, c = this.char;
    const left = k.LEFT.isDown || k.A.isDown, right = k.RIGHT.isDown || k.D.isDown;
    const jumpHeld = k.UP.isDown || k.SPACE.isDown || k.W.isDown;
    const jumpPressed = [k.UP, k.SPACE, k.W].some(key => Phaser.Input.Keyboard.JustDown(key));
    const onGround = p.body.blocked.down;
    if (onGround) this.jumps = 0;

    // Ducking (on ground, hold DOWN/S): stop and shrink hitbox
    const wantDuck = onGround && (k.DOWN.isDown || k.S.isDown);
    if (wantDuck !== this.ducking) { this.ducking = wantDuck; this.setPlayerSize(this.big); }

    // Movement / dash
    if (time < this.dashUntil) { /* keep dash velocity */ }
    else if (this.ducking) p.setVelocityX(0);
    else if (left) { p.setVelocityX(-c.speed); p.setFlipX(true); }
    else if (right) { p.setVelocityX(c.speed); p.setFlipX(false); }
    else p.setVelocityX(0);

    if (c.ability === 'dash' && Phaser.Input.Keyboard.JustDown(k.SHIFT) && time > this.dashReady) {
      p.setVelocityX(p.flipX ? -600 : 600); p.setVelocityY(0);
      this.dashUntil = time + 180; this.dashReady = time + 700;
    }

    // Jumping
    if (jumpPressed && !this.ducking) {
      if (onGround) { p.setVelocityY(-c.jump); this.jumps = 1; sfx(this, 'S1'); }
      else if (c.ability === 'doubleJump' && this.jumps < 2) { p.setVelocityY(-c.jump * 0.85); this.jumps = 2; sfx(this, 'S1'); }
    }
    if (!jumpHeld && p.body.velocity.y < -150) p.setVelocityY(-150); // variable jump height
    if (this.animated) {
      if (this.ducking && this.anims.exists('duck')) p.anims.play('duck', true);
      else if (!p.body.blocked.down) p.anims.play(p.body.velocity.y < 0 ? 'jumpUp' : 'fall', true);
      else if (Math.abs(p.body.velocity.x) > 10) p.anims.play('run', true);
      else p.anims.play('idle', true);
    }
    if (c.ability === 'float' && jumpHeld && p.body.velocity.y > 60) p.setVelocityY(60);

    // Enemies
    this.enemies.children.each(e => {
      if (e.getData('kind') === 'walker') {
        if (e.body.blocked.left) e.setVelocityX(70);
        else if (e.body.blocked.right) e.setVelocityX(-70);
        e.setFlipX(e.body.velocity.x > 0);
        if (e.y > this.physics.world.bounds.height) e.destroy();
      } else {
        e.y = e.getData('baseY') + Math.sin(time / 400 + e.x) * 40;
        e.setVelocityX(Math.sin(time / 1200 + e.x) * 60);
      }
    });

    if (p.y > LEVELS[this.levelIndex].length * TILE + 40) this.die();
    this.updateHud();
  }
}

// ---------- End screen ----------
class End extends Phaser.Scene {
  constructor() { super('End'); }
  init(d) { this.win = d.win; }
  create() {
    this.sound.stopAll();
    this.cameras.main.setBackgroundColor(this.win ? '#145a32' : '#4a0e0e');
    this.add.text(VIEW_W / 2, 200, this.win ? TEXT.winMessage : TEXT.gameOverMessage,
      { fontFamily: 'monospace', fontSize: 32, color: '#fff' }).setOrigin(0.5);
    this.add.text(VIEW_W / 2, 260, `Coins: ${this.registry.get('coins') || 0}   —   press ENTER`,
      { fontFamily: 'monospace', fontSize: 18, color: '#ddd' }).setOrigin(0.5);
    this.input.keyboard.once('keydown-ENTER', () => {
      this.registry.set('lives', 3); this.registry.set('coins', 0);
      this.scene.start('Select');
    });
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: VIEW_W, height: VIEW_H,
  pixelArt: true,
  physics: { default: 'arcade', arcade: { gravity: { y: 1100 }, debug: false } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [Boot, Select, Game, End],
});
