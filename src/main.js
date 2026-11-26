const TILE = 32, VIEW_W = 800, VIEW_H = 480;

// ---------- Boot: load real assets, make placeholders for missing ones ----------
class Boot extends Phaser.Scene {
  constructor() { super('Boot'); }
  preload() {
    this.load.on('loaderror', () => {}); // missing files are expected
    IMAGES.forEach(a => this.load.image(a.code, `assets/images/${a.code}.png`));
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
  ctx.fillStyle = a.color; ctx.fillRect(0, 0, a.w, a.h);
  ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, a.w - 2, a.h - 2);
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${Math.max(8, Math.min(a.w / 2.6, a.h / 2, 40))}px monospace`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('#' + a.code, a.w / 2, a.h / 2);
  tex.refresh();
}

function sfx(scene, code, cfg) { if (scene.cache.audio.exists(code)) scene.sound.play(code, cfg); }

// ---------- Character select ----------
class Select extends Phaser.Scene {
  constructor() { super('Select'); }
  create() {
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

    this.physics.world.setBounds(0, 0, W, H + 200);
    this.physics.world.setBoundsCollision(true, true, true, false);
    this.solids = this.physics.add.staticGroup();
    this.coins = this.physics.add.staticGroup();
    this.enemies = this.physics.add.group();
    this.powerups = this.physics.add.group();
    let start = { x: 64, y: 300 };

    map.forEach((row, ty) => [...row].forEach((c, tx) => {
      const x = tx * TILE + TILE / 2, y = ty * TILE + TILE / 2;
      if (c === '#') this.tile(x, y, 'D1', 'ground');
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
    this.player.setDisplaySize(32, 48).setCollideWorldBounds(true).setMaxVelocity(700, 900);
    this.big = false; this.invulnUntil = 0; this.jumps = 0; this.dashUntil = 0; this.dashReady = 0; this.done = false;

    this.physics.add.collider(this.player, this.solids, (p, b) => this.hitBlock(b));
    this.physics.add.collider(this.enemies, this.solids);
    this.physics.add.collider(this.powerups, this.solids);
    this.physics.add.overlap(this.player, this.coins, (p, c) => { c.destroy(); this.addCoin(); });
    this.physics.add.overlap(this.player, this.powerups, (p, u) => { u.destroy(); this.grow(); });
    this.physics.add.overlap(this.player, this.enemies, (p, e) => this.touchEnemy(e));
    if (this.goal) this.physics.add.overlap(this.player, this.goal, () => this.win());

    this.cameras.main.setBounds(0, 0, W, H).startFollow(this.player, true, 0.15, 0.15);

    const k = this.input.keyboard;
    this.keys = k.addKeys('LEFT,RIGHT,UP,SPACE,SHIFT,A,D,W');

    this.coinCount = this.registry.get('coins') || 0;
    this.hud = this.add.text(10, 10, '', { fontFamily: 'monospace', fontSize: 18, color: '#fff', stroke: '#000', strokeThickness: 4 }).setScrollFactor(0).setDepth(10);
    this.updateHud();

    if (this.cache.audio.exists('S7') && !this.sound.get('S7')) this.sound.play('S7', { loop: true, volume: 0.4 });
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
    this.big = true; this.player.setDisplaySize(40, 60); this.player.y -= 12;
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
      sfx(this, 'S5'); this.big = false; this.player.setDisplaySize(32, 48);
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
    if (this.done) return;
    const p = this.player, k = this.keys, c = this.char;
    const left = k.LEFT.isDown || k.A.isDown, right = k.RIGHT.isDown || k.D.isDown;
    const jumpHeld = k.UP.isDown || k.SPACE.isDown || k.W.isDown;
    const jumpPressed = [k.UP, k.SPACE, k.W].some(key => Phaser.Input.Keyboard.JustDown(key));
    const onGround = p.body.blocked.down;
    if (onGround) this.jumps = 0;

    // Movement / dash
    if (time < this.dashUntil) { /* keep dash velocity */ }
    else if (left) { p.setVelocityX(-c.speed); p.setFlipX(true); }
    else if (right) { p.setVelocityX(c.speed); p.setFlipX(false); }
    else p.setVelocityX(0);

    if (c.ability === 'dash' && Phaser.Input.Keyboard.JustDown(k.SHIFT) && time > this.dashReady) {
      p.setVelocityX(p.flipX ? -600 : 600); p.setVelocityY(0);
      this.dashUntil = time + 180; this.dashReady = time + 700;
    }

    // Jumping
    if (jumpPressed) {
      if (onGround) { p.setVelocityY(-c.jump); this.jumps = 1; sfx(this, 'S1'); }
      else if (c.ability === 'doubleJump' && this.jumps < 2) { p.setVelocityY(-c.jump * 0.85); this.jumps = 2; sfx(this, 'S1'); }
    }
    if (!jumpHeld && p.body.velocity.y < -150) p.setVelocityY(-150); // variable jump height
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
