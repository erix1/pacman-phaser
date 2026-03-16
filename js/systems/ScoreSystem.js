class ScoreSystem {
    constructor(scene) {
        this.scene = scene;
        this.score = 0;
        this.lives = 3;
        this.ghostCombo = 0; // resets on non-frightened ghost or when power pellet expires
        this.highScore = parseInt(localStorage.getItem('pacman_high_score') || '0', 10);

        const hudY = ROWS * TILE_SIZE + 8;

        this.scoreLabel = scene.add.text(8, hudY, 'SCORE', {
            fontSize: '10px', fill: '#ffffff', fontFamily: 'monospace'
        }).setDepth(10);

        this.scoreText = scene.add.text(8, hudY + 12, '0', {
            fontSize: '14px', fill: '#ffffff', fontFamily: 'monospace'
        }).setDepth(10);

        this.hiLabel = scene.add.text(COLS * TILE_SIZE / 2 - 20, hudY, 'HI-SCORE', {
            fontSize: '10px', fill: '#ffffff', fontFamily: 'monospace'
        }).setDepth(10);

        this.hiText = scene.add.text(COLS * TILE_SIZE / 2 - 20, hudY + 12, String(this.highScore), {
            fontSize: '14px', fill: '#ffffff', fontFamily: 'monospace'
        }).setDepth(10);

        this.livesText = scene.add.text(COLS * TILE_SIZE - 60, hudY + 6, '♥ ♥ ♥', {
            fontSize: '14px', fill: '#ff0000', fontFamily: 'monospace'
        }).setDepth(10);
    }

    addScore(points) {
        this.score += points;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('pacman_high_score', String(this.highScore));
            this.hiText.setText(String(this.highScore));
        }
        this.scoreText.setText(String(this.score));
    }

    eatPellet() {
        this.ghostCombo = 0;
        this.addScore(PELLET_SCORE);
    }

    eatPowerPellet() {
        this.ghostCombo = 0;
        this.addScore(POWER_PELLET_SCORE);
    }

    eatGhost() {
        const points = GHOST_EAT_SCORES[Math.min(this.ghostCombo, GHOST_EAT_SCORES.length - 1)];
        this.ghostCombo++;
        this.addScore(points);
        return points;
    }

    resetGhostCombo() {
        this.ghostCombo = 0;
    }

    loseLife() {
        this.lives--;
        this.updateLivesDisplay();
        return this.lives;
    }

    updateLivesDisplay() {
        const hearts = Array(Math.max(0, this.lives)).fill('♥').join(' ');
        this.livesText.setText(hearts);
    }

    reset() {
        this.score = 0;
        this.lives = 3;
        this.ghostCombo = 0;
        this.scoreText.setText('0');
        this.updateLivesDisplay();
    }
}
