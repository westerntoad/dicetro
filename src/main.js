const gameEngine = new GameEngine();

const PARAMS = {
    debug: true,
    initialRolls: 2, // in actuality, 3
    diceSlotCosts: [0, 5, 25, 100, 500, 5_000],
    speed: 75,
    cling: 100,
    friction: 100,
    gravity: 500,
    drag: 1.4,
    bounce: 0.4,
    rotationSpeed: 20,
    baseUncommonChance: 0.25,
    baseRareChance: 0.05,
    font: {
        shopName: '20pt Papyrus',
        common: '14pt Courier',
        uncommon: 'bold 14pt Courier',
        rare: 'italic 14pt Courier',
        gold: '20pt Courier',
        reroll: '20pt Courier'
    },
    color: {
        felt: '#008000',
        shopBackground: '#ffffff',
        shop: '#000000',
        common: '#888888',
        uncommon: '#1b7476',
        rare: '#ae02dd',
        gold: '#b5a642',
        reroll: '#008000',
        start: '#008000',
        startDark: '#338033',
        extraRoll: '#305473',
        extraRollDark: '#000000'
    }
}

const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queue('assets/empty-dice.png');
ASSET_MANAGER.queue('assets/bouncy-dice.png');
ASSET_MANAGER.queue('assets/left-right-sides.png');
ASSET_MANAGER.queue('assets/top-sides.png');
ASSET_MANAGER.queue('assets/left-right-sides-mult.png');
ASSET_MANAGER.queue('assets/top-sides-mult.png');
ASSET_MANAGER.queue('assets/dice-overlay.png');
ASSET_MANAGER.queue('assets/mult-overlay.png');
ASSET_MANAGER.queue('assets/reroll.png');
ASSET_MANAGER.queue('assets/coin.png');
ASSET_MANAGER.queue('assets/lock.png');
ASSET_MANAGER.queue('assets/clover.png');
ASSET_MANAGER.queue('assets/maintheme.wav');
ASSET_MANAGER.queue('assets/gameover.wav');
ASSET_MANAGER.queue('assets/diceland1.wav');
ASSET_MANAGER.queue('assets/diceland2.wav');
ASSET_MANAGER.queue('assets/diceland3.wav');

ASSET_MANAGER.downloadAll(() => {
    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");
    PARAMS.canvasWidth = canvas.width;
    PARAMS.canvasHeight = canvas.height;
    ctx.imageSmoothingEnabled = false;

    gameEngine.init(ctx);

    gameEngine.addEntity(new SceneManager(gameEngine));
    gameEngine.start();
});
