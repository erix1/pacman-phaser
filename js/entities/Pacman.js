class Pacman {
    constructor(scene) {
        this.scene = scene;
        this.graphics = scene.add.graphics();
        this.graphics.setDepth(5);

        this.spawnCol = 13;
        this.spawnRow = 23;

        this.x = 0;
        this.y = 0;
        this.currentDir = DIR.LEFT;
        this.queuedDir = DIR.LEFT;

        this.mouthAngle = 0.25; // radians, 0 = closed, ~0.5 = wide open
        this.mouthOpen = true;
        this.mouthSpeed = 4; // radians per second

        this.alive = true;
        this.deathTimer = -1;

        this.reset();
    }

    reset() {
        const pos = MazeUtils.tileToWorld(this.spawnCol, this.spawnRow);
        this.x = pos.x;
        this.y = pos.y;
        this.currentDir = DIR.LEFT;
        this.queuedDir = DIR.LEFT;
        this.alive = true;
        this.deathTimer = -1;
        this.mouthAngle = 0.25;
    }

    setDirection(dir) {
        this.queuedDir = dir;
    }

    update(delta) {
        if (!this.alive) {
            this.updateDeath(delta);
            return;
        }

        const dt = delta / 1000;
        this.updateMouth(dt);

        // Try to apply queued direction at tile center
        const tile = MazeUtils.worldToTile(this.x, this.y);
        const tileCenter = MazeUtils.tileToWorld(tile.col, tile.row);
        const dx = Math.abs(this.x - tileCenter.x);
        const dy = Math.abs(this.y - tileCenter.y);

        if (dx <= SNAP_THRESHOLD && dy <= SNAP_THRESHOLD) {
            // Try queued direction
            const nextCol = tile.col + this.queuedDir.dx;
            const nextRow = tile.row + this.queuedDir.dy;
            if (!MazeUtils.isWall(nextCol, nextRow, false)) {
                this.currentDir = this.queuedDir;
                // Snap to tile center when changing direction
                if (this.queuedDir !== this.currentDir) {
                    this.x = tileCenter.x;
                    this.y = tileCenter.y;
                }
            }
        }

        // Move in current direction
        const speed = PACMAN_SPEED * dt;
        const nextX = this.x + this.currentDir.dx * speed;
        const nextY = this.y + this.currentDir.dy * speed;

        // Check wall collision ahead
        const lookAheadX = nextX + this.currentDir.dx * (TILE_SIZE / 2 - 1);
        const lookAheadY = nextY + this.currentDir.dy * (TILE_SIZE / 2 - 1);
        const lookTile = MazeUtils.worldToTile(lookAheadX, lookAheadY);

        if (!MazeUtils.isWall(lookTile.col, lookTile.row, false)) {
            this.x = nextX;
            this.y = nextY;
        } else {
            // Snap to tile center when hitting wall
            const currentTile = MazeUtils.worldToTile(this.x, this.y);
            const snap = MazeUtils.tileToWorld(currentTile.col, currentTile.row);
            this.x = snap.x;
            this.y = snap.y;
        }

        // Tunnel wrap
        if (this.x < 0) this.x = COLS * TILE_SIZE;
        if (this.x > COLS * TILE_SIZE) this.x = 0;

        this.draw();
    }

    updateMouth(dt) {
        if (this.mouthOpen) {
            this.mouthAngle += this.mouthSpeed * dt;
            if (this.mouthAngle >= 0.45) {
                this.mouthAngle = 0.45;
                this.mouthOpen = false;
            }
        } else {
            this.mouthAngle -= this.mouthSpeed * dt;
            if (this.mouthAngle <= 0.02) {
                this.mouthAngle = 0.02;
                this.mouthOpen = true;
            }
        }
    }

    updateDeath(delta) {
        if (this.deathTimer < 0) {
            this.deathTimer = 0;
        }
        this.deathTimer += delta;

        // Death spin animation
        const progress = Math.min(this.deathTimer / 1200, 1);
        const g = this.graphics;
        g.clear();

        if (progress >= 1) return;

        const radius = 6;
        const startAngle = progress * Math.PI * 2;
        const endAngle = Math.PI * 2 - progress * Math.PI * 0.5;

        if (endAngle - startAngle > 0.1) {
            g.fillStyle(COLORS.PACMAN, 1);
            g.slice(this.x, this.y, radius, startAngle, endAngle, false);
            g.fillPath();
        }
    }

    draw() {
        const g = this.graphics;
        g.clear();

        if (!this.alive && this.deathTimer >= 0) return;

        const radius = 7;
        const baseAngle = this.currentDir.angle;
        const mouth = this.mouthAngle;

        g.fillStyle(COLORS.PACMAN, 1);
        g.slice(
            this.x, this.y,
            radius,
            baseAngle + mouth,
            baseAngle + Math.PI * 2 - mouth,
            false
        );
        g.fillPath();
    }

    getTile() {
        return MazeUtils.worldToTile(this.x, this.y);
    }

    die() {
        this.alive = false;
        this.deathTimer = -1;
        this.currentDir = DIR.NONE;
        this.queuedDir = DIR.LEFT;
    }

    isDeathComplete() {
        return !this.alive && this.deathTimer >= 1200;
    }
}
