class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        // Background
        this.add.rectangle(0, 0, W, H, 0x000000).setOrigin(0, 0);

        // Draw a mini ghost decoration
        const g = this.add.graphics();
        const ghostColors = GHOST_COLORS;
        for (let i = 0; i < 4; i++) {
            const gx = W / 2 - 48 + i * 32;
            const gy = H / 2 - 20;
            g.fillStyle(ghostColors[i], 1);
            g.fillCircle(gx, gy - 4, 10);
            g.fillRect(gx - 10, gy - 4, 20, 12);
            g.fillStyle(0xffffff, 1);
            g.fillCircle(gx - 3, gy - 6, 3);
            g.fillCircle(gx + 3, gy - 6, 3);
            g.fillStyle(0x0000aa, 1);
            g.fillCircle(gx - 3, gy - 6, 1.5);
            g.fillCircle(gx + 3, gy - 6, 1.5);
        }

        // PACMAN title
        this.add.text(W / 2, H / 2 - 100, 'PAC-MAN', {
            fontSize: '42px',
            fill: '#ffff00',
            fontFamily: 'monospace',
            fontStyle: 'bold',
            stroke: '#ff8800',
            strokeThickness: 4,
        }).setOrigin(0.5);

        this.add.text(W / 2, H / 2 + 30, 'PRESS  SPACE  TO  START', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'monospace',
        }).setOrigin(0.5);

        const hiScore = localStorage.getItem('pacman_high_score') || '0';
        this.add.text(W / 2, H / 2 + 60, `HI-SCORE: ${hiScore}`, {
            fontSize: '14px',
            fill: '#ffb852',
            fontFamily: 'monospace',
        }).setOrigin(0.5);

        this.add.text(W / 2, H - 30, '← → ↑ ↓  or  WASD to move', {
            fontSize: '11px',
            fill: '#888888',
            fontFamily: 'monospace',
        }).setOrigin(0.5);

        // Blink effect on "PRESS SPACE"
        this.time.addEvent({
            delay: 600,
            callback: () => {
                // handled by tween below
            },
        });

        const pressText = this.children.list.find(c => c.text && c.text.includes('PRESS'));
        if (pressText) {
            this.tweens.add({
                targets: pressText,
                alpha: 0,
                duration: 500,
                yoyo: true,
                repeat: -1,
            });
        }

        // Input
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('GameScene');
        });
        this.input.keyboard.once('keydown-ENTER', () => {
            this.scene.start('GameScene');
        });
    }
}
