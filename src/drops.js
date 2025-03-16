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

ITEM_POOL._dropDice = (sideTable, multTable, bodyTable, modsTable, allSided) => {
    /*     0  1  2  3  4  5  6
    sides:[0, 0, 0, 0, 0, 0, 0],
           x2    x4    x8    x16
    mult: [0   , 0   , 0   , 0   ],
           bouncy    ghost    gold
    body: [0       , 0       ,0       ],
           fractured wings
    mods: [0       , 0       ],*/

    let body = "normal";
    let mods = [];
    let sides = [];
    let mult = [];
    if (!allSided) {
        sides = ITEM_POOL._allSidesFromTable(sideTable);
        mult = [0, 0, 0, 0, 0, 0];
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
    } else {
        let rand = Math.random();
        let sum = 0;
        let flag = false;

        for (let i = multTable.length - 1; i >= 0; i--) {
            sum += multTable[i];

            if (rand <= sum) {
                mult = Array(6).fill(2**(i+1));
                flag = true;
                break;
            }
        }

        if (!flag) {
            rand = Math.random();
            sum = 0;
            for (let i = 0; i < sideTable.length; i++) {
                sum += sideTable[i];

                if (rand <= sum) {
                    sides = Array(6).fill(i);
                    break;
                }
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
                body = 'gold'
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

    for (let i = 0; i < table.length; i++) {
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
                const genItem = ITEM_POOL._dropDice(el.gen.sides, el.gen.mult, el.gen.body, el.gen.mods, el.gen.allSided);
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

ITEM_POOL.items.commonDie = {
    name: 'Common Die',
    cost: 10,
    gen: {
        //     0     1     2     3     4     5     6
        sides:[0.01, 0.16, 0.16, 0.16, 0.21, 0.15, 0.15],
        //     x2    x4    x8    x16
        mult: [0.15, 0.15, 0.00, 0.00],
        //     bouncy    ghost     gold
        body: [0.10    , 0.02    , 0.02    ],
        //     fractured wings
        mods: [0.01    , 0.01    ],
    }
}

ITEM_POOL.items.valuableDie = {
    name: 'Valuable Die',
    cost: 25,
    gen: {
        //     0     1     2     3     4     5     6
        sides:[0   , 0.15, 0.15, 0.15, 0.15, 0.20, 0.20],
        //     x2    x4    x8    x16
        mult: [0.15, 0.15, 0.10, 0.00],
        //     bouncy    ghost     gold
        body: [0.15    , 0.05    , 0.20    ],
        //     fractured wings
        mods: [0.05    , 0.01    ],
    }
}

ITEM_POOL.items.bouncyNormalDie = {
    name: 'Bouncy Normal Die',
    cost: 40,
    item: {
        type: 'dice',
        sides:[1, 3, 6, 4, 5, 2],
        mult: [0, 0, 0, 0, 0, 0],
        body: "bouncy",
        mods: []
    }
}

ITEM_POOL.items.lowMultDie = {
    name: 'Low Mult Die',
    cost: 30,
    item: {
        type: 'dice',
        sides:[0, 0, 0, 0, 0, 0],
        mult: [2, 2, 2, 2, 2, 2],
        body: "normal",
        mods: []
    }
}

ITEM_POOL.items.wingedDie = {
    name: 'Winged Die',
    cost: 50,
    gen: {
        //     0     1     2     3     4     5     6
        sides:[0   , 0.15, 0.25, 0.15, 0.15, 0.20, 0.10],
        //     x2    x4    x8    x16
        mult: [0.10, 0.05, 0.00, 0.00],
        //     bouncy    ghost     gold
        body: [0.00    , 0.20    , 0.00    ],
        //     fractured wings
        mods: [0.00    , 1.00    ],
    }
}

ITEM_POOL.items.rareDie = {
    name: 'Rare Die',
    cost: 100,
    gen: {
        //     0     1     2     3     4     5     6
        sides:[0   , 0.05, 0.05, 0.05, 0.30, 0.20, 0.35],
        //     x2    x4    x8    x16
        mult: [0.00, 0.05, 0.15, 0.05],
        //     bouncy    ghost     gold
        body: [0.15    , 0.10    , 0.10    ],
        //     fractured wings
        mods: [0.05    , 0.10    ],
    }
}

ITEM_POOL.items.allSidedDie = {
    name: 'All-sided Die',
    cost: 150,
    gen: {
        //     0     1     2     3     4     5     6
        sides:[0   , 0.05, 0.05, 0.05, 0.30, 0.20, 0.35],
        //     x2    x4    x8    x16
        mult: [0.00, 0.05, 0.05, 0.00],
        //     bouncy    ghost     gold
        body: [0.15    , 0.05    , 0.10    ],
        //     fractured wings
        mods: [0.10    , 0.05    ],

        allSided: true
    }
}

ITEM_POOL.items.goldDie = {
    name: 'Gold Die',
    cost: 300,
    gen: {
        //     0     1     2     3     4     5     6
        sides:[0   , 0.05, 0.10, 0.15, 0.20, 0.20, 0.30],
        //     x2    x4    x8    x16
        mult: [0.00, 0.00, 0.00, 0.00],
        //     bouncy    ghost     gold
        body: [0.00    , 0.00    , 1.00    ],
        //     fractured wings
        mods: [0.00    , 0.00    ],
    }
}

ITEM_POOL.items.ghostDie = {
    name: 'Ghost Die',
    cost: 200,
    gen: {
        //     0     1     2     3     4     5     6
        sides:[0.01, 0.17, 0.17, 0.17, 0.18, 0.15, 0.15],
        //     x2    x4    x8    x16
        mult: [0.02, 0.10, 0.02, 0.00],
        //     bouncy    ghost     gold
        body: [0.00    , 1.00    , 0.00    ],
        //     fractured wings
        mods: [0.00    , 0.20    ],
    }
}

ITEM_POOL.items.fracturedDie = {
    name: 'Fractured Die',
    cost: 300,
    gen: {
        //     0     1     2     3     4     5     6
        sides:[0   , 0.15, 0.15, 0.15, 0.15, 0.20, 0.20],
        //     x2    x4    x8    x16
        mult: [0.00, 0.00, 0.00, 0.00],
        //     bouncy    ghost     gold
        body: [0.15    , 0.05    , 0.10    ],
        //     fractured wings
        mods: [1.00    , 0.00    ],
    }
}

ITEM_POOL.items.megaMultDie = {
    name: 'MEGA-MULT Die',
    cost: 1000,
    gen: {
        //     0     1     2     3     4     5     6
        sides:[0   , 0.00, 0.00, 0.00, 0.00, 0.00, 0.00],
        //     x2    x4    x8    x16
        mult: [0.00, 0.00, 0.00, 1.00],
        //     bouncy    ghost     gold
        body: [0.05    , 0.05    , 0.15    ],
        //     fractured wings
        mods: [0.00    , 0.00    ],

        allSided: true
    }
}

ITEM_POOL.items.absurdBounceDie = {
    name: 'Absurdly Bouncy Die',
    cost: 2000,
    gen: {
        //     0     1     2     3     4     5     6
        sides:[0   , 0.00, 0.00, 0.00, 0.00, 0.00, 0.00],
        //     x2    x4    x8    x16
        mult: [0.00, 0.00, 0.00, 1.00],
        //     bouncy    ghost     gold
        body: [0.05    , 0.05    , 0.15    ],
        //     fractured wings
        mods: [0.00    , 0.00    ],

        allSided: true
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

// lost money
ITEM_POOL.items.penny = {
    name: 'Lost Penny',
    cost: 0,
    item: {
        type: 'consumable',
        icon: 'assets/penny.png',
        desc: 'Gain 1 gold - lucky you!'
    }
}

ITEM_POOL.items.nickel = {
    name: 'Lost Nickel',
    cost: 0,
    item: {
        type: 'consumable',
        icon: 'assets/nickel.png',
        desc: 'Gain 5 gold - lucky you!'
    }
}

ITEM_POOL.items.dime = {
    name: 'Lost Dime',
    cost: 0,
    item: {
        type: 'consumable',
        icon: 'assets/dime.png',
        desc: 'Gain 10 gold - lucky you!'
    }
}

ITEM_POOL.items.quarter = {
    name: 'Lost Quarter',
    cost: 0,
    item: {
        type: 'consumable',
        icon: 'assets/quarter.png',
        desc: 'Gain 25 gold - lucky you!'
    }
}


ITEM_POOL.items.dollar = {
    name: 'Lost Dollar',
    cost: 0,
    item: {
        type: 'consumable',
        icon: 'assets/dollar.png',
        desc: 'Gain 100 gold - lucky you!'
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
        icon: 'assets/bedsheet.png',
        desc: 'Increase the rate ghost dice trigger.'
    }
}

ITEM_POOL.items.midas = {
    name: 'Foot of Midas',
    cost: 1,
    item: {
        type: 'passive',
        icon: 'assets/midas.png',
        desc: 'Increase the value of gold dice.'
    }
}

ITEM_POOL.items.spaceStation = {
    name: 'Space Station',
    cost: 1,
    item: {
        type: 'passive',
        icon: 'assets/space-station.png',
        desc: 'Gives gold equal to the highest altitude reached for a roll.'
    }
}

// doubles values of base hands
// whenever a dice hits a wall, score it
// bouncy dice are more effective

/*
 *      ~~~~ DROPS ~~~~
 */


ITEM_POOL.dropCommon = () => {
    if (PARAMS.debug) {
        return ITEM_POOL._drop([
            [ITEM_POOL.items.poorDie,       1.00]
        ]);
    } else {
        return ITEM_POOL._drop([
            [ITEM_POOL.items.normalDie,    0.10],
            [ITEM_POOL.items.commonDie,    0.30],

            [ITEM_POOL.items.penny,        0.06],
            [ITEM_POOL.items.nickel,       0.06],
            [ITEM_POOL.items.dime,         0.06],
            [ITEM_POOL.items.quarter,      0.06],
            [ITEM_POOL.items.dollar,       0.06],
            [ITEM_POOL.items.spaceman,     0.15],
            [ITEM_POOL.items.tar,          0.15]
        ]);
    }
}

ITEM_POOL.dropUncommon = () => {
    return ITEM_POOL._drop([
        [ITEM_POOL.items.valuableDie,     0.25],
        [ITEM_POOL.items.bouncyNormalDie, 0.15],
        [ITEM_POOL.items.lowMultDie,      0.20],
        [ITEM_POOL.items.wingedDie,       0.05],

        [ITEM_POOL.items.spaceStation,    0.15],
        [ITEM_POOL.items.clover,          0.10],
        [ITEM_POOL.items.freeShop,        0.10],
    ]);

}

ITEM_POOL.dropRare = () => {
    return ITEM_POOL._drop([
        [ITEM_POOL.items.rareDie,      0.25],
        [ITEM_POOL.items.allSidedDie,  0.20],
        [ITEM_POOL.items.goldDie,      0.15],
        [ITEM_POOL.items.ghostDie,     0.05],
        [ITEM_POOL.items.fracturedDie, 0.10],

        [ITEM_POOL.items.bedsheet,     0.10],
        [ITEM_POOL.items.midas,        0.15],
    ]);

}

ITEM_POOL.dropMythic = () => {
    return ITEM_POOL._drop([
        [ITEM_POOL.items.megaMultDie,     0.20],
        [ITEM_POOL.items.absurdBounceDie, 0.20],

        [ITEM_POOL.items.ray,             0.20],
        [ITEM_POOL.items.fissure,         0.20],
        [ITEM_POOL.items.pick,            0.20],
    ]);
}
