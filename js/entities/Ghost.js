class Ghost {
    constructor(scene, id, startCol, startRow, color) {
        this.scene = scene;
        this.id = id;
        this.color = color;
        this.graphics = scene.add.graphics();
        this.graphics.setDepth(5);

        this.spawnCol = startCol;
        this.spawnRow = startRow;
        this.x = 0;
        this.y = 0;

        // Movement
        this.currentDirKey = 'LEFT';
        this.nextDirKey = null;
        this.atTileCenter = true;
        this.targetCol = 0;
        this.targetRow = 0;

        // Mode
        this.mode = GHOST_MODE.HOUSE;
        this.previousMode = GHOST_MODE.SCATTER;
        this.modeTimer = 0;
        this.houseTimer = id * 2000; // stagger house exit
        this.frightenedTimer = 0;
        this.frightenedFlash = false;
        this.flashTimer = 0;
        this.ghostComboAtEat = 0;

        this.reset();
    }

    reset() {
        const pos = MazeUtils.tileToWorld(this.spawnCol, this.spawnRow);
        this.x = pos.x;
        this.y = pos.y;
        this.currentDirKey = 'UP';
        this.nextDirKey = null;
        this.atTileCenter = true;
        this.mode = GHOST_MODE.HOUSE;
        this.modeTimer = 0;
        this.houseTimer = this.id * 2500;
        this.frightenedTimer = 0;
        this.frightenedFlash = false;
        this.flashTimer = 0;
    }

    frighten() {
        if (this.mode === GHOST_MODE.EATEN) return;
        if (this.mode !== GHOST_MODE.FRIGHTENED) {
            this.previousMode = this.mode;
        }
        this.mode = GHOST_MODE.FRIGHTENED;
        this.frightenedTimer = FRIGHTENED_DURATION;
        this.frightenedFlash = false;
        // Reverse direction
        const opp = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
        this.currentDirKey = opp[this.currentDirKey] || this.currentDirKey;
        this.nextDirKey = null;
    }

    eaten() {
        this.mode = GHOST_MODE.EATEN;
        this.frightenedTimer = 0;
    }

    setGlobalMode(mode) {
        if (this.mode === GHOST_MODE.FRIGHTENED || this.mode === GHOST_MODE.EATEN || this.mode === GHOST_MODE.HOUSE) return;
        const opp = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
        this.currentDirKey = opp[this.currentDirKey] || this.currentDirKey;
        this.nextDirKey = null;
        this.mode = mode;
        this.modeTimer = 0;
    }

    getSpeed() {
        switch (this.mode) {
            case GHOST_MODE.FRIGHTENED: return GHOST_FRIGHTENED_SPEED;
            case GHOST_MODE.EATEN: return GHOST_EATEN_SPEED;
            case GHOST_MODE.HOUSE: return GHOST_SPEED * 0.5;
            default: return GHOST_SPEED;
        }
    }

    computeTarget(pacman, ghosts) {
        if (this.mode === GHOST_MODE.EATEN) {
            // Head back to ghost house door
            return { col: 13, row: 12 };
        }

        if (this.mode === GHOST_MODE.FRIGHTENED) {
            // Random scatter - pick a random reachable adjacent tile
            return null;
        }

        if (this.mode === GHOST_MODE.SCATTER) {
            // Corner targets (must be walkable tiles inside maze bounds)
            const corners = [
                { col: 25, row: 1  }, // Blinky: top-right
                { col: 2,  row: 1  }, // Pinky:  top-left
                { col: 25, row: 29 }, // Inky:   bottom-right
                { col: 2,  row: 29 }, // Clyde:  bottom-left
            ];
            return corners[this.id % 4];
        }

        // CHASE mode - personality per ghost
        const pt = pacman.getTile();
        const dirObj = pacman.currentDir;

        switch (this.id) {
            case 0: // Blinky: target Pacman directly
                return { col: pt.col, row: pt.row };

            case 1: // Pinky: target 4 tiles ahead of Pacman
                return {
                    col: pt.col + dirObj.dx * 4,
                    row: pt.row + dirObj.dy * 4,
                };

            case 2: { // Inky: target using Blinky's position
                const blinky = ghosts[0];
                const bt = MazeUtils.worldToTile(blinky.x, blinky.y);
                const pivotCol = pt.col + dirObj.dx * 2;
                const pivotRow = pt.row + dirObj.dy * 2;
                return {
                    col: pivotCol + (pivotCol - bt.col),
                    row: pivotRow + (pivotRow - bt.row),
                };
            }

            case 3: { // Clyde: chase if far, scatter if close
                const dt = Math.abs(pt.col - MazeUtils.worldToTile(this.x, this.y).col) +
                           Math.abs(pt.row - MazeUtils.worldToTile(this.x, this.y).row);
                if (dt > 8) return { col: pt.col, row: pt.row };
                return { col: 0, row: 30 };
            }

            default:
                return { col: pt.col, row: pt.row };
        }
    }

    update(delta, pacman, ghosts) {
        const dt = delta / 1000;

        // House waiting
        if (this.mode === GHOST_MODE.HOUSE) {
            this.houseTimer -= delta;
            if (this.houseTimer <= 0) {
                this.mode = GHOST_MODE.SCATTER;
                this.modeTimer = 0;
                // Move to just above ghost house door
                const exitPos = MazeUtils.tileToWorld(13, 11);
                this.x = exitPos.x;
                this.y = exitPos.y;
                this.currentDirKey = 'LEFT';
            } else {
                // Bob up and down in house
                const bobCenter = MazeUtils.tileToWorld(this.spawnCol, this.spawnRow);
                this.x = bobCenter.x;
                this.y = bobCenter.y + Math.sin(Date.now() / 300 + this.id) * 3;
                this.draw();
                return;
            }
        }

        // Mode timers (scatter <-> chase)
        if (this.mode === GHOST_MODE.SCATTER || this.mode === GHOST_MODE.CHASE) {
            this.modeTimer += delta;
            if (this.mode === GHOST_MODE.SCATTER && this.modeTimer > SCATTER_DURATION) {
                this.setGlobalMode(GHOST_MODE.CHASE);
            } else if (this.mode === GHOST_MODE.CHASE && this.modeTimer > CHASE_DURATION) {
                this.setGlobalMode(GHOST_MODE.SCATTER);
            }
        }

        // Frightened timer
        if (this.mode === GHOST_MODE.FRIGHTENED) {
            this.frightenedTimer -= delta;
            this.flashTimer += delta;
            if (this.flashTimer > 200) {
                this.flashTimer = 0;
                this.frightenedFlash = !this.frightenedFlash;
            }
            if (this.frightenedTimer <= 0) {
                this.mode = this.previousMode;
                this.frightenedFlash = false;
            }
        }

        // Movement
        const speed = this.getSpeed() * dt;
        const tile = MazeUtils.worldToTile(this.x, this.y);
        const center = MazeUtils.tileToWorld(tile.col, tile.row);
        const dx = this.x - center.x;
        const dy = this.y - center.y;

        // At tile center: pick next direction
        if (Math.abs(dx) <= speed + 1 && Math.abs(dy) <= speed + 1) {
            this.x = center.x;
            this.y = center.y;

            if (!this.nextDirKey) {
                this.nextDirKey = this.pickNextDir(tile.col, tile.row, pacman, ghosts);
            }

            if (this.nextDirKey) {
                this.currentDirKey = this.nextDirKey;
                this.nextDirKey = null;
            }
        }

        // Move in current direction
        const d = DIR[this.currentDirKey] || DIR.LEFT;
        const newX = this.x + d.dx * speed;
        const newY = this.y + d.dy * speed;

        // Wall check
        const lookX = newX + d.dx * (TILE_SIZE / 2 - 1);
        const lookY = newY + d.dy * (TILE_SIZE / 2 - 1);
        const lookTile = MazeUtils.worldToTile(lookX, lookY);

        if (!MazeUtils.isWall(lookTile.col, lookTile.row, true)) {
            this.x = newX;
            this.y = newY;
        }

        // Tunnel wrap (snap to opposite tile center)
        if (this.x <= 0) this.x = (COLS - 1) * TILE_SIZE + TILE_SIZE / 2;
        if (this.x >= COLS * TILE_SIZE) this.x = TILE_SIZE / 2;

        // Re-enter ghost house when eaten
        if (this.mode === GHOST_MODE.EATEN) {
            const myTile = MazeUtils.worldToTile(this.x, this.y);
            if (myTile.col === 13 && myTile.row >= 13 && myTile.row <= 15) {
                this.mode = GHOST_MODE.SCATTER;
                this.modeTimer = 0;
                const spawnPos = MazeUtils.tileToWorld(this.spawnCol, this.spawnRow);
                this.x = spawnPos.x;
                this.y = spawnPos.y;
                this.currentDirKey = 'UP';
                this.nextDirKey = null;
            }
        }

        this.draw();
    }

    pickNextDir(col, row, pacman, ghosts) {
        if (this.mode === GHOST_MODE.FRIGHTENED) {
            // Random direction
            const options = [];
            const opp = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
            for (const key of DIR_KEYS) {
                if (key === opp[this.currentDirKey]) continue;
                const d = DIR[key];
                if (!MazeUtils.isWall(col + d.dx, row + d.dy, true)) {
                    options.push(key);
                }
            }
            if (options.length === 0) return opp[this.currentDirKey];
            return options[Math.floor(Math.random() * options.length)];
        }

        const target = this.computeTarget(pacman, ghosts);
        if (!target) {
            return this.pickNextDir_random(col, row);
        }

        // Clamp target to bounds
        const tc = Math.max(0, Math.min(COLS - 1, target.col));
        const tr = Math.max(0, Math.min(ROWS - 1, target.row));

        const dirKey = MazeUtils.bfsNextDir(col, row, tc, tr, true, this.currentDirKey);
        return dirKey || this.currentDirKey;
    }

    pickNextDir_random(col, row) {
        const opp = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
        const options = [];
        for (const key of DIR_KEYS) {
            if (key === opp[this.currentDirKey]) continue;
            const d = DIR[key];
            if (!MazeUtils.isWall(col + d.dx, row + d.dy, true)) {
                options.push(key);
            }
        }
        if (options.length === 0) return opp[this.currentDirKey];
        return options[Math.floor(Math.random() * options.length)];
    }

    draw() {
        const g = this.graphics;
        g.clear();

        let bodyColor = this.color;
        if (this.mode === GHOST_MODE.FRIGHTENED) {
            bodyColor = this.frightenedFlash ? COLORS.GHOST_FRIGHTENED_FLASH : COLORS.GHOST_FRIGHTENED;
        } else if (this.mode === GHOST_MODE.EATEN) {
            bodyColor = COLORS.GHOST_EATEN;
        }

        const r = 7;
        const x = this.x;
        const y = this.y;

        if (this.mode === GHOST_MODE.EATEN) {
            // Just draw eyes
            this.drawEyes(g, x, y, true);
            return;
        }

        // Body: half circle on top + rectangle on bottom with wavy bottom
        g.fillStyle(bodyColor, 1);
        g.fillCircle(x, y - 1, r);
        g.fillRect(x - r, y - 1, r * 2, r + 1);

        // Wavy bottom (3 bumps)
        const bumpR = r / 3;
        for (let i = 0; i < 3; i++) {
            g.fillCircle(x - r + bumpR + i * bumpR * 2, y + r, bumpR);
        }

        // Eyes (only when not frightened)
        if (this.mode !== GHOST_MODE.FRIGHTENED) {
            this.drawEyes(g, x, y, false);
        } else {
            // Frightened face: two dots + squiggly mouth
            g.fillStyle(0xffffff, 1);
            g.fillCircle(x - 2, y - 1, 1.5);
            g.fillCircle(x + 2, y - 1, 1.5);
        }
    }

    drawEyes(g, x, y, eaten) {
        const eyeColor = eaten ? 0x00aaff : 0xffffff;
        const pupilColor = 0x0000aa;

        // Get direction for pupil offset
        const d = DIR[this.currentDirKey] || DIR.LEFT;

        g.fillStyle(eyeColor, 1);
        g.fillCircle(x - 2.5, y - 2, 2.5);
        g.fillCircle(x + 2.5, y - 2, 2.5);

        g.fillStyle(pupilColor, 1);
        g.fillCircle(x - 2.5 + d.dx * 1.2, y - 2 + d.dy * 1.2, 1.5);
        g.fillCircle(x + 2.5 + d.dx * 1.2, y - 2 + d.dy * 1.2, 1.5);
    }

    getTile() {
        return MazeUtils.worldToTile(this.x, this.y);
    }

    isFrightened() {
        return this.mode === GHOST_MODE.FRIGHTENED;
    }

    isEaten() {
        return this.mode === GHOST_MODE.EATEN;
    }
}
