# Placeholder checklist

Every placeholder in the game shows its code (e.g. `#G1`). Drop a file at `assets/images/<CODE>.png` (transparent PNG, any size with the same aspect ratio) and it replaces the placeholder automatically. Tunable numbers (HP, damage, speed, cooldowns) live in `src/data.js`.

✅ done · 🎨 built-in art (replace if you want) · ⬜ needed

## A: Player
| Code | What | Size | |
|---|---|---|---|
| A1 | Dhruv: spritesheet (idle 0-2, run 3-6, jump 7-9, duck 10) | 96×128 / frame | ✅ |
| A1 (more frames) | **Needed for combat:** attack swing, hurt, dash. Send them and I'll extend the sheet | 96×128 | ⬜ |

## G: Bosses (also appear as mini enemies in their own level)
| Code | Boss | Level | Size | |
|---|---|---|---|---|
| G1 | YETI | 1 Library | 96×128 | ⬜ |
| G2 | CHOCO | 2 Sports Complex | 96×128 | ⬜ |
| G3 | BLDC | 3 Deltech | 96×128 | ⬜ |
| G4 | MEOW | 4 Design Dept | 96×128 | ⬜ |
| G5 | THARKI | 5 Girls Hostel | 96×128 | ⬜ |
| G6 | TYAGI | 6 Aryabhatta Hostel | 96×128 | ⬜ |

Later: one spritesheet per boss (idle, walk, attack, hurt, power-up animation, phase-2 look).

## P: Boss power-up props (shown during the power-up animation)
| Code | What | Size | |
|---|---|---|---|
| P1 | Chicken (Yeti) | 40×40 | ⬜ |
| P2 | Beer (Choco) | 40×40 | ⬜ |
| P3 | Sabal summon (BLDC) | 40×40 | ⬜ |
| P4 | White Monster (Meow) | 40×40 | ⬜ |
| P5 | Tinder phone (Tharki) | 40×40 | ⬜ |
| P6 | Beer (Tyagi) | 40×40 | ⬜ |

## M: Minions & projectiles
| Code | What | Size | |
|---|---|---|---|
| M1 | Cat (Meow's minion) | 32×24 | ⬜ |
| M2 | Giant cat that Meow rides (phase 2) | 128×80 | ⬜ |
| M3 | Female warrior (Tharki) | 40×56 | ⬜ |
| M4 | Fairy that heals Tharki | 28×28 | ⬜ |
| M5 | Hammer Tyagi throws | 24×24 | ⬜ |

## N: Regular enemies (every level)
| Code | Who | What they do | Size | |
|---|---|---|---|---|
| N1 | Bobba | Second half of the level. Touch sends you back to the start once, then all Bobbas vanish | 40×60 | ⬜ |
| N2 | Monkey | Hits you and steals your equipped weapon. Kill it within 9s or the weapon is gone until you beat that boss again | 32×32 | ⬜ |
| N3 | Gayansh | Pulls you in, hugs (1 dmg/sec). Mash attack/arrows to escape | 40×60 | ⬜ |
| N4 | Aunty | Can't be killed; hurts on touch, says a catchphrase when you're near | 40×60 | ⬜ |

## W: Weapons (icons; also drawn on the swing / as the thrown hammer)
| Code | Weapon | From | How it plays | |
|---|---|---|---|---|
| W0 | Fists | start | Weak, short | ⬜ |
| W1 | Boxing Gloves | Yeti | Fast combo, short | ⬜ |
| W2 | Belt | Choco | Long reach | ⬜ |
| W3 | Sabal | BLDC | Slow, 3 damage, big knockback | ⬜ |
| W4 | Pet Cat | Meow | Cat follows you and bites enemies | ⬜ |
| W5 | Fairy Healer | Tharki | Heals 1 heart every 5s | ⬜ |
| W6 | Hammer | Tyagi | Thrown, comes back | ⬜ |

## L / D / F: World & UI
| Code | What | Size | |
|---|---|---|---|
| L1–L6 | Level backgrounds (Library … Aryabhatta) | 800×480 | 🎨 |
| D1 / D5 | Ground top / ground fill tiles (seamless) | 32×32 | 🎨 |
| D2 | Floating ledge tile (repeats sideways) | 32×16 | 🎨 |
| F1 | Title logo | 400×100 | ⬜ |
| F2 | Campus map (`F2.jpg`) | 1672×941 | ✅ |
| F3 | Heart icon | 16×16 | 🎨 |

## S: Audio → `assets/audio/<CODE>.mp3` (all optional)
S1 jump · S2 attack swing · S3 hit enemy · S4 Dhruv hurt · S5 Dhruv dies · S6 boss power-up · S7 level music · S8 boss music · S9 boss defeated · S10 new weapon · S11 map music · S12 clink (unkillable) · S13 menu move

Free placeholder sounds (Kenney, CC0) already play for S1-S6, S9, S10, S12, S13. Dropping in your own mp3 replaces them. Music (S7, S8, S11) is still silent.

## T: Text (just tell me)
| Code | What |
|---|---|
| T9 | Game title (now "DHRUVKAAT") |
| T11 | Game-over line (now "Dhruv fainted") |
| T31–T33 | Aunty's catchphrases |

## Level 7
Not designed yet (shown as `?` at OAT on the map).
