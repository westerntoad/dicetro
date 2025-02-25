const gameEngine = new GameEngine();

const PARAMS = {
    debug: true,
    initialRolls: 2, // in actuality, 3
    diceSlotCosts: [0, 5, 25, 100, 500, 5_000],
    speed: 20,
    cling: 25,
    friction: 100,
    gravity: 1500,
    drag: 1.4,
    bounce: 0.4,
    rotationSpeed: 20,
    uncommonChance: 0.25,
    rareChance: 0.05,
    mythicChance: 0.01,
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

if (PARAMS.debug) {
    PARAMS.uncommonChance = 0.25;
    PARAMS.rareChance = 0.25;
    PARAMS.mythicChance = 0.25;
}

const BODY_PROPERTIES = [];
BODY_PROPERTIES["normal"] = {
    weight: 1,
    bounce: 1,
    drag: 1
}
BODY_PROPERTIES["bouncy"] = {
    weight: 0.85,
    bounce: 2.25,
    drag: 1
}
BODY_PROPERTIES["gold"] = {
    weight: 3,
    bounce: 0.2,
    drag: 1.1
}
BODY_PROPERTIES["ghost"] = {
    weight: 0.4,
    bounce: 0.8,
    drag: 0.2
}

const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queue('assets/empty-dice.png');
ASSET_MANAGER.queue('assets/bouncy-dice.png');
ASSET_MANAGER.queue('assets/gold-dice.png');
ASSET_MANAGER.queue('assets/ghost-dice.png');
ASSET_MANAGER.queue('assets/fractured-mod.png');
ASSET_MANAGER.queue('assets/wings-mod.png');
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
ASSET_MANAGER.queue('assets/ray.png');
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
