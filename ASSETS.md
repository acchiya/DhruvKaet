# Personalization checklist

Every placeholder in the game shows its code (e.g. `#A1`). Give me the file or text for a code and it replaces the placeholder. Missing items just stay as colored boxes, so the game always runs.

## Images → `assets/images/<CODE>.png` (transparent PNG)

| Code | What | Draw size (px) | Notes |
|---|---|---|---|
| A1 | Dhruv (player) | 96×128 per frame | **Done.** Spritesheet, 11 frames: idle 0-2, run 3-6, jump 7-9, duck 10. Built by `art-src/make_a1_sheet.py` |
| B1 | Walking enemy | 32×32 | Facing **left** |
| B2 | Flying enemy | 32×32 | Facing left |
| C1 | Coin / collectible | 20×20 | Doesn't have to be a coin: a face, a snack, anything |
| C2 | Power-up | 28×28 | Makes you bigger and lets you take 1 hit |
| C3 | Finish flag / goal | 32×96 | Tall and thin |
| D1 | Grass ground (top layer) | 32×32 | Has built-in art; replace if you want |
| D5 | Dirt ground (under grass) | 32×32 | Has built-in art |
| D2 | Breakable brick | 32×32 | |
| D3 | Surprise block | 32×32 | |
| D4 | Used surprise block | 32×32 | |
| E1 | Sky background | 800×480 | Has built-in art |
| E2 | Clouds layer | 800×240 | Transparent PNG, scrolls slowly; has built-in art |
| F1 | Title logo | 400×100 | |

Bigger PNGs are fine if the **aspect ratio** matches (e.g. 64×96 for a character).

## Audio → `assets/audio/<CODE>.mp3` (optional)

| Code | What |
|---|---|
| S1 | Jump |
| S2 | Coin |
| S3 | Power-up |
| S4 | Stomp enemy |
| S5 | Hurt / death |
| S6 | Level complete |
| S7 | Background music (loops) |

Voice clips of your friends work well here.

## Text → just tell me (lives in `src/assets.js`)

| Code | What |
|---|---|
| T5 | Dhruv's tagline (optional) |
| T9 | Game title |
| T10 | Win message |
| T11 | Game-over message |

## Gameplay decisions (tell me)

- Dhruv's ability. Built in: `doubleJump` (current), `dash`, `highJump`, `float`.
- What the enemies are and what the power-up is (inside jokes go here).
- How many levels.
