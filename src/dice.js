class Dice {
    constructor(game) {
        Object.assign(this, { game });
        this.scale = 3;
        this.size = 32;
        this.width = this.size * this.scale;
        this.height = this.size * this.scale;
        this.x = Math.floor((PARAMS.canvasWidth - this.width) / 2);
        this.y = Math.floor((PARAMS.canvasHeight - this.height) / 2);
        this.velocity = { x:0, y:0 };
        this.rotation = 0;
        this.rotationElapsedTime = 0;
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvas.width = this.size;
        this.offscreenCanvas.height = this.size;
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');
        this.image = ASSET_MANAGER.get('assets/empty-dice.png');

        this.sides = [
            {}
        ]

        this.currFaces = {}
        this.currFaces.north = { val: 1, sprite: ASSET_MANAGER.get('assets/top-face.png') }
        this.currFaces.west = { val: 4, sprite: ASSET_MANAGER.get('assets/left-face.png') }
        this.currFaces.east = { val: 2, sprite: ASSET_MANAGER.get('assets/right-face.png') }
    }

    onFloor() {
        const floorHeight = 100;
        return this.y >= PARAMS.canvasHeight - this.height + 8 * this.scale - floorHeight;
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        if (this.game.mouse.isDown) {
        //if (true) {
            const dx = this.game.mouse.x - (this.x + (this.width / 2));
            const dy = this.game.mouse.y - (this.y + (this.height / 2));
            this.velocity.x += dx * PARAMS.speed / 1000;
            this.velocity.y += dy * PARAMS.speed / 1000;

            this.x += dx * PARAMS.cling / 1000;
            this.y += dy * PARAMS.cling / 1000;
        } else {
            this.velocity.y += PARAMS.gravity / 1000;
        }

        if (this.onFloor()) {
            this.rotation = 0;
            this.velocity.x = this.velocity.x /  PARAMS.drag;
            this.velocity.y = this.velocity.y / (PARAMS.drag * 1.5);

            if (Math.abs(this.velocity.x) < 2)
                this.velocity.x = 0;
            if (Math.abs(this.velocity.y) < 2)
                this.velocity.y = 0;
        } else {
            this.rotationElapsedTime += this.game.clockTick;
            if (this.rotationElapsedTime >= 1 / PARAMS.rotationSpeed) {
                this.rotationElapsedTime = this.rotationElapsedTime % (1 / PARAMS.rotationSpeed);
                this.rotation += Math.PI / 2;
            }
        }
        
        // prevent dice from leaving play
        if (this.y <= 0 || this.y >= PARAMS.canvasHeight - this.height) {
            if (!this.onFloor())
                this.velocity.y = -this.velocity.y * PARAMS.bounce;

            this.y = clamp(0, this.y, PARAMS.canvasHeight - this.height);
        }
        if (this.x <= 0 || this.x >= PARAMS.canvasWidth - this.width) {
            this.velocity.x = -this.velocity.x * PARAMS.bounce;

            this.x = clamp(0, this.x, PARAMS.canvasWidth - this.width);
        }
    }

    draw(ctx) {
        // TEMP FELT TABLE
        ctx.fillStyle = 'green';
        ctx.fillRect(0, PARAMS.canvasHeight - 100, PARAMS.canvasWidth, 100)

        // rotate dice
        this.offscreenCtx.save();
        this.offscreenCtx.clearRect(0, 0, this.size, this.size);
        this.offscreenCtx.translate(this.size / 2, this.size / 2);
        this.offscreenCtx.rotate(this.rotation);
        this.offscreenCtx.translate(-this.size / 2, -this.size / 2);

        // draw empty dice
        this.offscreenCtx.drawImage(this.image, 0, 0, this.size, this.size);
        // draw top face
        this.offscreenCtx.drawImage(this.currFaces.north.sprite, 3, 1, 26, 14);
        // draw left face
        this.offscreenCtx.drawImage(this.currFaces.west.sprite, 1, 9, 14, 21);
        // draw right face
        this.offscreenCtx.drawImage(this.currFaces.east.sprite, 17, 9, 14, 21);
        this.offscreenCtx.restore();

        ctx.drawImage(this.offscreenCanvas, this.x, this.y, this.width, this.height);

        /*
        // draw empty dice
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        // draw top face
        ctx.drawImage(this.currFaces.north.sprite, this.x + (3 * this.scale), this.y + (1 * this.scale), 26 * this.scale, 14 * this.scale);
        // draw left face
        ctx.drawImage(this.currFaces.west.sprite, this.x + (1 * this.scale), this.y + (9 * this.scale), 14 * this.scale, 21 * this.scale);
        // draw right face
        ctx.drawImage(this.currFaces.east.sprite, this.x + (17 * this.scale), this.y + (9 * this.scale), 14 * this.scale, 21 * this.scale);
        */
    }
}
