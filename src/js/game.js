var Game = {
    _display: null, //Canvas context
    _currentScreen: null, //
    _width: 640, // canvas width
    _height: 480, // canvas height
    _tileSize: 32,
    _assetsToLoad: [],
    _assetsLoaded: 0,
    init: function() {
        var canvas = document.createElement("canvas");
        canvas.width = this._width;
        canvas.height = this._height;
        canvas.style.backgroundColor = "black";
        this._display = canvas.getContext("2d");
        document.body.appendChild(canvas);
        window.focus();
        //Dispatch event listeners on game screens
        var game = this;
        var bindEventToScreen = function(eventType) {
            window.addEventListener(eventType, function(event) {
                if(game._currentScreen) {
                    game._currentScreen.handleInput(eventType, event);
                }
            });
        }
        bindEventToScreen("keydown");
        // bindEventToScreen("click");
    },
    //Standard getters
    getDisplay: function() {
        return this._display;
    },
    getWidth: function() {
        return this._width;
    },
    getHeight: function() {
        return this._height;
    },
    centerX: function() {
        return ~~(this._width / 2);
    },
    centerY: function() {
        return ~~(this._height / 2);
    },
    getTileSize: function() {
        return this._tileSize;
    },
    //Cycle through game screens, start, play, game over
    switchScreen: function(screen) {
        if(this._currentScreen) {
            if(this.timerID) {
                clearInterval(this.timerID);
            }
            this._currentScreen.exit();
        }
        this._currentScreen = screen;
        if(this._currentScreen) {
            this._currentScreen.enter();
            this.refreshScreen();
        }
    },
    //
    refreshScreen: function() {
        var game = this;
        this.timerID = setInterval(function() {
                game._currentScreen.render(game._display);
        },1000/15);
    }
};

window.onload = function() {
    //
    Game.loadHandler = function() {
        Game._assetsLoaded++;
        //
        if(Game._assetsLoaded >= Game._assetsToLoad.length) {
            //
            for(var key in Game.sounds) {
                Game.sounds[key].removeEventListener("canplaythrough", Game.loadHandler, false);
            }
            Game.spriteSheet.removeEventListener("load", Game.loadHandler, false);
            //
            Game.init();
            Game.switchScreen(Game.Screens.startScreen);
        }
    }
    //
    Game.sounds = {
        attack: document.querySelector("#attack"),
        enterDungeon: document.querySelector("#enter-dungeon"),
        lvlUp: document.querySelector("#lvl-up"),
        pickArmor: document.querySelector("#pick-armor"),
        pickShield: document.querySelector("#pick-shield"),
        pickWeapon: document.querySelector("#pick-weapon"),
        potion: document.querySelector("#potion"),
        toggleHelp: document.querySelector("#toggle-help"),
    };
    //
    for(var key in Game.sounds) {
        Game.sounds[key].addEventListener("canplaythrough", Game.loadHandler, false);
        Game.sounds[key].load();
        Game._assetsToLoad.push(Game.sounds[key]);
    }
    //
    Game.spriteSheet = new Image();
    Game.spriteSheet.src = "./assets/img/spritesTilesSheet.png";
    Game.spriteSheet.addEventListener("load", Game.loadHandler, false);
    Game._assetsToLoad.push(Game.spriteSheet);
}



