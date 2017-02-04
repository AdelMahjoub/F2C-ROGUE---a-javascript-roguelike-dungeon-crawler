//
Game.Map = function(tiles, player) {
    this._tiles = tiles;
    this._width = tiles.length; 
    this._height = tiles[0].length;
    this._entities = [];
    this._numberOfFoes = 50;
    this._numberOfPotions = ~~(this._numberOfFoes / 3);
    this.generateEntities(Game.Templates.goblin,this._numberOfFoes);
    this.generateEntities(Game.Templates.healthPotion,this._numberOfPotions);
    this.generateEntities(Game.Templates.longSword,1);
    this.generateEntities(Game.Templates.leatherArmor,1);
    this.generateEntities(Game.Templates.warriorShield,1);
    this.generateEntities(Game.Templates.youngDragon,1);
    this.addEntityAtRandomPosition(player);
};
//Standard getters
Game.Map.prototype.getWidth = function() {
    return this._width;
};
//
Game.Map.prototype.getHeight = function() {
    return this._height;
};
//
Game.Map.prototype.getTiles = function() {
    return this._tiles;
};
//
Game.Map.prototype.getEntities = function() {
    return this._entities;
};
//return a tile at a given position
Game.Map.prototype.getTileAt = function(x, y) {
    var withinRange = ( x >= 0 && y >= 0 && x < this._width && y < this._height);
    if(withinRange) {
        return this._tiles[x][y];
    }
    return Game.Tiles.nullTile;
};
//Return an entity at a given position
Game.Map.prototype.getEntityAt = function(x, y) {
    for(var i = 0; i < this._entities.length; i++) {
        var entity = this._entities[i];
        if(entity.getX() === x && entity.getY() === y) {
            return entity;
        }
    }
    return false;
};
//
Game.Map.prototype.getRandomFloorPosition = function() {
    var x, y;
    do {
        x = ~~(Math.random() * this._width);
        y = ~~(Math.random() * this._height); 
    } while(!this.isEmptyFloor(x, y));
    return {x: x, y: y};
};
//
Game.Map.prototype.addEntity = function(entity) {
    if(entity.getX() < 0 || entity.getX() >= this._width ||
        entity.getY() < 0 || entity.getY() >= this._height) {
            throw new Error("Adding entity out of bounds.")
        }
    entity.setMap(this);
    this._entities.push(entity);
};
//
Game.Map.prototype.addEntityAtRandomPosition = function(entity) {
    var position = this.getRandomFloorPosition();
    entity.setX(position.x);
    entity.setY(position.y);
    this.addEntity(entity);
};
//Remove entity
Game.Map.prototype.removeEntity = function(entity) {
    for(var i = 0; i < this._entities.length; i++) {
        if(entity == this._entities[i]) {
            this._entities.splice(i, 1);
            break;
        }
    }
}
//Check if the tile is an empty floor
Game.Map.prototype.isEmptyFloor = function(x, y) {
    return this.getTileAt(x, y) === Game.Tiles.floorTile && !this.getEntityAt(x, y);
}
//Check for surrounding floors and return true is there is any,
//Used to reduce the number of walls to get walls only adjacent to floor tiles
Game.Map.prototype.checkSurroundingTiles = function(x, y) {
    var withinRange = ( x >= 0 && y >= 0 && x < this.getWidth() && y < this.getHeight());
    if(!withinRange) {
        return false;
    }
    for(var w = -1; w < 2; w++) {
        if((x + w) < 0 || (x + w) >= this.getWidth()) {
            continue;
        }
        for(var h = - 1; h < 2; h++) {
            if((y + h) < 0 || (y + h) >= this.getHeight()) {
                continue;
            }
            if( w !== 0 || h !== 0) {
                var tile = this.getTileAt(x + w, y + h);
                if(tile.isWalkable()) {
                    return true;
                }
            }
        }
    }
    return false;
};
//Populate the dungeon
Game.Map.prototype.generateEntities = function(template, number) {
    for(var i = 0; i < number; i++) {
        switch(template.type) {
            case "actor":
                var entity = new Game.Actor(template);
                this.addEntityAtRandomPosition(entity);
                break;
            case "item":
                var entity = new Game.Item(template);
                this.addEntityAtRandomPosition(entity);
                break;
            default:
                var entity = new Game.Entity(template);
                this.addEntityAtRandomPosition(entity);
                break;
        }
    }
};
//
Game.Map.prototype.getBossPosition = function() {
    var x, y;
    for(var i = 0; i < this._entities.length; i++) {
        var entity = this._entities[i];
        if(entity.getType() === "actor") {
            if(entity.getGenre() === "boss") {
                x = entity.getX();
                y = entity.getY();
                break;
            }
        }
    }
    return {x: x, y: y}
}






