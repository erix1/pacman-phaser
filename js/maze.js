// Classic Pacman maze layout (28 cols x 31 rows)
// 0=empty, 1=wall, 2=pellet, 3=power pellet, 4=ghost door, 5=ghost house
const MAZE_TEMPLATE = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,3,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,3,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
    [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,4,4,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,5,5,5,5,5,5,1,0,1,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,0,2,0,0,0,1,5,5,5,5,5,5,1,0,0,0,2,0,0,0,0,0,0],
    [1,1,1,1,1,1,2,1,1,0,1,5,5,5,5,5,5,1,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,3,2,2,1,1,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,1,1,2,2,3,1],
    [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
    [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
    [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
    [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// Mutable copy used at runtime
let MAZE_DATA = [];

const MazeUtils = {
    init() {
        MAZE_DATA = MAZE_TEMPLATE.map(row => [...row]);
    },

    getTile(col, row) {
        if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return TILE.WALL;
        return MAZE_DATA[row][col];
    },

    setTile(col, row, value) {
        if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
            MAZE_DATA[row][col] = value;
        }
    },

    isWall(col, row, isGhost = false) {
        const t = this.getTile(col, row);
        if (t === TILE.WALL) return true;
        if (t === TILE.DOOR) return !isGhost;
        return false;
    },

    isWalkable(col, row, isGhost = false) {
        return !this.isWall(col, row, isGhost);
    },

    worldToTile(x, y) {
        return {
            col: Math.floor(x / TILE_SIZE),
            row: Math.floor(y / TILE_SIZE),
        };
    },

    tileToWorld(col, row) {
        return {
            x: col * TILE_SIZE + TILE_SIZE / 2,
            y: row * TILE_SIZE + TILE_SIZE / 2,
        };
    },

    countPellets() {
        let count = 0;
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const t = MAZE_DATA[r][c];
                if (t === TILE.PELLET || t === TILE.POWER_PELLET) count++;
            }
        }
        return count;
    },

    // BFS from (startCol, startRow) to (targetCol, targetRow), returns next step direction key or null
    bfsNextDir(startCol, startRow, targetCol, targetRow, isGhost = true, forbiddenDir = null) {
        if (startCol === targetCol && startRow === targetRow) return null;

        const queue = [{ col: startCol, row: startRow, path: [] }];
        const visited = new Set();
        visited.add(`${startCol},${startRow}`);

        const dirList = [
            { key: 'UP',    dc: 0,  dr: -1 },
            { key: 'LEFT',  dc: -1, dr: 0  },
            { key: 'DOWN',  dc: 0,  dr: 1  },
            { key: 'RIGHT', dc: 1,  dr: 0  },
        ];

        // Opposite directions map
        const opposite = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };

        while (queue.length > 0) {
            const { col, row, path } = queue.shift();

            for (const d of dirList) {
                // Don't reverse direction (unless starting and forbidden)
                if (path.length === 0 && forbiddenDir && d.key === opposite[forbiddenDir]) continue;

                const nc = col + d.dc;
                const nr = row + d.dr;

                // Handle tunnel wrap
                const wc = ((nc % COLS) + COLS) % COLS;
                const wr = nr;

                const key = `${wc},${wr}`;
                if (visited.has(key)) continue;
                if (MazeUtils.isWall(wc, wr, isGhost)) continue;

                const newPath = path.length === 0 ? [d.key] : path;

                if (wc === targetCol && wr === targetRow) {
                    return newPath[0];
                }

                visited.add(key);
                queue.push({ col: wc, row: wr, path: newPath });
            }
        }

        return null; // no path found
    },
};
