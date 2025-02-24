class ScoreGUI {
    constructor(game, scene, dice) {
        Object.assign(this, { game, dice });
        this.z = 100_000;
        this.isDone = false;
        this.gold = 0;
        this.elapsed = 0;
        [this.handName, this.handDesc, this.handMult] = score(dice);
        this.dice.forEach(die => {
            if (die.mult)
                this.handMult += die.mult;
        });
        this.roundGold = scene.roundGold;
        this.gold += scene.roundGold * this.handMult;
    }

    update() {
        this.elapsed += this.game.clockTick;
        
        if (this.elapsed >= 1.25)
            this.isDone = true;
    }

    draw(ctx) {
        ctx.textAlign = 'center';
        ctx.font = 'bold 80pt Comic Sans';
        ctx.fillText(this.handName, PARAMS.canvasWidth / 2, PARAMS.canvasHeight / 2 - 50);
        ctx.font = '30pt Courier';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${this.roundGold} × ${this.handMult}`, PARAMS.canvasWidth / 2, PARAMS.canvasHeight / 2 + 50);
    }
}
