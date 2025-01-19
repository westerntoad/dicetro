const gameEngine = new GameEngine();

const PARAMS = {
    gravity: 300,
    drag: 5
}

const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queue('assets/empty-dice.png');
ASSET_MANAGER.queue('assets/top-face.png');
ASSET_MANAGER.queue('assets/left-face.png');
ASSET_MANAGER.queue('assets/right-face.png');

ASSET_MANAGER.downloadAll(() => {
    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");
    PARAMS.canvasWidth = canvas.width;
    PARAMS.canvasHeight = canvas.height;
    ctx.imageSmoothingEnabled = false;

    gameEngine.init(ctx);

    gameEngine.addEntity(new Dice(gameEngine));
    gameEngine.start();
});
