class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // Reset maze
        MazeUtils.init();

        // Systems
        this.mazeRenderer = new MazeRenderer(this);
        this.mazeRenderer.draw();

        this.scoreSystem = new ScoreSystem(this);
        this.pelletManager = new PelletManager(this);

        // Entities
        this.pacman = new Pacman(this);

        // Ghosts: id, startCol, startRow, color
        this.ghosts = [
            new Ghost(this, 0, 13, 14, GHOST_COLORS[0]), // Blinky (red)
            new Ghost(this, 1, 11, 14, GHOST_COLORS[1]), // Pinky
            new Ghost(this, 2, 13, 14, GHOST_COLORS[2]), // Inky
            new Ghost(this, 3, 15, 14, GHOST_COLORS[3]), // Clyde
        ];

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up:    Phaser.Input.Keyboard.KeyCodes.W,
            down:  Phaser.Input.Keyboard.KeyCodes.S,
            left:  Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        });

        // Game state
        this.state = 'playing'; // 'playing' | 'dying' | 'respawning' | 'won' | 'lost'
        this.stateTimer = 0;

        // Score popup graphics
        this.scorePopups = [];

        // Ready text
        this.readyText = this.add.text(
            COLS * TILE_SIZE / 2,
            17 * TILE_SIZE,
            'READY!',
            { fontSize: '14px', fill: '#ffff00', fontFamily: 'monospace' }
        ).setOrigin(0.5).setDepth(20);

        this.time.delayedCall(2000, () => {
            if (this.readyText) this.readyText.destroy();
        });
    }

    update(time, delta) {
        if (this.state === 'won' || this.state === 'lost') return;

        this.stateTimer -= delta;

        if (this.state === 'dying') {
            this.pacman.update(delta);
            if (this.pacman.isDeathComplete()) {
                this.state = 'respawning';
                this.stateTimer = 1500;
            }
            return;
        }

        if (this.state === 'respawning') {
            if (this.stateTimer <= 0) {
                this.pacman.reset();
                this.ghosts.forEach(g => g.reset());
                this.state = 'playing';
            }
            return;
        }

        // Playing state
        this.handleInput();
        this.pacman.update(delta);
        this.ghosts.forEach(g => g.update(delta, this.pacman, this.ghosts));
        this.pelletManager.update(delta);
        this.updateScorePopups(delta);
        this.checkCollisions();
        this.checkWinLose();
    }

    handleInput() {
        const cursors = this.cursors;
        const wasd = this.wasd;

        if (cursors.left.isDown  || wasd.left.isDown)  this.pacman.setDirection(DIR.LEFT);
        if (cursors.right.isDown || wasd.right.isDown) this.pacman.setDirection(DIR.RIGHT);
        if (cursors.up.isDown    || wasd.up.isDown)    this.pacman.setDirection(DIR.UP);
        if (cursors.down.isDown  || wasd.down.isDown)  this.pacman.setDirection(DIR.DOWN);
    }

    checkCollisions() {
        // Pellet collection
        const pt = this.pacman.getTile();
        const collected = this.pelletManager.checkCollect(pt.col, pt.row);
        if (collected === 'pellet') {
            this.scoreSystem.eatPellet();
        } else if (collected === 'power') {
            this.scoreSystem.eatPowerPellet();
            this.scoreSystem.resetGhostCombo();
            this.ghosts.forEach(g => g.frighten());
        }

        // Ghost collisions
        for (const ghost of this.ghosts) {
            if (ghost.isEaten()) continue;

            const dist = Phaser.Math.Distance.Between(
                this.pacman.x, this.pacman.y,
                ghost.x, ghost.y
            );

            if (dist < TILE_SIZE * 0.75) {
                if (ghost.isFrightened()) {
                    ghost.eaten();
                    const points = this.scoreSystem.eatGhost();
                    this.showScorePopup(ghost.x, ghost.y, points);
                } else if (this.state === 'playing') {
                    this.killPacman();
                }
            }
        }
    }

    killPacman() {
        this.state = 'dying';
        this.pacman.die();

        // Hide ghosts during death
        this.ghosts.forEach(g => {
            g.graphics.setVisible(false);
        });

        const lives = this.scoreSystem.loseLife();

        this.time.delayedCall(1500, () => {
            this.ghosts.forEach(g => g.graphics.setVisible(true));
            if (lives <= 0) {
                this.time.delayedCall(500, () => {
                    this.endGame(false);
                });
            }
        });
    }

    showScorePopup(x, y, points) {
        const text = this.add.text(x, y, String(points), {
            fontSize: '12px',
            fill: '#00ffff',
            fontFamily: 'monospace',
        }).setOrigin(0.5).setDepth(20);

        this.scorePopups.push({ text, timer: 800, vy: -30 });
    }

    updateScorePopups(delta) {
        const dt = delta / 1000;
        for (let i = this.scorePopups.length - 1; i >= 0; i--) {
            const p = this.scorePopups[i];
            p.timer -= delta;
            p.text.y += p.vy * dt;
            p.text.alpha = Math.max(0, p.timer / 800);
            if (p.timer <= 0) {
                p.text.destroy();
                this.scorePopups.splice(i, 1);
            }
        }
    }

    checkWinLose() {
        if (this.pelletManager.isCleared()) {
            this.endGame(true);
        }
    }

    endGame(won) {
        this.state = won ? 'won' : 'lost';
        this.time.delayedCall(1500, () => {
            this.scene.start('EndScene', {
                won: won,
                score: this.scoreSystem.score,
            });
        });
    }
}
