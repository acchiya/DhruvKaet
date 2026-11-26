# Placeholder checklist

Every placeholder in the game shows its code (e.g. `#B1`). Give me the file or text for a code and it replaces the placeholder. Missing items stay as colored boxes, so the game always runs.

Status: ✅ done · 🎨 has built-in art (replace if you want) · ⬜ needed · 🔧 mechanic not built yet

## A: Player
| Code | What | Size | Status |
|---|---|---|---|
| A1 | Dhruv: 11-frame spritesheet (idle 0-2, run 3-6, jump 7-9, duck 10) | 96×128 per frame | ✅ |

## B: Mini enemies (6)
| Code | What | Size | Status |
|---|---|---|---|
| B1 | Walker: patrols the ground | 32×32 | ⬜ art |
| B2 | Flyer: bobs in the air | 32×32 | ⬜ art |
| B3 | Hopper: jumps around | 32×32 | ⬜ art · 🔧 |
| B4 | Shooter: fires at head height (this is what duck is for) | 32×32 | ⬜ art · 🔧 |
| B5 | Charger: rushes you when it sees you | 32×32 | ⬜ art · 🔧 |
| B6 | Spiky: can't be stomped, only avoided | 32×32 | ⬜ art · 🔧 |

The behaviors are my suggestions. Tell me if a friend should do something else.

## G: Main bosses (6)
| Code | What | Size | Status |
|---|---|---|---|
| G1–G5 | Bosses 1–5 | 96×96 | ⬜ art · 🔧 |
| G6 | Final boss | 96×96 | ⬜ art · 🔧 |

For each boss I need: **who it is, 2–3 attacks, and how Dhruv damages it.**

## H: Projectiles
| Code | What | Size | Status |
|---|---|---|---|
| H1 | Mini-enemy projectile | 16×16 | ⬜ · 🔧 |
| H2 | Boss projectile | 24×24 | ⬜ · 🔧 |

## C: Items
| Code | What | Size | Status |
|---|---|---|---|
| C1 | Coin / collectible | 20×20 | ⬜ |
| C2 | Power-up (makes Dhruv big and gives one extra hit) | 28×28 | ⬜ |
| C3 | Finish flag | 32×96 | ⬜ |
| C4 | Extra life | 28×28 | ⬜ · 🔧 |

## D: Tiles
| Code | What | Size | Status |
|---|---|---|---|
| D1 | Grass ground | 32×32 | 🎨 |
| D5 | Dirt ground | 32×32 | 🎨 |
| D2 | Breakable brick | 32×32 | ⬜ |
| D3 | Surprise block | 32×32 | ⬜ |
| D4 | Used surprise block | 32×32 | ⬜ |

## E / L: Backgrounds
| Code | What | Size | Status |
|---|---|---|---|
| E1 | Default sky | 800×480 | 🎨 |
| E2 | Clouds layer (transparent) | 800×240 | 🎨 |
| L1–L7 | One background per level (optional, falls back to E1) | 800×480 | ⬜ optional · 🔧 |

## F: UI
| Code | What | Size | Status |
|---|---|---|---|
| F1 | Title logo | 400×100 | ⬜ |

## S: Audio → `assets/audio/<CODE>.mp3` (all optional)
| Code | What |
|---|---|
| S1 | Jump |
| S2 | Coin |
| S3 | Power-up |
| S4 | Stomp |
| S5 | Hurt / death |
| S6 | Level complete |
| S7 | Level music (loops) |
| S8 | Boss music 🔧 |
| S9 | Boss hit 🔧 |
| S10 | Boss defeated 🔧 |

## T: Text (just tell me)
| Code | What |
|---|---|
| T5 | Dhruv's tagline |
| T9 | Game title |
| T10 | Level-clear message |
| T11 | Game-over message |
| T12–T18 | Names of levels 1–7 |
| T19–T24 | Names of bosses 1–6 |
| T25–T30 | Names of mini enemies 1–6 |

Image files go in `assets/images/<CODE>.png` (transparent PNG; larger is fine if the aspect ratio matches).
