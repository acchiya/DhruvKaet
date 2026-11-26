# Dhruvkaat

A 2D action game set at IIT Bawana: Dhruv fights his way through 6 campus locations, beats a friend-boss in each, and takes their weapon.

## Run
```bash
python3 -m http.server 8000 --bind 127.0.0.1
```
Then open http://localhost:8000 (from inside this folder).

## Controls
A/D move · W/Space jump (double jump) · S duck · Shift dash (invincible) · J/X or click attack · Q/E or 1-7 switch weapon · Esc back to map

Progress (cleared levels, weapons) is saved in the browser.

## Structure
- `src/data.js`: all tunable numbers: player, weapons, enemies, bosses, levels, map path
- `src/assets.js`: every image/sound code
- `src/art.js`: built-in art and placeholders
- `src/main.js`: game engine (map, level, combat, bosses)
- `ASSETS.md`: checklist of everything to provide
- `art-src/`: source images and scripts that build sprites
