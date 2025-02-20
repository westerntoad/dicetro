
const sum = (arr) => arr.reduce((acc, x) => acc + x, 0);

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
 *  Single              (value of face)
 *  Pair                (sum * 2)
 *  Three of a kind     (sum * 3)
 *  Two-pair            (sum * 3)
 *  Full house          (sum * 4)
 *  Four of a kind      (sum * 8)
 *  Five of a kind      (sum * 12)
 *  Three pairs         ((pair1 sum) * (pair2 sum) * (pair3 sum))
 *  Pair of triples     ((triplet1 sum) * (triplet2 sum) * 4)
 *  Six of a kind       (val * 216)
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
    if (highestCount == 6) {
        return ["Six of a kind", `${face} × 6^3`, face * 216];
    } else if (highestCount == 5) {
        return ["Five of a kind", `(${face} + ${face} + ${face} + ${face} + ${face}) × 12`, face * 5 * 12];
    } else if (highestCount == 4) {
        return ["Four of a kind", `(${face} + ${face} + ${face} + ${face}) × 8`, face * 4 * 8];
    } else if (highestCount == 3 && highestCountCount == 2) {
        let face2 = 0;
        for (let i = highestCountIdx - 1; i >= 1; i--) {
            if (counts[i] == counts[highestCountIdx]) {
                face2 = i;
                break;
            }
        }
        return ["Pair of triples", `(${face} + ${face} + ${face}) × (${face2} + ${face2} + ${face2}) × 4`, (face * 3 + face2 * 3) * 4];
    } else if (highestCount == 3) {
        // annoying full house edge case
        for (let i = highestCountIdx - 1; i >= 1; i--) {
            if (counts[i] == 2) {
                const face2 = i;
                return ["Full house", `(${face} + ${face} + ${face} + ${face2} + ${face2}) × 4`, (face * 3 + face2 * 2) * 4];
            }
        }
        return ["Three of a kind", `(${face} + ${face} + ${face}) × 3`, face * 3 * 3];
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
        return ["Three pair", `(${face} + ${face}) × (${face2} + ${face2}) × (${face3} + ${face3})`, face * 2 + face2 * 2 + face3 * 2];
    } else if (highestCount == 2 && highestCountCount == 2) {
        let face2 = 0;
        for (let i = highestCountIdx - 1; i >= 1; i--) {
            if (counts[i] == counts[highestCountIdx]) {
                face2 = i;
                break;
            }
        }
        return ["Two pair", `(${face} + ${face} + ${face2} + ${face2}) × 3`, (face * 2 + face2 * 2) * 3];
    } else if (highestCount == 2) {
        return ["Pair", `(${face} + ${face}) × 2`, face * 2 * 2];
    } else {
        return ["Single", `${face}`, face];
    }


    console.log(`Scored values:\n${vals}\nhighestCount = ${highestCount}`);
    // debug
    return ["Debug hand", "sum of hand", sum(dice)];
};

