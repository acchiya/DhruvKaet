# Everything to send

**How to send:**
- **Images:** PNG with a transparent background, named exactly by code (e.g. `G1.png`). They go in `assets/images/`. A file can be bigger than the listed size as long as it has the same shape (e.g. 192×256 instead of 96×128).
- **Templates:** `asset-templates/` has a blank template for every code at the right size. The red box is the edge of the image, and the blue line at the bottom is where the feet touch the ground. Draw over it.
- **Audio:** MP3 named by code (e.g. `S1.mp3`), goes in `assets/audio/`.
- **Text:** just tell me.

Anything missing shows a labelled box in the game (`#G1`), so you can send things one at a time.

✅ done · 🔊 free placeholder sound already plays · 🎨 built-in art (replace only if you want) · ⬜ needed

---

## Priority 1: what the game looks like
### Dhruv (A1)
| Code | What | Size | |
|---|---|---|---|
| A1 | Dhruv spritesheet: idle 0-2, run 3-6, jump 7-9, duck 10 | 96×128 per frame | ✅ |
| A1 extra | **6 more frames, same style:** attack ×3 (swing), hurt ×1, dash ×1, wall slide ×1. Template: `asset-templates/A1-extra.png` | 96×128 per frame | ⬜ |

### Bosses (also appear smaller as mini enemies in their own level)
| Code | Boss | Level | Size | |
|---|---|---|---|---|
| G1 | YETI | 1 Library | 96×128 | ⬜ |
| G2 | CHOCO | 2 Sports Complex | 96×128 | ⬜ |
| G3 | BLDC | 3 Deltech | 96×128 | ⬜ |
| G4 | MEOW | 4 Design Dept | 96×128 | ⬜ |
| G5 | THARKI | 5 Girls Hostel | 96×128 | ⬜ |
| G6 | TYAGI | 6 Aryabhatta Hostel | 96×128 | ⬜ |

One standing pose each is enough to start. Better: a small sheet per boss (idle, walk, attack, hurt). The power-up look is made by the game (it grows the boss and tints it red).

### Regular enemies (every level)
| Code | Who | What they do | Size | |
|---|---|---|---|---|
| N1 | Bobba | 3 HP. Touch sends you back to the start once, then every Bobba vanishes | 40×60 | ⬜ |
| N2 | Monkey | Steals your weapon; 9s to kill it | 32×32 | ⬜ |
| N3 | Gayansh | Pulls you in and hugs | 40×60 | ⬜ |
| N4 | Aunty | Pops out of the ground, can't be killed, says a catchphrase | 40×60 | ⬜ |

## Priority 2: fights and rewards
### Boss power-up props (shown when the boss powers up at the start of the fight)
| Code | What | Size | |
|---|---|---|---|
| P1 | Chicken (Yeti) | 40×40 | ⬜ |
| P2 | Beer (Choco) | 40×40 | ⬜ |
| P3 | Sabal being summoned (BLDC) | 40×40 | ⬜ |
| P4 | White Monster can (Meow) | 40×40 | ⬜ |
| P5 | Phone showing Tinder (Tharki) | 40×40 | ⬜ |
| P6 | Beer (Tyagi) | 40×40 | ⬜ |

### Minions and projectiles
| Code | What | Size | |
|---|---|---|---|
| M1 | Cat that Meow summons | 32×24 | ⬜ |
| M2 | Giant cat Meow rides after the White Monster | 128×80 | ⬜ |
| M3 | Female warrior (Tharki) | 40×56 | ⬜ |
| M4 | Flying fairy that heals Tharki | 28×28 | ⬜ |
| M5 | Hammer Tyagi throws | 24×24 | ⬜ |

### Weapons and companions (icons; weapons are also drawn on the swing, and the hammer when thrown)
| Code | What | Won from | |
|---|---|---|---|
| W0 | Fists | start | ⬜ |
| W1 | Boxing Gloves | Yeti | ⬜ |
| W2 | Belt | Choco | ⬜ |
| W3 | Sabal | BLDC | ⬜ |
| W4 | Pet Cat (companion: also the cat walking with Dhruv) | Meow | ⬜ |
| W5 | Fairy Healer (companion: also the fairy flying with Dhruv) | Tharki | ⬜ |
| W6 | Hammer | Tyagi | ⬜ |
All 32×32.

## Priority 3: places
| Code | What | Size | |
|---|---|---|---|
| L1-L6 | Backgrounds: Library, Sports Complex, Deltech, Design Dept, Girls Hostel, Aryabhatta Hostel. **Best: your own landscape photo of each place, ideally at dusk.** I'll convert them to the game's dark pixel style | 800×480 (any 5:3 photo) | 🎨 |
| F1 | Title logo "DHRUVKAAT" | 400×100 | ⬜ |
| F2 | Campus map | 1672×941 | ✅ |

## Optional (built-in art already looks fine)
| Code | What | Size | |
|---|---|---|---|
| D1 / D5 | Ground surface / ground fill tile (seamless). Replaces the built-in college ground in **every** level | 32×32 | 🎨 |
| D2 | Ledge / moving platform tile (repeats sideways) | 32×16 | 🎨 |
| F3 | Heart icon | 16×16 | 🎨 |

---

## Audio → `assets/audio/<CODE>.mp3`
| Code | Sound | Length | Loops | |
|---|---|---|---|---|
| S1 | Jump | < 0.5s | | 🔊 |
| S2 | Attack swing | < 0.5s | | 🔊 |
| S3 | Hit an enemy | < 0.5s | | 🔊 |
| S4 | Dhruv hurt (a voice "ah!" works great) | < 1s | | 🔊 |
| S5 | Dhruv faints | 1-2s | | 🔊 |
| S6 | Boss power-up (each friend's voice line would be best) | 1-2s | | 🔊 |
| S7 | Level music | 1-3 min | ✔ | ⬜ |
| S8 | Boss fight music | 1-3 min | ✔ | ⬜ |
| S9 | Boss defeated | 1-3s | | 🔊 |
| S10 | New weapon / companion | 1-2s | | 🔊 |
| S11 | Campus map music | 1-2 min | ✔ | ⬜ |
| S12 | "Clink" (hit something unkillable) | < 0.5s | | 🔊 |
| S13 | Menu move | < 0.3s | | 🔊 |

🔊 = a free placeholder (Kenney "Digital Audio", CC0) plays until you send yours. Music only from sources you're allowed to use (your own, or royalty-free); no copied songs.

## Text (just tell me)
| Code | What | Now |
|---|---|---|
| T9 | Game title | "DHRUVKAAT" |
| T11 | Game-over line | "Dhruv fainted" |
| T31-T33 | Aunty's 3 catchphrases | placeholder |
| (none) | Each boss's power-up line | "*eats chicken*", "*drinks beer*", ... (in `src/data.js`) |
| Level 7 | Design: place (OAT on the map), boss, weapon, gimmick | not designed |
