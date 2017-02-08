//User interface
Game.Screens.UI = {
    width: Game.getWidth(),
    height: Game.getHeight(),
    tileSize: Game.getTileSize(),
    font: "14px Audiowide",
    fillStyle: "goldenrod",
    textAlign: "start",
    textBaseline: "top",
    helpMessage: [
        "[Arrow Keys] to move around.",
        "[P]: Drink a health potion.",
        "[F]: Toggle FOW (darkness).",
        "[H]: Toggle help window. ",
        "---------------------------",
        "-Walk into an item to pick it.",
        "-Walk into an enemy to strike it."
    ],
    //
    render: function(player, display) {
        this.renderHp(player, display);
        this.renderStatBar(display);
        this.renderAtk(player, display);
        this.renderDef(player, display);
        this.renderLvl(player, display);
        this.renderXp(player, display);
        this.renderPotions(player, display);
        this.drawHpBars(player, display);
        this.drawXpBar(player, display);
        this.renderCurrentEquipment(player, display);
        this.showHelpCommand(display);
    },
    //
    renderHp: function(player, display) {
        var hp = `HP ${player.getHp()} / ${player.getMaxHp()}`;
        var x = 2;
        var y = 1;
        display.save();
            display.beginPath();
                display.font = this.font;
                display.fillStyle = this.fillStyle;
                display.textAlign = this.textAlign;
                display.textBaseline = this.textBaseline;
                display.fillText(hp, x, y);
            display.closePath();
        display.restore();
    },
    //
    renderAtk: function(player, display) {
        var atk = `ATK ${player.getTotalAtk()}`;
        var x = 2;
        var y = this.height - this.tileSize * 3 / 4;
        display.save();
            display.beginPath();
                display.font = this.font;
                display.fillStyle = "darkgoldenrod";
                display.textAlign = this.textAlign;
                display.textBaseline = this.textBaseline;
                display.fillText(atk, x, y);
            display.closePath();
        display.restore();
    },
    //
    renderDef: function(player, display) {
        var def = `DEF ${player.getTotalDef()}`;
        var x = this.width * 1 / 6;
        var y = this.height - this.tileSize * 3 / 4;
        display.save();
            display.beginPath();
                display.font = this.font;
                display.fillStyle = "darkgoldenrod";
                display.textAlign = this.textAlign;
                display.textBaseline = this.textBaseline;
                display.fillText(def, x, y);
            display.closePath();
        display.restore();
    },
    //
    renderLvl: function(player, display) {
        var lvl = `LVL ${player.getLvl()}`;
        var x = this.width * 2 / 6;;
        var y = this.height - this.tileSize * 3 / 4;
        display.save();
            display.beginPath();
                display.font = this.font;
                display.fillStyle = "darkgoldenrod";
                display.textAlign = this.textAlign;
                display.textBaseline = this.textBaseline;
                display.fillText(lvl, x, y);
            display.closePath();
        display.restore();
    },
    //
    renderXp: function(player, display) {
        var currentXp = player.getXp() < 1000 ? player.getXp() :  (player.getXp() / 1000).toFixed(1) + "k";
        var nextLvl = player.getToNextLvl() < 1000 ? player.getToNextLvl() :  (player.getToNextLvl() / 1000).toFixed(1) + "k"
        var xp = `XP ${currentXp} / ${nextLvl}`;
        var x = this.width * 5 / 6;
        var y = this.height - this.tileSize * 3 / 4;
        display.save();
            display.beginPath();
                display.font = "10px Audiowide";
                display.fillStyle = "darkgoldenrod";
                display.textAlign = this.textAlign;
                display.textBaseline = this.textBaseline;
                display.fillText(xp, x, y);
            display.closePath();
        display.restore();
    },
    //
    renderPotions: function(player, display) {
        var potions = `x ${player._potions.length}`;
        var x = ~~(this.width * 1 / 6) + this.tileSize;
        var y = 1;
        display.save();
            display.beginPath();
                display.font = "10px Audiowide";
                display.fillStyle = this.fillStyle;
                display.textAlign = this.textAlign;
                display.textBaseline = this.textBaseline;
                display.fillText(potions, x, y);
            display.closePath();
        display.restore();
        display.save();
            display.drawImage(
                Game.spriteSheet,
                64, 32,
                this.tileSize, this.tileSize,
                x - this.tileSize / 2, y,
                this.tileSize / 2, this.tileSize / 2
            );
        display.restore();
    },
    //
    drawHpBars: function(entity, display) {
        if(entity.getType() !== "actor") {
            return;
        }
        var x = 2,
            y = (this.tileSize / 2) + 4,
            size =  ~~(this.width * 1 / 6),
            height = this.tileSize / 2,
            width;
        if(entity.getGenre() !== "player") {
            x = entity.getX() * entity.getWidth();
            y = entity.getY() * entity.getHeight();
            size = entity.getWidth();
            height = this.tileSize / 8;
        }
        display.save();
        display.fillStyle = "red";
        width = size * (entity.getHp() / entity.getMaxHp());
        display.fillRect(x, y, width, height)
        display.restore();

        display.save();
        display.strokeStyle = "white";
        display.strokeRect(x, y, size, height)
        display.restore();
    },
    //
    drawXpBar: function(player, display) {
        var x = this.width * 3 / 6 - this.tileSize;
        var y = this.height - this.tileSize * 3 / 4;
        var size =this.width * 2 / 6;
        var width;
        var height = this.tileSize / 2;
        display.save();
            display.fillStyle = "green";
            width = size * (player.getXp() / player.getToNextLvl());
            display.fillRect(x, y, width, height);
        display.restore();
        display.save();
            display.strokeStyle = "darkgoldenrod";
            display.strokeRect(x, y, size, height)
        display.restore();
    },
    //
    renderCurrentEquipment: function(player, display) {
        var equipement = [];
        var weapon = player._equippedWeapon[0];
        var armor = player._equippedArmor[0];
        var shield = player._equippedShield[0];
        equipement.push(weapon, armor, shield)
        var x = this.width - this.tileSize;
        var y = this.tileSize;
        for(var i = 0; i < equipement.length; i++) {
            var item = equipement[i];
            display.save();
                display.fillStyle = "gray";
                display.globalAlpha = 0.2;
                display.fillRect(x, y * i + 1, this.tileSize, this.tileSize);
            display.restore();
            display.save();
                display.strokeStyle = "black";
                display.strokeRect(x, y * i + 1, this.tileSize, this.tileSize);
            display.restore();
            if(item) {
                display.save();
                display.drawImage(
                    Game.spriteSheet,
                    item.getSrcX(), item.getSrcY(),
                    item.getSrcWidth(), item.getSrcHeight(),
                    x, y * i + 1,
                    this.tileSize, this.tileSize
                );
                display.restore();
                display.save();
                    display.beginPath();
                        display.font = "8px Audiowide";
                        display.fillStyle = "darkgoldenrod";
                        display.textAlign = "right";
                        display.textBaseline = "top";
                        display.fillText(
                            `${item.getName().toUpperCase()}`,
                             x - 2,
                            y * i  + y / 2
                        );
                    display.closePath();
                display.restore();
            } else {
                var text;
                switch(i) {
                    case 0:
                        text = "No Weapon";
                        break;
                    case 1:
                        text = "No Armor";
                        break;
                    case 2:
                        text = "No Shield";
                        break;
                    default:
                }
                display.beginPath();
                    display.font = "8px Audiowide";
                    display.fillStyle = "darkgoldenrod";
                    display.textAlign = "right";
                    display.textBaseline = "top";
                    display.fillText(
                        text,
                        x - 2,
                        y * i  + y / 2
                    );
                display.closePath();
            }
        }
    },
    showHelpCommand: function(display) {
        var text = "PRESS H FOR HELP SCREEN";
        var x = ~~(Game.getWidth() - Game._tileSize / 3);
        var y = Game.centerY();
        var spacing = Game._tileSize / 4;
        for(var i = 0; i < text.length; i++) {
            display.save();
                display.beginPath();
                    display.globalAlpha = 0.8;
                    display.fillStyle = "black";
                    display.fillRect(x - 1, y + i * spacing, spacing, spacing);
                display.closePath();
                display.beginPath();
                        display.font = "8px Aldrich";
                        display.fillStyle = "gold";
                        display.textAlign = "left";
                        display.textBaseline = "top";
                        display.fillText(text[i], x, y + i * spacing);
                display.closePath();
            display.restore();
        }
    },
    helpScreen: function(display) {
        var spacing = Game._tileSize / 2;
        var size = ~~(Game.getWidth() / 2);
        var x = ~~(Game.centerX() - size / 2);
        var y = ~~(Game.centerY() - size / 2);
        display.save();
        display.beginPath();
        display.globalAlpha = 0.9;
            display.fillStyle = "white";
            display.fillRect(x, y, size, size);
        display.closePath();
        display.beginPath();
            display.lineWidth = 5;
            display.strokeStyle = "green";
            display.strokeRect(x, y, size, size);
        display.closePath();
        for(var i = 0; i < this.helpMessage.length; i++) {
            var text = this.helpMessage[i];
            display.beginPath();
                display.font = "14px Aldrich";
                display.fillStyle = "black";
                display.textAlign = "left";
                display.textBaseline = "top";
                display.fillText(text, x + spacing, y + spacing * (1 + i));
            display.closePath();
        }
        display.restore();
    },
    renderStatBar: function(display) {
        var width = Game.getWidth();
        var height = Game._tileSize;
        var x = 0
        var y = Game.getHeight() - height;
        display.save();
        display.beginPath();
            display.globalAlpha = 0.8;
            display.fillStyle = "black";
            display.fillRect(x, y, width, height);
        display.closePath();
        display.restore();
    }
}
