//Dungeon Tiles, floors and walls
Game.Tiles = function(props){
    this._srcX =  props["srcX"] || 0; //Source X on sprites-tiles-sheet
    this._srcY =  props["srcY"] || 0; //Source Y on sprites-tiles-sheet
    this._width =  props["width"] || 32; //Displayed width
    this._height = props["height"] || 32; //Displayed height
    this._srcWidth = props["srcWidth"] || 32, //Source width on sprites-tiles-sheet
    this._srcHeight = props["srcHeight"] || 32,//Source height on sprites-tiles-sheet
    this._isWalkable = props["isWalkable"] || false;
};
//Standard getters
Game.Tiles.prototype.isWalkable = function() {
    return this._isWalkable;
};
//
Game.Tiles.prototype.getSrcX = function() {
    return this._srcX;
};
//
Game.Tiles.prototype.getSrcY = function() {
    return this._srcY;
};
//
Game.Tiles.prototype.getSrcWidth = function() {
    return this._srcWidth;
};
//
Game.Tiles.prototype.getSrcHeight = function() {
    return this._srcHeight;
};
//
Game.Tiles.prototype.getWidth = function() {
    return this._width;
};
//
Game.Tiles.prototype.getHeight = function() {
    return this._height;
};
//
Game.Tiles.nullTile = new Game.Tiles({});
Game.Tiles.nullTile._srcX = Game.Tiles.nullTile._srcY = 128;
Game.Tiles.floorTile = new Game.Tiles({srcX: 32, srcY: 32, isWalkable: true});
Game.Tiles.wallTile = new Game.Tiles({srcX: 0, srcY: 32,isWalkable: false});