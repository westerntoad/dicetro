class Shop {
    constructor(game, scene) {
        Object.assign(this, { game, scene });
        this.width = PARAMS.canvasWidth - 100;
        this.height = 450;
        this.x = (PARAMS.canvasWidth - this.width) / 2
        this.y = (PARAMS.canvasHeight - this.height) / 2
        this.z = 2;

        this.numItems = 3;
        this.items = [];
        for (let i = 0; i < this.numItems; i++) {
            const size = {
                width: 200,
                height: this.height - 150
            };
            const loc = {
                x: this.x + (this.width / (this.numItems + 1)) * (i + 1),
                y: this.y + (this.height / 2) - 25
            };
            let rarity = 'common';
            const quality = Math.random();
            if (quality <= PARAMS.rareChance) {
                rarity = 'rare';
            } else if (quality + PARAMS.rareChance <= PARAMS.uncommonChance) {
                rarity = 'uncommon';
            }
            this.items[i] = new Item(game, scene, loc, size, rarity);
            this.game.addEntity(this.items[i]);
        }

        
        this.extraRollButton = new Button(
            game, scene,
            { x: this.x + this.width - 329, y: this.y + this.height - 49 },
            { width: 200, height: 40 },
            'Extra Roll',
            PARAMS.color.extraRoll, PARAMS.color.extraRollDark, '14pt monospace',
            () => {
                const newCost = this.scene.previousExtraRollCost + this.scene.extraRollCost;
                if (newCost > this.scene.gold)
                    return;

                this.scene.previousExtraRollCost = this.scene.extraRollCost;
                this.scene.extraRollCost = newCost;
                this.scene.gold -= newCost;
                this.scene.rerolls += 1;
            }
        );
        this.startButton = new Button(
            game, scene,
            { x: this.x + this.width - 329, y: this.y + this.height - 94 },
            { width: 200, height: 40 },
            'Start',
            PARAMS.color.start, PARAMS.color.startDark, '14pt monospace',
            () => {
                this.scene.score += 1;
                this.scene.rerolls--;
                this.scene.items = [];
                this.scene.overlay = [];
                this.scene.dice.forEach(x => { x.removeFromWorld = true; });
                this.scene.inShop = false;
                this.scene.shouldThrow = true;
                this.game.clear();
            }
        );
        this.game.addEntity(this.startButton);
        this.game.addEntity(this.extraRollButton);
        
        for (let i = 0; i < 6; i++) {
            const button = new DiceButton(
                game, scene,
                { x: this.x + 300 + 40 * (i % 3), y: this.y + this.height - 90 + 40 * Math.floor(i / 3)},
                { width: 38, height: 38 },
                i
            );
            this.game.addEntity(button);
        }
    }

    update() {
        // TODO
    }

    draw(ctx) {
        ctx.fillStyle = PARAMS.color.shopBackground;
        ctx.fillRect(this.x, this.y, this.width, this.height)

        // title
        ctx.fillStyle = PARAMS.color.shop;
        ctx.font = PARAMS.font.shopName;
        ctx.textAlign = 'center';
        ctx.fillText('Market', this.x + this.width / 2, this.y + 35);
        
        // gold
        ctx.font = PARAMS.font.gold;
        ctx.fillStyle = PARAMS.color.gold;
        ctx.textAlign = 'left';
        ctx.fillText(`. ${this.scene.gold}`, this.x + 131, this.y + this.height - 65);
        ctx.drawImage(ASSET_MANAGER.get('assets/coin.png'), this.x + 128, this.y + this.height - 85, 16 * 1.5, 16 * 1.5);

        // rerolls
        ctx.font = PARAMS.font.reroll;
        ctx.fillStyle = PARAMS.color.reroll;
        ctx.textAlign = 'left';
        ctx.fillText(`. ${this.scene.rerolls}`, this.x + 131, this.y + this.height - 25);
        ctx.drawImage(ASSET_MANAGER.get('assets/reroll.png'), this.x + 129, this.y + this.height - 44, 16 * 1.5, 16 * 1.5);

        // extra roll button cost
        ctx.fillStyle = 'red';
        ctx.textAlign = 'right';
        ctx.fillText(`${this.scene.extraRollCost}`, this.x + 585, this.y + this.height - 22);

        // current dice
        
    }
}

class DiceButton {
    constructor(game, scene, loc, size, buttonIdx) {
        Object.assign(this, { game, scene, buttonIdx });

        this.cost = PARAMS.diceSlotCosts[buttonIdx]
        this.unlocked = false;
        this.width = size.width;
        this.height = size.height;
        this.x = loc.x;
        this.y = loc.y;
        this.z = 3;

        this.lockImg = ASSET_MANAGER.get('assets/lock.png');
        this.normalDiceImg = ASSET_MANAGER.get('assets/reroll.png');
    }

