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

ITEM_POOL._sideFromTable = table => {
    assert(PARAMS.debug && table.reduce((acc, x) => acc + x, 0) == 1 && table.length == 6);
    const rand = Math.random();
    let sum = 0;

    for (let i = 0; i < 6; i++) {
        sum += table[i];
        console.log(sum, rand);

        if (rand <= sum)
            return i + 1;
    }

    assert(false);
}

//
//      DICE MODIFIERS
// 
//   Dice sides:
// 1. 1-6 faces
// 2. mult face
// 3. empty face
// 4. inverted face 1-6
//
//   Dice body:
// 1. Fractured die - break up into pieces on hitting a wall
// 2. Bouncy die - on hitting wall, add face val to gold
// 3. Sky die - consumes die on hitting the ceiling for money
// 4. Gold die - 
// 5. Inverted die - augments inverted faces
//
//   Dice shader:
// 1. Rainbow shader
//
//      CONSUMABLE
// 1. Dice duplications
// 2. Increase drop rates
// 3. for each empty face in your hand 
//
//      OTHER IDEAS
// 1. Seed feature
// 2. score recap in shop
// 3. info section
// 4. mythic rarity
// 5. consumables

ITEM_POOL.dropCommon = () => {
    return ITEM_POOL.commons[getRandomInt(ITEM_POOL.commons.length - 1)];
}

ITEM_POOL.dropUncommon = () => {
    return ITEM_POOL.uncommons[getRandomInt(ITEM_POOL.uncommons.length - 1)]
}

ITEM_POOL.dropRare = () => {
    let drop = {};
    const init = Math.random();
    if (init <= 0.5) {
        // normal rare dice 
        drop.name = 'High-value Die';
        drop.item = { type: 'dice', sides: []};
        drop.cost = 0;
        const table = [0.04, 0.06, 0.10, 0.10, 0.20, 0.50];
        for (let i = 0; i < 6; i++) {
            const side = ITEM_POOL._sideFromTable(table);
            drop.item.sides.push(side);
            drop.cost += 3 * side;
        }
    } else {
        // All-side dice
        drop.name = 'All-sided Die';
        drop.item = { type: 'dice', sides: []};
        const side = getRandomInt(6) + 1;
        for (let i = 0; i < 6; i++) {
            drop.item.sides.push(side);
        }
        drop.cost = 100 + 10 * side;
    }

    return drop;
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
        this.name = this.drop.name;
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
        ctx.fillText(this.name ? this.name : `${this.rarity} dice`, this.x + this.width * 0.5, this.y + 40);

        // cost
        ctx.fillStyle = '#ff6666';
        ctx.fillText(this.cost, this.x + this.width * 0.5, this.y + this.height - 40);


        ctx.restore();
    }
}

