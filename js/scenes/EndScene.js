class EndScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EndScene' });
    }

    init(data) {
        this.won = data.won || false;
        this.finalScore = data.score || 0;
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        this.add.rectangle(0, 0, W, H, 0x000000).setOrigin(0, 0);

        // Outcome title
        const titleText = this.won ? 'YOU  WIN!' : 'GAME  OVER';
        const titleColor = this.won ? '#ffff00' : '#ff0000';

        this.add.text(W / 2, H / 2 - 110, titleText, {
            fontSize: '36px',
            fill: titleColor,
            fontFamily: 'monospace',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5);

        // Score
        this.add.text(W / 2, H / 2 - 50, `SCORE: ${this.finalScore}`, {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'monospace',
        }).setOrigin(0.5);

        const hiScore = parseInt(localStorage.getItem('pacman_high_score') || '0', 10);
        this.add.text(W / 2, H / 2 - 20, `HI-SCORE: ${hiScore}`, {
            fontSize: '16px',
            fill: '#ffb852',
            fontFamily: 'monospace',
        }).setOrigin(0.5);

        if (this.finalScore >= hiScore && this.finalScore > 0) {
            const newRecord = this.add.text(W / 2, H / 2 + 10, '★ NEW RECORD! ★', {
                fontSize: '14px',
                fill: '#ffff00',
                fontFamily: 'monospace',
            }).setOrigin(0.5);

            this.tweens.add({
                targets: newRecord,
                alpha: 0,
                duration: 400,
                yoyo: true,
                repeat: -1,
            });
        }

        // Draw ghosts as decoration
        const g = this.add.graphics();
        for (let i = 0; i < 4; i++) {
            const gx = W / 2 - 48 + i * 32;
            const gy = H / 2 + 60;
            const col = this.won ? GHOST_COLORS[i] : COLORS.GHOST_FRIGHTENED;
            g.fillStyle(col, 1);
            g.fillCircle(gx, gy - 4, 10);
            g.fillRect(gx - 10, gy - 4, 20, 12);
        }

        const promptText = this.add.text(W / 2, H / 2 + 100, 'PRESS  SPACE  TO  PLAY  AGAIN', {
            fontSize: '14px',
            fill: '#ffffff',
            fontFamily: 'monospace',
        }).setOrigin(0.5);

        this.tweens.add({
            targets: promptText,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1,
        });

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('StartScene');
        });
        this.input.keyboard.once('keydown-ENTER', () => {
            this.scene.start('StartScene');
        });
    }
}
