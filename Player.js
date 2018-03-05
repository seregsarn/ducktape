function Player(name) {
    Actor.call(this);
    this.type = monsters.player_dummy;
    this.name = name;
    this.commands = [];
    this.stall = null;
    this.promptData = null;
    document.addEventListener("keydown", this);
}
Player.prototype = Object.create(Actor.prototype);
Player.prototype.constructor = Player;
//----------------
// act() function for rotjs engine. It stalls the engine until the command queue is nonempty.
Player.prototype.act = function() {
    var player = this;
    var res;
    Game.render();
    //console.log("player is acting:", this);
    this.stall = new Promise(function(resolve, reject) {
        var checkStall = function() {
            if (player.commands.length > 0) {
                var cmd = player.commands.shift();
                if (player['cmd_'+cmd.type] !== undefined) {
                    Message.expire();
                    res = player['cmd_'+cmd.type](cmd);
                    if (res) {
                        resolve(cmd);
                        return; // don't reschedule
                    }
                } else {
                    console.error('Unimplemented command: ', cmd.type, " => ", cmd);
                }
            }
            setTimeout(checkStall, 100);
        };
        setTimeout(checkStall, 100);
    });
    return this.stall;
}
//--------------------
// reading the keyboard to get the player commands
Player.prototype.prompt = function(obj) { 
    var pd = obj;
    this.promptData = pd;
    Message.log(pd.message);
    var prom = new Promise(function(res, rej) {
        pd.resolve = res;
        pd.reject = rej;
    });
    return prom;
}
Player.prototype.handleEvent = function(ev) {
    var vk = '?';
    var player = this;
    for (var name in ROT) {
        if (ROT[name] == ev.keyCode && name.indexOf("VK_") == 0) vk = name;
    }
    if (this.promptData !== null) {
        var pd = this.promptData;
        switch (pd.type) {
            case 'dir':
                if (vk == 'VK_W' || vk == 'VK_UP') {
                    pd.resolve('north');
                    this.promptData = null;
                    return;
                } else if (vk == 'VK_S' || vk == 'VK_DOWN') {
                    pd.resolve('south');
                    this.promptData = null;
                    return;
                } else if (vk == 'VK_A' || vk == 'VK_LEFT') {
                    pd.resolve('west');
                    this.promptData = null;
                    return;
                } else if (vk == 'VK_D' || vk == 'VK_RIGHT') {
                    pd.resolve('east');
                    this.promptData = null;
                    return;
                }
            break;
            default:
                console.error('Unimplemented prompt: ', pd);
                pd.reject({ msg: 'Unimplemented prompt', obj: pd });
                this.promptData = null;
            break;
        }
        if (vk == 'VK_ESCAPE') {
            pd.reject();
            this.promptData = null;
        }
        return;
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
    } else if (vk == 'VK_C') {
        this.prompt({
            message: "In what direction?",
            type: 'dir'
        }).then(function(dir) {
            player.commands.push({
                type: 'close', dir: dir
            });
        }).catch(function(err) {
            if (err && err.msg) Message.log(err.msg);
            else Message.log('Never mind.');
        });
    }
};
//-----------------------
// player commands
Player.prototype.cmd_wait = function(cmd) {
    // stuh!
    return true;
};
Player.prototype.cmd_move = function(cmd) {
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
Player.prototype.cmd_close = function(cmd) {
    var dx, dy, tx, ty;
    switch (cmd.dir) {
        case 'north': dx = 0; dy = -1; break;
        case 'south': dx = 0; dy = 1; break;
        case 'east': dx = 1; dy = 0; break;
        case 'west': dx = -1; dy = 0; break;
        default: dx = 0; dy = 0; break;
    }
    tx = this.x + dx; ty = this.y + dy;
    var tile = this.map.at(tx,ty);
    if (!tile || (tile.name != 'OPENDOOR' && tile.name != 'DOOR')) {
        Message.log('You see no door there.');
        return false;
    }
    if (tile.name == 'DOOR') {
        Message.log('That door is already closed.');
        return false;
    }
    if (dx == 0 && dy == 0) {
        Message.log("You're in the way.");
        return false;
    }
    this.map.write(tx, ty, 'DOOR');
    this.map.updateTile(Game.screen, tx, ty);
    Message.log('You close the door.');
    return true;
};