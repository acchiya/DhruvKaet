// ============================================================
//  ASSET MANIFEST: every personalizable thing has a #CODE.
//  Drop a file at assets/images/<CODE>.png (or the listed ext) and it
//  replaces the placeholder automatically. Missing files show a labeled box.
//  Full checklist: ASSETS.md
// ============================================================
const img = (code, name, w, h, color, extra = {}) => ({ code, name, w, h, color, ...extra });

window.IMAGES = [
  // A: Player
  img('A1', 'Dhruv', 96, 128, '#e74c3c', { sheet: { frameWidth: 96, frameHeight: 128 } }),

  // W: Weapon icons (also used as the swing / thrown sprite)
  img('W0', 'Fists', 32, 32, '#d0a080'),
  img('W1', 'Boxing Gloves', 32, 32, '#c0392b'),
  img('W2', 'Belt', 32, 32, '#6e4b2a'),
  img('W3', 'Sabal', 32, 32, '#7f8c8d'),
  img('W4', 'Pet Cat', 32, 32, '#f0b27a'),
  img('W5', 'Fairy Healer', 32, 32, '#a3e4d7'),
  img('W6', 'Hammer', 32, 32, '#95a5a6'),

  // G: Bosses (also appear as mini enemies in their own level)
  img('G1', 'YETI', 96, 128, '#d5dbdb'),
  img('G2', 'CHOCO', 96, 128, '#6e2c00'),
  img('G3', 'BLDC', 96, 128, '#1f618d'),
  img('G4', 'MEOW', 96, 128, '#7d3c98'),
  img('G5', 'THARKI', 96, 128, '#b03a2e'),
  img('G6', 'TYAGI', 96, 128, '#1e8449'),

  // P: Boss power-up props
  img('P1', 'Chicken', 40, 40, '#e59866'),
  img('P2', 'Beer (Choco)', 40, 40, '#f4d03f'),
  img('P3', 'Sabal summon', 40, 40, '#85c1e9'),
  img('P4', 'White Monster', 40, 40, '#f8f9f9'),
  img('P5', 'Tinder phone', 40, 40, '#ff5864'),
  img('P6', 'Beer (Tyagi)', 40, 40, '#f4d03f'),

  // M: Minions & projectiles
  img('M1', 'Cat', 32, 24, '#a569bd'),
  img('M2', 'Giant cat mount', 128, 80, '#6c3483'),
  img('M3', 'Female warrior', 40, 56, '#cb4335'),
  img('M4', 'Fairy (Tharki)', 28, 28, '#f5b7b1'),
  img('M5', 'Thrown hammer', 24, 24, '#7b7d7d'),

  // N: Regular enemies (every level)
  img('N1', 'Bobba', 40, 60, '#5d6d7e'),
  img('N2', 'Monkey', 32, 32, '#8d6e63'),
  img('N3', 'Gayansh', 40, 60, '#e91e63'),
  img('N4', 'Aunty', 40, 60, '#16a085'),

  // L: Level backgrounds (built-in semi-dark art until replaced)
  img('L1', 'Library', 800, 480, '#2c3e50', { art: 'dusk', variant: 0 }),
  img('L2', 'Sports Complex', 800, 480, '#2c3e50', { art: 'dusk', variant: 1 }),
  img('L3', 'Deltech', 800, 480, '#2c3e50', { art: 'dusk', variant: 2 }),
  img('L4', 'Design Dept', 800, 480, '#2c3e50', { art: 'dusk', variant: 3 }),
  img('L5', 'Girls Hostel', 800, 480, '#2c3e50', { art: 'dusk', variant: 4 }),
  img('L6', 'Aryabhatta Hostel', 800, 480, '#2c3e50', { art: 'dusk', variant: 5 }),

  // D: Ground
  img('D1', 'Ground top', 32, 32, '#3b3a4a', { art: 'groundTop' }),
  img('D2', 'Platform / ledge', 32, 16, '#4a3426', { art: 'plat' }),
  img('D5', 'Ground fill', 32, 32, '#2b2a36', { art: 'groundFill' }),

  // F: UI
  img('F1', 'Title logo', 400, 100, '#34495e'),
  img('F2', 'Campus map', 1672, 941, '#27ae60', { ext: 'jpg' }),
  img('F3', 'Heart', 16, 16, '#e74c3c', { art: 'heart' }),
];

// ---- AUDIO (optional) → assets/audio/<CODE>.mp3 replaces the default.
// def: built-in default from Kenney "Digital Audio" (CC0) in assets/audio/default/
window.AUDIO = [
  { code: 'S1', desc: 'Jump', def: true },
  { code: 'S2', desc: 'Attack swing', def: true },
  { code: 'S3', desc: 'Hit enemy', def: true },
  { code: 'S4', desc: 'Dhruv hurt', def: true },
  { code: 'S5', desc: 'Dhruv dies', def: true },
  { code: 'S6', desc: 'Boss power-up', def: true },
  { code: 'S7', desc: 'Level music (loops)' },
  { code: 'S8', desc: 'Boss music (loops)' },
  { code: 'S9', desc: 'Boss defeated', def: true },
  { code: 'S10', desc: 'New weapon get', def: true },
  { code: 'S11', desc: 'Map music (loops)' },
  { code: 'S12', desc: 'Clink (hit something unkillable)', def: true },
  { code: 'S13', desc: 'Menu move / select', def: true },
];
