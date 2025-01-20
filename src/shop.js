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
            console.log(this);
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
            console.log
        );
        this.startButton = new Button(
            game, scene,
            { x: this.x + this.width - 329, y: this.y + this.height - 94 },
            { width: 200, height: 40 },
            'Start',
            PARAMS.color.start, PARAMS.color.startDark, '',
            () => {
                this.scene.rerolls--;
                this.scene.items = [];
                this.scene.overlay = [];
                this.scene.dice.forEach(x => { x.removeFromWorld = true; });
                this.scene.inShop = false;
                this.scene.shouldThrow = true;
                this.removeFromWorld = true;
                this.extraRollButton.removeFromWorld = true;
                this.startButton.removeFromWorld = true;
                this.items.forEach(x => { x.removeFromWorld = true; });
            }
        );
        this.game.addEntity(this.startButton);
        this.game.addEntity(this.extraRollButton);
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
                this.game.click = null;
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

        this.width = size.width;
        this.height = size.height;
        this.x = loc.x - size.width / 2;
        this.y = loc.y - size.height / 2;
        this.z = 3;
    }

    update() {
        // TODO
    }

    draw(ctx) {
        ctx.fillStyle = '#800000'
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
