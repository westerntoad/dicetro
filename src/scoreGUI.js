class ScoreGUI {
    constructor(game, scene, dice) {
        Object.assign(this, { game, scene, dice });
        this.z = 100_000;
        this.isDone = false;
        this.gold = 0;
        this.elapsed = 0;
        [this.handName, this.handDesc, this.handMult] = score(dice);
        this.roundMult = this.handMult += scene.roundMult;
        this.roundGold = scene.roundGold;
        this.gold += scene.roundGold * this.handMult;
        this.finishTime = 1.25;


        this.ssCount = scene.itemCount("Space Station");
        if (this.ssCount > 0) {
            this.ssOrig = {
                x: PARAMS.canvasWidth / 2 + 50 - Math.random() * 100,
                y: PARAMS.canvasHeight / 2 + 200
            }
            this.ssDest = { x: this.ssOrig.x, y: Math.max(this.ssOrig.y - 100, 0) }

            new Particle(this.game, this.ssOrig, this.ssDest, 1, `SPACE STATION ${scene.roundAltitude}m × ${this.ssCount}`, '#ADD8E6');
            this.finishTime += 0.7;
        }

    }

    update() {
        this.elapsed += this.game.clockTick;

        if (this.elapsed >= 0.3 && this.ssCount > 0 && !this.shownSS) {
            const amt = this.scene.roundAltitude * this.ssCount;
            this.roundGold += amt;
            new Particle(this.game, this.ssOrig, this.ssDest, 1, `$${amt}`, 'yellow');
            
            this.shownSS = true;
        }
        
        if (this.elapsed >= this.finishTime)
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
