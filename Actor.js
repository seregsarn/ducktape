function Actor() {
    this.id = Identifier.get();
    this.name = '';
    this.speed = 12;
    this.x = 0; this.y = 0;
}
Actor.prototype.act = function() {
    console.log(this.name + " is acting");
};
Actor.prototype.getSpeed = function() { return this.speed; };
Actor.prototype.render = function(display,x,y) {
    display.draw(x,y, '@', 'white');
};

//========================================
function Player() {
    Actor.call(this);
    this.name = 'beor';
    this.commands = [];
    this.stall = null;
    document.addEventListener("keydown", this);
}
Player.prototype = Object.create(Actor.prototype);
Player.prototype.constructor = Player;
//-----
Player.prototype.act = function() {
    var player = this;
    Game.render();
    //console.log("player is acting:", this);
    this.stall = new Promise(function(resolve, reject) {
        var checkStall = function() {
            if (player.commands.length > 0) {
                var cmd = player.commands.shift();
                resolve(cmd);
            } else {
                setTimeout(checkStall, 100);
            }
        };
        setTimeout(checkStall, 100);
    }).then(function(cmd) {
        //console.log("execute command: ", cmd);
        if (player[cmd.type] !== undefined) {
            return player[cmd.type](cmd);
        } else {
            console.error('Unimplemented command: ', cmd.type, " => ", cmd);
        }
        // todo: general rules for handling animations?
        /* 
        var prom = new Promise(function(res,rej) {
            setTimeout(function() { 
                res();
            }, 1000);
        });
        return prom;
        */
    });
    return this.stall;
}
Player.prototype.handleEvent = function(ev) {
    var vk = '?';
    for (var name in ROT) {
        if (ROT[name] == ev.keyCode && name.indexOf("VK_") == 0) vk = name;
    }
    //console.log("down:", ev.keyCode, "=>", vk);
    if (vk == 'VK_SPACE') {
        //console.log("pushing wait onto queue", this.commands);
        this.commands.push({ type: 'wait' });
    }
    if (vk == 'VK_W' || vk == 'VK_UP') {
        this.commands.push({ type: 'move', dir: 'north' });
    } else if (vk == 'VK_S' || vk == 'VK_DOWN') {
        this.commands.push({ type: 'move', dir: 'south' });
    } else if (vk == 'VK_A' || vk == 'VK_LEFT') {
        this.commands.push({ type: 'move', dir: 'west' });
    } else if (vk == 'VK_D' || vk == 'VK_RIGHT') {
        this.commands.push({ type: 'move', dir: 'east' });
    }
};

Player.prototype.move = function(cmd) {
    var dx, dy;
    dx = 0; dy = 0;
    switch (cmd.dir) {
        case 'north': dx = 0; dy = -1; break;
        case 'south': dx = 0; dy = 1; break;
        case 'east': dx = 1; dy = 0; break;
        case 'west': dx = -1; dy = 0; break;
        default: dx = 0; dy = 0; break;
    }
    var tx = this.x + dx;
    var ty = this.y + dy;
    if (tx < 0 || tx > Game.map.w-1 || ty < 0 || ty > Game.map.h-1) {
        console.log('thud');
        return;
    }
    Game.map.updateTile(Game.screen, this.x, this.y);
    this.x = tx; this.y = ty;
    this.render(Game.screen, this.x, this.y);
};