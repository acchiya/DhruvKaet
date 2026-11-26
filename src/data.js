// ============================================================
//  GAME DATA: tweak numbers here, no engine code needed.
// ============================================================

window.PLAYER = { hp: 10, speed: 220, jump: 520, doubleJump: true, dashSpeed: 560, dashMs: 180, dashCd: 650 };

// kind: melee | throw.  companion: cat | fairy (helper that follows Dhruv)
window.WEAPONS = {
  fists:  { name: 'Fists',         icon: 'W0', kind: 'melee', dmg: 1, range: 36, cd: 350 },
  gloves: { name: 'Boxing Gloves', icon: 'W1', kind: 'melee', dmg: 1, range: 40, cd: 170 },
  belt:   { name: 'Belt',          icon: 'W2', kind: 'melee', dmg: 1, range: 100, cd: 450 },
  sabal:  { name: 'Sabal',         icon: 'W3', kind: 'melee', dmg: 3, range: 56, cd: 750, knock: 420 },
  cat:    { name: 'Pet Cat',       icon: 'W4', kind: 'melee', dmg: 1, range: 36, cd: 350, companion: 'cat' },
  healer: { name: 'Fairy Healer',  icon: 'W5', kind: 'melee', dmg: 1, range: 36, cd: 350, companion: 'fairy' },
  hammer: { name: 'Hammer',        icon: 'W6', kind: 'throw', dmg: 2 },
};
window.WEAPON_ORDER = ['fists', 'gloves', 'belt', 'sabal', 'cat', 'healer', 'hammer'];

// Regular enemies + minions.  ai: see LevelScene.updateEnemy
window.ENEMIES = {
  bobba:   { name: 'Bobba',   sprite: 'N1', w: 40, h: 60, hp: 1, invulnerable: true, ai: 'bobba', speed: 40 },
  monkey:  { name: 'Monkey',  sprite: 'N2', w: 32, h: 32, hp: 2, contact: 1, ai: 'monkey', speed: 170 },
  gayansh: { name: 'Gayansh', sprite: 'N3', w: 40, h: 60, hp: 3, contact: 0, ai: 'gayansh', speed: 60 },
  aunty:   { name: 'Aunty',   sprite: 'N4', w: 40, h: 60, hp: 1, invulnerable: true, contact: 1, ai: 'aunty' },
  cat:     { name: 'Cat',     sprite: 'M1', w: 32, h: 24, hp: 1, contact: 1, ai: 'chaser', speed: 150 },
  warrior: { name: 'Warrior', sprite: 'M3', w: 40, h: 56, hp: 1, contact: 1, ai: 'melee', dmg: 1, speed: 110, range: 50, windup: 350, cd: 1100 },
  fairy:   { name: 'Fairy',   sprite: 'M4', w: 28, h: 28, hp: 1, ai: 'fairy', fly: true },
};

