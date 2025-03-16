const gameEngine = new GameEngine();

const PARAMS = {
    debug: false,
    initialRolls: 2, // in actuality, 3
    extraRollCosts: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25,
        30, 35, 40, 45, 50, 60, 70, 80, 90,
        100, 150, 200, 250, 300, 400, 500, 700,
        1_000, 2_000, 3_000, 4_000, 5_000, 10_000,
        15_000, 20_000, 25_000, 50_000, 100_000, 150_000, 250_000,
        500_000, 1_000_000, 10_000_000, 100_000_000, 500_000_000,
        1_000_000_000, 10_000_000_000, 100_000_000_000, 1_000_000_000_000,
        9_007_199_254_740_991 // max range of javascript integers
    ],
    diceSlotCosts: [0, 5, 25, 100, 500, 5_000],
    speed: 20,
    cling: 25,
    friction: 100,
    gravity: 1500,
    drag: 1.4,
    bounce: 0.4,
    rotationSpeed: 20,
    uncommonChance: 0.125,
    rareChance: 0.02,
    mythicChance: 0.005,
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

/*if (PARAMS.debug) {
    PARAMS.uncommonChance = 0.15;
    PARAMS.rareChance = 0.15;
    PARAMS.mythicChance = 0.15;
}*/

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

// dice bodies
ASSET_MANAGER.queue('assets/empty-dice.png');
ASSET_MANAGER.queue('assets/bouncy-dice.png');
ASSET_MANAGER.queue('assets/gold-dice.png');
ASSET_MANAGER.queue('assets/ghost-dice.png');

// mods
ASSET_MANAGER.queue('assets/fractured-mod.png');
ASSET_MANAGER.queue('assets/wings-mod.png');

// dice sides
ASSET_MANAGER.queue('assets/left-right-sides.png');
ASSET_MANAGER.queue('assets/top-sides.png');
ASSET_MANAGER.queue('assets/left-right-sides-mult.png');
ASSET_MANAGER.queue('assets/top-sides-mult.png');

// overlays
ASSET_MANAGER.queue('assets/overlay-faces.png');
ASSET_MANAGER.queue('assets/overlay-bodies.png');

// shop icons
ASSET_MANAGER.queue('assets/reroll.png');
ASSET_MANAGER.queue('assets/coin.png');
ASSET_MANAGER.queue('assets/lock.png');
ASSET_MANAGER.queue('assets/invalid-icon.png');

// consumables
ASSET_MANAGER.queue('assets/pick.png');
ASSET_MANAGER.queue('assets/penny.png');
ASSET_MANAGER.queue('assets/nickel.png');
ASSET_MANAGER.queue('assets/dime.png');
ASSET_MANAGER.queue('assets/quarter.png');
ASSET_MANAGER.queue('assets/dollar.png');
ASSET_MANAGER.queue('assets/ray.png');

// passives
ASSET_MANAGER.queue('assets/clover.png');
ASSET_MANAGER.queue('assets/fissure.png');
ASSET_MANAGER.queue('assets/tar.png');
ASSET_MANAGER.queue('assets/spaceman.png');
ASSET_MANAGER.queue('assets/free-shop.png');
ASSET_MANAGER.queue('assets/midas.png');
ASSET_MANAGER.queue('assets/space-station.png');
ASSET_MANAGER.queue('assets/bedsheet.png');

// music
ASSET_MANAGER.queue('assets/maintheme.wav');
ASSET_MANAGER.queue('assets/gameover.wav');

// sound effects
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
