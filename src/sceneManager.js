class SceneManager {
    constructor(game) {
        Object.assign(this, { game });
        this.diceOnClick = 3;
        this.game.click = null;
        this.z = -1;
    }

    update() {
        if (this.game.click) {
            for (let i = 0; i < this.diceOnClick; i++) {
                this.game.addEntity(new Dice(this.game, this.game.click));
            }
            this.game.click = null;
        }
    }

    draw(ctx) {
        // TEMP FELT TABLE
        ctx.fillStyle = 'green';
        ctx.fillRect(0, PARAMS.canvasHeight - 100, PARAMS.canvasWidth, 100)
    }
}
