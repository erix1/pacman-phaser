# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Game

No build step required. Open `index.html` in a browser, or serve locally:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

A local server is required (not `file://`) due to CORS restrictions when loading JS modules via script tags in some browsers.

## Stack

- **Phaser 3.88.2** loaded via CDN (`cdn.jsdelivr.net`)
- Vanilla JS (no bundler, no npm, no modules)
- All graphics are programmatic (no image assets)

## Project Structure

```
index.html              Entry point — loads scripts in dependency order, configures Phaser.Game
js/constants.js         All magic numbers: tile size, speeds, timings, colors, tile type enums
js/maze.js              MAZE_DATA array (28×31), MazeUtils helpers (isWall, BFS pathfinding, coord conversion)
js/systems/
  MazeRenderer.js       Draws maze walls once using Phaser Graphics
  ScoreSystem.js        Score, lives, hi-score (localStorage), HUD text
js/entities/
  Pellet.js             PelletManager — tracks remaining dots, draws pellets, handles collection
  Ghost.js              Ghost class — BFS pathfinding, mode state machine (SCATTER/CHASE/FRIGHTENED/EATEN/HOUSE)
  Pacman.js             Pacman — tile-snapped movement, mouth animation, death animation
js/scenes/
  BootScene.js          Minimal boot, immediately starts StartScene
  StartScene.js         Title screen
  GameScene.js          Main game loop — orchestrates all entities/systems, handles collisions
  EndScene.js           Win/lose screen with final score
```

## Architecture Notes

**Global variable loading order matters.** Scripts are loaded via `<script>` tags in `index.html`. All constants from `constants.js` (TILE_SIZE, DIR, GHOST_MODE, TILE, etc.) must be available before any other file. Never use ES modules (`import`/`export`).

**Coordinate system:** The maze is 28×31 tiles of 16px each. Entity positions (`x`, `y`) are pixel coordinates. Use `MazeUtils.worldToTile()` and `MazeUtils.tileToWorld()` to convert. The HUD occupies 48px below the maze.

**Maze data:** `MAZE_TEMPLATE` in `maze.js` is the static layout. `MazeUtils.init()` copies it into `MAZE_DATA` (mutable). Always call `MazeUtils.init()` at the start of `GameScene.create()` to reset pellets.

**Collision:** Tile-based. Wall checks use a lookahead pixel (`TILE_SIZE/2 - 1` in the movement direction). Ghost-Pacman collision uses pixel distance (`< TILE_SIZE * 0.75`).

**Ghost movement:** Ghosts pick a new direction each time they reach a tile center (not every frame). BFS runs from current tile to target tile; result is cached until next tile center. Ghost house uses tile types `TILE.DOOR` (passable by ghosts, not Pacman) and `TILE.HOUSE`.

**Scene data passing:** `GameScene` passes `{ won, score }` to `EndScene` via `this.scene.start('EndScene', data)`, received in `EndScene.init(data)`.
