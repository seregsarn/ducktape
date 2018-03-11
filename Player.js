function Player(name) {
    Actor.call(this, monsters.player_dummy);
    this.name = name;
    this.commands = [];
    this.stall = null;
    this.promptData = null;
    document.addEventListener("keydown", this);
    //this.sprite = document.createElement('img');
    //this.sprite.src = 'duck.png';
    this.inventory = [];
    this.armor = null;
    this.weapon = null;
}
Player.prototype = Object.create(Actor.prototype);
Player.prototype.constructor = Player;
Player.prototype.a = function() {
    return "you";
};
Player.prototype.the = function() {
    return "you";
};
Player.prototype.your = function() {
    return "your";
};
Player.prototype.verb = function(word) {
    // special cases for different irregular verbs go here
    return word;
};
/*
Player.prototype.render = function(display,x,y) {
    // TODO: draw a duck
};
*/
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
Player.prototype.die = function() {
    this.dead = true;
    Message.log("You die...");
    Message.more();
};
//--------------------
// reading the keyboard to get the player commands
Player.prototype.prompt = function(obj) { 
    var pd = obj;
    this.promptData = pd;
    Message.log(pd.message);
    if (pd.type == 'target') {
        pd.x = this.x;
        pd.y = this.y;
        pd.render = function(screen) {
            screen.draw(this.promptData.x + Game.mapRenderPos[0], this.promptData.y + Game.mapRenderPos[1], 'X', 'red');
        }.bind(this);
    }
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
    if (this.dead || this.win) {
//console.log("endgame");
        document.removeEventListener('keydown', this);
        Game.shutdown();
        return;
    }
    if (Inventory.isOpen) return;
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
            case 'target':
//console.log("vk: ", vk);
                if (vk == 'VK_W' || vk == 'VK_UP' || vk == 'VK_NUMPAD8') {
//console.log("north: range ", this.map.pathDistance([pd.x, pd.y-1], [this.x, this.y]) , " <=> ", pd.range);
                    if (this.map.pathDistance([pd.x, pd.y-1], [this.x, this.y]) <= pd.range) {
                        pd.y -= 1;
                        if (pd.y < 0) pd.y = 0;
                    }
                    Game.render(); return;
                } else if (vk == 'VK_S' || vk == 'VK_DOWN' || vk == 'VK_NUMPAD2') {
                    if (this.map.pathDistance([pd.x, pd.y+1], [this.x, this.y]) <= pd.range) {
                        pd.y += 1;
                        if (pd.y > this.map.h - 1) pd.y = this.map.h - 1;
                    }
                    Game.render(); return;
                } else if (vk == 'VK_A' || vk == 'VK_LEFT' || vk == 'VK_NUMPAD4') {
                    if (this.map.pathDistance([pd.x - 1, pd.y], [this.x, this.y]) <= pd.range) {
                        pd.x -= 1;
                        if (pd.x < 0) pd.x = 0;
                    }
                    Game.render(); return;
                } else if (vk == 'VK_D' || vk == 'VK_RIGHT' || vk == 'VK_NUMPAD6') {
                    if (this.map.pathDistance([pd.x + 1, pd.y], [this.x, this.y]) <= pd.range) {
                        pd.x += 1;
                        if (pd.x > this.map.w - 1) pd.x = this.map.w - 1;
                    }
                    Game.render(); return;
                } else if (vk == 'VK_NUMPAD7') {
                    if (this.map.pathDistance([pd.x - 1, pd.y - 1], [this.x, this.y]) <= pd.range) {
                        pd.x -= 1; pd.y -= 1;
                        if (pd.x < 0) pd.x = 0;
                        if (pd.y < 0) pd.y = 0;
                    }
                    Game.render(); return;
                } else if (vk == 'VK_NUMPAD9') {
                    if (this.map.pathDistance([pd.x + 1, pd.y - 1], [this.x, this.y]) <= pd.range) {
                        pd.x += 1; pd.y -= 1;
                        if (pd.x > this.map.w - 1) pd.x = this.map.w - 1;
                        if (pd.y < 0) pd.y = 0;
                    }
                    Game.render(); return;
                } else if (vk == 'VK_NUMPAD1') {
                    if (this.map.pathDistance([pd.x - 1, pd.y + 1], [this.x, this.y]) <= pd.range) {
                        pd.x -= 1; pd.y += 1;
                        if (pd.x < 0) pd.x = 0;
                        if (pd.y > this.map.h - 1) pd.y = this.map.h - 1;
                    }
                    Game.render(); return;
                } else if (vk == 'VK_NUMPAD3') {
                    if (this.map.pathDistance([pd.x + 1, pd.y + 1], [this.x, this.y]) <= pd.range) {
                        pd.x += 1; pd.y += 1;
                        if (pd.x > this.map.w - 1) pd.x = this.map.w - 1;
                        if (pd.y > this.map.h - 1) pd.y = this.map.h - 1;
                    }
                    Game.render(); return;
                } else if ((vk == 'VK_DECIMAL' || vk == 'VK_PERIOD' || vk == 'VK_ENTER' || vk == 'VK_RETURN')) {
                    pd.resolve([pd.x,pd.y]); this.promptData = null; return;
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
    } else if (vk == 'VK_ENTER' || vk == 'VK_RETURN' || vk == 'VK_SPACE') { // pass through exit
        this.commands.push({ type: 'exit' });
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
    } else if (vk == 'VK_I') {
        this.commands.push({ type: 'inventory' });
    } else if (vk == 'VK_F') {
        this.commands.push({ type: 'fire' });
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
//    } else if ((vk == 'VK_SLASH' && ev.shiftKey) || vk == 'VK_F1') { // halp
//        if (vk == 'VK_F1') ev.preventDefault();
//        Message.log("FIXME: help screen");
    } else {
//console.log("VK: ",vk);
    }
};
//-----------------------
// api stuff
Player.prototype.letGo = function(item) {
    if (this.armor == item) this.armor = null;
    if (this.weapon == item) this.weapon = null;
    var idx = this.inventory.findIndex(i => item == i);
    if (idx >= 0) this.inventory.splice(idx, 1);
    return item;
};
//-----------------------
// player commands
Player.prototype.cmd_wait = function(cmd) {
    // stuh!
    return true;
};
Player.prototype.cmd_inventory = function(cmd) {
    Inventory.open();
    return false;
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
    var res = Actor.prototype.move.call(this, dx, dy);
    if (!res) return false;
    // pick up items on this square.
    var itm = this.map.itemAt(this.x,this.y);
    if (itm !== undefined) {
        // TODO: pick up the item instead of just telling you you see it.
        this.map.removeItem(itm);
        if (itm.type == items.get('stale bread')) {
            // eat it!
            Message.log("You eat some stale bread.");
            this.hp += 8 + Math.floor((ROT.RNG.getUniform() * 4));
            if (this.hp > this.stats.maxhp) this.hp = this.stats.maxhp;
        } else if (itm.type == items.get('Grapes of Yendor')) {
            Message.log("You got the Grapes of Yendor!");
            Message.more();
            this.win = true;
            MainMenu.victoryScreen.show();
        } else {
            Message.log("You pick up %a.".format(itm));
            ItemPopup("You got:", itm);
            this.inventory.push(itm);
        }
        //Message.log("You see here %a%s".format(itm, itm.type.name=="Grapes of Yendor" ? "!":"."));
    }
    // look at the square we just moved to and say things if appropriate.
    var t = this.map.at(this.x, this.y);
    if (t == tiles.STAIRS || t == tiles.EXIT) {
        Message.log("You see a staircase here.");
    } else if (t == tiles.WATER) {
        Message.log("splish, splish");
    } else if (t == tiles.PEDESTAL) {
        Message.log("You see a pedestal here.");
    } else if (t == tiles.POST) {
        Message.log("There is a post here, with a cable stretching across the chasm.");
    }
    return true;
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

Player.prototype.cmd_exit = function(cmd) {
    var tile = this.map.at(this.x, this.y);
    if (!tile || (tile.name != 'EXIT' && tile.name != 'STAIRS')) {
        Message.log('You see no exit here.');
        return false;
    }
    var ex = this.map.exits.find(ex => ex.loc[0] == this.x && ex.loc[1] == this.y);
    if (ex !== undefined) {
        //console.log("DEBUG: exit at: ",this.x,this.y, ex);
        var destMap = Game.world.findLevelById(ex.dest);
        if (!destMap) {
            Message.log("You can't leave without the Grapes of Yendor.");
            return false;
        }
        var fromMap = this.map;
        var destExit = destMap.exits.find(ex => ex.dest == fromMap.id);
        fromMap.removeMob(this);
        destMap.putMob(this, destExit.loc[0], destExit.loc[1]);
        Game.map = destMap;
        return true;
    }
    console.error("Unknown exit at ",x,y);
    return false;
};

// "shoot ranged weapon" shortcut.
Player.prototype.cmd_fire = function(cmd) {
    var weap = null;
    weap = this.inventory.find(it => it.type.name == "bow");
//console.log("testing",weap);
    if (weap === undefined) {
        weap = this.inventory.find(it => it.type.name == "blowgun");
    }
    if (weap === undefined) {
        Message.log("You don't have anything to shoot.");
        return false;
    }
    this.prompt({
        message: "Where do you want to shoot?",
        type: 'target',
        range: weap.type.range
    }).then(function(tgt) {
        this.commands.push({ type: 'use', item: weap, target: tgt });
    }.bind(this));
};

// generic use command.
Player.prototype.cmd_use = function(cmd) {
    //console.log("use: ", cmd);
    if (cmd.item.type.name == 'grapple bow') {
        var t = this.map.at(cmd.target[0], cmd.target[1]);
        if (t !== undefined && !t.solid && t != tiles.CHASM && t != tiles.CHASMCABLE) {
            if (this.map.mobAt(cmd.target[0], cmd.target[1]) !== undefined) {
                // TODO: attack with grapple bow?
                //console.log("mob: ",
            } else {
                var dif = [cmd.target[0] - this.x, cmd.target[1] - this.y];
                Message.log("You grapple across.");
                this.move(dif[0], dif[1]);
            }
            return true;
        }
    } else if (cmd.item.type.name == 'bow' || cmd.item.type.name == 'blowgun') {
        var other = this.map.mobAt(cmd.target[0], cmd.target[1]);
        if (!other) {
            Message.log("Your shot caroms off into the darkness.");
            return true;
        }
        if (other == this) {
            Message.log("You can't shoot yourself.");
            return false;
        }
        var ammo = null;
        if (cmd.item.type.name == 'bow') {
            ammo = this.inventory.find(it => it.type.name == "fire arrows");
            if (ammo === undefined) {
                ammo = this.inventory.find(it => it.type.name == "arrows");
            }
        }
//console.log("shoot %s: ", cmd.item.type.name, ammo ? ammo.type.attackBonus : 0, ammo ? ammo.type.damageBonus : 0, cmd.target);
        var roll = Dice(1,20);
        roll += this.stats.attack + (cmd.item && cmd.item.type.attackBonus ? cmd.item.type.attackBonus : 0) + (ammo ? ammo.type.attackBonus : 0);
        if (roll > other.stats.level * 3) {
            // hit, roll base 1d4 damage
            roll = Dice(1,4);
            // add damage bonus if applicable
            roll += (this.stats.damage ? this.stats.damage : 0) + (cmd.item && cmd.item.type.damageBonus ? cmd.item.type.damageBonus : 0) + (ammo ? ammo.type.damageBonus : 0);
            // subtract armor.
            roll -= (other.stats.armor + (other.armor ? other.armor.type.armorValue : 0));
            if (roll >= other.hp) {
                ActorMessage(this, "%The %{verb,kill} %the!".format(this, this, other));
                other.loseHp(roll);
            } else if (roll <= 0) {
                ActorMessage(this, "%Your shot glances harmlessly off %the.".format(this, other));
                // don't bother taking the hit if armor absorbed it all.
            } else {
                ActorMessage(this, "%The %{verb,shoot} %the.".format(this, this, other));
                other.loseHp(roll);
            }
        } else {
            ActorMessage(this, "%The %{verb,miss} %the.".format(this,this, other));
        }
        return true;
    } else if (cmd.item.type.name == "scythe") {
        Message.log("You swing your scythe.");
        var didSomething = false;
        //console.log("dir: ", cmd.direction);
        var pt = {
            "north": [0,-1], "south": [0,1], "east": [1, 0], "west": [-1, 0],
            "northeast": [1,-1], "northwest": [-1,-1], "southeast": [1,1], "southwest": [-1,1],
        }[cmd.direction];
        //console.log("pt:", pt);
        var t = this.map.at(this.x + pt[0], this.y + pt[1]);
        if (t && t == tiles.RAZORGRASS) {
            this.map.write(this.x + pt[0], this.y + pt[1], tiles.MIDCAVEFLOOR);
            didSomething = true;
        }
        if (didSomething) {
            Message.log("The razorgrass is cut down!");
        }
    } else if (cmd.item.type.name == "rubber chicken with a pulley in the middle") {
        var t = this.map.at(this.x, this.y);
        if (t !== undefined && t == tiles.POST) {
            Message.log("You hook your rubber chicken with a pulley in the middle over the cable and glide smoothly across.");
            var pather = ROT.Path.AStar2(this.x,this.y, function(x,y) {
                var t = this.map.at(x,y);
                if (!t || t.solid) return false;
                if (t != tiles.POST && t != tiles.CHASMCABLE) return false;
                return true;
            }.bind(this));
            var tgtpt, startpt;
            startpt = [0,0];
            do {
                tgtpt = this.map.scanForTile(tiles.POST, startpt);
                startpt[0] = tgtpt[0]+1;
                startpt[1] = tgtpt[1];
            } while (tgtpt[0] == this.x && tgtpt[1] == this.y);
//console.log("go from ", [this.x,this.y], " to ",tgtpt);
            this.x = tgtpt[0]; this.y = tgtpt[1];
            return true;
        }
    } else if (cmd.item.type.name == "crowbar") {
    } else if (cmd.item.type.name == "mirror") {
    } else if (cmd.item.type.name == "bucket") {
        var t = this.map.at(this.x, this.y);
        if (t !== undefined && t == tiles.WATER) {
            Message.log("You scoop up some water in the bucket.");
            this.letGo(cmd.item);
            var res = new Item("water bucket");
            this.inventory.push(res);
            ItemPopup("You acquired: ", res);
        }
        return true;
    } else if (cmd.item.type.name == "water bucket") {
        Message.log("You dump a little of the water out on the floor.");
        var didSomething = false;
        [[-1,0],[1,0],[0,-1],[0,1]].forEach(function(pt) {
            var t = this.map.at(this.x + pt[0], this.y + pt[1]);
            if (t && t == tiles.LAVA) {
                this.map.write(this.x + pt[0], this.y + pt[1], tiles.OBSIDIAN);
                didSomething = true;
            }
        }.bind(this));
        if (didSomething) {
            Message.log("Some lava solidifies!");
        }
        return true;
    //} else if (cmd.item.type.name == "herring") {
    }
    Message.log("That doesn't seem to do anything.");
    return true;
};