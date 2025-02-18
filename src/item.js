const ITEM_POOL = {
    commons: [
        { sides: [1, 2, 3, 4, 5, 6] }
    ],
    uncommons: [
        { sides: [2, 2, 3, 4, 6, 6] }
    ],
    rares: [
        { sides: [4, 4, 5, 5, 6, 6] }
    ]
};

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
            const diceSlotsHaveRoom = this.scene.diceSlotsUnlocked[this.scene.dice.length];
            if (e.x >= this.x && e.x <= this.x + this.width && e.y >= this.y && e.y <= this.y + this.height
                    && diceSlotsHaveRoom) {
                
                this.scene.dice.push(this.item);
                this.taken = true;
                this.diceButt.removeFromWorld = true;
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

        

        if (this.rarity == 'common') {
            ctx.fillStyle = '#888888';
        } else if (this.rarity == 'uncommon') {
            ctx.fillStyle = '#0000FF';
        } else if (this.rarity == 'rare') {
            ctx.fillStyle = '#FF00FF';
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }
}