    update() {
        this.dice = this.scene.dice[this.buttonIdx];

        if (this.game.mouse.x >= this.x && this.game.mouse.x <= this.x + this.width
              && this.game.mouse.y >= this.y && this.game.mouse.y <= this.y + this.height) {

            this.isHighlighted = true;
        } else {
            this.isHighlighted = false;
        }

        console.log(this.game.click);
        if (this.isHighlighted && this.game.click && this.scene.gold >= this.cost && !this.scene.diceSlotsUnlocked[this.buttonIdx]) {
            this.scene.diceSlotsUnlocked[this.buttonIdx] = true;
            this.scene.gold -= this.cost;
        }
    }

    draw(ctx) {
        const unlocked = this.scene.diceSlotsUnlocked[this.buttonIdx];
        ctx.fillStyle = unlocked ? '#dddddd' : '#000000';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        if (!this.dice && !unlocked) {
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
        } else if (this.dice) {
            ctx.drawImage(this.normalDiceImg, this.x, this.y, this.width, this.height);

            // draw dice sides
            if (this.isHighlighted) {
                // yoinked from scene
                /*ctx.drawImage(this.overlaySheet,
                    32 * (this.overlay[i] - 1), 0,
                    32, 32,
                    Math.floor(((size * i) % PARAMS.canvasWidth) / size) * size,
                    Math.floor(size * i / PARAMS.canvasWidth) * size,
                    32 * overlayScale, 32 * overlayScale
                );*/

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
                    const sideVal = this.scene.dice[this.buttonIdx].sides[i] - 1;

                    ctx.drawImage(this.scene.overlaySheet, 32 * sideVal, 0, 32, 32, x, y, w, h);
                }

                const x = dialogX + (w + 10) + (dialogWidth - (w + 20) * 3) * 0.5 - 13;
                let y = dialogY + dialogHeight * 0.5 - h * 0.5 - (h + 10);
                let sideVal = this.scene.dice[this.buttonIdx].sides[4] - 1;
                ctx.drawImage(this.scene.overlaySheet, 32 * sideVal, 0, 32, 32, x, y, w, h);

                y = dialogY + dialogHeight * 0.5 - h * 0.5 + (h + 10);
                sideVal = this.scene.dice[this.buttonIdx].sides[5] - 1;
                ctx.drawImage(this.scene.overlaySheet, 32 * sideVal, 0, 32, 32, x, y, w, h);
            }
        }

    }
}

class Button {
    constructor(game, scene, loc, size, label, main, highlight, font, onclick) {
        Object.assign(this, { game, scene });
        
        this.width = size.width;
        this.height = size.height;
        this.x = loc.x;
        this.y = loc.y;
        this.z = 3;
        this.label = label;
        this.main = main;
        this.highlight = highlight;
        this.font = font;
        this.onclick = onclick;
    }

    update() {
        if (this.game.click) {
            const e = this.game.click;
            if (e.x >= this.x && e.x <= this.x + this.width && e.y >= this.y && e.y <= this.y + this.height) {
                this.onclick();
            }
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.main;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'center';
        ctx.font = this.font;
        ctx.fillText(this.label, this.x + this.width / 2, this.y + this.height / 2 + 5);
    }

}

class Item {
    constructor(game, scene, loc, size, rarity) {
        Object.assign(this, { game, scene, rarity });

        if (this.rarity == 'common') {
            this.item = ITEM_POOL.commons[getRandomInt(ITEM_POOL.commons.length - 1)]
        } else if (this.rarity == 'uncommon') {
            this.item = ITEM_POOL.uncommons[getRandomInt(ITEM_POOL.uncommons.length - 1)]
        } else {
            this.item = ITEM_POOL.rares[getRandomInt(ITEM_POOL.rares.length - 1)]
        }
        this.taken = false;
        this.width = size.width;
        this.height = size.height;
        this.x = loc.x - size.width / 2;
        this.y = loc.y - size.height / 2;
        this.z = 3;
    }

    update() {
        if (this.game.click) {
            const e = this.game.click;
            const diceSlotsHaveRoom = this.scene.diceSlotsUnlocked[this.scene.dice.length];
            if (e.x >= this.x && e.x <= this.x + this.width && e.y >= this.y && e.y <= this.y + this.height
                    && diceSlotsHaveRoom) {
                
                this.scene.dice.push(this.item);
                this.taken = true;
            }
        }
    }

    draw(ctx) {
        ctx.save();
        if (this.taken) {
            ctx.font = 'italic 38pt monospace'
            ctx.fillStyle = '#dddddd';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeStyle = '#888888';
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'center';
            ctx.fillStyle = '#888888';
            ctx.fillText('item taken', this.x + this.width / 2, this.y + this.height / 2, this.width - 40);
            return;
        }

        if (this.taken) {
            ctx.fillStyle = '#FFFFFF';
        } else if (this.rarity == 'common') {
            ctx.fillStyle = '#888888';
        } else if (this.rarity == 'uncommon') {
            ctx.fillStyle = '#0000FF';
        } else {
            ctx.fillStyle = '#FF00FF';
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }
}
