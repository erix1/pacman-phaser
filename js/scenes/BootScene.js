class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // No assets to load - all graphics are programmatic
    }

    create() {
        this.scene.start('StartScene');
    }
}
