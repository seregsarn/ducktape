function Player(name) {
    Actor.call(this);
    this.type = monsters.player_dummy;
    this.name = name;
    this.commands = [];
    this.stall = null;
    document.addEventListener("keydown", this);
}
Player.prototype = Object.create(Actor.prototype);
Player.prototype.constructor = Player;
//----------------
// act() function for rotjs engine. It stalls the engine until the command queue is nonempty.
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
//--------------------
// reading the keyboard to get the player commands
Player.prototype.handleEvent = function(ev) {
    var vk = '?';
    for (var name in ROT) {
        if (ROT[name] == ev.keyCode && name.indexOf("VK_") == 0) vk = name;
    }
    //console.log("down:", ev.keyCode, "=>", vk);
    if (vk == 'VK_PERIOD') {
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
//-----------------------
// player commands
Player.prototype.wait = function(cmd) {
    // stuh!
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
    return Actor.prototype.move.call(this, dx, dy);
};
