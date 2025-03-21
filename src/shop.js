class Shop {
    constructor(game, scene) {
        Object.assign(this, { game, scene });
                console.log(this.scene.overlay);
        this.width = PARAMS.canvasWidth - 100;
        this.height = 450;
        this.x = (PARAMS.canvasWidth - this.width) / 2
        this.y = (PARAMS.canvasHeight - this.height) / 2
        this.z = 2;
        this.infoHighlighted = false;

        this.numItems = 3;
        this.items = [];
        this.freeShop();
        
        
        this.extraRollButton = new Button(
            game, scene,
            { x: this.x + this.width - 329, y: this.y + this.height - 49 },
            { width: 200, height: 40 },
            'Extra Roll',
            PARAMS.color.extraRoll, PARAMS.color.extraRollDark, '14pt monospace',
            () => {
                const cost = PARAMS.extraRollCosts[this.scene.extraRollIdx];
                if (cost > this.scene.gold)
                    return;

                this.scene.gold -= cost;
                this.scene.extraRollIdx++;
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
                this.scene.dice.forEach(x => {
                    if (x)
                        x.removeFromWorld = true;
                });
                this.scene.inShop = false;
                this.scene.shouldThrow = true;
                this.game.clear();
            }
        );
        this.game.addEntity(this.startButton);
        this.game.addEntity(this.extraRollButton);
        
        this.diceButts = [];
        for (let i = 0; i < 6; i++) {
            const button = new DiceButton(
                game, scene,
                { x: this.x + 300 + 40 * (i % 3), y: this.y + this.height - 90 + 40 * Math.floor(i / 3)},
                { width: 38, height: 38 },
                i
            );
            this.game.addEntity(button);
            this.diceButts.push(button);
        }

        this.passives = [];
        this.scene.passives.forEach(item => this.addPassive(item));
    }

    freeShop() {
        this.items.forEach(item => {
            if (item.itemIcon)
                item.itemIcon.removeFromWorld = true;

            if (item.diceButt)
                item.diceButt.removeFromWorld = true;

            item.removeFromWorld = true;
        });

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
            if (quality <= PARAMS.mythicChance * this.scene.cloverScalar()) {
                rarity = 'mythic';
            } else if (quality <= (PARAMS.mythicChance + PARAMS.rareChance) * this.scene.cloverScalar()) {
                rarity = 'rare';
            } else if (quality <= (PARAMS.mythicChance + PARAMS.rareChance + PARAMS.uncommonChance) * this.scene.cloverScalar()) {
                rarity = 'uncommon';
            }
            this.items[i] = new Item(this.game, this.scene, this, loc, size, rarity);
            console.log(this.items[i]) // DEBUG
            this.game.addEntity(this.items[i]);
        }
    }

    addPassive(item) {
        
        const i = this.passives.length;
        const w = 40;
        const h = 40;
        const x = this.x + 18 + (w + 5) * (i % 2);
        const y = this.y + 50 + (h + 5) * Math.floor(i / 2);
        this.passives.push(new Icon(
            this.game, this.scene, item,
            x, y, w, h, this
        ));

        this.game.addEntity(this.passives[i]);
    }

    update() {
        const mx = this.game.mouse.x;
        const my = this.game.mouse.y;

        // info highlight check
        this.infoHighlighted = mx >= this.x + this.width - 60 && mx <= this.x + this.width - 25 && my >= this.y + 15 && my <= this.y + 50;
        if (this.infoHighlighted && this.game.click) {
            window.open('https://github.com/westerntoad/tcss491-dicetro/wiki', '_blank').focus();
        }

        this.startButton.color = this.scene.rerolls == 0 ? '#ff0000' : undefined;
    }

    draw(ctx) {
        ctx.save();
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
        ctx.drawImage(ASSET_MANAGER.get('assets/reroll.png'), 0, 0, 16, 16, this.x + 129, this.y + this.height - 44, 16 * 1.5, 16 * 1.5);

        // extra roll button cost
        const cost = PARAMS.extraRollCosts[this.scene.extraRollIdx];
        ctx.fillStyle = 'red';
        ctx.textAlign = 'right';
        ctx.fillText(cost, this.x + 585, this.y + this.height - 22);

        
        if (this.highlightDice) {
            ctx.strokeStyle = '#ff0000';
            ctx.strokeRect(this.x + 300 - 5, this.y + this.height - 90 - 5, 119 + 10, 79 + 10);
        }

        // info
        ctx.fillStyle = this.infoHighlighted ? '#ff0000' : '#dddddd';
        ctx.textBaseline = 'top';
        ctx.textAlign = 'right';
        ctx.font = '32pt monospace';
        ctx.fillText('?', this.x + this.width - 25, this.y + 15);
        
        // debug

        ctx.fillStyle = '#dddddd';
        const x = this.x + 18;
        const y = this.y + 50;
        const w = 45 * 2
        const h = 300
        ctx.fillRect(x, y, w, h);

        ctx.restore();
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
        ctx.fillStyle = this.color ? this.color : this.main;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'center';
        ctx.font = this.font;
        ctx.fillText(this.label, this.x + this.width / 2, this.y + this.height / 2 + 5);
    }

}
