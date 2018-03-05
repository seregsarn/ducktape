function Map(w, h) {
    var inst = this;
    this.w = w; this.h = h;
    this.renderX = 0;
    this.renderY = 0;
    this.map = {};
    this.fovMap = {};
    this.memory = {};
    this.fov = new ROT.FOV.PreciseShadowcasting(function(x,y) {
        var t = inst.at(x,y);
        return (t ? !t.opaque : false);
    });
    this.mobs = [];
}
Map.prototype.at = function(x,y) {
    key = x + ',' + y;
    return this.map[key];
};
Map.prototype.write = function(x,y, idx) {
    key = x + ',' + y;
    this.map[key] = tiles[idx];
};
// helper lookups
Map.prototype.solid = function(x,y) {
    return this.at(x,y).solid;
};
Map.prototype.updateFov = function(actor) {
    var inst = this;
    this.fovMap = {};
    this.mobs.forEach(m => m.visible = false);
    this.fov.compute(actor.x, actor.y, Game.VISION_RADIUS, function(x,y,r,vis) {
        inst.fovMap[x+','+y] = [r,vis];
        // check for visible mobs
        var m = inst.mobAt(x,y);
        if (m) m.visible = true;
        // remember stuff
        if (actor == Game.player) inst.memory[x+','+y] = inst.at(x,y);
    });
};
//-------------------------------------
// rendering and stuff
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
            display.draw(x+this.renderX, y+this.renderY, tiles.glyph, 'rgb(64,64,64)');
        }
    }
    // go through the map, rendering tiles.
    for (var key in mapper) {
        var pa = key.split(',');
        var x = parseInt(pa[0]);
        var y = parseInt(pa[1]);
        var tiles = this.map[key];
        if (tiles === undefined) continue;
        display.draw(x+this.renderX,y+this.renderY, tiles.glyph, tiles.color);
    }
    // draw mobs if asked to.
    if (opts && opts.drawMobs) this.drawMobs(display, opts);
};
Map.prototype.updateTile = function(display,x,y) {
    var t = this.map[x + ',' + y];
    if (t !== undefined) {
        display.draw(x+this.renderX,y+this.renderY, t.glyph, t.color);
    } else {
        display.draw(x+this.renderX,y+this.renderY, ' ');
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
        }
    }
    return n;
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
Map.prototype.findLocation = function(tile) {
    var tries = 0;
    var x, y;
    do {
        x = Math.round(ROT.RNG.getUniform() * this.w);
        y = Math.round(ROT.RNG.getUniform() * this.h);
    } while (tries++ < 1000 && this.at(x,y) != tile);
    return [x,y];
};
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
            m.render(display, m.x+this.renderX, m.y+this.renderY);
    }
};
Map.prototype.mobAt = function(x,y) {
    var m = this.mobs.find(dude => (dude.x == x && dude.y == y));
    return m;
};
