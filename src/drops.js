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
// 4. right click to shoot the dice at high speed ?
//
//      OTHER IDEAS
// 1. Seed feature
// 2. score recap in shop
// 3. info section
// 4. mythic rarity
// 5. consumables

ITEM_POOL = {};

ITEM_POOL._sideFromTable = table => {
    if (PARAMS.debug) {
        const avg = table.reduce((acc, x) => acc + x, 0);
        const tolerance = 0.001;
        const acceptable = avg >= 1 - tolerance && avg <= 1 + tolerance;
        assert(acceptable && table.length == 6);
    }

    const rand = Math.random();
    let sum = 0;

    for (let i = 0; i < 6; i++) {
        sum += table[i];

        if (rand <= sum)
            return i + 1;
    }

    assert(false); // unreachable code
}

ITEM_POOL._allSidesFromTable = table => {
    let sides = [];

    for (let i = 0; i < 6; i++) {
        sides.push(ITEM_POOL._sideFromTable(table));
    }

    return sides;
}


ITEM_POOL.dropCommon = () => {
    let drop = {};
    const init = Math.random();

    if (init <= 0.3) {
        drop.name = 'Low-value Die'
        drop.item = { type: 'dice', sides: [] };

        const table = [0.20, 0.20, 0.20, 0.15, 0.15, 0.10];
        drop.item.sides = ITEM_POOL._allSidesFromTable(table);
        drop.cost = Math.floor(drop.item.sides.reduce((acc, x) => acc + x, 0) / 2 / 5) * 5;
    } else if (init <= 1) {
        drop.name = 'Low Mult Die';
        drop.item = { type: 'dice', sides: [], mult: [] };

        const table = [0.20, 0.20, 0.20, 0.15, 0.15, 0.10];
        drop.item.sides = ITEM_POOL._allSidesFromTable(table);
        const i = getRandomInt(6) + 1;
        drop.item.sides[i] = 0;
        drop.item.mult[i] = 2;
        drop.cost = Math.floor(drop.item.sides.reduce((acc, x) => acc + x, 0) / 2 / 5) * 5;
        // debug
        for (let i = 0; i < 6; i++) {
            drop.item.sides[i] = 0;
            drop.item.mult[i] = 2;
        }
    } else {
        drop.name = 'Normal Die';
        drop.item = { type: 'dice', sides: [] };
        drop.item.sides = [1, 3, 6, 4, 5, 2];
        drop.cost = 5;
    }

    return drop;
}

ITEM_POOL.dropUncommon = () => {
    let drop = {};
    const init = Math.random();

    if (init <= 0.5) {
        drop.name = 'Medium-value Die'
        drop.item = { type: 'dice', sides: [] };

        const table = [0.15, 0.15, 0.15, 0.15, 0.20, 0.20];
        drop.item.sides = ITEM_POOL._allSidesFromTable(table);
        drop.cost = Math.floor(drop.item.sides.reduce((acc, x) => acc + x, 0) / 5) * 5;
    } else {
        drop.name = 'Four-leaf Clover';
        drop.item = {
            type: 'passive',
            name: drop.name,
            icon: 'assets/clover.png',
            desc: 'Increases the chances of finding higher quality items.',
            effect: 1.25,
            count: 1
        };
        drop.cost = 50;
    }

    return drop;

}

ITEM_POOL.dropRare = () => {
    let drop = {};
    const init = Math.random();
    if (init <= 0.5) {
        // normal rare dice 
        drop.name = 'High-value Die';
        drop.item = { type: 'dice', sides: [] };
        const table = [0.04, 0.06, 0.10, 0.10, 0.20, 0.50];
        drop.item.sides = ITEM_POOL._allSidesFromTable(table);
        drop.cost = drop.item.sides.reduce((acc, x) => acc + x*3, 0);
    } else {
        // All-side dice
        drop.name = 'All-sided Die';
        drop.item = { type: 'dice', sides: []};
        const side = getRandomInt(6) + 1;
        drop.item.sides = Array(6).fill(side);
        drop.cost = 100 + 10 * side;
    }

    return drop;
}
