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
  { code: 'A1', w: 96, h: 128, color: '#e74c3c', desc: 'Dhruv (player) spritesheet: idle 0-2, run 3-6, jump 7-9',
    sheet: { frameWidth: 96, frameHeight: 128 } },

  // B = Mini enemies (planned behavior in desc)
  { code: 'B1', w: 32, h: 32, color: '#8e5a2b', desc: 'Mini enemy 1: walker (built)' },
  { code: 'B2', w: 32, h: 32, color: '#c0392b', desc: 'Mini enemy 2: flyer (built)' },
  { code: 'B3', w: 32, h: 32, color: '#d35400', desc: 'Mini enemy 3: hopper (planned)' },
  { code: 'B4', w: 32, h: 32, color: '#7d3c98', desc: 'Mini enemy 4: shooter, fires H1 at head height (planned)' },
  { code: 'B5', w: 32, h: 32, color: '#a93226', desc: 'Mini enemy 5: charger, rushes when it sees you (planned)' },
  { code: 'B6', w: 32, h: 32, color: '#566573', desc: 'Mini enemy 6: spiky, cannot be stomped (planned)' },

  // G = Main bosses (planned)
  { code: 'G1', w: 96, h: 96, color: '#922b21', desc: 'Boss 1' },
  { code: 'G2', w: 96, h: 96, color: '#1f618d', desc: 'Boss 2' },
  { code: 'G3', w: 96, h: 96, color: '#196f3d', desc: 'Boss 3' },
  { code: 'G4', w: 96, h: 96, color: '#7e5109', desc: 'Boss 4' },
  { code: 'G5', w: 96, h: 96, color: '#5b2c6f', desc: 'Boss 5' },
  { code: 'G6', w: 96, h: 96, color: '#17202a', desc: 'Boss 6 (final)' },

  // H = Projectiles (planned)
  { code: 'H1', w: 16, h: 16, color: '#ff00ff', desc: 'Mini enemy projectile' },
  { code: 'H2', w: 24, h: 24, color: '#ff4500', desc: 'Boss projectile' },

  // C = Items
  { code: 'C1', w: 20, h: 20, color: '#f1c40f', desc: 'Coin / collectible' },
  { code: 'C2', w: 28, h: 28, color: '#e67e22', desc: 'Power-up (makes you big)' },
  { code: 'C3', w: 32, h: 96, color: '#1abc9c', desc: 'Level goal / finish flag' },
  { code: 'C4', w: 28, h: 28, color: '#27ae60', desc: 'Extra life (planned)' },

  // D = Tiles (32x32)
  { code: 'D1', w: 32, h: 32, color: '#6d4c2f', desc: 'Grass ground (top layer)', art: 'grass' },
  { code: 'D5', w: 32, h: 32, color: '#6d4c2f', desc: 'Dirt ground (under grass)', art: 'dirt' },
  { code: 'D2', w: 32, h: 32, color: '#b5651d', desc: 'Breakable brick' },
  { code: 'D3', w: 32, h: 32, color: '#f39c12', desc: 'Surprise block (unused)' },
  { code: 'D4', w: 32, h: 32, color: '#7f6a4f', desc: 'Surprise block (used)' },

  // E = Backgrounds
  { code: 'E1', w: 800, h: 480, color: '#5dade2', desc: 'Sky background', art: 'sky' },
  { code: 'E2', w: 800, h: 240, color: '#ffffff', desc: 'Clouds layer (scrolls slowly)', art: 'clouds' },

  // L = Per-level background (optional; falls back to E1 sky) (planned)
  ...[1, 2, 3, 4, 5, 6, 7].map(n => ({ code: 'L' + n, w: 800, h: 480, color: '#5dade2', desc: `Level ${n} background`, optional: true })),

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
  { code: 'S8', desc: 'Boss fight music (planned)' },
  { code: 'S9', desc: 'Boss hit sound (planned)' },
  { code: 'S10', desc: 'Boss defeated sound (planned)' },
];

// ---- TEXT / GAMEPLAY ---------------------------------------
// #T codes = text you give me. ability: doubleJump | dash | highJump | float
window.CHARACTERS = [
  { sprite: 'A1', name: 'Dhruv', ability: 'doubleJump', speed: 210, jump: 560, tagline: '#T5 Can jump twice' },
];

window.TEXT = {
  title: 'Dhruvkaat #T9',
  winMessage: 'Level clear! #T10',
  gameOverMessage: 'Game over! #T11',
};
