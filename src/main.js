const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queue('assets/empty-dice.png');
ASSET_MANAGER.queue('assets/top-face.png');
ASSET_MANAGER.queue('assets/left-face.png');
ASSET_MANAGER.queue('assets/right-face.png');

ASSET_MANAGER.downloadAll(() => {
    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    gameEngine.init(ctx);

    gameEngine.addEntity(new Dice(gameEngine, { width: canvas.width, height: canvas.height}));
    gameEngine.start();
});
