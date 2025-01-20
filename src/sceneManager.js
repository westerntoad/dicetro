class SceneManager {
    constructor(game) {
        Object.assign(this, { game });
        this.diceOnClick = 5;
        this.game.click = null;
        this.shouldThrow = true;
        this.overlay = [];
        this.overlaySheet = ASSET_MANAGER.get('assets/dice-overlay.png');
        this.z = -1;
    }

    update() {
        if (this.game.click && this.shouldThrow) {
            for (let i = 0; i < this.diceOnClick; i++) {
                this.game.addEntity(new Dice(this.game, this, this.game.click));
            }
            this.shouldThrow = false;
            this.game.click = null;
        } else if (this.game.click) {
            this.game.clearDice();
            this.overlay = [];
            this.shouldThrow = true;
            this.game.click = null;
        }
    }

    draw(ctx) {
        // TEMP FELT TABLE
        ctx.fillStyle = 'green';
        ctx.fillRect(0, PARAMS.canvasHeight - 100, PARAMS.canvasWidth, 100)

        // overlay
        const overlayScale = 4;
        const size = 32 * overlayScale;
        for (let i = 0; i < this.overlay.length; i++) {
            ctx.drawImage(this.overlaySheet,
                32 * (this.overlay[i] - 1), 0,
                32, 32,
                Math.floor(((size * i) % PARAMS.canvasWidth) / size) * size,
                Math.floor(size * i / PARAMS.canvasWidth) * size,
                32 * overlayScale, 32 * overlayScale
            );
        }
    }
}
