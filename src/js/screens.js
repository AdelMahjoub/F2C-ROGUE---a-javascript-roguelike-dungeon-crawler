//Game screens, start, play and game over screens
Game.Screens = {};
//
Game.Screens.startScreen = {
    _blinkCounter: 0,
    _blinkFrequency: 2,
    _gameTitle: {},
    _welComeMessage: {},
    //
    enter: function() {
        //Initialise start screen
        //Initialize game title text
        this._gameTitle = Game.Screens.TextObject.create({
            text: "JavaScript Roguelike",
            font: "30px Audiowide",
            color: "white",
            textAlign: "center",
            x: Game.centerX(),
            y: Game.centerY() - Game._tileSize
        });
        //Initialize welcome message text
        this._welComeMessage = Game.Screens.TextObject.create({
            text: "Press [ENTER] to start",
            font: "30px Audiowide",
            color: "goldenrod",
            textAlign: "center",
            x: Game.centerX(),
            y: Game.centerY()
        });
    },
    //
    exit: function() {
        /*

        */
    },
    //
    render: function(display) {
        //Clear previous render
        display.clearRect(0, 0, Game.getWidth(), Game.getHeight());
        //Render Game title
        Game.Screens.drawText(this._gameTitle, display);
        //Render welcome message
        this._blinkCounter += 0.1;
        if(~~(this._blinkCounter) % this._blinkFrequency === 0){
            Game.Screens.drawText(this._welComeMessage, display);
        }
    },
    //
    handleInput: function(inputType, inputData) {
        if(inputType === "keydown") {
            if(inputData.keyCode === 13) {
                Game.switchScreen(Game.Screens.playScreen);
            }
        }
    }
};
//
Game.Screens.playScreen = {
    //
    _map: null, //Dungeon Map, 2D array of tiles (objects)
    _player: null, //The player object, actor extend entity extend tile
    _screenWidth: Game.getWidth(), //Canvas width
    _screenHeight: Game.getHeight(), //Canvas height
    _cameraX: null, //top x corner of the display, used for scrolling
    _cameraY: null, //top y corner of the display, used for scrolling
    _cameraWidth: null,
    _cameraHeight: null,
    _toggleHelp: false,
    //
    fogOfWar: {
        visible: true,
        alpha: 1,
        radius: 8,
        unit: null
    },
    //Initialization
    enter: function() {
        Game.sounds.enterDungeon.currentTime = 0;
        Game.sounds.enterDungeon.play();
        var mapWidth = 100; //Number of columns of the tiles array
        var mapHeight = 100; //Number of rows of the tiles array
        var map = [];
        for(var x = 0; x < mapWidth; x++) {
            map[x] = [];
            for(var y = 0; y < mapHeight; y++) {
                map[x][y] = Game.Tiles.nullTile;
            }
        }
        //Get a random Dungeon map, 2D array of tiles
      
        var digger = new ROT.Map.Uniform(mapWidth, mapHeight);
        var diggerClallback = function(x, y, v) {
            if(v === 1) {
                map[x][y] = Game.Tiles.wallTile;
            } else {
                map[x][y] = Game.Tiles.floorTile;
            }
        }
        digger.create(diggerClallback);
        //Initialize the player
        this._player = new Game.Actor(Game.Templates.player);
        //Initialize the screen dungeon map
        this._map = new Game.Map(map, this._player);
        this.fogOfWar.unit = this._player.getWidth();
        //Get rid of unecessary walls tiles
        this.reduceWalls(this._map);
    },
    //
    exit: function() { 
        /*
        
        */
    },
    //Display Map tiles and entities
    render: function(display) {
        //Initialize the camera position, centered on player's position
        this.setCamera();
        //Clear the previous render
        display.clearRect(
            0, 0,
            this._map.getWidth() * this._player.getWidth(),
            this._map.getHeight() * this._player.getHeight()
        );
        //render the map
        for(var x = 0; x < this._map.getWidth(); x++) {
            for(var y = 0; y < this._map.getHeight(); y++) {
                var tile = this._map.getTileAt(x, y);
                display.save();
                display.translate(-this._cameraX, -this._cameraY);
                display.drawImage(
                    Game.spriteSheet,
                    tile.getSrcX(), tile.getSrcY(),
                    tile.getSrcWidth(), tile.getSrcHeight(),
                    ~~(x * tile.getWidth()),
                    ~~(y * tile.getHeight()),
                    tile.getWidth(), tile.getHeight()
                );
                display.restore();
            };
        };
        //Render entities
        for(var i = 0; i < this._map.getEntities().length; i++) {
            var entity = this._map.getEntities()[i];
            display.save();
            display.translate(-this._cameraX, -this._cameraY)
            display.drawImage(
                Game.spriteSheet,
                entity.getSrcX(), entity.getSrcY(),
                entity.getSrcWidth(), entity.getSrcHeight(),
                ~~(entity.getX() * entity.getWidth()),
                ~~(entity.getY() * entity.getHeight()),
                entity.getWidth(), entity.getHeight()
            );
            //Render entities health bars
            Game.Screens.UI.drawHpBars(entity, display);
            display.restore();
        };
        //Render fog of war
        if(this.fogOfWar.visible) {
            for(var x = 0; x < this._map.getWidth(); x++) {
                for(var y = 0; y < this._map.getHeight(); y++) {
                display.save();
                display.translate(-this._cameraX, -this._cameraY);
                var vx = x - this._player.getX();
                var vy = y - this._player.getY();
                var distance = Math.sqrt(vx * vx + vy * vy);
                if(distance <= this.fogOfWar.radius) {
                    this.fogOfWar.alpha = distance / this.fogOfWar.radius;
                } else {
                     this.fogOfWar.alpha = 1;
                }
                display.globalAlpha =  this.fogOfWar.alpha;
                display.fillStyle = "black";
                display.fillRect(
                    ~~(x * this.fogOfWar.unit), ~~(y * this.fogOfWar.unit),
                    this.fogOfWar.unit, this.fogOfWar.unit
                )
                display.restore();
                };
            };
        };
        //Render UI
        Game.Screens.UI.render(this._player, display);
        //Help screen
        if(this._toggleHelp) {
            Game.Screens.UI.helpScreen(display);
        }
    },
    //
    handleInput: function(inputType, inputData) {
        if(inputType === "keydown") { 
            var code = inputData.keyCode;
            // console.log(code);
            switch(code) {
                //Up arrow key
                case 38:
                    this.move(0, -1); //Move up
                    break;
                //Down arrow key
                case 40:
                    this.move(0, 1); //Move down
                    break;
                //Right arrow key
                case 39:
                    this.move(1, 0); //Move right
                    break;
                //Left arrow key
                case 37:
                    this.move(-1,0) //Move left
                    break;
                //[P] key
                case 80:
                    this._player.drinkPotion();
                    break;
                //[F] key
                case 70:
                    this.fogOfWar.visible = !this.fogOfWar.visible;
                    break;
                //[H] key
                case 72:
                    this._toggleHelp = !this._toggleHelp;
                    Game.sounds.toggleHelp.currentTime = 0;
                    Game.sounds.toggleHelp.play();
                    break;
            }
        }
        //
        if(inputType === "click") {
            var x = ~~((inputData.offsetX + this._cameraX) / Game._tileSize);
            var y = ~~((inputData.offsetY + this._cameraY) / Game._tileSize);
            var entity = this._map.getEntityAt(x, y);
            console.log(entity);
        }
    },
    //
    move: function(dx, dy) {
        var newX = this._player.getX() + dx;
        var newY = this._player.getY() + dy;
        this._player.tryMove(newX, newY, this._map);
    },
    //Walls only adjacent to floors
    //Get rid of unecessary walls
    reduceWalls: function(map) {
        for(var x = 0; x < map.getWidth(); x++) {
            for(var y = 0; y < map.getHeight(); y++) {
                if(!map.checkSurroundingTiles(x, y)) {
                    map.getTiles()[x][y] = Game.Tiles.nullTile;
                }
            }
        }
    },
    //Set the screen camera position, centered on the player 
    setCamera: function() {
        this._cameraWidth = this._screenWidth - Game._tileSize;
        this._cameraHeight =  this._screenHeight - Game._tileSize;
        var centerX = ~~(this._player.getX() * this._player.getWidth());
        var centerY = ~~(this._player.getY() * this._player.getHeight());
        this._cameraX = Math.max(0, ~~(centerX - this._cameraWidth / 2));
        this._cameraY = Math.max(0, ~~(centerY - this._cameraHeight / 2));
        this._cameraX = Math.min(
            this._cameraX,
            this._map.getWidth() * this._player.getWidth() - this._cameraWidth
        );
        this._cameraY = Math.min(
            this._cameraY, 
            this._map.getWidth() * this._player.getWidth() - this._cameraHeight
        );
    }   
};

