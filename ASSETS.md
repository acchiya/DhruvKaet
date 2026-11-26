# Personalization checklist

Every placeholder in the game shows its code (e.g. `#A1`). Give me the file or text for a code and it replaces the placeholder. Missing items just stay as colored boxes, so the game always runs.

## Images → `assets/images/<CODE>.png` (transparent PNG)

| Code | What | Draw size (px) | Notes |
|---|---|---|---|
| A1 | Friend 1 character | 32×48 | Facing **right**, full body, transparent background |
| A2 | Friend 2 character | 32×48 | same |
| A3 | Friend 3 character | 32×48 | same |
| A4 | Friend 4 character | 32×48 | same |
| B1 | Walking enemy | 32×32 | Facing **left** |
| B2 | Flying enemy | 32×32 | Facing left |
| C1 | Coin / collectible | 20×20 | Doesn't have to be a coin: a face, a snack, anything |
| C2 | Power-up | 28×28 | Makes you bigger and lets you take 1 hit |
| C3 | Finish flag / goal | 32×96 | Tall and thin |
| D1 | Ground tile | 32×32 | Must tile seamlessly |
| D2 | Breakable brick | 32×32 | |
| D3 | Surprise block | 32×32 | |
| D4 | Used surprise block | 32×32 | |
| E1 | Level 1 background | 800×480 | |
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
| T1–T4 | Friend 1–4 names |
| T5–T8 | One-line tagline per friend |
| T9 | Game title |
| T10 | Win message |
| T11 | Game-over message |

## Gameplay decisions (tell me)

- Ability per friend. Built in: `doubleJump`, `dash`, `highJump`, `float`. Ask for new ones.
- What the enemies are and what the power-up is (inside jokes go here).
- How many friends (currently 4) and how many levels.
