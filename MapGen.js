var MapGen = {
    EXIT_MIN_DISTANCE: 20,
    map: null,
    generateDungeon: function() {
        var map = new Map(80,24);
        // first, dig out the map.
        var digger = new ROT.Map.Digger(80,24,{
            dugPercentage: 0.85
        });
        var dig = function(x,y,value) {
            if (value) return;
            map.write(x,y, tile('CORR'));
        };
        digger.create(dig.bind(this));
        // decorate the rooms accordingly.
        var rooms = digger.getRooms();
        var drawDoor = function(x,y) {
            map.write(x,y, tile('DOOR'));
        };
        for (var i = 0; i < rooms.length; i++) {
            var room = rooms[i];
            var x,y;
            for (x = room.getLeft()-1; x <= room.getRight()+1; x++) {
                for (y = room.getTop()-1; y <= room.getBottom()+1; y++) {
                    if (x < 0 || x >= map.w || y < 0 || y >= map.h) continue;
                    map.write(x,y,tile('IND_WALL'));
                }
            }
            for (x = room.getLeft(); x <= room.getRight(); x++) {
                for (y = room.getTop(); y <= room.getBottom(); y++) {
                    map.write(x,y,tile('FLOOR'));
                }
            }
            room.getDoors(drawDoor.bind(this));
            // TODO: add furniture/items/mobs/etc to rooms here.
        }
        // make IND_WALL into pretty walls.
        map.wallify();
        return map;
    },
    //--------------------------------------------------
    findExitSpot: function(map) {
        var pt;
        var reject;
        var tries = 0;
        do {
            pt = map.findWalkableSpot();
            reject = false;
            for (i = 0; i < map.exits.length; i++) {
                d = map.pathDistance(map.exits[i].loc, pt);
                if (d < this.EXIT_MIN_DISTANCE) reject = true;
            }
        } while (++tries < 20 && reject);
        // if we drop out after 20 tries, then something's weird, just let the exit land anywhere walkable.
        return pt;
    },
    findSpotInCell: function(map, cell) {
        var tries = 0, reject;
        var x,y, t;
        do {
            reject = false;
            x = Math.floor(ROT.RNG.getUniform() * cell.w);
            y = Math.floor(ROT.RNG.getUniform() * cell.h);
            t = map.at(cell.x + x, cell.y + y);
            if (t === undefined) reject = true;
                else if (t.solid) reject = true;
        } while (++tries < 1000 && reject );
        return [cell.x + x,cell.y + y];
    },
    cellForSpot: function (pt) {
//console.log(pt, this.cells);
        var cx = Math.floor(pt[0] / this.cells.cw);
        var cy = Math.floor(pt[1] / this.cells.ch);
//console.log("cxy: ", cx,cy);
        return this.cellmap[(cy*this.cells.nx)+cx];
    },
    putRoadblocksOnMap: function(map, hazard) {
//        console.log("add ", hazard.name, " to ", map);
        var p1, p2;
        var c1, c2;
        var i, j, k;
        // pick the target points.
        p1 = map.exits[0].loc;
        if (map.reward !== undefined) {
            p2 = [map.reward.x, map.reward.y];
        } else {
            p2 = map.exits[1].loc;
        }
        // find the cells
//        console.log("---------\nroadblocks");
//        console.log('cellmap: ', this.cellmap);
        c1 = this.cellForSpot(p1);
        c2 = this.cellForSpot(p2);
//console.log("=> between ",c1, " and ", c2);
        // first major type: fields of stuff that block the path.
        if (["CHASM","BIGCHASM","LAVA","RAZORGRASS"].includes(hazard.code)) {
            var tiletype = {
                CHASM: tiles.CHASM,
                BIGCHASM: tiles.CHASM,
                LAVA: tiles.LAVA,
                RAZORGRASS: tiles.RAZORGRASS
            }[hazard.code];
            // start at exit one, walk to exit 2. count the steps.
            var len = 0;
            var passable = function(x,y) { return map.at(x,y) !== undefined ? !map.at(x,y).solid : false; };
            var costfn = function(x,y) {
                var t = map.at(x,y);
                if (t === undefined || t.solid) return 1000;
                return 1;
            };
            while (len <= 0) {
                len = 0;
                var pather = new ROT.Path.AStar2(p1[0], p1[1], passable, { cost: costfn });
                pather.compute(p2[0], p2[1], function(x,y) {
                    if (!map.at(x,y) || map.at(x,y).solid) map.write(x,y,tiles.MIDCAVEFLOOR);
                    len += 1;
                });
//console.log("steps between ",p1," and ",p2,":", len);
                if (len <= 0) {
                    map.exits[0].loc = this.findExitSpot(map, c1);
                    p1 = map.exits[0].loc;
                }
            }
            // divide that number in half to get the threshold.
            // make a dijkstra map of the entire level based on distance from the goal.
            dmap1 = new ROT.Path.Dijkstra(p1[0],p1[1], passable);
            dmap2 = new ROT.Path.Dijkstra(p2[0],p2[1], passable);
            // mark every cell with dmap value == threshold as a seed for the chasm.
            for (j = 0; j < map.h; j++) {
                for (i = 0; i < map.w; i++) {
                    var dval1 = 0, dval2 = 0;
                    dmap1.compute(i,j, function(x,y) { dval1 += 1; });
                    dmap2.compute(i,j, function(x,y) { dval2 += 1; });
                    if (dval2 == Math.floor(len / 2) && Math.abs(dval1 - dval2) < 3) {
                        map.write(i,j, tiletype);
                    }
                }
            }
            // expand the chasm till it's too big for the grapplebow to get you across.
            //*
            var patchSize = 0;
            var keepGoing;
            do {
                keepGoing = true;
                var expansion = [];
                for (j = 0; j < map.h; j++) {
                    for (i = 0; i < map.w; i++) {
                        var t = map.at(i,j);
                        if (t !== undefined && t == tiletype) {
                            map._neighbors(i,j).forEach(function(n) {
                                if (hazard.code != "CHASM" && hazard.code != "BIGCHASM" && Math.round(ROT.RNG.getUniform()) == 1) return;
                                if (n[2] == tiles.MIDCAVEFLOOR)
                                    expansion.push([i+n[0], j+n[1]]);
                            });
                        }
                    }
                }
//if (hazard.code == 'BIGCHASM') console.log("patch iter ", patchSize, ": ", expansion);
                expansion.forEach(function(e) { map.write(e[0],e[1], tiletype); });
                var pather = new ROT.Path.AStar2(p1[0], p1[1], function(x,y) {
                    var t = map.at(x,y);
                    if (t === undefined || t.solid) return false;
                    if (t == tiles.CHASM || t == tiles.CHASMCABLE || t == tiles.POST) return false;
                    if (t == tiles.LAVA || t == tiles.RAZORGRASS) return false;
                    return true;
                });
                len = 0;
                pather.compute(p2[0], p2[1], function(x,y) { len += 1 });
                patchSize++;
                if (len != 0) keepGoing = true;
                // only expand a little bit if we're doing a regular chasm.
                if ("CHASM" == hazard.code && patchSize >= 1) keepGoing = false;
                if ("BIGCHASM" == hazard.code && patchSize >= 5) keepGoing = false;
                if ("LAVA" == hazard.code && patchSize >= 6) keepGoing = false;
                if ("RAZORGRASS" == hazard.code && patchSize >= 7) keepGoing = false;
//if (hazard.code == 'BIGCHASM') console.log("patch iter ", patchSize, ": keep=", keepGoing);
            } while (len || keepGoing);
            //*/
            if (hazard.code == "CHASM" || hazard.code == "RAZORGRASS" || hazard.code == "LAVA") {
                // make sure the chasm can be crossed with the grapple bow.
                var fillin = new ROT.Path.AStar2(p1[0], p1[1], function(x,y) {
                    var t = map.at(x,y);
                    if (t === undefined || t.solid) return false;
                    return true;
                });
                var len = 0;
                fillin.compute(p2[0],p2[1], function(x,y) {
                    var t = map.at(x,y);
                    if (t !== undefined && t == tiles.CHASM) {
                        len += 1;
                        if (len > 3) {
                            map.write(x,y, tiles.MIDCAVEFLOOR);
                        }
                    }
                });
            } else if (hazard.code == "BIGCHASM") {
                // for bigchasm, we need to make a cable.
                var inChasm = false;
                var done = false;
                var post1, post2, prev;
                var pather = new ROT.Path.AStar2(p1[0], p1[1], passable);
                prev = p1;
                // find two edge spots of the chasm and draw a cable between them.
                pather.compute(p2[0], p2[1], function(x,y) {
                    if (done) return;
                    if (!inChasm && map.at(x,y) && map.at(x,y) == tiles.CHASM) {
                        post1 = prev;
                        inChasm = true;
                        map.write(x,y,tiles.CHASMCABLE);
                    } else if (inChasm && map.at(x,y) && map.at(x,y) == tiles.CHASM) {
                        map.write(x,y,tiles.CHASMCABLE);
                    } else if (inChasm && map.at(x,y) && map.at(x,y) != tiles.CHASM) {
                        post2 = [x,y];
                        done = true;
                    }
                    prev = [x,y];
                });
                // put posts at the ends.
                map.write(post1[0],post1[1], tiles.POST);
                map.write(post2[0],post2[1], tiles.POST);
            }
        } else if ([].includes(hazard.code)) {
            // same as above, except we stop at "expand the chasm" and don't make it too big for the grapplebow
            
        }
    },
    addWater: function(map) {
        // the opposite of the chasms: expand the water as much as we can but without cutting off the path.
        k = Math.floor(ROT.RNG.getUniform() * 5) + 2;
        for (i = 0; i < k; i++) {
            p1 = map.findWalkableSpot();
            map.write(p1[0],p1[1], tiles.WATER);
        }
        var patchSize = 0;
        var keepGoing;
        k = Math.floor(ROT.RNG.getUniform() * 5);
        do {
            keepGoing = false;
            var expansion = [];
            for (j = 0; j < map.h; j++) {
                for (i = 0; i < map.w; i++) {
                    var t = map.at(i,j);
                    if (t !== undefined && t == tiles.WATER) {
                        map._neighbors(i,j).forEach(function(n) {
                            if (Math.round(ROT.RNG.getUniform()) == 1) return;
                            if (n[2] == tiles.MIDCAVEFLOOR)
                                expansion.push([i+n[0], j+n[1]]);
                        });
                    }
                }
            }
            expansion.forEach(function(e) { map.write(e[0],e[1], tiles.WATER); });
            patchSize++;
            // only expand a little bit if we're doing a regular chasm.
            if (patchSize >= k) keepGoing = false;
        } while (keepGoing);
    },
    makeMiniCave: function(map, x,y,w,h, type) {
        var automaton = new ROT.Map.Cellular((w-2), (h-2)); //, {connected:true});
        automaton.randomize(0.70);
        for (k = 0; k < 4; k++) automaton.create();
        automaton.connect(function(px,py, value) {
            if (value == 1) map.write(x + px + 1, y + py + 1, type);
        }, 1);
    },
    cutCorridor: function(map, p1,p2, type, radius) {
        radius = radius || 0;
        var line = new ROT.Path.AStar(p1[0], p1[1], (x,y)=>true);
        var brush = [];
        var i, j;
        // make the brush.
        for (i = -radius; i <= radius; i++) {
            for (j = -radius; j <= radius; j++) {
                if (Math.sqrt(i*i+j*j) > radius) continue;
                brush.push([i,j]);
            }
        }
        //console.log("brush: ", brush);
        line.compute(p2[0], p2[1], function(x,y) {
            brush.forEach(bp => map.write(bp[0]+x, bp[1]+y, type));
        });
    },
    createMapFromDescription: function(def) {
        var inst = this;
        var i, j, k, ex;
        var pt, d;
        var tries = 0, reject;
//console.log("=========================\nCREATE MAP:", def);
        var map = this.map = new Map(80,24);
        // set up basics
        map.id = def.id;
        map.name = NameGenerator.levelName();
        var cells = {};
        cells.nx = Math.floor(ROT.RNG.getUniform() * 3) + 3;
        cells.ny = Math.floor(ROT.RNG.getUniform() * 2) + 2;
        cells.cw = Math.floor(map.w / cells.nx);
        cells.ch = Math.floor(map.h / cells.ny);
        this.cells = cells;
        var cellmap = [];
        var cellset = [];
        var idx, walls;
        // make a map of all the cells
        for (j = 0; j < cells.ny; j++) {
            for (i = 0; i < cells.nx; i++) {
                idx = i + (j*cells.ny);
                walls = [];
                if (i > 0) walls.push({dir: 'W', target: [i-1,j], from: [i,j]});
                if (j > 0) walls.push({dir: 'N', target: [i,j-1], from: [i,j]});
                if (i < cells.nx - 1) walls.push({dir: 'E', target: [i+1,j], from: [i,j]});
                if (j < cells.ny - 1) walls.push({dir: 'S', target: [i,j+1], from: [i,j]});
                cellmap.push({
                    visited: false,
                    x: i * cells.cw,
                    y: j * cells.ch,
                    w: cells.cw,
                    h: cells.ch,
                    walls: walls
                });
            }
        }
//console.log("before-- cellmap:", cellmap, "set: ", cellset);
        var walls = []; var w, cellidx, fromidx;
        var passages = [];
        // pick a random "start cell" and visit it.
        // add the walls to the cell list.
        idx = cellmap.chooseIndex();
        walls = walls.concat(cellmap[idx].walls);
        // while there's walls left in the list:
        while (walls.length) {
            // pick a random wall from the list.
            idx = walls.chooseIndex();
            w = walls[idx];
            walls.splice(idx, 1);
            fromidx = w.from[0] + (w.from[1] * cells.nx);
            cellidx = w.target[0] + (w.target[1] * cells.nx);
            if (!cellmap[cellidx].visited) {
                // open the wall
                passages.push(w);
                /* // FIXME: this code to remove the wall from the cell doesn't seem to be working. It also isn't super important, so I can come back and look at it again later maybe
                var rem = cellmap[fromidx].walls.findIndex(rw => rw.dir == w.dir && rw.from == w.from && rw.target == w.target);
                if (rem >= 0) cellmap[fromidx].walls.splice(rem, 1);
                function oppDir(d) { return "SNWE".charAt("NSEW".indexOf(d)); }
                rem = cellmap[cellidx].walls.findIndex(rw => rw.dir == oppDir(w.dir) && rw.from == w.from && rw.target == w.target);
                if (rem >= 0) cellmap[cellidx].walls.splice(rem, 1);
                */
                // visit the other cell and add its walls to the wall list.
                cellmap[cellidx].visited = true;
                walls = walls.concat(cellmap[cellidx].walls);
            }
        }
        for (idx = 0; idx < cellmap.length; idx++) {
            var cell = cellmap[idx];
            this.makeMiniCave(map, cell.x, cell.y, cell.w, cell.h, tiles.MIDCAVEFLOOR);
//console.log("carve cell: ", cell);            
        }
        for (idx = 0; idx < passages.length; idx++) {
            var p = passages[idx];
            var p1 = p.from, p2 = p.target;
//console.log(p1,p2);
            p1[0] = (p1[0] * cells.cw) + (cells.cw / 2) + Math.round(ROT.RNG.getUniform(0,0.5));
            p1[1] = (p1[1] * cells.ch) + (cells.ch / 2) + Math.round(ROT.RNG.getUniform(0,0.5));
            p2[0] = (p2[0] * cells.cw) + (cells.cw / 2) + Math.round(ROT.RNG.getUniform(0,0.5));
            p2[1] = (p2[1] * cells.ch) + (cells.ch / 2) + Math.round(ROT.RNG.getUniform(0,0.5));
//console.log("line from ",p1,"=>",p2);
            //console.log("TODO: make passages wider");
            this.cutCorridor(map, p1,p2, tiles.MIDCAVEFLOOR, Math.round(ROT.RNG.getUniform()) + 1);
        }
        this.cellmap = cellmap;
        this.passages = passages;
//console.log("cell map:", cellmap, passages);
//map.exits.push({map_id: map.id, dest: map.id,loc: [0,0]});
        // make exit 0 (the entrance to the level).
        ex = def.exits[0];
        excell = cellmap.choose();
        pt = this.findSpotInCell(map, excell);
        map.write(pt[0], pt[1], tiles.EXIT);
        map.exits.push({
            map_id: map.id,
            dest: ex.toLevel,
            loc: pt
        });
        // if we have a reward, place it.
        if (def.reward !== undefined) {
//console.warn('placing reward: ', def.reward);
            do {
                var excell = cellmap.choose();
                pt = this.findSpotInCell(map, excell);
//console.log("choosing cell: ", excell);
            } while (excell == this.cellForSpot(map.exits[0].loc) || map.pathDistance(map.exits[0].loc, pt) < 10);
            //pt = this.findExitSpot(map);
//console.log("PEDESTAL at ", pt);
            map.write(pt[0], pt[1], tiles.PEDESTAL);
            map.placeItem(def.reward, pt[0], pt[1]);
            map.reward = def.reward;
        } else if (def.exits.length >= 2) {
            // if no reward, place the second exit too.
            ex = def.exits[1];
            do {
                var excell = cellmap.choose();
                pt = this.findSpotInCell(map, excell);
            } while (excell == this.cellForSpot(map.exits[0].loc) || map.pathDistance(map.exits[0].loc, pt) < 10);
            map.write(pt[0], pt[1], tiles.STAIRS);
            map.exits.push({
                map_id: map.id,
                dest: ex.toLevel,
                loc: pt
            });
        }
        // draw roadblocks for the map.
        if (def.hazard) {
            this.putRoadblocksOnMap(map, def.hazard);
        }
        // now make the rest of the exits, making sure they end up on the right side of the hazard.
        for (i = (def.reward !== undefined ? 1 : 2); i < def.exits.length; i++) {
            ex = def.exits[i];
            var excell;
            // create a new exit in the map, far from any other exits if possible.
            var ok = false;
            var hazardpath = new ROT.Path.AStar2(map.exits[0].loc[0], map.exits[0].loc[1], function (x,y) {
                var t = map.at(x,y);
                if (t === undefined || t.solid) return false;
                return true;
            });
            var tries = 0;
            do {
                excell = cellmap.choose();
                pt = this.findSpotInCell(map, excell);
                ok = true;
                if (map.at(pt[0], pt[1]) != tiles.MIDCAVEFLOOR) continue; // if there's already something there, then no way.
                // if the path to the exit passes over a hazard tile, say no.
                hazardpath.compute(pt[0], pt[1], function(x,y) {
                    if (map.at(x,y) === undefined) return;
                    if (map.at(x,y) == tiles.LAVA) ok = false;
                    if (map.at(x,y) == tiles.CHASM) ok = false;
                    if (map.at(x,y) == tiles.CHASMCABLE) ok = false;
                    if (map.at(x,y) == tiles.RAZORGRASS) ok = false;
                    if (map.at(x,y) == tiles.POST) ok = false;
                });
            } while (!ok && ++tries < 1000);
            //console.log("putting exit at ", pt);
            map.write(pt[0], pt[1], tiles.STAIRS);
            map.exits.push({
                map_id: map.id,
                dest: ex.toLevel,
                loc: pt
            });
        }
        // add water if we need it.
        if (def.water) {
//console.log("Adding water: ", map);
            this.addWater(map);
        }
        // scatter some bread.
        k = Math.floor(ROT.RNG.getUniform() * 10) + 3;
        for (i = 0; i < k; i++) {
            var bread = new Item('stale bread');
            do {
                pt = map.findWalkableSpot();
            } while (map.itemAt(pt[0],pt[1]) || map.at(pt[0],pt[1]) != tiles.MIDCAVEFLOOR);
            map.placeItem(bread, pt[0],pt[1]);
        }
//console.log(map);
        return map;
    }
};
