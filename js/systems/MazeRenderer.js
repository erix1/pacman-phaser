class MazeRenderer {
    constructor(scene) {
        this.scene = scene;
        this.graphics = scene.add.graphics();
        this.graphics.setDepth(0);
    }

    draw() {
        const g = this.graphics;
        g.clear();

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const tile = MazeUtils.getTile(c, r);
                const x = c * TILE_SIZE;
                const y = r * TILE_SIZE;

                if (tile === TILE.WALL) {
                    g.fillStyle(COLORS.WALL, 1);
                    g.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    // Inner border effect
                    g.fillStyle(COLORS.WALL_BORDER, 1);
                    g.fillRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
                    g.fillStyle(COLORS.WALL, 1);
                    g.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
                } else if (tile === TILE.DOOR) {
                    g.fillStyle(COLORS.GHOST_HOUSE_DOOR, 1);
                    g.fillRect(x, y + 6, TILE_SIZE * 2, 4);
                }
            }
        }
    }
}
