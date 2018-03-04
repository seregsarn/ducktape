function Map(w, h) {
    this.w = w; this.h = h;
    this.map = {};
    this.mobs = [];
}
Map.prototype.at = function(x,y) {
    key = x + ',' + y;
    return this.map[key];
};
Map.prototype.solid = function(x,y) {
    return this.at(x,y).solid;
};
Map.prototype.write = function(x,y, idx) {
    key = x + ',' + y;
    this.map[key] = tiles[idx];
};
Map.prototype.render = function(display) {
    for (var key in this.map) {
        var pa = key.split(',');
        var x = parseInt(pa[0]);
        var y = parseInt(pa[1]);
        var tiles = this.map[key];
        if (tiles === undefined) {
            display.draw(x,y, '@', 'brightred', 'red');
            console.warn('blank tile:', tiles, x,y); continue;
        }
        display.draw(x,y, tiles.glyph, tiles.color);
        
    }
};
Map.prototype.updateTile = function(display,x,y) {
    var t = this.map[x + ',' + y];
    if (t !== undefined) {
        display.draw(x,y, t.glyph, t.color);
    } else {
        display.draw(x,y, ' ');
    }
};
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
//if (i > 29 && i < 34 && j >= 0 && j < 2)
//console.log(i,j,this.at(i,j));
            if (this.at(i,j) === undefined || !is_wall(this.at(i,j))) continue;
            var nl = this._neighbors(i,j);
            var v = false, h = false;
            var w = '';
//if (i > 29 && i < 34 && j >= 0 && j < 2)
//console.log('=>', nl);
            nl.forEach(function (n) {
                if (links_walls(n[2])) {
//if (i > 29 && i < 34 && j >= 0 && j < 2)
//console.log('=> block: ', n, n[0] != 0, n[1] != 0);
                    if (n[1] == 0 && n[0] != 0) h = true;
                    if (n[0] == 0 && n[1] != 0) v = true;
//                } else {
//if (i > 29 && i < 34 && j >= 0 && j < 2)
//console.log('=> unblocked', n, n[0] != 0, n[1] != 0);
                }
            });
            if (h) w = 'HWALL';
            if (v) w = 'VWALL';
            if (h && v) w = 'CWALL';
            this.write(i,j,tile(w));
        }
    }
};
Map.prototype.addMob = function(mob) {
    if (!(mob instanceof Actor)) return false;
    if (this.mobs.includes(mob)) return true;
//console.log('mob:', mob,mob.constructor);
    this.mobs.push(mob);
    return true;
};

