# Dhruvkaat

A 2D action game set at IIT Bawana: Dhruv fights his way through 6 campus locations, beats a friend-boss in each, and takes their weapon.

## Run
```bash
python3 -m http.server 8000 --bind 127.0.0.1
```
Then open http://localhost:8000 (from inside this folder).

## Controls
| Action | Keyboard | Gamepad |
|---|---|---|
| Move | A/D or ←/→ | Left stick / D-pad |
| Jump (double jump; jump off walls) | W / ↑ / Space | A (Cross) |
| Wall slide | hold toward a wall in the air | same |
| Duck | S / ↓ | Down |
| Drop through a ledge | S + jump | Down + A |
| Attack | J / K / X / click | X (Square) |
| Dash (invincible) | Shift | B (Circle) / RT |
| Switch weapon | Q / E, or 1-7 | LB / RB |
| Pause (Resume / Restart / Quit) | Esc / P | Start |

Gamepad: press any button once after plugging in. Unplugging it mid-level pauses the game.

Falling into a pit costs 1 heart and puts you back on the last safe ground.

Progress (cleared levels, weapons) is saved in the browser.

## Structure
- `src/data.js`: all tunable numbers: player, weapons, enemies, bosses, levels, map path
- `src/assets.js`: every image/sound code
- `src/art.js`: built-in art (sky, parallax forest, soil, grass, plants) and placeholders
- `src/terrain.js`: uneven terrain + parkour generator (hills, pits, climb walls, ledges)
- `src/controls.js`: keyboard + gamepad input
- `src/main.js`: game engine (map, level, combat, bosses)
- `ASSETS.md`: checklist of everything to provide
- `art-src/`: source images and scripts that build sprites

## Credits
Default sound effects: "Digital Audio" by Kenney (www.kenney.nl), CC0, in `assets/audio/default/`.
All other art is drawn in code or provided by us.
