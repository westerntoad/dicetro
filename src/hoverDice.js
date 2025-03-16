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
                if (db.isHighlighted && db.unlocked) {
                    this.scene.dice[db.buttonIdx] = this.currDice;
                    this.cleanup();
                }
            });
        }
    }

    draw(ctx) {
        const mx = this.game.mouse.x;
        const my = this.game.mouse.y;
        let sx = 0;
        if (this.currDice.body == 'bouncy') {
            sx = 16;
        } else if (this.currDice.body == 'gold') {
            sx = 32;
        } else if (this.currDice.body == 'ghost') {
            sx = 48;
        }
        ctx.drawImage(this.origDiceButt.normalDiceImg, sx, 0, 16, 16, mx - 38 * 0.5, my - 38 * 0.5, 38, 38);

    }
}
