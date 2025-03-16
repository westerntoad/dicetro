class DiceButton {
    constructor(game, scene, loc, size, finalArg) {
        Object.assign(this, { game, scene });
        if (Number.isInteger(finalArg)) {
            this.buttonIdx = finalArg;
        } else {
            this.buttonIdx = -1;
            this.dice = finalArg;
        }

        this.cost = PARAMS.diceSlotCosts[this.buttonIdx];
        this.unlocked = this.scene.diceSlotsUnlocked[this.buttonIdx];
        this.width = size.width;
        this.height = size.height;
        this.x = loc.x;
        this.y = loc.y;
        this.z = 100_001;
        this.disableUnlock = false;

        this.lockImg = ASSET_MANAGER.get('assets/lock.png');
        this.normalDiceImg = ASSET_MANAGER.get('assets/reroll.png');
    }

    update() {
        const dice = this.buttonIdx != -1 ? 
            this.scene.dice[this.buttonIdx] :
            this.dice;

        if (this.game.mouse.x >= this.x && this.game.mouse.x <= this.x + this.width
              && this.game.mouse.y >= this.y && this.game.mouse.y <= this.y + this.height) {

            this.isHighlighted = true;
        } else {
            this.isHighlighted = false;
        }

        if (this.isHighlighted && this.game.click && this.scene.dice[this.buttonIdx]) {
            this.scene.gold += sellPrice(this.scene.dice[this.buttonIdx]);
            this.scene.dice[this.buttonIdx] = undefined;
        }

        if (this.isHighlighted && this.game.click && this.scene.gold >= this.cost && !this.scene.diceSlotsUnlocked[this.buttonIdx] && this.buttonIdx != -1 && !this.disableUnlock) {
            this.scene.diceSlotsUnlocked[this.buttonIdx] = true;
            this.scene.gold -= this.cost;
        }
    }

    drawDice(ctx, idx, x, y, w, h) {
        const dice = this.buttonIdx == -1 ? this.dice : this.scene.dice[this.buttonIdx];

        let sx = 0;
        let sy = 0;

        // draw dice body
        if (dice.body == 'bouncy') {
           sx = 32;
        } else if (dice.body == 'gold') {
           sx = 64;
        } else if (dice.body == 'ghost') {
           sx = 96;
        }

        ctx.drawImage(this.scene.overlayBodiesImg,
            sx, sy,
            32, 32,
            x, y, w, h
        );
        
        // draw dice face
        if (dice.mult && dice.mult[idx]) {
            sx = Math.floor(Math.log2(dice.mult[idx])) - 1;
            sy = 32;
        } else {
            sx = 32 * dice.sides[idx];
        }
        ctx.drawImage(this.scene.overlayFacesImg,
            sx, sy,
            32, 32,
            x, y, w, h
        );
    }

    draw(ctx) {
        const dice = this.buttonIdx == -1 ? this.dice : this.scene.dice[this.buttonIdx];


        const unlocked = this.buttonIdx == -1 || this.scene.diceSlotsUnlocked[this.buttonIdx];
        ctx.fillStyle = unlocked ? '#dddddd' : '#000000';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        if (!dice && !unlocked) {
            ctx.drawImage(this.lockImg, this.x, this.y, this.width, this.height);

            // show price
            if (this.isHighlighted) {
                const dialogWidth = 150;
                const dialogHeight = 50;

                ctx.fillStyle = '#ffffff';
                ctx.fillRect(this.x  + this.width / 2 - dialogWidth / 2, this.y - dialogHeight, dialogWidth, dialogHeight);
                ctx.fillStyle = '#000000';
                ctx.strokeRect(this.x + this.width / 2 - dialogWidth / 2, this.y - dialogHeight, dialogWidth, dialogHeight);
                ctx.fillStyle = PARAMS.color.gold;
                ctx.fillStyle = '#ff0000';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'center';
                ctx.fillText(`-$${this.cost}`, this.x + this.width / 2, (this.y - this.height) + this.height / 2);
            }
        } else if (dice) {
            let sx = 0;
            if (dice.body == 'bouncy') {
                sx = 16;
            } else if (dice.body == 'gold') {
                sx = 32;
            } else if (dice.body == 'ghost') {
                sx = 48;
            }
            ctx.drawImage(this.normalDiceImg, sx, 0, 16, 16, this.x, this.y, this.width, this.height);

            // draw dice sides
            if (this.isHighlighted) {
                // please do not look at this
                const dialogWidth = 300;
                const dialogHeight = 220;
                const dialogX = this.x  + this.width / 2 - dialogWidth / 2;
                const dialogY = this.y - dialogHeight;
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(dialogX, dialogY, dialogWidth, dialogHeight);
                ctx.fillStyle = '#000000';
                ctx.strokeRect(this.x + this.width / 2 - dialogWidth / 2, this.y - dialogHeight, dialogWidth, dialogHeight);
                const w = dialogWidth * 0.2;
                const h = w;
                for (let i = 0; i < 4; i++) {
                    const x = dialogX + (w + 10) * i + (dialogWidth - (w + 20) * 3) * 0.5 - 13;
                    const y = dialogY + dialogHeight * 0.5 - h * 0.5;
                    this.drawDice(ctx, i, x, y, w, h);
                    /*if (dice.mult && dice.mult[i]) {
                        const multIdx = Math.floor(Math.log2(dice.mult[i])) - 1;
                        ctx.drawImage(this.scene.multSheet, 32 * multIdx, 0, 32, 32, x, y, w, h);
                    } else {
                        const sideVal = dice.sides[i];
                        ctx.drawImage(this.scene.overlaySheet, 32 * sideVal, 0, 32, 32, x, y, w, h);
                    }*/
                }

                const x = dialogX + (w + 10) + (dialogWidth - (w + 20) * 3) * 0.5 - 13;
                let y = dialogY + dialogHeight * 0.5 - h * 0.5 - (h + 10);
                this.drawDice(ctx, 4, x, y, w, h);
                /*if (dice.mult && dice.mult[4]) {
                    const multIdx = Math.floor(Math.log2(dice.mult[4])) - 1;
                    ctx.drawImage(this.scene.multSheet, 32 * multIdx, 0, 32, 32, x, y, w, h);
                } else {
                    const sideVal = dice.sides[4];
                    ctx.drawImage(this.scene.overlaySheet, 32 * sideVal, 0, 32, 32, x, y, w, h);
                }*/

                y = dialogY + dialogHeight * 0.5 - h * 0.5 + (h + 10);
                this.drawDice(ctx, 5, x, y, w, h);
                /*if (dice.mult && dice.mult[5]) {
                    const multIdx = Math.floor(Math.log2(dice.mult[5])) - 1;
                    ctx.drawImage(this.scene.multSheet, 32 * multIdx, 0, 32, 32, x, y, w, h);
                } else {
                    const sideVal = dice.sides[5];
                    ctx.drawImage(this.scene.overlaySheet, 32 * sideVal, 0, 32, 32, x, y, w, h);
                }*/
            }
        }

    }
}
