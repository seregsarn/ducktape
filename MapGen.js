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
    }
};
