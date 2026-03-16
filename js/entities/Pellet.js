class PelletManager {
    constructor(scene) {
        this.scene = scene;
        this.graphics = scene.add.graphics();
        this.graphics.setDepth(1);
        this.powerPelletGraphics = scene.add.graphics();
        this.powerPelletGraphics.setDepth(1);
        this.totalPellets = 0;
        this.remainingPellets = 0;
        this.powerPelletBlink = true;
        this.blinkTimer = 0;
        this.init();
    }

    init() {
        this.totalPellets = MazeUtils.countPellets();
        this.remainingPellets = this.totalPellets;
        this.draw();
    }

    draw() {
        const g = this.graphics;
        const pg = this.powerPelletGraphics;
        g.clear();
        pg.clear();

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const tile = MazeUtils.getTile(c, r);
                const cx = c * TILE_SIZE + TILE_SIZE / 2;
                const cy = r * TILE_SIZE + TILE_SIZE / 2;

                if (tile === TILE.PELLET) {
                    g.fillStyle(COLORS.PELLET, 1);
                    g.fillCircle(cx, cy, 2);
                } else if (tile === TILE.POWER_PELLET && this.powerPelletBlink) {
                    pg.fillStyle(COLORS.POWER_PELLET, 1);
                    pg.fillCircle(cx, cy, 5);
                }
            }
        }
    }

    update(delta) {
        this.blinkTimer += delta;
        if (this.blinkTimer > 350) {
            this.blinkTimer = 0;
            this.powerPelletBlink = !this.powerPelletBlink;
            this.draw();
        }
    }

    checkCollect(pacCol, pacRow) {
        const tile = MazeUtils.getTile(pacCol, pacRow);
        if (tile === TILE.PELLET) {
            MazeUtils.setTile(pacCol, pacRow, TILE.EMPTY);
            this.remainingPellets--;
            this.draw();
            return 'pellet';
        }
        if (tile === TILE.POWER_PELLET) {
            MazeUtils.setTile(pacCol, pacRow, TILE.EMPTY);
            this.remainingPellets--;
            this.draw();
            return 'power';
        }
        return null;
    }

    isCleared() {
        return this.remainingPellets <= 0;
    }
}
