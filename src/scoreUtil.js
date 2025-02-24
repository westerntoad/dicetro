

/*
 * Takes an array of rolled dice values & returns both a string stating the
 * name of the hand scored, as well as a value for the hand to be added to
 * the player's bank. The two are returned as an array and can be accessed
 * like so:
 *
 * ```
 * const [name, desc, value] = score();
 * ```
 *
 * ALL HANDS (ordered least to greatest in value):
 *  Single              1
 *  Pair                2
 *  Three of a kind     4
 *  Two-pair            4
 *  Full house          8
 *  Four of a kind      12
 *  Five of a kind      16
 *  Three pairs         24
 *  Pair of triples     24
 *  Six of a kind       32
 */
const score = dice => {
    if (dice.length == 0)
        return undefined;

    const countValue = val => {
        let acc = 0;
        dice.forEach(el => {
            if (el.val == val)
                acc++;
        });
        return acc;
    };

    let counts = [];
    let highestCount = -1;
    let highestCountIdx = -1;
    let highestCountCount = 0;
    for (let i = 1; i <= 6; i++) {
        counts[i] = countValue(i);
        if (counts[i] >= highestCount) {
            if (highestCount == counts[i]) {
                highestCountCount += 1;
            } else {
                highestCountCount = 1;
            }
            highestCount = counts[i];
            highestCountIdx = i;
        }
    }

    const face = highestCountIdx;
    if (highestCount >= 6) {
        return ["Six of a kind", `REPLACE`, 32];
    } else if (highestCount == 5) {
        return ["Five of a kind", `REPLACE`, 16];
    } else if (highestCount == 4) {
        return ["Four of a kind", `REPLACE`, 12];
    } else if (highestCount == 3 && highestCountCount == 2) {
        let face2 = 0;
        for (let i = highestCountIdx - 1; i >= 1; i--) {
            if (counts[i] == counts[highestCountIdx]) {
                face2 = i;
                break;
            }
        }
        return ["Pair of triples", `REPLACE`, 24];
    } else if (highestCount == 3) {
        // annoying full house edge case
        for (let i = highestCountIdx - 1; i >= 1; i--) {
            if (counts[i] == 2) {
                const face2 = i;
                return ["Full house", `REPLACE`, 8];
            }
        }
        return ["Three of a kind", `REPLACE`, 4];
    } else if (highestCount == 2 && highestCountCount == 3) {
        let face2 = 0;
        for (let i = highestCountIdx - 1; i >= 1; i--) {
            if (counts[i] == counts[highestCountIdx]) {
                face2 = i;
                break;
            }
        }
        let face3 = 0;
        for (let i = face2 - 1; i >= 1; i--) {
            if (counts[i] == counts[highestCountIdx]) {
                face3 = i;
                break;
            }
        }
        return ["Three pair", `REPLACE`, 24];
    } else if (highestCount == 2 && highestCountCount == 2) {
        let face2 = 0;
        for (let i = highestCountIdx - 1; i >= 1; i--) {
            if (counts[i] == counts[highestCountIdx]) {
                face2 = i;
                break;
            }
        }
        return ["Two pair", `REPLACE`, 4];
    } else if (highestCount == 2) {
        return ["Pair", `REPLACE`, 2];
    } else if (highestCount == 1) {
        return ["Single", `REPLACE`, 1];
    } else {
        return ["None", `REPLACE`, 0];
    }


    console.log(`Scored values:\n${vals}\nhighestCount = ${highestCount}`);
    // debug
    return ["Debug hand", "sum of hand", sum(dice)];
};

