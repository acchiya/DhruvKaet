// ============================================================
//  ASSET MANIFEST — every personalizable thing has a #CODE.
//  Drop a file at the listed path and it replaces the placeholder
//  automatically. Missing files show a colored box with the code.
//  Full checklist: ASSETS.md
// ============================================================

// ---- IMAGES ------------------------------------------------
// w/h = size the game draws it at (your PNG can be any size; keep the same aspect ratio).
window.IMAGES = [
  // A = Playable character
  { code: 'A1', w: 32, h: 48, color: '#e74c3c', desc: 'Dhruv (player)' },

  // B = Enemies
  { code: 'B1', w: 32, h: 32, color: '#8e5a2b', desc: 'Walking enemy' },
  { code: 'B2', w: 32, h: 32, color: '#c0392b', desc: 'Flying enemy' },

  // C = Items
  { code: 'C1', w: 20, h: 20, color: '#f1c40f', desc: 'Coin / collectible' },
  { code: 'C2', w: 28, h: 28, color: '#e67e22', desc: 'Power-up (makes you big)' },
  { code: 'C3', w: 32, h: 96, color: '#1abc9c', desc: 'Level goal / finish flag' },

  // D = Tiles (32x32)
  { code: 'D1', w: 32, h: 32, color: '#6d4c2f', desc: 'Ground tile' },
  { code: 'D2', w: 32, h: 32, color: '#b5651d', desc: 'Breakable brick' },
  { code: 'D3', w: 32, h: 32, color: '#f39c12', desc: 'Surprise block (unused)' },
  { code: 'D4', w: 32, h: 32, color: '#7f6a4f', desc: 'Surprise block (used)' },

  // E = Backgrounds
  { code: 'E1', w: 800, h: 480, color: '#5dade2', desc: 'Level 1 background' },

  // F = UI
  { code: 'F1', w: 400, h: 100, color: '#34495e', desc: 'Game title logo' },
];

// ---- AUDIO (optional; silent if missing) -------------------
window.AUDIO = [
  { code: 'S1', desc: 'Jump sound' },
  { code: 'S2', desc: 'Coin sound' },
  { code: 'S3', desc: 'Power-up sound' },
  { code: 'S4', desc: 'Stomp enemy sound' },
  { code: 'S5', desc: 'Hurt / death sound' },
  { code: 'S6', desc: 'Level complete sound' },
  { code: 'S7', desc: 'Background music (loops)' },
];

// ---- TEXT / GAMEPLAY ---------------------------------------
// #T codes = text you give me. ability: doubleJump | dash | highJump | float
window.CHARACTERS = [
  { sprite: 'A1', name: 'Dhruv', ability: 'doubleJump', speed: 210, jump: 560, tagline: '#T5 Can jump twice' },
];

window.TEXT = {
  title: 'DhruvKaet #T9',
  winMessage: 'Level clear! #T10',
  gameOverMessage: 'Game over! #T11',
};
