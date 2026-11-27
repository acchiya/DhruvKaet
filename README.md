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
| Switch weapon | Q / E, or 1-5 | LB / RB |
| Pause (Resume / Restart / Quit) | Esc / P | Start |

Gamepad: press any button once after plugging in. Unplugging it mid-level pauses the game.

Weapons: Fists, Boxing Gloves, Belt, Sabal, Hammer. The Pet Cat and Fairy Healer are companions: once won they're always with you.

Falling into a pit costs 1 heart and puts you back on the last safe ground.

**Test mode:** press **T** on the campus map (or open `http://localhost:8000/?test`). Every level opens, Dhruv has every weapon and both companions, keys **1-6** (top row or numpad) jump straight into a level, and nothing is saved. Without test mode, 1-6 open any level you have already unlocked. Press T again to go back to your real progress.

Progress (cleared levels, weapons) is saved in the browser.

## Structure
- `src/data.js`: all tunable numbers: player, weapons, enemies, bosses, levels, map path
- `src/assets.js`: every image/sound code
- `src/art.js`: built-in art (sky, parallax forest, soil, grass, plants) and placeholders
- `src/terrain.js`: uneven terrain + parkour generator (bumpy ground, pits, pillar hops, climb walls, ledges, moving platforms, elevators)
- `src/theme.js`: college look per area (paving, running track, road, classroom floor, hostel pavers/concrete) + campus props and backdrop
- `src/controls.js`: keyboard + gamepad input
- `src/main.js`: game engine (map, level, combat, bosses)
- `ASSETS.md`: checklist of everything to provide
- `art-src/`: source images and scripts that build sprites

## Credits
Default sound effects: "Digital Audio" by Kenney (www.kenney.nl), CC0, in `assets/audio/default/`.
All other art is drawn in code or provided by us.
