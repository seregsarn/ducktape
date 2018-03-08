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
    generateCave: function(map) {
        // first, dig out the map.
        var ca = new ROT.Map.Cellular(80,24);
        var i, n;
        ca.randomize(0.5);
        for (i = 0; i < 5; i++) ca.create();
        ca.connect(null, 1);
        ca.create();
        ca.connect(function(x,y, value) {
            if (value == 1) map.write(x,y,tile('MIDCAVEFLOOR'));
        }, 1);
        // TODO: insert HIGHCAVEFLOOR and LOWCAVEFLOOR areas according to rules instead of just slapping them down wherever.
        /*
        n = Math.round(ROT.RNG.getUniform() * 10) + 5;
        for (i = 0; i < n; i++) {
            var high = Math.round(ROT.RNG.getUniform());
            var xp, yp, tries;
            tries = 0;
            var size;
            do {
                xp = Math.floor(ROT.RNG.getUniform() * map.w);
                yp = Math.floor(ROT.RNG.getUniform() * map.h);
            } while (++tries > 100 && map.at(xp,yp) != tile('MIDCAVEFLOOR'));
            size = Math.floor(ROT.RNG.getUniform() * 40) + 40;
            map.quantityFill(xp,yp, size, function(x,y) {
                map.write(x,y, high ? tile('HIGHCAVEFLOOR') : tile('LOWCAVEFLOOR'));
            });
        }
        map.slopeify();
        */
//        console.log("wrote map");
        return map;    
    },
    addExit: function(map, tt, filter) {
        tt = tt || tiles.EXIT;
        var pt, i, d;
        var tries = 0, reject;
        // create a new exit in the map, far from any other exits if possible.
        // TODO: keep recalculating this until we give up or find one far from all existing exits.
        do {
            pt = map.findWalkableSpot();
            reject = false;
            for (i = 0; i < map.exits.length; i++) {
                d = map.pathDistance(map.exits[i].loc, pt);
                if (d < this.EXIT_MIN_DISTANCE) reject = true;
            }
            if (filter !== undefined && !filter(pt[0], pt[1])) reject = true;
        } while (++tries < 100 || reject);
        // if we drop out after 100 tries, then something's weird, just let the exit land anywhere walkable.
        var ex = { map_id: map.id, dest: -1, loc: pt };
        map.write(pt[0], pt[1], tt);
        map.exits.push(ex);
        return ex;
    },
    placeExits: function(map) {
        var pt, left;
        left = false;
        // add one exit anywhere, first.
        this.addExit(map);
        if (map.exits[0].loc[0] < map.w / 2) left = true;
        // try to put the second exit on the opposite side of the map.
        this.addExit(map, tiles.EXIT, function(x,y) { return (left ? x > map.w / 2 : x < map.w / 2); });
        // add some more exits randomly.
        var i, n;
        n = Math.floor(ROT.RNG.getUniform() * 3);
        for (i = 0; i < n; i++) {
            this.addExit(map);
        }
        // compute paths between exits.
        this.drawWeb(map);
    },
    drawWeb: function (map) {
        var i, j;
        // for each exit...
//console.log("draw web for exits: ", map.exits);
        for (i = 0; i < map.exits.length; i++) {
            var start = map.exits[i];
//console.log("exit ",i,":", start);
            var pather = new ROT.Path.AStar(start.loc[0], start.loc[1], function(x,y,cx,cy) {
                var t = map.at(x,y);
                return t && !t.solid;
            });
            start.links = [];
//console.log("exits: ", map.exits);
            // ...find paths to the other exits and record them.
            for (j = 0; j < map.exits.length; j++) {
                if (i == j) continue; // don't connect to the same exit.
                var end = map.exits[j];
//console.log("walk from ",start.loc[0], start.loc[1], " to ", end.loc[0], end.loc[1]);
                var link = { to: j, steps: [] };
                pather.compute(end.loc[0], end.loc[1], function(x,y) {
//console.log("step ",x,y, " from ", i," to ", j);
                    link.steps.push([x,y]);
                });
//console.log("steps from ",start," to ", end, ": ", link.steps);
                start.links.push(link);
            }
        }
    },
    generateMap: function() {
        var map = this.map = new Map(80,24);
        // TODO: randomly select a theme and call the appropriate generator function.
        this.generateCave(this.map);
        // TODO: decorate with furniture and stuff according to theme
        // TODO: fill it with level-appropriate monsters
/*// all this is just debug stuff
        for (var i = 0; i < 42; i++) {
            var it = new Item();
            map.placeItem(it);
        }
        for (var i = 0; i < 42; i++) {
            var m = new Actor();
            Game.time.add(m, true);
            var spot = this.map.findWalkableSpot();
            map.putMob(m,spot[0],spot[1]);
        }
        var tim = new Actor();
        tim.type = monsters.astrojag;
        tim.name = "Tim";
        Game.time.add(tim, true);
        spot = this.map.findLocation(tiles.FLOOR);
        this.map.putMob(tim,spot[0],spot[1]);
//*/// end debug stuff
        return this.map;
    },
    generateItemLevel: function(item) {
        if (item === undefined) item = new Item();
        var map = this.generateMap();
        this.addExit(map);
        this.addExit(map, tiles.PEDESTAL);
        var ped = map.exits[1];
        map.placeItem(item, ped.loc[0], ped.loc[1]);
        // TODO: add roadblocks to the map!
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
        } while (++tries < 20 || reject);
        // if we drop out after 20 tries, then something's weird, just let the exit land anywhere walkable.
        return pt;
    },
    putRoadblocksOnMap: function(map, hazard) {
        console.log("add ", hazard.name, " to ", map);
        var p1, p2;
        var i, j, k;
        p1 = map.exits[0].loc;
        if (map.reward !== undefined) {
            p2 = [map.reward.x, map.reward.y];
        } else {
            p2 = map.exits[1].loc;
        }
        console.log("=> between ",p1, " and ", p2);
        if (hazard.name == "big chasm with cable") {
            // start at exit one, walk to exit 2. count the steps.
            var len = 0;
            var passable = function(x,y) { return map.at(x,y) !== undefined ? !map.at(x,y).solid : false; };
            var pather = new ROT.Path.AStar(p1[0], p1[1], passable);
            pather.compute(p2[0], p2[1], function(x,y) { len += 1; });
            console.log("steps between start and goal:", len);
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
                        map.write(i,j, tiles.LOWCAVEFLOOR);
                    }
                }
            }
            // expand the chasm till it's too big for the grapplebow to get you across.
            for (k = 0; k < 4; k++) {
                var expansion = [];
                for (j = 0; j < map.h; j++) {
                    for (i = 0; i < map.w; i++) {
                        var t = map.at(i,j);
                        if (t !== undefined && t == tiles.LOWCAVEFLOOR) {
                            map._neighbors(i,j).forEach(function(n) {
                                if (n[2] == tiles.MIDCAVEFLOOR)
                                    expansion.push([i+n[0], j+n[1]]);
                            });
                        }
                    }
                }
                expansion.forEach(function(e) { map.write(e[0],e[1], tiles.LOWCAVEFLOOR); });
            }
            // find two spots that can see one another on opposite sides of the chasm.
            // place the cable between those two points.
        } else if (hazard.name == "chasm") {
            // same as above, except we stop at "expand the chasm" and don't make it too big for the grapplebow
        }
    },
    createMapFromDescription: function(def) {
        var inst = this;
        var i, ex;
        var pt, i, d;
        var tries = 0, reject;
console.log("CREATE MAP:", def);
        var map = this.map = new Map(80,24);
        // first, dig out the map.
        var ca = new ROT.Map.Cellular(80,24);
        var i, n;
        ca.randomize(0.5);
        for (i = 0; i < 5; i++) ca.create();
        ca.connect(function(x,y, value) {
            if (value == 1) map.write(x,y,tile('MIDCAVEFLOOR'));
        }, 1);
        // set up basics
        map.id = def.id;
        for (i = 0; i < def.exits.length; i++) {
            ex = def.exits[i];
            // create a new exit in the map, far from any other exits if possible.
            pt = this.findExitSpot(map);
            //console.log("putting exit at ", pt);
            map.write(pt[0], pt[1], tiles.EXIT);
            map.exits.push({
                map_id: map.id,
                dest: ex.toLevel,
                loc: pt
            });
        }
        if (def.reward !== undefined) {
            pt = this.findExitSpot(map);
            map.write(pt[0], pt[1], tiles.PEDESTAL);
            map.placeItem(def.reward, pt[0], pt[1]);
            map.reward = def.reward;
        }
        // draw roadblocks for the map.
        if (def.hazard) {
            this.putRoadblocksOnMap(map, def.hazard);
        }
console.log(map);
        return map;
    }
};
