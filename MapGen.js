var MapGen = {
    generateMap: function() {
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
    }
};
