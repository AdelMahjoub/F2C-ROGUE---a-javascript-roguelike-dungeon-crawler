//Entities
Game.Entity = function(props) {
    this._type = props["type"] || "entity";
    this._genre = props["genre"] || "any";
    this._name = props["name"] || "";
    this._x = 0;
    this._y = 0;
    this._map = null,
    this._isDestructable = props["isDestructable"] || false;
    Game.Tiles.call(this, props);
};
//
Game.Entity.extend(Game.Tiles);
//Standard getters
Game.Entity.prototype.getName = function() {
    return this._name;
};
//
Game.Entity.prototype.getType = function() {
    return this._type;
};
//
Game.Entity.prototype.getGenre = function() {
    return this._genre;
};
//
Game.Entity.prototype.getX = function() {
    return this._x;
};
//
Game.Entity.prototype.getY = function() {
    return this._y;
};
//
Game.Entity.prototype.getMap = function() {
    return this._map;
};
//
Game.Entity.prototype.isDestructable = function() {
    return this._isDestructable;
};
//Standard setters
Game.Entity.prototype.setX = function(x) {
    this._x = x;
};
Game.Entity.prototype.setY = function(y) {
    this._y = y;
};
//
Game.Entity.prototype.setMap = function(map) {
    this._map = map;
};
//Actors
Game.Actor = function(props) {
    this._maxHp = props["maxHp"] || 10;
    this._lvl = props["lvl"] || 1;
    this._xp = 0;
    this._toNextLvl = 50;
    this._givenXp = props["givenXp"] || 0;
    this._hp = this._maxHp;
    this._atk = props["atk"] || 1; //base attack
    this._def = props["def"] || 0; //base def
    this._wAtk = 0; //collectable atk bonus
    this._wDef = 0; //collectable def bonus
    this._potions = [];
    this._equippedWeapon = [];
    this._equippedArmor = [];
    this._equippedShield = [];
    Game.Entity.call(this, props);
};
//
Game.Actor.extend(Game.Entity);
//Standard getters
Game.Actor.prototype.getHp = function() {
    return this._hp;
};
//
Game.Actor.prototype.getMaxHp = function() {
    return this._maxHp;
};
//
Game.Actor.prototype.getAtk = function() {
    return this._atk;
};
//
Game.Actor.prototype.getDef = function() {
    return this._def;
};
//
Game.Actor.prototype.getTotalDef = function() {
    return (this._def + this._wDef);
};
//
Game.Actor.prototype.getTotalAtk = function() {
    return (this._atk + this._wAtk);
};
//
Game.Actor.prototype.getLvl = function() {
    return this._lvl;
};
//
Game.Actor.prototype.getXp = function() {
    return this._xp;
};
//
Game.Actor.prototype.getToNextLvl = function() {
    return this._toNextLvl;
};
//
Game.Actor.prototype.getGivenXp = function() {
    return this._givenXp;
};
//Actors actions
Game.Actor.prototype.updateXp = function(target, xp) {
    target._xp += xp;
    if(target._xp >= target._toNextLvl) {
        Game.sounds.lvlUp.currentTime = 0;
        Game.sounds.lvlUp.play();
        target._lvl += ~~(target._xp / target._toNextLvl);
        target._toNextLvl *= 2;
        target._atk += 1;
        target._def += 1;
        target._maxHp += 2;
    }
}
//
Game.Actor.prototype.attack = function(target) {
    var attack = this.getTotalAtk();
    var defense = target.getTotalDef();
    var max = Math.max(0, attack - defense);
    target.takeDamage(this, 1 + ~~(Math.random() * max));
};
//
Game.Actor.prototype.takeDamage = function(target, damage) {
    this._hp -= damage;
    if(this._hp <= 0) {
        this.updateXp(target, this.getGivenXp());
        this._map.removeEntity(this);
        if(this.getGenre() === "boss") {
            Game.switchScreen(Game.Screens.winScreen);
        }
        if(this.getGenre() === "player") {
            Game.switchScreen(Game.Screens.endScreen);
        }
    }
};
//
Game.Actor.prototype.pickItem = function(item) {
    switch (item.getGenre()) {
        case "potion":
            Game.sounds.potion.currentTime = 0;
            Game.sounds.potion.play();
            this._potions.push(item);
            this._map.removeEntity(item);
            break;
        case "weapon":
            Game.sounds.pickWeapon.currentTime = 0;
            Game.sounds.pickWeapon.play();
            if(this._equippedWeapon.length !== 0) {
                this.switchEquipement(this._equippedWeapon, item);
            } else {
                this._equippedWeapon.push(item);
                item.use(this);
                this._map.removeEntity(item);
            }
            break;
        case "armor":
            Game.sounds.pickArmor.currentTime = 0;
            Game.sounds.pickArmor.play();
            if(this._equippedArmor.length !== 0) {
                this.switchEquipement(this._equippedArmor, item);
            } else {
                this._equippedArmor.push(item);
                item.use(this);
                this._map.removeEntity(item);
            }
            break;
        case "shield":
            Game.sounds.pickShield.currentTime = 0;
            Game.sounds.pickShield.play();
            if(this._equippedShield.length !== 0) {
                this.switchEquipement(this._equippedShield, item);
            } else {
                this._equippedShield.push(item);
                item.use(this);
                this._map.removeEntity(item);
            }
            break;
        default:
    }
};
//
Game.Actor.prototype.drinkPotion = function() {
    if(this._potions.length !== 0) {
        if(this.getHp() < this.getMaxHp()) {
            Game.sounds.potion.currentTime = 0;
            Game.sounds.potion.play();
            this._potions[0].use(this);
            this._potions.splice(0,1);
        }
    }
};
//
Game.Actor.prototype.switchEquipement = function(slot, next) {
    //Switch with the weapon on floor
    var current = slot[0];
    var x = next.getX(); //floor x position where to drop current weapon
    var y = next.getY(); //floor y position where to drop current weapon
    current.setX(x); //set new x position of current weapon
    current.setY(y); //set new y position of current weapon
    current.drop(this); //drop current weapon
    slot.splice(0, 1); //Unequip the current weapon
    slot.push(next); // Equip the new weapon
    next.use(this); //Get the effect of the new weapon
    var index = this._map._entities.indexOf(next); //picked weapon index in entities array
    this._map._entities.splice(index, 1, current);//previous weapon get picked weapon position in the entities array           
} 
//
Game.Actor.prototype.tryMove = function(x, y, map) {
    var tile = map.getTileAt(x, y, map);
    var entity = map.getEntityAt(x, y);
    var destructable = false;
    if(entity) {
        destructable = entity.isDestructable();
    }
    if(tile.isWalkable() && (!entity || !destructable)) {
       this.setX(x);
       this.setY(y);
    }
    if(entity && !destructable) {
        this.pickItem(entity);
    }
    if(destructable) {
        Game.sounds.attack.currentTime = 0;
        Game.sounds.attack.play();
        this.attack(entity);
        if(entity.getHp() > 0) {
            entity.attack(this);
        }
    }
}
//Items
Game.Item = function(props) {
    this.atk = props["atkBonus"] || 0;
    this.def = props["defBonus"] || 0;
    this.hp = props["hpBonus"] || 0;
    Game.Entity.call(this, props);
};
//
Game.Item.extend(Game.Entity);
//
Game.Item.prototype.use = function(user) {
    user._hp += this.hp;
    user._hp = Math.min(user.getMaxHp(), user._hp);
    user._wAtk += this.atk;
    user._wDef += this.def;
};
//
Game.Item.prototype.drop = function(user) {
    user._wAtk -= this.atk;
    user._wDef -= this.def;
}
//Entities Templates
Game.Templates = {
    player: {
        type: "actor",
        name: "you",
        genre: "player",
        maxHp: 40,
        atk:2,
        def: 1,
        srcX: 0,
        srcY: 0,
        isDestructable: true
    },
    goblin: {
        type: "actor",
        name: "goblin",
        genre: "mob",
        maxHp: 15,
        atk: 2,
        def: 1,
        givenXp: 10,
        srcX: 32,
        srcY: 0,
        isDestructable: true
    },
    youngDragon: {
        type: "actor",
        name: "young dragon",
        genre: "boss",
        maxHp: 50,
        givenXp: 100,
        atk: 5,
        def: 5,
        srcX: 64,
        srcY: 0,
        isDestructable: true
    },
    healthPotion: {
        type: "item",
        name: "health potion",
        genre: "potion",
        hpBonus: 20,
        srcX: 64,
        srcY: 32
    },
    longSword: {
        type: "item",
        name: "long sword",
        genre: "weapon",
        atkBonus: 2,
        srcX: 0,
        srcY: 64
    },
    leatherArmor: {
        type: "item",
        name: "leather armor",
        genre: "armor",
        defBonus: 2,
        srcX: 32,
        srcY: 64
    },
    warriorShield: {
        type: "item",
        name: "warrior shield",
        genre: "shield",
        defBonus: 2,
        srcX: 64,
        srcY: 64
    }
}


