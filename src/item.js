const ITEM_POOL = {
    commons: [
        {
            item: { sides: [1, 3, 6, 4, 5, 2] },
            cost: 1
        }
    ],
    uncommons: [
        {
            item: { sides: [2, 3, 6, 4, 4, 2] },
            cost: 1
        }
    ],
    rares: [
        {
            item: { sides: [6, 6, 6, 6, 6, 6] },
            cost: 1
        }
    ]
};

ITEM_POOL.dropCommon = () => {
    return ITEM_POOL.commons[getRandomInt(ITEM_POOL.commons.length - 1)];
}
ITEM_POOL.dropUncommon = () => {
    return ITEM_POOL.uncommons[getRandomInt(ITEM_POOL.uncommons.length - 1)]
}
ITEM_POOL.dropRare = () => {
    return ITEM_POOL.rares[getRandomInt(ITEM_POOL.rares.length - 1)];
}

class Item {
    constructor(game, scene, shop, loc, size, rarity) {
        Object.assign(this, { game, shop, scene, rarity });

        if (this.rarity == 'common') {
            this.drop = ITEM_POOL.dropCommon();
        } else if (this.rarity == 'uncommon') {
            this.drop = ITEM_POOL.dropUncommon();
        } else {
            this.drop = ITEM_POOL.dropRare();
        }
        this.item = this.drop.item;
        this.cost = this.drop.cost;
        this.taken = false;
        this.width = size.width;
        this.height = size.height;
        this.x = loc.x - size.width / 2;
        this.y = loc.y - size.height / 2;
        this.z = 3;

        const diceButtSize = {
            width : 64,
            height: 64
        };
        const diceButtLoc = {
            x: this.x + (this.width - diceButtSize.width) / 2,
            y: this.y + (this.height - diceButtSize.height) / 2
        }
        this.diceButt = new DiceButton(this.game, this.scene, diceButtLoc, diceButtSize, this.item);
        this.diceButt.z = 100_000;
        this.game.addEntity(this.diceButt);

    }

    update() {
        if (this.game.click) {
            const e = this.game.click;
            if (e.x >= this.x && e.x <= this.x + this.width && e.y >= this.y && e.y <= this.y + this.height && this.scene.gold >= this.cost && !this.disableBuy) {

                const diceSlotsHaveRoom = this.scene.diceSlotsUnlocked[this.scene.dice.length];
                
                if (diceSlotsHaveRoom) {
                    this.scene.dice.push(this.item);
                    this.scene.gold -= this.cost;
                    this.taken = true;
                    this.diceButt.removeFromWorld = true;
                } else {
                    this.heldDice = new HoverDice(this.game, this.scene, this.diceButt, this.shop);
                    this.game.addEntity(this.heldDice);
                }
            }
        }
    }

    draw(ctx) {
        ctx.save();
        // if item taken
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

        

        // background
        if (this.rarity == 'common') {
            ctx.fillStyle = '#dddddd';
            ctx.strokeStyle = '#888888';
        } else if (this.rarity == 'uncommon') {
            ctx.fillStyle = '#ddddff';
            ctx.strokeStyle = '#0000ff';
        } else if (this.rarity == 'rare') {
            ctx.fillStyle = '#ffccff';
            ctx.strokeStyle = '#ff00ff';
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        
        // name
        ctx.fillStyle = ctx.strokeStyle;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'center';
        ctx.font = '20pt monospace';
        ctx.fillText(`${this.rarity} dice`, this.x + this.width * 0.5, this.y + 40);

        // cost
        ctx.fillStyle = '#ff6666';
        ctx.fillText(this.cost, this.x + this.width * 0.5, this.y + this.height - 40);


        ctx.restore();
    }
}

class HoverDice {
    constructor(game, scene, origDiceButt, shop) {
        Object.assign(this, { game, scene, origDiceButt, shop });
        this.z = 100_005;
        this.currDice = origDiceButt.dice;
        origDiceButt.dice = undefined;

        this.shop.diceButts.forEach(db => db.disableUnlock = true);
        this.shop.items.forEach(db => db.disableBuy = true);
        this.shop.highlightDice = true;
    }

    cleanup() {
        this.shop.diceButts.forEach(db => db.disableUnlock = false);
        this.shop.items.forEach(db => db.disableBuy = false);
        this.shop.highlightDice = false;
        this.removeFromWorld = true;
    }

    update() {
        if (this.game.rightclick) {
            this.origDiceButt.dice = this.currDice;
            this.cleanup();
        } else if (this.game.click) {
            this.shop.diceButts.forEach(db => {
                if (db.isHighlighted) {
                    this.scene.dice[db.buttonIdx] = this.currDice;
                    this.cleanup();
                }
            });
        }
    }

    draw(ctx) {
        const mx = this.game.mouse.x;
        const my = this.game.mouse.y;
        ctx.drawImage(this.origDiceButt.normalDiceImg, mx - 38 * 0.5, my - 38 * 0.5, 38, 38);

    }
}
