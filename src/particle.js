class Particle {
    constructor(game, orig, dest, lifetime, text, color) {
        Object.assign(this, { game, orig, dest, color, lifetime, text });
        this.z = 200_000;
        this.elapsed = 0;
        this.x = orig.x;
        this.y = orig.y;


        this.game.addEntity(this);
    }

    update() {
        this.elapsed += this.game.clockTick;

        this.x = this.orig.x + (this.dest.x - this.orig.x) * (this.elapsed / this.lifetime);
        this.y = this.orig.y + (this.dest.y - this.orig.y) * (this.elapsed / this.lifetime);

        if (this.elapsed >= this.lifetime) {
            this.removeFromWorld = true;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.font = '24pt monospace';
        ctx.fillStyle = this.color;
        ctx.textBaseline = 'center';
        ctx.textAlign = 'center';
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}
