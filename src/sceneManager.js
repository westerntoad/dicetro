class SceneManager {
    constructor(game) {
        Object.assign(this, { game });
        this.z = -1;
        this.totalDice = 1;
        this.shouldThrow = true;
        this.firstClick = true;
        this.overlay = [];
        this.dice = [ {sides: [1, 2, 3, 4, 5, 6]} ];
        this.inShop = false;
        this.shopDelay = 1;
        this.shopDelayElapsed = 0;
        this.gold = 0;
        this.rerolls = PARAMS.initialRolls;
        this.score = 1;
        this.extraRollCost = 1;
        this.previousExtraRollCost = 1;

        this.overlaySheet = ASSET_MANAGER.get('assets/dice-overlay.png');
        this.game.click = null;

    }

    allDiceScored() {
        for (let i = 0; i < this.game.entities.length; i++) {
            const entity = this.game.entities[i];
            if (entity.currFaces && !entity.wasCalculated)
                return false;
        }

        return true;
    }

    update() {
        console.log(this.dice);
        if (this.rerolls < 0) { // game over
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
                    const idxDice = new Dice(this.game, this, {x: PARAMS.canvasWidth / 2, y:PARAMS.canvasHeight - 200}, [1, 2, 3, 4, 5, 6]);
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
                        this.inShop = false;
                        this.gold = 0;
                        this.rerolls = PARAMS.initialRolls;
                        this.score = 0;
                        this.extraRollCost = 1;
                        this.previousExtraRollCost = 1;

                        this.overlaySheet = ASSET_MANAGER.get('assets/dice-overlay.png');
                        this.game.click = null;

                        ASSET_MANAGER.get('assets/maintheme.wav').play();

                        this.game.clear();
                    }
                );
                this.game.addEntity(butt);
                this.done = true;
            }
        } else if (this.game.click && this.shouldThrow) {
            if (this.firstClick) {
                ASSET_MANAGER.autoRepeat('assets/maintheme.wav');
                ASSET_MANAGER.playAsset('assets/maintheme.wav');
                this.firstClick = false;
            }
            for (let i = 0; i < this.dice.length; i++) {
                let idxDice = new Dice(this.game, this, this.game.click, this.dice[i].sides);
                this.game.addEntity(idxDice);
            }
            this.shouldThrow = false;
            this.game.click = null;
        } else if (!this.inShop && this.allDiceScored() && !this.shouldThrow) {
            this.shopDelayElapsed += this.game.clockTick;
            if (this.shopDelayElapsed >= this.shopDelay) {
                this.inShop = true;
                this.game.addEntity(new Shop(this.game, this));
                this.shopDelayElapsed = 0;
            }
        }
        /*} else if (this.game.click) {
            this.game.clearDice();
            this.overlay = [];
            this.shouldThrow = true;
            this.game.click = null;
        }*/
    }

    draw(ctx) {

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

        // felt table
        ctx.fillStyle = PARAMS.color.felt;
        ctx.fillRect(0, PARAMS.canvasHeight - 100, PARAMS.canvasWidth, 100)

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
