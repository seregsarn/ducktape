var AI = {
    random_walk: function() {
        var dx, dy;
        do {
            dx = Math.round(ROT.RNG.getUniform() * 2) - 1;
            dy = Math.round(ROT.RNG.getUniform() * 2) - 1;
        } while (dx == 0 && dy == 0);
        this.move(dx, dy);
        //*
        if (ROT.RNG.getPercentage() > 50) {
            ActorMessage(this, "%The %{verb,yelp}!".format(this, this));
        }
        //*/
        return true;
    },
    seek_player: function() {
        if (!this.visible) return AI.random_walk.apply(this);
        if (ROT.RNG.getUniform() > 0.8) return AI.random_walk.apply(this);
        var pather = new ROT.Path.AStar(Game.player.x, Game.player.y, function(x,y) {
            var t = this.map.at(this.x, this.y);
            if (t === undefined || t.solid) return false;
            if (t == tiles.CHASM || t == tiles.CHASMCABLE) return false;
            if (t == tiles.LAVA || t == tiles.RAZORGRASS) return false;
            return true;
        }.bind(this));
        var dir = undefined;
        pather.compute(this.x, this.y, function(x,y) {
            //console.log('dir: ', dir, " I'm at (", this.x,",",this.y, ") path: (",x,",",y,")");
            if (dir === undefined && !(x == this.x && y == this.y)) {
                dir = [x - this.x, y - this.y];
            }
        }.bind(this));
        if (dir !== undefined) {
            //console.log("final dir: ", dir);
            this.move(dir[0], dir[1]);
        }
        return true;
    }
};
