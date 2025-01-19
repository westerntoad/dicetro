class Dice {
    constructor(game) {
        Object.assign(this, { game });
        this.scale = 4;
        this.width = 32 * this.scale;
        this.height = 32 * this.scale;
        this.x = Math.floor((PARAMS.canvasWidth - this.width) / 2);
        this.y = Math.floor((PARAMS.canvasHeight - this.height) / 2);
        this.speed = 100;
        this.cling = 100;
        this.velocity = { x:0, y:0 };
        this.rotation = 0;
        this.image = ASSET_MANAGER.get('assets/empty-dice.png');

        this.currFaces = {}
        this.currFaces.north = { val: 1, sprite: ASSET_MANAGER.get('assets/top-face.png') }
        this.currFaces.west = { val: 4, sprite: ASSET_MANAGER.get('assets/left-face.png') }
        this.currFaces.east = { val: 2, sprite: ASSET_MANAGER.get('assets/right-face.png') }

    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        if (this.game.mouse.isDown) {
        //if (true) {
            const dx = this.game.mouse.x - (this.x + (this.width / 2));
            const dy = this.game.mouse.y - (this.y + (this.height / 2));
            this.velocity.x += dx * this.speed / 1000;
            this.velocity.y += dy * this.speed / 1000;

            this.x += dx * this.cling / 1000;
            this.y += dy * this.cling / 1000;
        } else {
            this.velocity.y += PARAMS.gravity / 1000;
        }
        if (this.x <= 0 || this.x >= PARAMS.canvasWidth - this.width) {
            this.x = clamp(0, this.x, PARAMS.canvasWidth - this.width);
            this.velocity.x = 0;
        }
        if (this.y <= 0 || this.y >= PARAMS.canvasHeight- this.height) {
            this.y = clamp(0, this.y, PARAMS.canvasHeight - this.height);
            this.velocity.y = PARAMS.gravity / 1000;
        }
    }

    draw(ctx) {
        // draw empty dice
        ctx.drawImage(this.image, this.x, this.y, this.width, this.width);

        // draw top face
        ctx.drawImage(this.currFaces.north.sprite, this.x + (3 * this.scale), this.y + (1 * this.scale), 26 * this.scale, 14 * this.scale);
        // draw left face
        ctx.drawImage(this.currFaces.west.sprite, this.x + (1 * this.scale), this.y + (9 * this.scale), 14 * this.scale, 21 * this.scale);
        // draw right face
        ctx.drawImage(this.currFaces.east.sprite, this.x + (17 * this.scale), this.y + (9 * this.scale), 14 * this.scale, 21 * this.scale);
    }
}
