// ============================================================
//  Input: keyboard + gamepad merged into named actions.
//  Gamepad layout (standard / Xbox names; PlayStation in brackets):
//    Left stick / D-pad  move, Down = duck
//    A [Cross]           jump            X [Square]   attack
//    B [Circle] / RT     dash            LB / RB      switch weapon
//    Start / Back        pause           (menus: A confirm, B back)
// ============================================================
const PAD = { A: 0, B: 1, X: 2, Y: 3, LB: 4, RB: 5, LT: 6, RT: 7, BACK: 8, START: 9, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15 };

class Controls {
  constructor(scene) {
    this.scene = scene;
    this.k = scene.input.keyboard.addKeys('LEFT,RIGHT,UP,DOWN,SPACE,SHIFT,ENTER,ESC,P,A,D,W,S,J,X,K,Q,E,ONE,TWO,THREE,FOUR,FIVE,SIX,SEVEN');
    this.prev = {}; this.cur = {};
    this.poll(); this.sync();
  }
  pad() { const g = this.scene.input.gamepad; return g && g.total ? g.pad1 || g.getPad(0) : null; }
  poll() {
    const k = this.k, p = this.pad();
    const B = i => !!(p && p.buttons[i] && p.buttons[i].pressed);
    const sx = p && p.axes.length ? p.axes[0].getValue() : 0, sy = p && p.axes.length > 1 ? p.axes[1].getValue() : 0;
    this.prev = this.cur;
    this.cur = {
      left: k.LEFT.isDown || k.A.isDown || B(PAD.LEFT) || sx < -0.4,
      right: k.RIGHT.isDown || k.D.isDown || B(PAD.RIGHT) || sx > 0.4,
      up: k.UP.isDown || k.W.isDown || B(PAD.UP) || sy < -0.6,
      down: k.DOWN.isDown || k.S.isDown || B(PAD.DOWN) || sy > 0.6,
      jump: k.UP.isDown || k.W.isDown || k.SPACE.isDown || B(PAD.A),
      attack: k.J.isDown || k.K.isDown || k.X.isDown || B(PAD.X),
      dash: k.SHIFT.isDown || B(PAD.B) || B(PAD.RT),
      prevWeapon: k.Q.isDown || B(PAD.LB),
      nextWeapon: k.E.isDown || B(PAD.RB) || B(PAD.Y),
      pause: k.ESC.isDown || k.P.isDown || B(PAD.START) || B(PAD.BACK),
      confirm: k.ENTER.isDown || k.SPACE.isDown || B(PAD.A) || B(PAD.START),
      back: k.ESC.isDown || B(PAD.B),
    };
    ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN'].forEach((n, i) => { this.cur['slot' + i] = k[n].isDown; });
  }
  // Forget presses already in progress (after pausing / changing scene)
  sync() { this.poll(); this.prev = { ...this.cur }; }
  held(a) { return !!this.cur[a]; }
  pressed(a) { return !!this.cur[a] && !this.prev[a]; }
}

const CONTROLS_HELP =
  'KEYBOARD                         GAMEPAD\n' +
  'A/D or ←/→   move               stick / d-pad\n' +
  'W/↑/Space    jump (x2, walls)   A\n' +
  'S/↓          duck               down\n' +
  'S + jump     drop off a ledge   down + A\n' +
  'J/K/X/click  attack             X\n' +
  'Shift        dash               B / RT\n' +
  'Q/E, 1-7     switch weapon      LB / RB\n' +
  'Esc / P      pause              Start';
