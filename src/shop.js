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
            PARAMS.color.extraRoll, PARAMS.color.extraRollDark, '',
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
            PARAMS.color.start, PARAMS.color.startDark, '',
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
                this.scene.dice[i],
                PARAMS.diceSlotCosts[i]
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
    constructor(game, scene, loc, size, dice, cost) {
        Object.assign(this, { game, scene, dice, cost });

        this.width = size.width;
        this.height = size.height;
        this.x = loc.x;
        this.y = loc.y;
        this.z = 3;

        this.lockImg = ASSET_MANAGER.get('assets/lock.png');
        this.normalDiceImg = ASSET_MANAGER.get('assets/reroll.png');
    }

    update() {
        if (this.game.mouse.x >= this.x && this.game.mouse.x <= this.x + this.width
              && this.game.mouse.y >= this.y && this.game.mouse.y <= this.y + this.height) {

            this.isHighlighted = true;
        } else {
            this.isHighlighted = false;
        }
    }

    draw(ctx) {
        if (!this.dice) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.drawImage(this.lockImg, this.x, this.y, this.width, this.height);
            if (this.isHighlighted && !this.dice) {
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
        } else {
            ctx.fillStyle = '#dddddd';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.drawImage(this.normalDiceImg, this.x, this.y, this.width, this.height);
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
        ctx.font = this.font;
        ctx.fillText(this.label, this.x + this.width / 2, this.y + this.height / 2 + 5);
    }

}

class Item {
    constructor(game, scene, loc, size, rarity) {
        Object.assign(this, { game, scene, rarity });

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
            if (e.x >= this.x && e.x <= this.x + this.width && e.y >= this.y && e.y <= this.y + this.height) {
                let item = { sides: [1, 1, 1, 1, 1, 1] };
                if (this.rarity == 'common') {
                    item = ITEM_POOL.commons[getRandomInt(ITEM_POOL.commons.length - 1)]
                } else if (this.rarity == 'uncommon') {
                    item = ITEM_POOL.uncommons[getRandomInt(ITEM_POOL.rares.length - 1)]
                } else {
                    item = ITEM_POOL.rares[getRandomInt(ITEM_POOL.rares.length - 1)]
                }
                this.scene.dice.push(item);

                this.taken = true;
            }
        }
    }

    draw(ctx) {
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
    }
}
