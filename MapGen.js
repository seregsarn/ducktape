var MapGen = {
    generateMap: function() {
        var map = new Map(80,24);
        var digger = new ROT.Map.Digger(80,24,{
            dugPercentage: 0.85
        });
        var dig = function(x,y,value) {
            if (value) return;
            map.write(x,y, tile('CORR'));
        };
        var drawDoor = function(x,y) {
            map.write(x,y, tile('DOOR'));
        };
        digger.create(dig.bind(this));
        var rooms = digger.getRooms();
        for (var i = 0; i < rooms.length; i++) {
            var room = rooms[i];
//console.log("room ", i, room);
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
        }
        map.wallify();
        return map;
    }
};
