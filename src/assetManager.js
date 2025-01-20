class AssetManager {
    constructor() {
        this.successCount = 0;
        this.errorCount = 0;
        this.cache = [];
        this.downloadQueue = [];
    };

    queue(path) {
        console.log("Queueing " + path);
        this.downloadQueue.push(path);
    };

    isDone() {
        return this.downloadQueue.length === this.successCount + this.errorCount;
    };

    downloadAll(callback) {
        if (this.downloadQueue.length === 0) setTimeout(callback, 10);
        for (let i = 0; i < this.downloadQueue.length; i++) {
            const path = this.downloadQueue[i];
            const split = path.split(".");
            const ext = split[split.length - 1];

            switch (ext) {
                case 'jpg':
                case 'png':
                    const img = new Image();
                    img.addEventListener("load", () => {
                        console.log(`Loaded ${path}`);
                        this.successCount++;
                        if (this.isDone()) callback();
                    });

                    img.addEventListener("error", () => {
                        console.log(`Error loading ${path}`);
                        this.errorCount++;
                        if (this.isDone()) callback();
                    });

                    img.src = path;
                    this.cache[path] = img;
                    break;
                case 'json':
                    fetch(path)
                        .then(response => response.json())
                        .then(data => {
                            console.log(`Loaded ${path}`);
                            this.successCount++;
                            this.cache[path] = data;
                            if (this.isDone()) callback();
                        })
                        .catch(error => {
                            this.errorCount++;
                            console.error(error);
                            if (this.isDone()) callback();
                        });
                    break;
                case 'wav':
                case 'mp3':
                case 'mp4':
                    const aud = new Audio();
                    aud.addEventListener("loadeddata", () => {
                        console.log("Loaded " + this.src);
                        this.successCount++;
                        if (this.isDone()) callback();
                    });

                    aud.addEventListener("error", () => {
                        console.log("Error loading " + this.src);
                        this.errorCount++;
                        if (this.isDone()) callback();
                    });

                    aud.addEventListener("ended", () => {
                        aud.pause();
                        aud.currentTime = 0;
                    });

                    aud.src = path;
                    aud.load();

                    this.cache[path] = aud;
                    break;
            }
        }
    };

    get(path) {
        return this.cache[path];
    };

    playAsset(path) {
        const audio = this.cache[path];
        if (audio.currentTime != 0) {
            let bak = audio.cloneNode();
            bak.currentTime = 0;
            bak.volume = audio.volume;
            bak.play();
        } else {
            audio.currentTime = 0;
            audio.play();
        }
    };

    autoRepeat(path) {
        var aud = this.cache[path];
        aud.addEventListener("ended", function () {
            aud.play();
        });
    };
};

