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
//   Dice modifier:
// 1. Rainbow shader
// 2. Gives money every second in the air
//
//      CONSUMABLE
// 1. Dice duplications
//
//      OTHER IDEAS
// 1. Seed feature
// 2. score recap in shop
// 3. info section
// 4. mythic rarity
// 5. consumables
//
//
//      PASSIVES
// 1. Lucky Clover - easier to find items of increasing rarity
// 2.  - gain flat money for lower money later
// 3.  - lose flat money for more money later
// 4.  - mult sides give more mult
// 5.  - all odd sides are scored as a 5 and even sides scored as a 6
// 6.  - increase value of all hands by a flat amount
// 7.  - increase value of all hands by a scalar amount
// 8.  - empty faces score special
// 9. Fissure - fractured die split into additional copies
// 10. - increases value of golden dice
// 11. - ghost die give increasingly more amounts of money while in the air
// 12. - gives one extra reroll per shop

ITEM_POOL = {}

ITEM_POOL._sideFromTable = table => {
    if (PARAMS.debug) {
        const avg = table.reduce((acc, x) => acc + x, 0);
        const tolerance = 0.001;
        const acceptable = avg >= 1 - tolerance && avg <= 1 + tolerance;
        assert(acceptable && table.length == 7);
    }

    const rand = Math.random();
    let sum = 0;

    for (let i = 0; i <= 6; i++) {
        sum += table[i];

        if (rand <= sum)
            return i;
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

ITEM_POOL._dropDice = (sideTable, multTable, bodyTable, modsTable) => {
    /*     0  1  2  3  4  5  6
    sides:[0, 0, 0, 0, 0, 0, 0],
           x2    x4    x8    x16
    mult: [0   , 0   , 0   , 0   ],
           bouncy    ghost    gold
    body: [0       , 0       ,0       ],
           fractured wings
    mods: [0       , 0       ],*/

    const sides = ITEM_POOL._allSidesFromTable(sideTable);
    const mult = [0, 0, 0, 0, 0, 0];
    let body = "normal";
    let mods = [];
    for (let i = 0; i < mult.length; i++) {
        const rand = Math.random();
        let sum = 0;

        for (let j = multTable.length - 1; j >= 0; j--) {
            sum += multTable[j];

            if (rand <= sum) { 
                sides[i] = 0;
                mult[i] = 2**(j+1);
            }
        }
    }

    let rand = Math.random();
    let sum = 0;

    for (let i = 0; i < 3; i++) {
        sum += bodyTable[i];

        if (rand <= sum) {
            if      (i == 0)
                body = 'bouncy'; 
            else if (i == 1)
                body = 'ghost';
            else if (i == 2)
                body == 'gold'
            break;
        }
    }

    for (let i = 0; i < modsTable.length; i++) {
        rand = Math.random();
        if (rand <= modsTable[i]) {
            let mod = '';
            if      (i == 0)
                mod = 'fractured';
            else if (i == 1)
                mod = 'wings';

            mods.push(mod);
        }
    }


    return {
        type: 'dice',
        sides: sides,
        mult: mult,
        body: body,
        mods: mods
    }
}

ITEM_POOL._drop = table => {
    if (PARAMS.debug) {
        const avg = table.reduce((acc, x) => acc + x[1], 0);
        const tolerance = 0.001;
        const acceptable = avg >= 1 - tolerance && avg <= 1 + tolerance;
        assert(acceptable);
    }
    
    const rand = Math.random();
    let sum = 0;

    for (let i = 0; i < 6; i++) {
        sum += table[i][1];

        if (rand <= sum) {
            let el = table[i][0];
            if (el.item && !el.item.name) {
                el.item.name = el.name;
            }
            if (el.item && el.item.type == 'passive' && !el.item.count) {
                el.item.count = 1;
            }
            if (el.gen) {
                const genItem = ITEM_POOL._dropDice(el.gen.sides, el.gen.mult, el.gen.body, el.gen.mods);
                return { item: genItem, name: el.name, cost: el.cost };
            } else {
                return table[i][0];
            }
        }
    }

    assert(false); // unreachable code
}

ITEM_POOL.items = {}


/*
 *      ~~~~ DICE ~~~~
 */
ITEM_POOL.items.normalDie = {
    name: 'Normal Die',
    cost: 5,
    item: {
        type: 'dice',
        sides:[1, 3, 6, 4, 5, 2],
        mult: [0, 0, 0, 0, 0, 0],
        body: "normal",
        mods: []
    }
}

ITEM_POOL.items.poorDie = {
    name: 'Poor Die',
    cost: 5,
    gen: {
        //     0     1     2     3     4     5     6
        sides:[0.40, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10],
        //     x2    x4    x8    x16
        mult: [0.10, 0   , 0   , 0   ],
        //     bouncy    ghost     gold
        body: [0       , 0.15    , 0       ],
        //     fractured wings
        mods: [0.02    , 0.03    ],
    }
}

ITEM_POOL.items.common = {
    name: 'Common Die',
    cost: 5,
    gen: {
        //     0     1     2     3     4     5     6
        sides:[0.05, 0.15, 0.15, 0.15, 0.20, 0.15, 0.15],
        //     x2    x4    x8    x16
        mult: [0.10, 0.05, 0   , 0   ],
        //     bouncy    ghost     gold
        body: [0.05    , 0.02    , 0.02    ],
        //     fractured wings
        mods: [0.01    , 0.01    ],
    }
}

ITEM_POOL.items.uncommonDie = {
    name: 'Uncommon Die',
    cost: 25,
    gen: {
        //     0     1     2     3     4     5     6
        sides:[0   , 0.15, 0.15, 0.15, 0.15, 0.15, 0.15],
        //     x2    x4    x8    x16
        mult: [0.05, 0.10, 0.05, 0   ],
        //     bouncy    ghost     gold
        body: [0.15    , 0.05    , 0.05    ],
        //     fractured wings
        mods: [0       , 0.01    ],
    }
}

ITEM_POOL.items.rareDie = {
    name: 'Rare Die',
    cost: 100,
    gen: {
        //     0     1     2     3     4     5     6
        sides:[0   , 0.05, 0.05, 0.05, 0.30, 0.20, 0.35],
        //     x2    x4    x8    x16
        mult: [0   , 0.05, 0.10, 0.05],
        //     bouncy    ghost     gold
        body: [0.15    , 0.05    , 0.10    ],
        //     fractured wings
        mods: [0.05    , 0.05    ],
    }
}

/*
 *      ~~~~ CONSUMABLES ~~~~
 */

ITEM_POOL.items.pick = {
    name: 'Rock Pick',
    cost: 200,
    item: {
        type: 'consumable',
        icon: 'assets/pick.png',
        desc: 'Fracture a random die in inventory.'
    }
}

ITEM_POOL.items.ray = {
    name: 'Duplication Ray',
    cost: 10_000,
    item: {
        type: 'consumable',
        icon: 'assets/ray.png',
        desc: 'Duplicates a random dice in inventory. (MUST HAVE ROOM)'
    }
}

/*
 *      ~~~~ PASSIVES ~~~~
 */

ITEM_POOL.items.clover = {
    name: 'Four-leaf Clover',
    cost: 20,
    item: {
        type: 'passive',
        icon: 'assets/clover.png',
        desc: 'Increases the chanes of finding higher quality items.'
    }
}

ITEM_POOL.items.freeShop = {
    name: 'Free Shop',
    cost: 20,
    item: {
        type: 'passive',
        icon: 'assets/free-shop.png',
        desc: 'Click icon in passive menu to renew Shop items every round upon purchase.'
    }
}

ITEM_POOL.items.fissure = {
    name: 'Fissure',
    cost: 250,
    item: {
        type: 'passive',
        icon: 'assets/fissure.png',
        desc: 'Fractured die produce an additional die when broken.'
    }
}

ITEM_POOL.items.spaceman = {
    name: 'Spaceman',
    cost: 20,
    item: {
        type: 'passive',
        icon: 'assets/spaceman.png',
        desc: 'Your dice are affected less by gravity.'
    }
}

ITEM_POOL.items.tar = {
    name: 'Pine Tar',
    cost: 25,
    item: {
        type: 'passive',
        icon: 'assets/tar.png',
        desc: 'Provide better control & power over the throw of your dice.'
    }
}

ITEM_POOL.items.bedsheet = {
    name: 'Spooky Bedsheet',
    cost: 300,
    item: {
        type: 'passive',
        icon: 'assets/invalid-icon.png',
        desc: 'Increase the rate ghost dice trigger.'
    }
}


ITEM_POOL.dropCommon = () => {
    return ITEM_POOL._drop([
        [ITEM_POOL.items.normalDie, 0.25],
        [ITEM_POOL.items.poorDie,   0.25],
        [ITEM_POOL.items.commonDie, 0.30],
        [ITEM_POOL.items.spaceman,  0.10],
        [ITEM_POOL.items.tar,       0.10],
    ]);
}

ITEM_POOL.dropUncommon = () => {
    return ITEM_POOL._drop([
        [ITEM_POOL.items.uncommonDie, 0.50],
        [ITEM_POOL.items.clover,      0.25],
        [ITEM_POOL.items.freeShop,    0.25],
    ]);

}

ITEM_POOL.dropRare = () => {
    return ITEM_POOL._drop([
        [ITEM_POOL.items.rareDie,  0.50],
        [ITEM_POOL.items.fissure,  0.25],
        [ITEM_POOL.items.bedsheet, 0.25],
    ]);

}

ITEM_POOL.dropMythic = () => {
    return ITEM_POOL._drop([
        [ITEM_POOL.items.ray,  0.50],
        [ITEM_POOL.items.pick, 0.50],
    ]);
}
