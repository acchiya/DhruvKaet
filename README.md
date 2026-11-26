# Dhruvkaat

A side-scrolling platformer starring me and my friends. Built with Phaser 3 (bundled in `lib/`, no install needed).

## Run
```bash
python3 -m http.server 8000
```
Then open http://localhost:8000. Opening `index.html` directly won't work, because browsers block local file loading.

**Controls:** ←/→ or A/D to move · Space/↑/W to jump · ↓/S to duck · Shift to dash (dash character)

## Structure
- `src/assets.js` holds every personalizable image, sound, name and ability
- `src/levels.js` holds the level layouts (grid of characters)
- `src/main.js` holds the game logic
- `ASSETS.md` is the checklist of everything to provide