// Bosses. `mini` = stats when met inside the level, `boss` = phase-1 stats in the arena.
// Phase 2 starts at half HP after the power-up animation; `phase2` overrides stats.
window.BOSSES = {
  yeti: {
    name: 'YETI', sprite: 'G1', ai: 'melee', speed: 90, range: 64, windup: 450, cd: 1200,
    mini: { hp: 3, dmg: 1 }, boss: { hp: 12, dmg: 2 },
    prop: 'P1', powerText: '*eats chicken*',
    phase2: { speed: 150, windup: 260, dmg: 3, special: 'slam', specialCd: 4000 },
  },
  choco: {
    name: 'CHOCO', sprite: 'G2', ai: 'melee', speed: 100, range: 105, windup: 420, cd: 1100,
    mini: { hp: 2, dmg: 2 }, boss: { hp: 14, dmg: 2 },
    prop: 'P2', powerText: '*drinks beer*',
    phase2: { speed: 150, range: 140, windup: 280, dmg: 3, cd: 800 },
  },
  bldc: {
    name: 'BLDC', sprite: 'G3', ai: 'melee', speed: 85, range: 70, windup: 550, cd: 1300,
    mini: { hp: 2, dmg: 2 }, boss: { hp: 16, dmg: 2 },
    prop: 'P3', powerText: '*SABAL! come to me*',
    phase2: { speed: 110, dmg: 3, special: 'lightning', specialCd: 2500 },
  },
  meow: {
    name: 'MEOW', sprite: 'G4', ai: 'summon', speed: 90, minion: 'cat', maxMinions: 2, cd: 3000,
    mini: { hp: 2, dmg: 2 }, boss: { hp: 18, dmg: 3 },
    prop: 'P4', powerText: '*drinks White Monster, feeds the cat*',
    phase2: { speed: 170, dmg: 4, onPhase2: 'mount', special: 'swarm', specialCd: 5000, maxMinions: 6 },
  },
  tharki: {
    name: 'THARKI', sprite: 'G5', ai: 'summon', speed: 90, minion: 'warrior', maxMinions: 1, cd: 4000,
    mini: { hp: 1, dmg: 1 }, boss: { hp: 20, dmg: 3 },
    prop: 'P5', powerText: '*swipes right. a lot.*',
    phase2: { dmg: 4, onPhase2: 'squad', special: 'squad', specialCd: 9000 },
  },
  tyagi: {
    name: 'TYAGI', sprite: 'G6', ai: 'throw', speed: 80, cd: 1800,
    mini: { hp: 2, dmg: 1 }, boss: { hp: 24, dmg: 3 },
    prop: 'P6', powerText: '*drinks beer*',
    phase2: { cd: 1100, dmg: 4, special: 'slam', specialCd: 3500 },
  },
};

// map: position on the campus map image (F2, in its own pixels)
window.LEVELS = [
  { name: 'Library',           bg: 'L1', boss: 'yeti',   reward: 'gloves', map: [1030, 415] },
  { name: 'Sports Complex',    bg: 'L2', boss: 'choco',  reward: 'belt',   map: [1470, 400] },
  { name: 'Deltech',           bg: 'L3', boss: 'bldc',   reward: 'sabal',  map: [550, 240] },
  { name: 'Design Department', bg: 'L4', boss: 'meow',   reward: 'cat',    map: [1120, 270] },
  { name: 'Girls Hostel',      bg: 'L5', boss: 'tharki', reward: 'healer', map: [520, 795] },
  { name: 'Aryabhatta Hostel', bg: 'L6', boss: 'tyagi',  reward: 'hammer', map: [330, 560] },
];
window.LEVEL7 = { name: '??? (coming soon)', map: [870, 555] };
// Road waypoints between stops (campus map pixels): MAP_ROUTE[i] leads from stop i to stop i+1
window.MAP_ROUTE = [
  [[1170, 445], [1320, 425]],                          // Library → Sports Complex
  [[1260, 330], [1170, 175], [900, 160], [680, 185]],  // Sports Complex → Deltech
  [[680, 185], [900, 160], [1060, 205]],               // Deltech → Design Dept
  [[1010, 330], [960, 600], [720, 690], [580, 745]],   // Design Dept → Girls Hostel
  [[455, 725], [390, 640]],                            // Girls Hostel → Aryabhatta
  [[470, 500], [640, 545]],                            // Aryabhatta → OAT (level 7)
];

// Where things spawn in every level (x positions; level is 3600px + boss arena).
window.LEVEL_LAYOUT = {
  mini:    [700, 1700, 2650],
  monkey:  [1250, 2950],
  gayansh: [2150],
  aunty:   [1000, 2400],
  bobba:   [2250, 3150],        // second half only
};

window.TEXT = {
  title: 'DHRUVKAAT',                 // #T9
  aunty: ['#T31 Aunty line 1', '#T32 Aunty line 2', '#T33 Aunty line 3'],
  bobba: 'Bobba sent you back!',
  hug: '*HUG*',
  gameOver: 'Dhruv fainted',          // #T11
};
