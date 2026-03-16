const TILE_SIZE = 16;
const COLS = 28;
const ROWS = 31;
const HUD_HEIGHT = 48;

const PACMAN_SPEED = 90; // pixels per second
const GHOST_SPEED = 75;
const GHOST_FRIGHTENED_SPEED = 45;
const GHOST_EATEN_SPEED = 140;

const FRIGHTENED_DURATION = 8000;
const SCATTER_DURATION = 7000;
const CHASE_DURATION = 20000;

const PELLET_SCORE = 10;
const POWER_PELLET_SCORE = 50;
const GHOST_EAT_SCORES = [200, 400, 800, 1600];

const SNAP_THRESHOLD = 2; // px: how close to tile center before direction change allowed

const COLORS = {
    WALL: 0x1a1aff,
    WALL_BORDER: 0x4444ff,
    FLOOR: 0x000000,
    PELLET: 0xffb8ae,
    POWER_PELLET: 0xffb8ae,
    PACMAN: 0xffff00,
    GHOST_FRIGHTENED: 0x0000cc,
    GHOST_FRIGHTENED_FLASH: 0xffffff,
    GHOST_EATEN: 0xffffff,
    UI_TEXT: 0xffffff,
    GHOST_HOUSE_DOOR: 0xffaaff,
};

const GHOST_COLORS = [0xff0000, 0xffb8ff, 0x00ffff, 0xffb852];

const DIR = {
    LEFT:  { dx: -1, dy:  0, angle: Math.PI },
    RIGHT: { dx:  1, dy:  0, angle: 0 },
    UP:    { dx:  0, dy: -1, angle: -Math.PI / 2 },
    DOWN:  { dx:  0, dy:  1, angle:  Math.PI / 2 },
    NONE:  { dx:  0, dy:  0, angle:  0 },
};

const DIR_KEYS = ['LEFT', 'RIGHT', 'UP', 'DOWN'];

// Ghost modes
const GHOST_MODE = {
    SCATTER: 'SCATTER',
    CHASE: 'CHASE',
    FRIGHTENED: 'FRIGHTENED',
    EATEN: 'EATEN',
    HOUSE: 'HOUSE',
};

// Tile types
const TILE = {
    EMPTY: 0,
    WALL: 1,
    PELLET: 2,
    POWER_PELLET: 3,
    DOOR: 4,     // ghost house door - ghosts pass, pacman cannot
    HOUSE: 5,    // ghost house interior
};