Game.Screens.endScreen = {
    _blinkCounter: 0,
    _blinkFrequency: 2,
    _endMessage: {},
    _endTitle: {},
    enter: function() {
        this._endTitle = Game.Screens.TextObject.create({
            text: "The Dungeon Lord Got your Soul.",
            font: "20px Aldrich",
            color: "red",
            textAlign: "center",
            x: Game.centerX(),
            y: Game.centerY() - Game._tileSize
        });
        this._endMessage = Game.Screens.TextObject.create({
            text: "press [ENTER] to venture with a new brave soul.",
            font: "18px Aldrich",
            color: "darkgoldenrod",
            textAlign: "center",
            x: Game.centerX(),
            y: Game.centerY()
        });
    },
    exit: function() {

    },
    render: function(display) {
        display.clearRect(0, 0, Game.getWidth(), Game.getHeight());
        Game.Screens.drawText(this._endTitle, display);
        this._blinkCounter += 0.1;
        if(~~(this._blinkCounter) % this._blinkFrequency === 0){
            Game.Screens.drawText(this._endMessage, display);
        }
    },
    handleInput: function(inputType, inputData) {
        if(inputType === "keydown") {
            var code = inputData.keyCode;
            switch (code) {
                case 13 :
                    Game.switchScreen(Game.Screens.playScreen);
                    break;
            }
        }
    }
};
//
Game.Screens.winScreen = {
    _blinkCounter: 0,
    _blinkFrequency: 2,
    _winMessage: {},
    _winTitle: {},
    enter: function() {
        this._winTitle = Game.Screens.TextObject.create({
            text: "You sent those fiends back to where they belong.",
            font: "20px Aldrich",
            color: "gold",
            textAlign: "center",
            x: Game.centerX(),
            y: Game.centerY() - Game._tileSize
        });
        this._winMessage = Game.Screens.TextObject.create({
            text: "[ENTER] back to start screen.",
            font: "18px Aldrich",
            color: "white",
            textAlign: "center",
            x: Game.centerX(),
            y: Game.centerY()
        });
    },
    exit: function() {

    },
    render: function(display) {
        display.clearRect(0, 0, Game.getWidth(), Game.getHeight());
        Game.Screens.drawText(this._winTitle, display);
        this._blinkCounter += 0.1;
        if(~~(this._blinkCounter) % this._blinkFrequency === 0){
            Game.Screens.drawText(this._winMessage, display);
        }
    },
    handleInput: function(inputType, inputData) {
        if(inputType === "keydown") {
            var code = inputData.keyCode;
            switch (code) {
                case 13 :
                    Game.switchScreen(Game.Screens.startScreen);
                    break;
            }
        }
    }
}
//Game screens utilities
//Text renderer
Game.Screens.drawText = function(props, display) {
    var x = props.x;
    var y = props.y;
    var text = props.text;
    display.save();
    display.beginPath();
    display.font = props.font;
    display.fillStyle = props.color;
    display.textAlign = props.textAlign;
    display.textBaseline = props.textBaseline;
    display.fillText(text, x, y);
    display.closePath();
    display.restore();
};
//Text formatter
Game.Screens.TextObject = {
    x: 0,
    y: 0,
    text: "",
    font: "14px Audiowide",
    color: "goldenrod",
    textAlign: "start",
    textBaseline: "top",
    create: function(props) {
        var obj = Object.create(this);
        for(var key in props) {
            obj[key] = props[key];
        }
        obj.create = undefined;
        return obj;
    }
}

