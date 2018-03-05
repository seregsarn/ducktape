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
Player.prototype.a = function() {
    return "you";
}
Player.prototype.the = function() {
    return "you";
}
//----------------
// act() function for rotjs engine. It stalls the engine until the command queue is nonempty.
Player.prototype.act = function() {
    var player = this;
    var res;
    if (this.map) {
        this.map.updateFov(this);
    }
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
                    } else {
                        Game.render();
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
    // prompts can be generated if you need more data to issue a command, like a direction or whatever.
    if (this.promptData !== null) {
        var pd = this.promptData;
        // each prompt gets its own switch block.
        switch (pd.type) {
            // we're asking for a direction.
            case 'dir':
                if (vk == 'VK_W' || vk == 'VK_UP' || vk == 'VK_NUMPAD8') {
                    pd.resolve('north'); this.promptData = null; return;
                } else if (vk == 'VK_S' || vk == 'VK_DOWN' || vk == 'VK_NUMPAD2') {
                    pd.resolve('south'); this.promptData = null; return;
                } else if (vk == 'VK_A' || vk == 'VK_LEFT' || vk == 'VK_NUMPAD4') {
                    pd.resolve('west'); this.promptData = null; return;
                } else if (vk == 'VK_D' || vk == 'VK_RIGHT' || vk == 'VK_NUMPAD6') {
                    pd.resolve('east'); this.promptData = null; return;
                } else if (vk == 'VK_NUMPAD7') {
                    pd.resolve('northwest'); this.promptData = null; return;
                } else if (vk == 'VK_NUMPAD9') {
                    pd.resolve('northeast'); this.promptData = null; return;
                } else if (vk == 'VK_NUMPAD1') {
                    pd.resolve('southwest'); this.promptData = null; return;
                } else if (vk == 'VK_NUMPAD3') {
                    pd.resolve('southeast'); this.promptData = null; return;
                } else if ((vk == 'VK_DECIMAL' || vk == 'VK_PERIOD') && pd.allowSelf) {
                    pd.resolve('self'); this.promptData = null; return;
                }
            break;
            // don't know what we're asking for. :O
            default:
                console.error('Unimplemented prompt: ', pd);
                pd.reject({ msg: 'Unimplemented prompt', obj: pd, event: ev });
                this.promptData = null;
                return;
            break;
        }
        // these are here as get-out defaults for all prompts; if any of them are handled in the prompt-specific handler above then we just never get here.
        if (vk == 'VK_ESCAPE' || vk == 'VK_RETURN' || vk == 'VK_SPACE') {
            //pd.reject();
            Message.log("Never mind.");
            this.promptData = null;
        }
        return;
    }
    // ordinary command kickoffs.
    if (vk == 'VK_PERIOD' || vk == 'VK_DECIMAL') { // wait
        this.commands.push({ type: 'wait' });
    } else if (vk == 'VK_W' || vk == 'VK_UP' || vk == 'VK_NUMPAD8') { // movement
        this.commands.push({ type: 'move', dir: 'north' });
    } else if (vk == 'VK_S' || vk == 'VK_DOWN' || vk == 'VK_NUMPAD2') { // ""
        this.commands.push({ type: 'move', dir: 'south' });
    } else if (vk == 'VK_A' || vk == 'VK_LEFT' || vk == 'VK_NUMPAD4') {
        this.commands.push({ type: 'move', dir: 'west' });
    } else if (vk == 'VK_D' || vk == 'VK_RIGHT' || vk == 'VK_NUMPAD6') {
        this.commands.push({ type: 'move', dir: 'east' });
    } else if (vk == 'VK_NUMPAD7') {
        this.commands.push({ type: 'move', dir: 'northwest' });
    } else if (vk == 'VK_NUMPAD9') {
        this.commands.push({ type: 'move', dir: 'northeast' });
    } else if (vk == 'VK_NUMPAD1') {
        this.commands.push({ type: 'move', dir: 'southwest' });
    } else if (vk == 'VK_NUMPAD3') {
        this.commands.push({ type: 'move', dir: 'southeast' });
    } else if (vk == 'VK_C') { // close door
        this.prompt({
            message: "In what direction?",
            type: 'dir'
        }).then(function(dir) {
            player.commands.push({
                type: 'close', dir: dir
            });
        });
        /*.catch(function(err) {
            if (err && err.msg) Message.log(err.msg);
            else Message.log('Never mind.');
        });
        */
    } else if ((vk == 'VK_SLASH' && ev.shiftKey) || vk == 'VK_F1') { // halp
        if (vk == 'VK_F1') ev.preventDefault();
        Message.log("FIXME: help screen");
    } else {
//console.log("VK: ",vk);
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
        case 'northeast': dx = 1; dy = -1; break;
        case 'southeast': dx = 1; dy = 1; break;
        case 'northwest': dx = -1; dy = -1; break;
        case 'southwest': dx = -1; dy = 1; break;
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
        case 'northeast': dx = 1; dy = -1; break;
        case 'southeast': dx = 1; dy = 1; break;
        case 'northwest': dx = -1; dy = -1; break;
        case 'southwest': dx = -1; dy = 1; break;
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
