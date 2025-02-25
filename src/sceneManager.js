class SceneManager {
    constructor(game) {
        Object.assign(this, { game });
        this.z = -1;
        this.shouldThrow = true;
        this.firstClick = true;
        this.overlay = [];
        this.roundGold = 0;
        this.roundMult = 0;
        // weird order to make sure dice are displayed correctly
        if (PARAMS.debug) {
            this.dice = [
                //{ sides: [1, 3, 6, 4, 5, 2] }
                { sides: [1, 3, 6, 4, 5, 2], body: "normal", mod: "wings"},
                //{ sides: [1, 3, 6, 4, 5, 2], body: "bouncy" },
                //{ sides: [1, 3, 6, 4, 5, 2], body: "gold" },
                //{ sides: [1, 3, 6, 4, 5, 2], body: "ghost" }
                //{ sides: [1, 3, 6, 4, 5, 2], mult: [0, 0, 0, 0, 0, 0], body: "gold", mod: "none" }
            ];
        } else {
            this.dice = [ { sides: [1, 3, 6, 4, 5, 2] } ];
        }
        this.inShop = false;
        this.scoreDelay = 0;
        this.shopDelay = 1.25;
        this.diceSlotsUnlocked = [ true, true, false, false, false, false ];
        //this.shopDelay = 1000000000;
        this.shopDelayElapsed = 0;
        this.gold = PARAMS.debug ? 0 : 0;
        this.rerolls = PARAMS.initialRolls;
        this.score = 1;
        this.extraRollCost = 1;
        this.previousExtraRollCost = 1;
        this.diceControlDisabled = false;
        this.uncommonChance = PARAMS.baseUncommonChance;
        this.rareChance = PARAMS.baseRareChance;
        this.passives = [];

        this.overlaySheet = ASSET_MANAGER.get('assets/dice-overlay.png');
        this.multSheet = ASSET_MANAGER.get('assets/mult-overlay.png');
        this.particles = [];
        this.game.click = null;
    }

    cloverScalar() {
        for (let i = 0; i < this.passives.length; i++) {
            if (this.passives[i].name == 'Four-leaf Clover') {
                let scalar = Math.pow(this.passives[i].effect, this.passives[i].count);
                console.log(scalar);
                return scalar;
            }
        }
        return 1;
        
    }

    allDiceScored() {
        for (let i = 0; i < this.game.entities.length; i++) {
            const entity = this.game.entities[i];
            if (entity.currFaces && !entity.wasCalculated)
                return false;
        }

        return true;
    }

    handleDeath() {
        if (!this.deathElapsed) {
            this.deathElapsed = 0;
            this.deathSpawnCube = 0;
            this.diceControlDisabled = true;
            ASSET_MANAGER.get('assets/maintheme.wav').pause();
            ASSET_MANAGER.get('assets/maintheme.wav').currentTime = 0;
            ASSET_MANAGER.get('assets/gameover.wav').currentTime = 0;
            ASSET_MANAGER.get('assets/gameover.wav').play();
        }

        this.deathElapsed += this.game.clockTick;

        if (this.deathElapsed <= 4) {
            if (this.deathElapsed - this.deathSpawnCube >= 0.05) {
                this.deathSpawnCube += 0.05;
                const idxDice = new Dice(this.game, this, {x: PARAMS.canvasWidth / 2, y:PARAMS.canvasHeight - 200}, { sides: [1, 2, 3, 4, 5, 6] });
                idxDice.velocity.y = -Math.random() * 25;
                idxDice.velocity.x = (Math.random() - 0.5) * 50;
                this.game.addEntity(idxDice);
            }
        } else if (this.deathElapsed > 8) {
            const size = { width: 250, height: 70 };
            const butt = new Button(
                this.game, this,
                { x: (PARAMS.canvasWidth - size.width) / 2, y: (PARAMS.canvasHeight - size.height) / 2 + 100 },
                size,
                'Retry',
                '#880000', '#000000', '30pt Papyrus',
                () => {
                    this.deathElapsed = null;
                    this.deathSpawnCube = null;

                    this.shouldThrow = true;
                    this.overlay = [];
                    this.dice = [{ sides: [1, 2, 3, 4, 5, 6] }];
                    this.diceSlotsUnlocked = [ true, false, false, false, false, false ];
                    this.inShop = false;
                    this.gold = PARAMS.debug ? 999_999 : 0;
                    this.rerolls = PARAMS.initialRolls;
                    this.score = 0;
                    this.extraRollCost = 1;
                    this.passives = [];
                    this.previousExtraRollCost = 1;
                    this.diceControlDisabled = false;

                    this.overlaySheet = ASSET_MANAGER.get('assets/dice-overlay.png');
                    this.game.click = null;
                    this.game.clear();


                    ASSET_MANAGER.playAsset('assets/maintheme.wav');
                }
            );
            this.game.addEntity(butt);
            this.done = true;
        }
    }

    showScore() {
        this.scoreGUI = new ScoreGUI(this.game, this, this.overlay);
        this.game.addEntity(this.scoreGUI);
    }

    hideScore() {
        this.scoreGUI.removeFromWorld = true;
        this.scoreGUI = undefined;
    }

    update() {
        if (this.rerolls < 0) {
            this.handleDeath();
        } else if (this.game.click && this.shouldThrow) {
            if (this.firstClick) {
                ASSET_MANAGER.autoRepeat('assets/maintheme.wav');
                ASSET_MANAGER.playAsset('assets/maintheme.wav');
                ASSET_MANAGER.get('assets/maintheme.wav').volume = 0.25;
                this.firstClick = false;
            }
            for (let i = 0; i < this.dice.length; i++) {
                let idxDice = new Dice(this.game, this, this.game.click, this.dice[i]);
                this.game.addEntity(idxDice);
            }
            this.shouldThrow = false;
        } else if (!this.inShop && this.allDiceScored() && !this.shouldThrow) {
            this.shopDelayElapsed += this.game.clockTick;
            if (this.scoreGUI && this.scoreGUI.isDone) {
                this.gold += this.scoreGUI.gold;
                this.shownScore = false;
                this.hideScore();
                this.roundGold = 0;
                this.roundMult = 0;
                this.inShop = true;
                this.game.addEntity(new Shop(this.game, this));
                this.shopDelayElapsed = 0;
            } else if (this.shopDelayElapsed >= this.scoreDelay && !this.shownScore) {
                this.showScore();
                this.shownScore = true;
                /*[this.handName, this.handDesc, this.handMult] = score(this.overlay);
                this.handSum = this.overlay.reduce((acc,x) => acc + x.val, 0);
                this.gold += this.handSum * this.handMult;
                this.showScore = true;*/
            }
        }
    }

    draw(ctx) {

        const overlayScale = 4;
        const size = 32 * overlayScale;
        for (let i = 0; i < this.overlay.length; i++) {
            if (this.overlay[i].mult) {
                const multIdx = Math.floor(Math.log2(this.overlay[i].mult)) - 1;
                ctx.drawImage(this.multSheet,
                    32 * multIdx, 0,
                    32, 32,
                    Math.floor(((size * i) % PARAMS.canvasWidth) / size) * size,
                    Math.floor(size * i / PARAMS.canvasWidth) * size,
                    32 * overlayScale, 32 * overlayScale
                );
            } else {
                ctx.drawImage(this.overlaySheet,
                    32 * (this.overlay[i].val - 1), 0,
                    32, 32,
                    Math.floor(((size * i) % PARAMS.canvasWidth) / size) * size,
                    Math.floor(size * i / PARAMS.canvasWidth) * size,
                    32 * overlayScale, 32 * overlayScale
                );
            }
        }

        // felt table
        ctx.fillStyle = PARAMS.color.felt;
        ctx.fillRect(0, PARAMS.canvasHeight - 100, PARAMS.canvasWidth, 100)

        // show score
        /*if (this.showScore) {
            ctx.textAlign = 'center';
            ctx.font = 'bold 80pt Comic Sans';
            ctx.fillText(this.handName, PARAMS.canvasWidth / 2, PARAMS.canvasHeight / 2 - 50);
            ctx.font = '30pt Courier';
        ctx.fillStyle = '#ffffff';
            ctx.fillText(`${this.handSum} × ${this.handMult}`, PARAMS.canvasWidth / 2, PARAMS.canvasHeight / 2 + 50);
        }*/

        // game over
        if (this.rerolls < 0) {
            ctx.font = 'bold 80pt Comic Sans';
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'center';
            ctx.fillText('Game Over', PARAMS.canvasWidth / 2, PARAMS.canvasHeight / 2);

            if (this.deathElapsed > 5) {
                ctx.font = '20pt Comic Sans'
                ctx.fillStyle = '#000000'
                ctx.textAlign = 'center';
                ctx.fillText('Final Score', PARAMS.canvasWidth / 2, PARAMS.canvasHeight / 2 - 165);
            }
            if (this.deathElapsed > 6.5) {
                ctx.font = '35pt monospace'
                ctx.fillStyle = '#00dd00'
                ctx.fillText(this.score, PARAMS.canvasWidth / 2, PARAMS.canvasHeight / 2 - 100);
            }
        }
    }
}
