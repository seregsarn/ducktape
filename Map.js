function Map(w, h) {
    var inst = this;
    this.id = Identifier.get();
    this.w = w; this.h = h;
    this.map = {};
    this.fovMap = {};
    this.memory = {};
    this.fov = new ROT.FOV.PreciseShadowcasting(function(x,y) {
        var t = inst.at(x,y);
        return (t ? !t.opaque : false);
    });
    this.mobs = [];
    this.items = [];
    this.exits = [];
    this.forbid = [];
}
Map.prototype.at = function(x,y) {
    key = x + ',' + y;
    return this.map[key];
};
Map.prototype.write = function(x,y, t) {
    if (typeof tile == 'integer') t = tiles[t];
    key = x + ',' + y;
    this.map[key] = t;
};
// helper lookups
Map.prototype.solid = function(x,y) {
    return this.at(x,y).solid;
};
Map.prototype.updateFov = function(actor) {
    var inst = this;
    this.fovMap = {};
    this.mobs.forEach(m => m.visible = false);
    this.items.forEach(it => it.visible = false);
    var rad = 2;
    var light = Game.player.inventory.find(it => it.type.name == 'torch');
    if (light !== undefined) rad = 10;
    this.fov.compute(actor.x, actor.y, rad, function(x,y,r,vis) {
        inst.fovMap[x+','+y] = [r,vis];
        // check for visible mobs
        var m = inst.mobAt(x,y);
        if (m) m.visible = true;
        var it = inst.itemAt(x,y);
        if (it) it.visible = true;
        // remember stuff
        if (actor == Game.player) inst.memory[x+','+y] = inst.at(x,y);
    });
};
//-------------------------------------
// rendering and stuff
Map.prototype.magicMap = function() {
    for (var key in this.map) {
        this.memory[key] = this.map[key]
    }
};
Map.prototype.render = function(display, opts) {
    var mapper;
    // only show the FOV unless we asked for the whole map.
    mapper = (opts && opts.showAll ? this.map : this.fovMap);
    // if we want memory, then show it first.
    if (opts && opts.memory) {
        for (var key in this.memory) {
            var pa = key.split(',');
            var x = parseInt(pa[0]), y = parseInt(pa[1]);
            var tiles = this.memory[key];
            if (tiles === undefined) continue;
            display.draw(x+Game.mapRenderPos[0], y+Game.mapRenderPos[1], tiles.glyph, 'rgb(92,92,92)');
        }
    }
    // go through the map, rendering tiles.
    for (var key in mapper) {
        var pa = key.split(',');
        var x = parseInt(pa[0]);
        var y = parseInt(pa[1]);
        var tiles = this.map[key];
        if (tiles === undefined) continue;
        display.draw(x+Game.mapRenderPos[0],y+Game.mapRenderPos[1], tiles.glyph, tiles.color);
    }
    // draw mobs and items if asked to.
    if (opts && opts.drawItems) this.drawItems(display, opts);
    if (opts && opts.drawMobs) this.drawMobs(display, opts);
};
Map.prototype.updateTile = function(display,x,y) {
    var t = this.map[x + ',' + y];
    if (t !== undefined) {
        display.draw(x+Game.mapRenderPos[0],y+Game.mapRenderPos[1], t.glyph, t.color);
    } else {
        display.draw(x+Game.mapRenderPos[0],y+Game.mapRenderPos[1], ' ');
    }
};
//-------------------------------------
// generation functions and helpers
Map.prototype._neighbors = function(x,y) {
    var n = [];
    var i, j;
    for (j = -1; j <= 1; j++) {
        for (i = -1; i <= 1; i++) {
            if (i == 0 && j == 0) continue;
            if (x+i < 0 || x+i >= this.w || y+j < 0 || y+j >= this.h) continue;
            var t = this.at(x+i, y+j);
            if (t !== undefined) n.push([i, j, t]);
            else n.push([i,j,undefined]);
        }
    }
    return n;
};
Map.prototype.quantityFill = function(x,y,n,callback,edgeCallback) {
    var open = [[x,y]];
    var closed = [];
    var i;
    var next;
    var count = 1;
    var startTile = this.at(x,y);
    while (open.length > 0) {
        next = open.shift();
        closed.push(next);
        if (count < n) {
            callback(next[0],next[1]);
            count++;
        }
        var nn = this._neighbors(next[0],next[1]);
        nn.shuffle();
//console.log('pt: ',next);
        for (i = 0; i < nn.length; i++) {
//console.log(nn[i]);
            var t = nn[i][2];
            var nx = nn[i][0] + next[0];
            var ny = nn[i][1] + next[1];
            if (closed.find(function(elt) { return elt[0] == nx && elt[1] == ny; }) === undefined
                && open.find(function(elt) { return elt[0] == nx && elt[1] == ny; }) === undefined
                && t == startTile) {
                open.push([nx, ny]);
            }
        }
//        console.log(open);
    }
//    console.log('floodfilled ', count, ' tiles');
};
Map.prototype.slopeify = function(x,y,w,h) {
    x = x || 0;
    y = y || 0;
    w = w || this.w;
    h = h || this.h;
    var i, j;
    for (j = y; j < h; j++) {
        for (i = x; i < w; i++) {
            var here = this.at(i,j);
            if (here === undefined || !is_cave(here)) continue;
            var nl = this._neighbors(i,j);
            var ntile = null;
            nl.forEach(function (n) {
                if (n[2] == tiles.HIGHCAVEFLOOR && here == tiles.MIDCAVEFLOOR) ntile = tiles.HIGHSLOPE;
                if (n[2] == tiles.LOWCAVEFLOOR && here == tiles.MIDCAVEFLOOR) ntile = tiles.LOWSLOPE;
            });
            if (ntile != null) { this.write(i,j,ntile); }
        }
    }
};
Map.prototype.wallify = function() {
    var i, j;
    for (j = 0; j < this.h; j++) {
        for (i = 0; i < this.w; i++) {
            if (this.at(i,j) === undefined || !is_wall(this.at(i,j))) continue;
            var nl = this._neighbors(i,j);
            var v = false, h = false;
            var w = '';
            nl.forEach(function (n) {
                if (links_walls(n[2])) {
                    if (n[1] == 0 && n[0] != 0) h = true;
                    if (n[0] == 0 && n[1] != 0) v = true;
                }
            });
            if (h) w = 'HWALL';
            if (v) w = 'VWALL';
            if (h && v) w = 'CWALL';
            this.write(i,j,tile(w));
        }
    }
};
Map.prototype.findWalkableSpot = function() {
    var tries = 0;
    var x, y, t;
    do {
        x = Math.round(ROT.RNG.getUniform() * this.w);
        y = Math.round(ROT.RNG.getUniform() * this.h);
        t = this.at(x,y);
        if (t == tiles.CHASM || t == tiles.CHASMCABLE) t = undefined;
    } while (tries++ < 1000 && (t === undefined || t.solid));
    if (tries < 1000) return [x,y];
    return undefined;
};
Map.prototype.findLocation = function(tile) {
    var tries = 0;
    var x, y;
    do {
        x = Math.round(ROT.RNG.getUniform() * this.w);
        y = Math.round(ROT.RNG.getUniform() * this.h);
    } while (tries++ < 100 && this.at(x,y) != tile);
    return [x,y];
};
Map.prototype.scanForTile = function(target, startPt) {
    var x, y, t;
    if (startPt === undefined) startPt = [0,0];
    for (x = startPt[0]; x < this.w; x++) {
        for (y = startPt[1]; y < this.h; y++) {
            t = this.at(x,y);
            if (t != target) continue;
            return [x,y];
        }
    }
    return null;
};
Map.prototype.pathDistance = function(p1, p2) {
    var self = this;
    var path = new ROT.Path.AStar(p1[0], p1[1], function(x,y,cx,cy) {
        var t = self.at(x,y);
        return t && !t.solid;
    });
    var len = 0;
    path.compute(p2[0], p2[1], function(x,y) { len += 1; });
    return len;
}
//-------------------------
// mob handling
Map.prototype.addMob = function(mob) {
    if (!(mob instanceof Actor)) return false;
    if (this.mobs.includes(mob)) return true;
    mob.map = this;
    this.mobs.push(mob);
    return true;
};
Map.prototype.putMob = function(mob, x,y) {
    if (!(mob instanceof Actor)) return false;
    if (!this.addMob(mob)) return false;
    mob.x = x;
    mob.y = y;
    return true;
};
Map.prototype.removeMob = function(mob) {
    var idx = this.mobs.findIndex(item => mob.id == item.id);
    if (idx != -1) {
        this.mobs.splice(idx, 1);
        mob.map = null;
    }
    return true;
};
Map.prototype.drawMobs = function(display, opts) {
    for (i = 0; i < this.mobs.length; i++) {
        var m = this.mobs[i];
        if ((opts && opts.showAll) || m.visible)
            m.render(display, m.x+Game.mapRenderPos[0], m.y+Game.mapRenderPos[1]);
    }
};
Map.prototype.mobAt = function(x,y) {
    var m = this.mobs.find(dude => (dude.x == x && dude.y == y));
    return m;
};
//-------------------------
// object handling
Map.prototype.addItem = function(itm) {
    if (!(itm instanceof Item)) return false;
    if (this.items.includes(itm)) return true;
    itm.map = this;
    this.items.push(itm);
    return true;
};
Map.prototype.placeItem = function(itm, x,y) {
    if (!(itm instanceof Item)) return false;
    if (!this.addItem(itm)) return false;
    if (x === undefined || y === undefined) {
        var p = this.findWalkableSpot();
        x = p[0];
        y = p[1];
    }
    itm.x = x;
    itm.y = y;
    return true;
};
Map.prototype.removeItem = function(itm) {
    var idx = this.items.findIndex(item => itm.id == item.id);
    if (idx != -1) {
        this.items.splice(idx, 1);
        itm.map = null;
    }
    return true;
};
Map.prototype.drawItems = function(display, opts) {
    for (i = 0; i < this.items.length; i++) {
        var it = this.items[i];
        if ((opts && opts.showAll) || it.visible)
            it.render(display, it.x+Game.mapRenderPos[0], it.y+Game.mapRenderPos[1]);
    }
};
Map.prototype.itemAt = function(x,y) {
    var m = this.items.find(itm => (itm.x == x && itm.y == y));
    return m;
};
